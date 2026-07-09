import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  Gift,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { cn } from "../utils/adminUtils";

const EMPTY_FORM = {
  title: "",
  description: "",
  discountText: "",
  code: "",
  startDate: "",
  endDate: "",
  imageUrl: "",
  media: [],
  linkLabel: "",
  linkUrl: "",
  sortOrder: "",
  isFeatured: false,
  isActive: true,
};

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hiện" },
  { value: "hidden", label: "Đang ẩn" },
  { value: "featured", label: "Nổi bật" },
];

function getId(item) {
  return item?._id || item?.id || "";
}

function isVideoMedia(media) {
  const resourceType = String(
    media?.resourceType || media?.type || ""
  ).toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getPromotionImage(promotion) {
  if (promotion?.imageUrl) return promotion.imageUrl;

  if (Array.isArray(promotion?.media)) {
    const firstImage = promotion.media.find((item) => !isVideoMedia(item));
    if (firstImage?.url) return firstImage.url;
  }

  return "";
}

function getTitle(promotion) {
  return promotion.title || promotion.name || "Khuyến mãi YEPO";
}

function getDescription(promotion) {
  return promotion.description || promotion.content || promotion.caption || "";
}

function getCode(promotion) {
  return promotion.code || promotion.promoCode || promotion.couponCode || "";
}

function formatShortDate(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function mapToForm(promotion) {
  return {
    title: getTitle(promotion),
    description: getDescription(promotion),
    discountText: promotion.discountText || "",
    code: getCode(promotion),
    startDate: String(promotion.startDate || promotion.validFrom || "").slice(
      0,
      10
    ),
    endDate: String(promotion.endDate || promotion.validTo || "").slice(0, 10),
    imageUrl: getPromotionImage(promotion),
    media: Array.isArray(promotion.media) ? promotion.media : [],
    linkLabel: promotion.linkLabel || "",
    linkUrl: promotion.linkUrl || "",
    sortOrder: String(promotion.sortOrder || promotion.order || 999),
    isFeatured: promotion.isFeatured === true,
    isActive: promotion.isActive !== false,
  };
}

function buildPayload(form) {
  const imageUrl =
    form.imageUrl ||
    form.media?.find((item) => !isVideoMedia(item))?.url ||
    "";

  return {
    title: String(form.title || "").trim(),
    name: String(form.title || "").trim(),

    description: String(form.description || "").trim(),
    content: String(form.description || "").trim(),
    caption: String(form.description || "").trim(),

    discountText: String(form.discountText || "").trim(),

    code: String(form.code || "").trim(),
    promoCode: String(form.code || "").trim(),
    couponCode: String(form.code || "").trim(),

    startDate: form.startDate || "",
    endDate: form.endDate || "",
    validFrom: form.startDate || "",
    validTo: form.endDate || "",

    imageUrl,
    media: Array.isArray(form.media) ? form.media : [],

    linkLabel: String(form.linkLabel || "").trim(),
    linkUrl: String(form.linkUrl || "").trim(),

    sortOrder: Number(form.sortOrder || 999),
    order: Number(form.sortOrder || 999),

    isFeatured: form.isFeatured === true,
    isActive: form.isActive !== false,
  };
}

function sortPromotions(items = []) {
  return [...items].sort((a, b) => {
    const sortA = Number(a.sortOrder || a.order || 999);
    const sortB = Number(b.sortOrder || b.order || 999);

    if (sortA !== sortB) return sortA - sortB;

    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

async function requestPromotions() {
  if (api.promotions?.list) {
    const result = await api.promotions.list();
    return Array.isArray(result)
      ? result
      : result.promotions || result.data || [];
  }

  const response = await fetch("/api/promotions", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Không tải được danh sách khuyến mãi.");
  }

  return response.json();
}

async function createPromotion(payload) {
  if (api.promotions?.create) return api.promotions.create(payload);

  const response = await fetch("/api/promotions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không tạo được khuyến mãi.");
  }

  return response.json();
}

async function updatePromotion(id, payload) {
  if (api.promotions?.update) return api.promotions.update(id, payload);

  const response = await fetch(`/api/promotions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không cập nhật được khuyến mãi.");
  }

  return response.json();
}

async function deletePromotion(id) {
  if (api.promotions?.remove) return api.promotions.remove(id);
  if (api.promotions?.delete) return api.promotions.delete(id);

  const response = await fetch(`/api/promotions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không xóa được khuyến mãi.");
  }

  return response.json();
}

async function reorderPromotions(ids) {
  if (api.promotions?.reorder) return api.promotions.reorder(ids);

  const response = await fetch("/api/promotions/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không lưu được thứ tự khuyến mãi.");
  }

  return response.json();
}

async function uploadOneFile(file) {
  if (!file) return [];

  if (api.uploadMedia) {
    const result = await api.uploadMedia([file]);
    return result.media || result.files || result.data || [];
  }

  const formData = new FormData();
  formData.append("files", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Không upload được ảnh khuyến mãi.");
  }

  const result = await response.json();

  return result.media || result.files || result.data || [];
}

export function PromotionManagerView() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    sortOrder: "1",
  }));
  const [formOpen, setFormOpen] = useState(false);

  const [editingId, setEditingId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [draggingId, setDraggingId] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const selectedPreview = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const sortedPromotions = useMemo(
    () => sortPromotions(promotions),
    [promotions]
  );

  const stats = useMemo(() => {
    return {
      total: promotions.length,
      active: promotions.filter((promotion) => promotion.isActive !== false)
        .length,
      hidden: promotions.filter((promotion) => promotion.isActive === false)
        .length,
      featured: promotions.filter((promotion) => promotion.isFeatured === true)
        .length,
    };
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sortedPromotions.filter((promotion) => {
      const text = [
        getTitle(promotion),
        getDescription(promotion),
        getCode(promotion),
        promotion.discountText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchQuery = !keyword || text.includes(keyword);

      const matchStatus =
        status === "all" ||
        (status === "active" && promotion.isActive !== false) ||
        (status === "hidden" && promotion.isActive === false) ||
        (status === "featured" && promotion.isFeatured === true);

      return matchQuery && matchStatus;
    });
  }, [sortedPromotions, query, status]);

  const reorderLocked = query.trim() !== "" || status !== "all";

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  async function loadPromotions() {
    try {
      setLoading(true);
      const data = await requestPromotions();
      setPromotions(sortPromotions(Array.isArray(data) ? data : []));
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không tải được danh sách khuyến mãi.",
      });
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId("");
    setSelectedFile(null);
    setForm({
      ...EMPTY_FORM,
      sortOrder: String(promotions.length + 1),
    });
  }

  function handleEdit(promotion) {
    setEditingId(getId(promotion));
    setSelectedFile(null);
    setForm(mapToForm(promotion));
    setFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề khuyến mãi.");
      return;
    }

    try {
      setSaving(true);
      setNotice({ type: "", text: "" });

      const uploadedMedia = selectedFile ? await uploadOneFile(selectedFile) : [];
      const media = uploadedMedia.length > 0 ? uploadedMedia : form.media || [];
      const imageUrl =
        uploadedMedia[0]?.url ||
        form.imageUrl ||
        media.find((item) => !isVideoMedia(item))?.url ||
        "";

      const payload = buildPayload({
        ...form,
        media,
        imageUrl,
        sortOrder: form.sortOrder || String(promotions.length + 1),
      });

      if (editingId) {
        await updatePromotion(editingId, payload);
        setNotice({ type: "success", text: "Đã cập nhật khuyến mãi." });
      } else {
        await createPromotion(payload);
        setNotice({ type: "success", text: "Đã tạo khuyến mãi." });
      }

      resetForm();
      setFormOpen(false);
      await loadPromotions();
      window.dispatchEvent(new Event("yepo:data-changed"));
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không lưu được khuyến mãi.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(promotion) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${getTitle(promotion)}" không?`)) {
      return;
    }

    try {
      await deletePromotion(getId(promotion));
      setNotice({ type: "success", text: "Đã xóa khuyến mãi." });
      await loadPromotions();
      window.dispatchEvent(new Event("yepo:data-changed"));

      if (editingId === getId(promotion)) {
        resetForm();
      }
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không xóa được khuyến mãi.",
      });
    }
  }

  async function handleToggleActive(promotion) {
    try {
      const payload = buildPayload({
        ...mapToForm(promotion),
        isActive: promotion.isActive === false,
      });

      await updatePromotion(getId(promotion), payload);
      await loadPromotions();
      window.dispatchEvent(new Event("yepo:data-changed"));
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không cập nhật được trạng thái.",
      });
    }
  }

  async function handleToggleFeatured(promotion) {
    try {
      const payload = buildPayload({
        ...mapToForm(promotion),
        isFeatured: promotion.isFeatured !== true,
      });

      await updatePromotion(getId(promotion), payload);
      await loadPromotions();
      window.dispatchEvent(new Event("yepo:data-changed"));
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không cập nhật được nổi bật.",
      });
    }
  }

  async function persistOrder(nextItems) {
    const ordered = nextItems.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
      order: index + 1,
    }));

    setPromotions(ordered);

    try {
      setReordering(true);
      await reorderPromotions(ordered.map(getId));
      setNotice({ type: "success", text: "Đã cập nhật thứ tự hiển thị." });
      await loadPromotions();
      window.dispatchEvent(new Event("yepo:data-changed"));
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không lưu được thứ tự hiển thị.",
      });
      await loadPromotions();
    } finally {
      setReordering(false);
    }
  }

  function moveItem(fromIndex, toIndex) {
    if (reorderLocked) return;
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    const current = sortPromotions(promotions);

    if (toIndex >= current.length) return;

    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    persistOrder(next);
  }

  function handleDrop(targetId) {
    if (reorderLocked || !draggingId || draggingId === targetId) {
      setDraggingId("");
      return;
    }

    const current = sortPromotions(promotions);
    const fromIndex = current.findIndex((item) => getId(item) === draggingId);
    const toIndex = current.findIndex((item) => getId(item) === targetId);

    setDraggingId("");
    moveItem(fromIndex, toIndex);
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-4">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#d8b77e] bg-white px-5 py-4 text-sm font-bold text-[#8c672f] shadow-[0_14px_40px_rgba(87,61,28,.06)]">
          <Loader2 size={20} className="animate-spin" />
          Đang tải khuyến mãi...
        </div>
      </div>
    );
  }

  return (
    <div
      data-admin-promotion-page="true"
      className="mx-auto w-full max-w-7xl space-y-4 overflow-x-hidden pb-0 sm:space-y-5"
    >
      <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4 shadow-[0_18px_54px_rgba(87,61,28,.07)] sm:rounded-[34px] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70 sm:px-4 sm:text-xs">
              <Gift size={15} />
              Khuyến mãi
            </p>

            <h1 className="font-sniglet mt-3 text-3xl leading-tight text-[#3b2a18] sm:mt-4 sm:text-5xl">
              Quản lý khuyến mãi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#756144] sm:mt-3">
              Tạo chương trình ưu đãi, cập nhật trạng thái và sắp xếp thứ tự
              hiển thị ngoài trang khách hàng.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPromotions}
            disabled={reordering}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_12px_28px_rgba(185,140,73,.2)] transition hover:bg-[#8c672f] disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={reordering ? "animate-spin" : ""}
            />
            Làm mới
          </button>
        </div>
      </section>

      {notice.text && (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-bold shadow-sm",
            notice.type === "error"
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          )}
        >
          {notice.text}
        </div>
      )}

      <MobilePromotionStats stats={stats} />

      <div className="space-y-4 sm:space-y-5">
        <PromotionFormPanel
          form={form}
          formOpen={formOpen}
          setFormOpen={setFormOpen}
          editingId={editingId}
          selectedPreview={selectedPreview}
          saving={saving}
          update={update}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          setSelectedFile={setSelectedFile}
          setForm={setForm}
        />

        <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
          <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-brand uppercase tracking-[0.14em] text-[#b98c49] sm:text-xs">
                  Danh sách
                </p>

                <h2 className="mt-1 text-2xl font-black leading-tight text-[#3b2a18]">
                  Khuyến mãi
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#756144]">
                  Kéo biểu tượng tay nắm hoặc dùng nút Lên/Xuống để đổi thứ tự.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setFormOpen(true);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#f6d77d]/45 px-4 text-sm font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/60 transition hover:bg-[#f6d77d]/65 sm:w-auto"
              >
                <Plus size={16} />
                Thêm mới
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_170px]">
              <label className="relative block">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm khuyến mãi..."
                  className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white pl-11 pr-4 text-base text-[#3b2a18] outline-none transition placeholder:text-[#9b8a72] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
                />
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-4 text-base font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    "h-9 shrink-0 rounded-full px-4 text-xs font-bold transition",
                    status === option.value
                      ? "bg-[#b98c49] text-white shadow-[0_10px_22px_rgba(185,140,73,.18)]"
                      : "bg-white text-[#8c672f] ring-1 ring-[#d8b77e]/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {reorderLocked && (
              <div className="mt-4 rounded-2xl bg-[#f6d77d]/25 px-4 py-3 text-xs font-bold leading-5 text-[#8c672f]">
                Để kéo thả thứ tự, hãy chọn bộ lọc “Tất cả” và xóa ô tìm kiếm.
              </div>
            )}
          </div>

          <div className="space-y-3 bg-[#FFFAFA] p-3 sm:p-5">
            {filteredPromotions.length === 0 ? (
              <EmptyPromotions />
            ) : (
              filteredPromotions.map((promotion, displayIndex) => {
                const orderIndex = sortedPromotions.findIndex(
                  (item) => getId(item) === getId(promotion)
                );

                return (
                  <PromotionRow
                    key={getId(promotion)}
                    promotion={promotion}
                    index={orderIndex}
                    displayIndex={displayIndex}
                    total={sortedPromotions.length}
                    dragging={draggingId === getId(promotion)}
                    reorderLocked={reorderLocked || reordering}
                    onDragStart={() => setDraggingId(getId(promotion))}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(getId(promotion))}
                    onMoveUp={() => moveItem(orderIndex, orderIndex - 1)}
                    onMoveDown={() => moveItem(orderIndex, orderIndex + 1)}
                    onEdit={() => handleEdit(promotion)}
                    onDelete={() => handleDelete(promotion)}
                    onToggleActive={() => handleToggleActive(promotion)}
                    onToggleFeatured={() => handleToggleFeatured(promotion)}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MobilePromotionStats({ stats }) {
  const items = [
    { label: "Tổng", value: stats.total },
    { label: "Hiện", value: stats.active },
    { label: "Ẩn", value: stats.hidden },
    { label: "Nổi bật", value: stats.featured },
  ];

  return (
    <section className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
      {items.map((item) => (
        <div
          key={item.label}
          className="min-w-[92px] shrink-0 rounded-[20px] border border-[#d8b77e]/80 bg-white p-3 shadow-[0_10px_26px_rgba(87,61,28,.05)]"
        >
          <p className="text-[10px] font-brand uppercase tracking-[0.12em] text-[#b98c49]">
            {item.label}
          </p>

          <p className="mt-1 text-2xl font-black text-[#3b2a18]">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

function PromotionFormPanel({
  form,
  formOpen,
  setFormOpen,
  editingId,
  selectedPreview,
  saving,
  update,
  handleSubmit,
  resetForm,
  setSelectedFile,
  setForm,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <button
        type="button"
        onClick={() => setFormOpen((value) => !value)}
        className="group flex w-full items-center justify-between gap-3 bg-gradient-to-br from-white to-[#FFFAFA] p-4 text-left transition hover:from-[#FFFAFA] hover:to-[#f6d77d]/20 sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white shadow-sm">
            <Gift size={24} />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-brand uppercase tracking-[0.14em] text-[#8c672f] sm:text-xs">
              {editingId ? "Đang chỉnh sửa" : "Thêm khuyến mãi"}
            </p>

            <h2 className="font-sniglet mt-1 text-2xl leading-none text-[#3b2a18] sm:text-3xl">
              {editingId ? "Cập nhật khuyến mãi" : "Tạo chương trình mới"}
            </h2>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#756144] sm:text-sm sm:leading-6">
              {formOpen
                ? "Điền thông tin chương trình, ảnh, mã ưu đãi và trạng thái hiển thị."
                : "Bấm để mở form. Đóng lại giúp trang gọn hơn trên mobile."}
            </p>
          </div>
        </div>

        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105 sm:h-11 sm:w-11">
          {formOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </span>
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} className="border-t border-[#d8b77e]/60">
          <div className="space-y-4 p-4 sm:p-5">
            <Field
              label="Tiêu đề"
              value={form.title}
              required
              placeholder="Ví dụ: Sale cuối tuần"
              onChange={(value) => update("title", value)}
            />

            <Textarea
              label="Mô tả"
              value={form.description}
              placeholder="Nội dung chương trình..."
              onChange={(value) => update("description", value)}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Text giảm giá"
                value={form.discountText}
                placeholder="10% OFF"
                onChange={(value) => update("discountText", value)}
              />

              <Field
                label="Mã ưu đãi"
                value={form.code}
                placeholder="YEPO10"
                onChange={(value) => update("code", value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Ngày bắt đầu"
                value={form.startDate}
                type="date"
                onChange={(value) => update("startDate", value)}
              />

              <Field
                label="Ngày kết thúc"
                value={form.endDate}
                type="date"
                onChange={(value) => update("endDate", value)}
              />
            </div>

            <PromotionImageInput
              form={form}
              selectedPreview={selectedPreview}
              update={update}
              setSelectedFile={setSelectedFile}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Nhãn link"
                value={form.linkLabel}
                placeholder="Xem chi tiết"
                onChange={(value) => update("linkLabel", value)}
              />

              <Field
                label="Link"
                value={form.linkUrl}
                placeholder="https://..."
                onChange={(value) => update("linkUrl", value)}
              />
            </div>

            <Field
              label="Thứ tự hiển thị"
              value={form.sortOrder}
              inputMode="numeric"
              placeholder="1"
              onChange={(value) =>
                update("sortOrder", value.replace(/[^\d]/g, ""))
              }
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <Toggle
                label="Đang hiển thị"
                checked={form.isActive}
                onChange={(checked) => update("isActive", checked)}
              />

              <Toggle
                label="Đánh dấu nổi bật"
                checked={form.isFeatured}
                onChange={(checked) => update("isFeatured", checked)}
              />
            </div>
          </div>

          <div className="border-t border-[#d8b77e]/60 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-5 text-sm font-bold text-[#756144] ring-1 ring-[#d8b77e] sm:w-auto"
                >
                  <X size={17} />
                  Hủy chỉnh sửa
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60 sm:w-auto"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {editingId ? "Lưu thay đổi" : "Tạo khuyến mãi"}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

function PromotionImageInput({
  form,
  selectedPreview,
  update,
  setSelectedFile,
}) {
  const image = selectedPreview || form.imageUrl;

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#d8b77e] bg-[#FFFAFA]">
      <div className="border-b border-[#d8b77e]/60 bg-white p-4">
        <p className="text-sm font-bold text-[#3b2a18]">Ảnh khuyến mãi</p>
        <p className="mt-1 text-xs leading-5 text-[#756144]">
          Nên dùng ảnh ngang hoặc ảnh vuông rõ chữ để hiển thị đẹp ngoài trang khách.
        </p>
      </div>

      <div className="p-4">
        <div className="overflow-hidden rounded-[22px] border border-[#d8b77e] bg-white">
          {image ? (
            <img
              src={image}
              alt={form.title || "Khuyến mãi"}
              className="h-48 w-full object-cover sm:h-56"
            />
          ) : (
            <div className="grid h-48 place-items-center text-[#b98c49] sm:h-56">
              <ImagePlus size={36} />
            </div>
          )}
        </div>

        <label className="mt-3 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(185,140,73,.18)] transition hover:bg-[#8c672f]">
          <UploadCloud size={17} />
          Chọn ảnh
          <input
            type="file"
            accept="image/*,.gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                setSelectedFile(file);
              }

              event.target.value = "";
            }}
          />
        </label>

        <input
          value={form.imageUrl}
          placeholder="Hoặc dán URL ảnh..."
          onChange={(event) => {
            const url = event.target.value.trim();

            setSelectedFile(null);
            update("imageUrl", url);
            update(
              "media",
              url
                ? [
                    {
                      url,
                      resourceType: "image",
                      type: "image",
                      name: "Ảnh URL",
                      originalName: "Ảnh URL",
                      publicId: "",
                    },
                  ]
                : []
            );
          }}
          className="mt-3 h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-base text-[#3b2a18] outline-none transition placeholder:text-[#9b8a72] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
        />
      </div>
    </section>
  );
}

function EmptyPromotions() {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-[24px] border border-dashed border-[#d8b77e] bg-white px-6 py-10 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#FFFAFA] text-[#b98c49] ring-1 ring-[#d8b77e]/70">
          <Gift size={36} />
        </div>

        <p className="mt-4 font-bold text-[#3b2a18]">
          Chưa có khuyến mãi phù hợp
        </p>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756144]">
          Thử đổi từ khóa tìm kiếm hoặc chọn lại trạng thái.
        </p>
      </div>
    </div>
  );
}

function PromotionRow({
  promotion,
  index,
  total,
  dragging,
  reorderLocked,
  onDragStart,
  onDragOver,
  onDrop,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}) {
  const image = getPromotionImage(promotion);
  const active = promotion.isActive !== false;
  const featured = promotion.isFeatured === true;

  return (
    <article
      draggable={!reorderLocked}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "overflow-hidden rounded-[24px] border border-[#d8b77e] bg-white shadow-[0_12px_34px_rgba(87,61,28,.05)] transition",
        dragging && "scale-[0.99] opacity-60",
        !reorderLocked && "cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-[44px_96px_minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-center justify-between gap-2 lg:block">
          <div className="inline-flex h-9 min-w-9 items-center justify-center rounded-2xl bg-[#FFFAFA] px-2 text-xs font-black text-[#8c672f] ring-1 ring-[#d8b77e]">
            #{index + 1}
          </div>

          <button
            type="button"
            disabled={reorderLocked}
            className="grid h-9 w-9 place-items-center rounded-2xl bg-[#FFFAFA] text-[#b98c49] ring-1 ring-[#d8b77e] disabled:opacity-40 lg:mt-2"
            title="Kéo để đổi thứ tự"
          >
            <GripVertical size={18} />
          </button>
        </div>

        <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 lg:contents">
          <div className="h-24 w-full overflow-hidden rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] lg:h-20 lg:w-20">
            {image ? (
              <img
                src={image}
                alt={getTitle(promotion)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[#b98c49]">
                <Tag size={24} />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f6d77d]/50 px-2 py-1 text-[10px] font-black uppercase text-[#8c672f]">
                  <Star size={11} />
                  Nổi bật
                </span>
              )}

              <span
                className={cn(
                  "rounded-full px-2 py-1 text-[10px] font-black uppercase",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-neutral-100 text-neutral-500"
                )}
              >
                {active ? "Đang hiện" : "Đang ẩn"}
              </span>
            </div>

            <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-[#3b2a18]">
              {getTitle(promotion)}
            </h3>

            <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#756144]">
              {getDescription(promotion) || "Chưa có mô tả"}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold text-[#8c672f]">
              {promotion.discountText && (
                <span className="rounded-full bg-[#FFFAFA] px-2 py-1 ring-1 ring-[#d8b77e]">
                  {promotion.discountText}
                </span>
              )}

              {getCode(promotion) && (
                <span className="rounded-full bg-[#FFFAFA] px-2 py-1 ring-1 ring-[#d8b77e]">
                  Mã: {getCode(promotion)}
                </span>
              )}

              {(promotion.startDate || promotion.endDate) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFAFA] px-2 py-1 ring-1 ring-[#d8b77e]">
                  <CalendarDays size={12} />
                  {formatShortDate(promotion.startDate)}
                  {promotion.endDate
                    ? ` - ${formatShortDate(promotion.endDate)}`
                    : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[252px]">
          <IconButton
            disabled={reorderLocked || index <= 0}
            onClick={onMoveUp}
            label="Lên"
          >
            <ArrowUp size={15} />
          </IconButton>

          <IconButton
            disabled={reorderLocked || index >= total - 1}
            onClick={onMoveDown}
            label="Xuống"
          >
            <ArrowDown size={15} />
          </IconButton>

          <IconButton
            onClick={onToggleFeatured}
            label={featured ? "Bỏ nổi bật" : "Nổi bật"}
          >
            <Star size={15} />
          </IconButton>

          <IconButton
            onClick={onToggleActive}
            label={active ? "Ẩn" : "Hiện"}
          >
            {active ? <Eye size={15} /> : <EyeOff size={15} />}
          </IconButton>

          <IconButton onClick={onEdit} label="Sửa">
            <Edit size={15} />
          </IconButton>

          <IconButton onClick={onDelete} label="Xóa" danger>
            <Trash2 size={15} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  inputMode,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value ?? ""}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-base text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        rows={4}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[132px] w-full resize-y rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-base leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4 text-sm font-bold text-[#3b2a18]">
      <span>{label}</span>

      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
          checked ? "bg-[#b98c49]" : "bg-neutral-200"
        )}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />

        <span
          className={cn(
            "ml-1 h-5 w-5 rounded-full bg-white shadow transition",
            checked && "translate-x-5"
          )}
        />
      </span>
    </label>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1 rounded-2xl px-3 text-xs font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-white text-[#8c672f] ring-1 ring-[#d8b77e] hover:bg-[#f6d77d]/25"
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}