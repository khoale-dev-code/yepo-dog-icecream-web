import { ChevronUp, PawPrint, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { api } from "../../lib/api";
import { notifyDataChanged } from "../../lib/dataSync";
import { DogEditorPanel } from "./DogEditorPanel";
import { DogListPanel } from "./DogListPanel";
import {
  buildDogPayload,
  collectDogSuggestions,
  createEmptyDogForm,
  getDogMedia,
  getId,
  mapDogToForm,
} from "./dogUtils";

export function DogManagerView() {
  const toast = useSnackbar();

  const [dogs, setDogs] = useState([]);
  const [form, setForm] = useState(() => createEmptyDogForm(1));
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const editingDog = useMemo(() => {
    if (!editingId) return null;
    return dogs.find((dog) => getId(dog) === editingId) || null;
  }, [dogs, editingId]);

  const existingMedia = editingDog ? getDogMedia(editingDog) : [];

  const favoriteSuggestions = useMemo(
    () => collectDogSuggestions(dogs, "favoriteTreats"),
    [dogs]
  );

  const personalitySuggestions = useMemo(
    () => collectDogSuggestions(dogs, "personalityTags"),
    [dogs]
  );

  const breedSuggestions = useMemo(() => {
    const values = [];

    dogs.forEach((dog) => {
      String(dog.breed || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.push(item));
    });

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "vi"));
  }, [dogs]);

  async function loadDogs({ resetOrder = false } = {}) {
    setLoading(true);

    try {
      const result = await api.dogs.list();
      const nextDogs = Array.isArray(result?.dogs) ? result.dogs : [];

      nextDogs.sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
      setDogs(nextDogs);

      if (resetOrder && !editingId) {
        setForm((current) => ({
          ...current,
          sortOrder: String(nextDogs.length + 1),
        }));
      }
    } catch (error) {
      console.error("[dog-save] lỗi lưu hồ sơ cún:", error);
      toast.error(error.message || "Không tải được hồ sơ cún.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDogs({ resetOrder: true });
  }, []);

  function resetForm(nextCount = dogs.length) {
    setForm(createEmptyDogForm(nextCount + 1));
    setFiles([]);
    setEditingId("");
  }

  function openCreateEditor() {
    resetForm(dogs.length);
    setIsEditorOpen(true);
  }

  function closeEditor() {
    resetForm(dogs.length);
    setIsEditorOpen(false);
  }

  async function uploadMediaIfNeeded(currentMedia = []) {
    if (!files.length) return currentMedia;

    const result = await api.uploadMedia(files);
    return [...currentMedia, ...(result.media || [])];
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();
    event?.preventDefault?.();
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên cún.");
      return;
    }

    setSubmitting(true);

    try {
      const media = await uploadMediaIfNeeded(existingMedia);
      const payload = buildDogPayload(form, media, existingMedia.length);
      payload.colorTheme = String(form.colorTheme || payload.colorTheme || "pink").trim();
      payload.frameColor = String(form.frameColor || payload.frameColor || "").trim();
      const submittedColorThemeSafe = String(
        event?.currentTarget
          ? new FormData(event.currentTarget).get("colorThemeDraft") || ""
          : ""
      ).trim();

      payload.colorTheme = String(
        submittedColorThemeSafe || form.colorTheme || payload.colorTheme || "pink"
      ).trim();

      const submittedFrameColor = String(
        event?.currentTarget
          ? new FormData(event.currentTarget).get("frameColorDraft") || ""
          : ""
      ).trim();

      payload.frameColor = String(
        submittedFrameColor || form.frameColor || ""
      ).trim();

      console.log("[dog-save] payload gửi lên API:", payload);
      const submittedColorTheme = String(
        (event?.currentTarget ? new FormData(event.currentTarget).get("colorThemeDraft") : "") ||
          form.colorTheme ||
          payload.colorTheme ||
          "pink"
      ).trim();

      payload.colorTheme = submittedColorTheme;
      payload.colorTheme = form.colorTheme || payload.colorTheme || "pink";

      if (editingId) {
        await api.dogs.update(editingId, payload);
        toast.success("Đã cập nhật hồ sơ cún.");
        notifyDataChanged({ resource: "dogs", action: "update" });
      } else {
        await api.dogs.create(payload);
        toast.success("Đã tạo hồ sơ cún.");
        notifyDataChanged({ resource: "dogs", action: "create" });
      }

      const nextCount = editingId ? dogs.length : dogs.length + 1;
      resetForm(nextCount);
      setIsEditorOpen(false);
      await loadDogs();
    } catch (error) {
      toast.error(error.message || "Không lưu được hồ sơ cún.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(dog) {
    setEditingId(getId(dog));
    setForm(mapDogToForm(dog));
    setFiles([]);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa hồ sơ cún này?")) return;

    try {
      await api.dogs.remove(id);
      toast.success("Đã xóa hồ sơ cún.");
      await loadDogs({ resetOrder: true });
      notifyDataChanged({ resource: "dogs", action: "delete" });
    } catch (error) {
      toast.error(error.message || "Không xóa được hồ sơ cún.");
    }
  }

  async function handleToggleActive(dog) {
    try {
      await api.dogs.update(getId(dog), {
        isActive: dog.isActive === false,
      });

      toast.success("Đã cập nhật trạng thái hiển thị.");
      await loadDogs();
      notifyDataChanged({ resource: "dogs", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được trạng thái.");
    }
  }

  async function handleToggleFeatured(dog) {
    try {
      await api.dogs.update(getId(dog), {
        isFeatured: dog.isFeatured !== true,
      });

      toast.success("Đã cập nhật trạng thái nổi bật.");
      await loadDogs();
      notifyDataChanged({ resource: "dogs", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được cún nổi bật.");
    }
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      {!isEditorOpen ? (
        <button
          type="button"
          onClick={openCreateEditor}
          className="group flex w-full items-center justify-between gap-4 rounded-[30px] border border-[#d8b77e]/80 bg-white p-5 text-left shadow-[0_18px_60px_rgba(87,61,28,.07)] transition hover:bg-[#FFFAFA]"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white shadow-sm">
              <PlusCircle size={26} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                Tạo hồ sơ cún
              </p>

              <h2 className="font-sniglet mt-1 text-4xl leading-none text-[#3b2a18]">
                Thêm hồ sơ cún
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756144]">
                Bấm dấu cộng để mở form. Thứ tự hồ sơ mới đang gợi ý là #{dogs.length + 1}.
              </p>
            </div>
          </div>

          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49] transition group-hover:scale-105">
            <PlusCircle size={24} />
          </span>
        </button>
      ) : (
        <section className="space-y-3">
          <div className="flex flex-col gap-3 rounded-[30px] border border-[#d8b77e]/80 bg-white p-4 shadow-[0_18px_60px_rgba(87,61,28,.07)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
                <PawPrint size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                  {editingId ? "Đang chỉnh sửa" : "Đang tạo mới"}
                </p>

                <h2 className="font-sniglet text-3xl leading-none text-[#3b2a18]">
                  {editingId ? "Chỉnh sửa hồ sơ cún" : "Thêm hồ sơ cún"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={closeEditor}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f7efe3] px-4 text-sm font-brand text-[#8c672f] transition hover:bg-[#ead7b6]"
            >
              <ChevronUp size={16} />
              Thu gọn
            </button>
          </div>

          <DogEditorPanel
            form={form}
            setForm={setForm}
            files={files}
            setFiles={setFiles}
            existingMedia={existingMedia}
            editingId={editingId}
            submitting={submitting}
            dogsCount={dogs.length}
            favoriteSuggestions={favoriteSuggestions}
            personalitySuggestions={personalitySuggestions}
            breedSuggestions={breedSuggestions}
            onSubmit={handleSubmit}
            onCancel={closeEditor}
          />
        </section>
      )}

      <DogListPanel
        dogs={dogs}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
      
        editingId={editingId}
        draftDog={editingId ? { ...form, _id: editingId, id: editingId } : null}
      />
    </div>
  );
}
