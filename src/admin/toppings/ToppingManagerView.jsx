import { Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { ToppingList } from "./ToppingList.jsx";
import { ToppingPanel } from "./ToppingPanel.jsx";
import {
  EMPTY_TOPPING_FORM,
  buildToppingPayload,
  createTopping,
  deleteTopping,
  getId,
  isToppingVisible,
  getMediaUrl,
  isVideoMedia,
  mapToppingToForm,
  normalizeToppingMedia,
  requestToppings,
  updateTopping,
} from "./toppingUtils";

export function ToppingManagerView() {
  const [toppings, setToppings] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_TOPPING_FORM,
    sortOrder: "1",
  }));

  const [editingId, setEditingId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedPreview = useMemo(() => {
    if (!selectedFile) return "";

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const filteredToppings = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return toppings
      .filter((topping) => {
        const searchText = [topping.name, topping.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const isVisible = isToppingVisible(topping);

        const matchQuery = !keyword || searchText.includes(keyword);
        const matchStatus =
          status === "all" ? true : status === "active" ? isVisible : !isVisible;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => {
        const sortA = Number(a.sortOrder || 999);
        const sortB = Number(b.sortOrder || 999);

        if (sortA !== sortB) return sortA - sortB;

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [toppings, query, status]);

  useEffect(() => {
    loadToppings();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  async function loadToppings() {
    try {
      setLoading(true);

      const data = await requestToppings(api);
      setToppings(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error.message || "Không tải được danh sách topping.");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreatePanel() {
    setEditingId("");
    setSelectedFile(null);
    setForm({
      ...EMPTY_TOPPING_FORM,
      sortOrder: String(toppings.length + 1),
    });
    setPanelOpen(true);
  }

  function openEditPanel(topping) {
    setEditingId(getId(topping));
    setSelectedFile(null);
    setForm(mapToppingToForm(topping));
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId("");
    setSelectedFile(null);
    setForm({
      ...EMPTY_TOPPING_FORM,
      sortOrder: String(toppings.length + 1),
    });
  }

  function clearImage() {
    setSelectedFile(null);
    setForm((current) => ({
      ...current,
      imageUrl: "",
      media: [],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Vui lòng nhập tên topping.");
      return;
    }

    try {
      setSubmitting(true);

      let uploadedMedia = [];

      if (selectedFile) {
        const uploadResult = await api.uploadMedia([selectedFile]);
        uploadedMedia = normalizeToppingMedia(uploadResult.media || []);
      }

      const media = selectedFile
        ? uploadedMedia
        : Array.isArray(form.media)
          ? form.media
          : [];

      const imageUrl =
        getMediaUrl(uploadedMedia[0]) ||
        form.imageUrl ||
        getMediaUrl(media.find((item) => !isVideoMedia(item))) ||
        "";

      const payload = buildToppingPayload({
        ...form,
        media,
        imageUrl,
      });

      if (editingId) {
        await updateTopping(api, editingId, payload);
      } else {
        await createTopping(api, payload);
      }

      await loadToppings();
      closePanel();
    } catch (error) {
      alert(error.message || "Không lưu được topping.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(topping) {
    try {
      const isVisible = isToppingVisible(topping);

      const payload = buildToppingPayload({
        ...mapToppingToForm(topping),
        isActive: !isVisible,
        isAvailable: !isVisible,
      });

      await updateTopping(api, getId(topping), payload);
      await loadToppings();
    } catch (error) {
      alert(error.message || "Không cập nhật trạng thái topping.");
    }
  }

  async function handleDelete(topping) {
    const name = topping.name || "topping này";

    if (!window.confirm(`Bạn có chắc muốn xóa "${name}" không?`)) return;

    try {
      await deleteTopping(api, getId(topping));
      await loadToppings();

      if (editingId === getId(topping)) {
        closePanel();
      }
    } catch (error) {
      alert(error.message || "Không xóa được topping.");
    }
  }

  return (
    <div className="space-y-6">
      <Header onCreate={openCreatePanel} />

      <ToppingList
        toppings={toppings}
        filteredToppings={filteredToppings}
        query={query}
        status={status}
        loading={loading}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onCreate={openCreatePanel}
        onEdit={openEditPanel}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      <ToppingPanel
        open={panelOpen}
        editing={Boolean(editingId)}
        form={form}
        selectedPreview={selectedPreview}
        submitting={submitting}
        onClose={closePanel}
        onSubmit={handleSubmit}
        onUpdate={updateForm}
        onFileChange={setSelectedFile}
        onClearImage={clearImage}
      />
    </div>
  );
}

function Header({ onCreate }) {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-5 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-6">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f6d77d]/50 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
            <Sparkles size={15} />
            Quản lý topping
          </p>

          <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
            Topping YEPO
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756144]">
            Quản lý topping theo dạng danh sách hiện đại: tìm kiếm, bật tắt nhanh, thêm mới và chỉnh sửa trong panel riêng.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:-translate-y-0.5 hover:bg-[#8c672f]"
        >
          <Plus size={18} />
          Thêm topping
        </button>
      </div>
    </section>
  );
}
