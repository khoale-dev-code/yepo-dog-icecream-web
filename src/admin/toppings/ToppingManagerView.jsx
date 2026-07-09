import { Eye, EyeOff, Layers3, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import { ToppingList } from "./ToppingList.jsx";
import { ToppingPanel } from "./ToppingPanel.jsx";
import {
  EMPTY_TOPPING_FORM,
  buildToppingPayload,
  createTopping,
  deleteTopping,
  getId,
  getMediaUrl,
  isToppingVisible,
  isVideoMedia,
  mapToppingToForm,
  normalizeToppingMedia,
  requestToppings,
  updateTopping,
} from "./toppingUtils";

function createImageId(prefix = "image") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toExistingImageItem(media, index) {
  const url = getMediaUrl(media);

  if (!url) return null;

  return {
    id: `existing-${index}-${url}`,
    type: "existing",
    media,
    previewUrl: url,
    name: media?.name || media?.originalName || `Ảnh ${index + 1}`,
  };
}

function toFileImageItem(file) {
  return {
    id: createImageId("file"),
    type: "file",
    file,
    previewUrl: URL.createObjectURL(file),
    name: file.name || "Ảnh mới",
  };
}

function revokeFilePreviews(items = []) {
  items.forEach((item) => {
    if (item?.type === "file" && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
}

function getToppingImageItems(topping) {
  const media = Array.isArray(topping?.media)
    ? normalizeToppingMedia(topping.media)
    : [];

  const normalizedMedia =
    media.length > 0
      ? media
      : topping?.imageUrl
        ? [
            {
              url: topping.imageUrl,
              secureUrl: topping.imageUrl,
              type: "image",
              resourceType: "image",
              name: topping.name || "Ảnh topping",
            },
          ]
        : [];

  return normalizedMedia
    .map(toExistingImageItem)
    .filter(Boolean);
}

export function ToppingManagerView() {
  const [toppings, setToppings] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_TOPPING_FORM,
    sortOrder: "1",
  }));

  const [editingId, setEditingId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [imageItems, setImageItems] = useState([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const imageItemsRef = useRef([]);

  useEffect(() => {
    imageItemsRef.current = imageItems;
  }, [imageItems]);

  useEffect(() => {
    loadToppings();

    return () => {
      revokeFilePreviews(imageItemsRef.current);
    };
  }, []);

  const toppingStats = useMemo(() => {
    const visible = toppings.filter(isToppingVisible).length;

    return {
      total: toppings.length,
      visible,
      hidden: Math.max(toppings.length - visible, 0),
    };
  }, [toppings]);

  const filteredToppings = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return toppings
      .filter((topping) => {
        const searchText = [topping.name, topping.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const visible = isToppingVisible(topping);

        const matchQuery = !keyword || searchText.includes(keyword);
        const matchStatus =
          status === "all" ? true : status === "active" ? visible : !visible;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => {
        const sortA = Number(a.sortOrder || 999);
        const sortB = Number(b.sortOrder || 999);

        if (sortA !== sortB) return sortA - sortB;

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [toppings, query, status]);

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

  function replaceImageItems(nextItems) {
    revokeFilePreviews(imageItemsRef.current);
    setImageItems(nextItems);
  }

  function openCreatePanel() {
    setEditingId("");
    replaceImageItems([]);
    setForm({
      ...EMPTY_TOPPING_FORM,
      sortOrder: String(toppings.length + 1),
    });
    setPanelOpen(true);
  }

  function openEditPanel(topping) {
    setEditingId(getId(topping));
    replaceImageItems(getToppingImageItems(topping));
    setForm(mapToppingToForm(topping));
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId("");
    replaceImageItems([]);
    setForm({
      ...EMPTY_TOPPING_FORM,
      sortOrder: String(toppings.length + 1),
    });
  }

  function handleFilesAdd(files) {
    const nextFiles = Array.from(files || []).filter((file) =>
      file?.type?.startsWith("image/")
    );

    if (nextFiles.length === 0) return;

    setImageItems((current) => [
      ...current,
      ...nextFiles.map(toFileImageItem),
    ]);
  }

  function handleImageRemove(index) {
    setImageItems((current) => {
      const removed = current[index];

      if (removed?.type === "file" && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function handleImageMove(index, direction) {
    setImageItems((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      const temp = next[index];

      next[index] = next[nextIndex];
      next[nextIndex] = temp;

      return next;
    });
  }

  function clearImage() {
    replaceImageItems([]);
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

      const newImageItems = imageItems.filter((item) => item.type === "file");
      const filesToUpload = newImageItems.map((item) => item.file);

      let uploadedMedia = [];

      if (filesToUpload.length > 0) {
        const uploadResult = await api.uploadMedia(filesToUpload);
        uploadedMedia = normalizeToppingMedia(uploadResult.media || []);
      }

      let uploadIndex = 0;

      const media = imageItems
        .map((item) => {
          if (item.type === "existing") return item.media;

          const uploaded = uploadedMedia[uploadIndex];
          uploadIndex += 1;

          return uploaded;
        })
        .filter(Boolean);

      const imageUrl =
        getMediaUrl(media.find((item) => !isVideoMedia(item))) ||
        getMediaUrl(media[0]) ||
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
      const visible = isToppingVisible(topping);

      const payload = buildToppingPayload({
        ...mapToppingToForm(topping),
        isActive: !visible,
        isAvailable: !visible,
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
    <div
      data-admin-topping-page="true"
      className="mx-auto w-full max-w-7xl space-y-5 pb-[calc(96px+env(safe-area-inset-bottom))] sm:space-y-6 lg:pb-8"
    >
      <Header
        stats={toppingStats}
        filteredCount={filteredToppings.length}
        onCreate={openCreatePanel}
      />

      <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/70 bg-[#FFFAFA] shadow-[0_20px_70px_rgba(87,61,28,.07)] sm:rounded-[34px]">
        <div className="border-b border-[#d8b77e]/55 bg-white/70 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-brand uppercase tracking-[0.16em] text-[#b98c49]">
                Danh sách topping
              </p>
              <h2 className="mt-1 font-sniglet text-2xl leading-tight text-[#3b2a18] sm:text-3xl">
                Quản lý hiển thị & giá topping
              </h2>
            </div>

            <p className="rounded-full bg-[#f6d77d]/35 px-3 py-1.5 text-xs font-bold text-[#8c672f]">
              Đang hiển thị {filteredToppings.length}/{toppings.length}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-5">
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
        </div>
      </section>

      <ToppingPanel
        open={panelOpen}
        editing={Boolean(editingId)}
        form={form}
        imageItems={imageItems}
        submitting={submitting}
        onClose={closePanel}
        onSubmit={handleSubmit}
        onUpdate={updateForm}
        onFilesAdd={handleFilesAdd}
        onImageMove={handleImageMove}
        onImageRemove={handleImageRemove}
        onClearImage={clearImage}
      />
    </div>
  );
}

function Header({ stats, filteredCount, onCreate }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:rounded-[34px] sm:p-6">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f6d77d]/55 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[#b98c49]/10 blur-3xl" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11px] font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70 sm:px-4 sm:text-xs">
            <Sparkles size={15} />
            Quản lý topping
          </p>

          <h1 className="font-sniglet mt-4 text-[34px] leading-[1.02] text-[#3b2a18] sm:text-5xl">
            Topping YEPO
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#756144]">
            Quản lý topping theo dạng danh sách hiện đại: tìm kiếm, bật tắt nhanh, thêm mới và chỉnh sửa trong panel riêng.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[22px] bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition active:scale-[0.99] hover:bg-[#8c672f] sm:w-auto sm:min-w-[190px]"
        >
          <Plus size={19} />
          Thêm topping
        </button>
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard
          icon={Layers3}
          label="Tổng"
          value={stats.total}
          helper={`${filteredCount} đang lọc`}
        />
        <StatCard
          icon={Eye}
          label="Đang bán"
          value={stats.visible}
          helper="Hiện trên menu"
        />
        <StatCard
          icon={EyeOff}
          label="Đã ẩn"
          value={stats.hidden}
          helper="Không hiển thị"
        />
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="min-w-0 rounded-[22px] border border-[#d8b77e]/55 bg-white/85 p-3 shadow-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f6d77d]/35 text-[#b98c49]">
          <Icon size={17} />
        </span>

        <span className="font-sniglet text-2xl leading-none text-[#3b2a18] sm:text-3xl">
          {value}
        </span>
      </div>

      <p className="mt-3 truncate text-[12px] font-bold text-[#3b2a18]">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-semibold text-[#8c672f]/75 sm:text-xs">
        {helper}
      </p>
    </div>
  );
}
