const fs = require("fs");
const path = require("path");

function writeFile(relativePath, content) {
  const filePath = path.resolve(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated", relativePath);
}

writeFile("server/models/Promotion.js", `import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    resourceType: {
      type: String,
      default: "image",
      trim: true,
    },
    originalName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
      trim: true,
    },

    caption: {
      type: String,
      default: "",
      trim: true,
    },

    code: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    promoCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    discountText: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: String,
      default: "",
      trim: true,
    },

    endDate: {
      type: String,
      default: "",
      trim: true,
    },

    validFrom: {
      type: String,
      default: "",
      trim: true,
    },

    validTo: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    media: {
      type: [mediaSchema],
      default: [],
    },

    linkLabel: {
      type: String,
      default: "",
      trim: true,
    },

    linkUrl: {
      type: String,
      default: "",
      trim: true,
    },

    sortOrder: {
      type: Number,
      default: 999,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

promotionSchema.pre("save", function syncPromotionAliases(next) {
  if (!this.name && this.title) {
    this.name = this.title;
  }

  if (!this.title && this.name) {
    this.title = this.name;
  }

  if (!this.content && this.description) {
    this.content = this.description;
  }

  if (!this.description && this.content) {
    this.description = this.content;
  }

  if (this.code && !this.promoCode) {
    this.promoCode = this.code;
  }

  if (this.promoCode && !this.code) {
    this.code = this.promoCode;
  }

  if (this.code && !this.couponCode) {
    this.couponCode = this.code;
  }

  if (this.startDate && !this.validFrom) {
    this.validFrom = this.startDate;
  }

  if (this.validFrom && !this.startDate) {
    this.startDate = this.validFrom;
  }

  if (this.endDate && !this.validTo) {
    this.validTo = this.endDate;
  }

  if (this.validTo && !this.endDate) {
    this.endDate = this.validTo;
  }

  if (!this.imageUrl && this.media?.length) {
    const firstImage = this.media.find((item) => item.resourceType !== "video");
    this.imageUrl = firstImage?.url || "";
  }

  next();
});

const Promotion =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

export default Promotion;
`);

writeFile("server/routes/promotion.routes.js", `import express from "express";
import Promotion from "../models/Promotion.js";

const router = express.Router();

function normalizePromotionPayload(payload = {}) {
  const next = { ...payload };

  if (next.title && !next.name) next.name = next.title;
  if (next.name && !next.title) next.title = next.name;

  if (next.description && !next.content) next.content = next.description;
  if (next.content && !next.description) next.description = next.content;

  if (next.code) {
    next.code = String(next.code).trim().toUpperCase();
    next.promoCode = next.promoCode || next.code;
    next.couponCode = next.couponCode || next.code;
  }

  if (next.promoCode && !next.code) next.code = String(next.promoCode).trim().toUpperCase();

  if (next.startDate && !next.validFrom) next.validFrom = next.startDate;
  if (next.validFrom && !next.startDate) next.startDate = next.validFrom;

  if (next.endDate && !next.validTo) next.validTo = next.endDate;
  if (next.validTo && !next.endDate) next.endDate = next.validTo;

  if (Array.isArray(next.media) && !next.imageUrl) {
    const firstImage = next.media.find((item) => item.resourceType !== "video");
    next.imageUrl = firstImage?.url || "";
  }

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const { q, status, active, featured } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$or = [
        { title: regex },
        { name: regex },
        { description: regex },
        { content: regex },
        { code: regex },
        { discountText: regex },
      ];
    }

    if (status === "active" || active === "true") {
      filter.isActive = true;
    }

    if (status === "hidden" || active === "false") {
      filter.isActive = false;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    const promotions = await Promotion.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.json(promotions);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = normalizePromotionPayload(req.body);
    const promotion = await Promotion.create(payload);

    res.status(201).json(promotion);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = normalizePromotionPayload(req.body);

    const promotion = await Promotion.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!promotion) {
      return res.status(404).json({
        message: "Không tìm thấy khuyến mãi.",
      });
    }

    res.json(promotion);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        message: "Không tìm thấy khuyến mãi.",
      });
    }

    res.json({
      ok: true,
      deletedId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
`);

writeFile("src/admin/promotions/PromotionManagerView.jsx", `import {
  CalendarDays,
  Edit,
  Eye,
  EyeOff,
  Gift,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Search,
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
  code: "",
  discountText: "",
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

function getId(item) {
  return item?._id || item?.id || "";
}

function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getMediaImage(item) {
  if (item?.imageUrl) return item.imageUrl;

  if (Array.isArray(item?.media) && item.media.length > 0) {
    const firstImage = item.media.find((media) => !isVideoMedia(media));
    if (firstImage?.url) return firstImage.url;
  }

  return "";
}

function mapPromotionToForm(promotion) {
  return {
    title: promotion.title || promotion.name || "",
    description: promotion.description || promotion.content || promotion.caption || "",
    code: promotion.code || promotion.promoCode || promotion.couponCode || "",
    discountText: promotion.discountText || "",
    startDate: promotion.startDate || promotion.validFrom || "",
    endDate: promotion.endDate || promotion.validTo || "",
    imageUrl: promotion.imageUrl || "",
    media: Array.isArray(promotion.media) ? promotion.media : [],
    linkLabel: promotion.linkLabel || "",
    linkUrl: promotion.linkUrl || "",
    sortOrder: String(promotion.sortOrder ?? ""),
    isFeatured: promotion.isFeatured === true,
    isActive: promotion.isActive !== false,
  };
}

function buildPayload(form) {
  const code = String(form.code || "").trim().toUpperCase();
  const title = String(form.title || "").trim();
  const description = String(form.description || "").trim();
  const imageUrl = form.imageUrl || getMediaImage(form);

  return {
    title,
    name: title,
    description,
    content: description,
    caption: description,
    code,
    promoCode: code,
    couponCode: code,
    discountText: String(form.discountText || "").trim(),
    startDate: form.startDate || "",
    validFrom: form.startDate || "",
    endDate: form.endDate || "",
    validTo: form.endDate || "",
    imageUrl,
    media: Array.isArray(form.media) ? form.media : [],
    linkLabel: String(form.linkLabel || "").trim(),
    linkUrl: String(form.linkUrl || "").trim(),
    sortOrder: Number(form.sortOrder || 999),
    isFeatured: Boolean(form.isFeatured),
    isActive: Boolean(form.isActive),
  };
}

async function requestPromotions() {
  if (api.promotions?.list) {
    const result = await api.promotions.list();

    return Array.isArray(result) ? result : result.promotions || result.data || [];
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
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Không tạo được khuyến mãi.");

  return response.json();
}

async function updatePromotion(id, payload) {
  if (api.promotions?.update) return api.promotions.update(id, payload);

  const response = await fetch(\`/api/promotions/\${id}\`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Không cập nhật được khuyến mãi.");

  return response.json();
}

async function deletePromotion(id) {
  if (api.promotions?.remove) return api.promotions.remove(id);
  if (api.promotions?.delete) return api.promotions.delete(id);

  const response = await fetch(\`/api/promotions/\${id}\`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Không xóa được khuyến mãi.");

  return response.json();
}

export function PromotionManagerView() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    sortOrder: "1",
  }));
  const [files, setFiles] = useState([]);
  const [editingId, setEditingId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const filePreviews = useMemo(() => {
    return files.map((file, index) => ({
      url: URL.createObjectURL(file),
      type: file.type?.startsWith("video/") ? "video" : "image",
      name: file.name,
      index,
    }));
  }, [files]);

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [filePreviews]);

  const filteredPromotions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return promotions
      .filter((promotion) => {
        const searchText = [
          promotion.title,
          promotion.name,
          promotion.description,
          promotion.content,
          promotion.code,
          promotion.discountText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchQuery = !keyword || searchText.includes(keyword);
        const isActive = promotion.isActive !== false;

        const matchStatus =
          status === "all" ? true : status === "active" ? isActive : !isActive;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  }, [promotions, query, status]);

  async function loadPromotions() {
    try {
      setLoading(true);
      const data = await requestPromotions();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error.message || "Không tải được danh sách khuyến mãi.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId("");
    setFiles([]);
    setForm({
      ...EMPTY_FORM,
      sortOrder: String(promotions.length + 1),
    });
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleEdit(promotion) {
    setEditingId(getId(promotion));
    setFiles([]);
    setForm(mapPromotionToForm(promotion));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeSavedMedia(indexToRemove) {
    setForm((current) => {
      const media = current.media.filter((_, index) => index !== indexToRemove);
      const imageUrl =
        current.imageUrl === current.media[indexToRemove]?.url
          ? media.find((item) => !isVideoMedia(item))?.url || ""
          : current.imageUrl;

      return {
        ...current,
        media,
        imageUrl,
      };
    });
  }

  function removeSelectedFile(indexToRemove) {
    setFiles((current) => current.filter((_, index) => index !== indexToRemove));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề khuyến mãi.");
      return;
    }

    try {
      setSubmitting(true);

      let uploadedMedia = [];

      if (files.length > 0) {
        const uploadResult = await api.uploadMedia(files);
        uploadedMedia = uploadResult.media || [];
      }

      const media = [...(form.media || []), ...uploadedMedia];
      const payload = buildPayload({
        ...form,
        media,
        imageUrl: form.imageUrl || media.find((item) => !isVideoMedia(item))?.url || "",
      });

      if (editingId) {
        await updatePromotion(editingId, payload);
      } else {
        await createPromotion(payload);
      }

      await loadPromotions();
      resetForm();
    } catch (error) {
      alert(error.message || "Không lưu được khuyến mãi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này không?")) return;

    try {
      await deletePromotion(id);
      await loadPromotions();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      alert(error.message || "Không xóa được khuyến mãi.");
    }
  }

  async function handleToggleActive(promotion) {
    try {
      await updatePromotion(getId(promotion), {
        ...promotion,
        isActive: promotion.isActive === false,
      });
      await loadPromotions();
    } catch (error) {
      alert(error.message || "Không cập nhật trạng thái khuyến mãi.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-5 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
          <Gift size={15} />
          Quản lý khuyến mãi
        </p>

        <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
          Khuyến mãi YEPO
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756144]">
          Tạo ưu đãi, mã giảm giá, banner khuyến mãi và bật hiển thị ngoài trang Khuyến mãi.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[34px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
                {editingId ? "Đang chỉnh sửa" : "Tạo mới"}
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#3b2a18]">
                {editingId ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff1f1] text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="grid gap-4">
            <Field
              label="Tiêu đề khuyến mãi"
              value={form.title}
              required
              placeholder="Ví dụ: Mua 2 tặng 1"
              onChange={(value) => update("title", value)}
            />

            <Textarea
              label="Mô tả"
              value={form.description}
              placeholder="Mô tả chi tiết chương trình..."
              onChange={(value) => update("description", value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Mã ưu đãi"
                value={form.code}
                placeholder="YEPO77"
                onChange={(value) => update("code", value.toUpperCase())}
              />

              <Field
                label="Nội dung giảm giá"
                value={form.discountText}
                placeholder="Giảm 20%, tặng topping..."
                onChange={(value) => update("discountText", value)}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                  Ngày bắt đầu
                </span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => update("startDate", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none focus:border-[#b98c49]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                  Ngày kết thúc
                </span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => update("endDate", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none focus:border-[#b98c49]"
                />
              </label>

              <Field
                label="Nhãn nút"
                value={form.linkLabel}
                placeholder="Xem menu"
                onChange={(value) => update("linkLabel", value)}
              />

              <Field
                label="Link nút"
                value={form.linkUrl}
                placeholder="/menu hoặc https://..."
                onChange={(value) => update("linkUrl", value)}
              />

              <Field
                label="Thứ tự hiển thị"
                value={form.sortOrder}
                inputMode="numeric"
                placeholder="1"
                onChange={(value) => update("sortOrder", value.replace(/[^\\d]/g, ""))}
              />
            </div>

            <div className="rounded-[24px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4">
              <p className="mb-3 text-sm font-brand text-[#3b2a18]">
                Ảnh / GIF khuyến mãi
              </p>

              <label className="grid cursor-pointer place-items-center rounded-[24px] border-2 border-dashed border-[#d8b77e] bg-white px-5 py-8 text-center text-[#b98c49] transition hover:bg-[#fff8f1]">
                <ImagePlus size={36} />
                <p className="mt-3 text-sm font-bold">
                  Bấm để chọn ảnh hoặc GIF
                </p>
                <p className="mt-1 text-xs text-[#8c672f]">
                  Có thể chọn nhiều file.
                </p>

                <input
                  type="file"
                  multiple
                  accept="image/*,.gif"
                  className="hidden"
                  onChange={(event) => {
                    const picked = Array.from(event.target.files || []);
                    if (picked.length) setFiles((current) => [...current, ...picked]);
                    event.target.value = "";
                  }}
                />
              </label>

              {(form.media.length > 0 || filePreviews.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {form.media.map((media, index) => {
                    const isCover = form.imageUrl === media.url;

                    return (
                      <MediaPreview
                        key={`${media.url}-${index}`}
                        media={media}
                        label="Đã lưu"
                        isCover={isCover}
                        onCover={() => update("imageUrl", media.url)}
                        onRemove={() => removeSavedMedia(index)}
                      />
                    );
                  })}

                  {filePreviews.map((media, index) => (
                    <MediaPreview
                      key={`${media.url}-${index}`}
                      media={media}
                      label={\`Mới #\${index + 1}\`}
                      isCover={false}
                      onRemove={() => removeSelectedFile(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                label="Nổi bật"
                checked={form.isFeatured}
                onChange={(checked) => update("isFeatured", checked)}
              />

              <Toggle
                label="Công khai"
                checked={form.isActive}
                onChange={(checked) => update("isActive", checked)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {editingId ? "Lưu thay đổi" : "Tạo khuyến mãi"}
            </button>
          </div>
        </form>

        <section className="rounded-[34px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
                Danh sách
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#3b2a18]">
                Khuyến mãi đã tạo
              </h2>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#f6d77d] px-4 text-sm font-bold text-[#8c672f]"
            >
              <Plus size={16} />
              Thêm mới
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm khuyến mãi..."
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-11 pr-4 text-sm outline-none focus:border-[#b98c49]"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-12 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm outline-none focus:border-[#b98c49]"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-[24px] bg-[#FFFAFA] p-8 text-center text-[#8c672f]">
                Đang tải khuyến mãi...
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-8 text-center">
                <Gift size={38} className="mx-auto text-[#b98c49]" />
                <p className="mt-3 font-bold text-[#3b2a18]">
                  Chưa có khuyến mãi phù hợp.
                </p>
              </div>
            ) : (
              filteredPromotions.map((promotion) => (
                <PromotionCard
                  key={getId(promotion)}
                  promotion={promotion}
                  onEdit={() => handleEdit(promotion)}
                  onDelete={() => handleDelete(getId(promotion))}
                  onToggleActive={() => handleToggleActive(promotion)}
                />
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function PromotionCard({ promotion, onEdit, onDelete, onToggleActive }) {
  const image = getMediaImage(promotion);
  const isActive = promotion.isActive !== false;
  const title = promotion.title || promotion.name || "Khuyến mãi YEPO";
  const description = promotion.description || promotion.content || "Chưa có mô tả.";
  const code = promotion.code || promotion.promoCode || promotion.couponCode || "";

  return (
    <article className="overflow-hidden rounded-[26px] border border-[#d8b77e]/80 bg-[#FFFAFA]">
      <div className="grid gap-4 p-4 sm:grid-cols-[130px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-[20px] bg-white">
          {image ? (
            <img src={image} alt={title} className="h-32 w-full object-cover sm:h-full" />
          ) : (
            <div className="grid h-32 place-items-center text-[#b98c49]">
              <Gift size={34} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg font-black text-[#3b2a18]">
                {title}
              </h3>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756144]">
                {description}
              </p>
            </div>

            <span
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold",
                isActive ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {isActive ? "Đang hiện" : "Đang ẩn"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {code && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6d77d] px-3 py-1 text-xs font-bold text-[#8c672f]">
                <Tag size={12} />
                {code}
              </span>
            )}

            {(promotion.startDate || promotion.endDate) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8c672f]">
                <CalendarDays size={12} />
                {promotion.startDate || "Hiện tại"} {promotion.endDate ? \`- \${promotion.endDate}\` : ""}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <IconButton onClick={onEdit} label="Sửa" className="bg-[#b98c49] text-white">
              <Edit size={15} />
            </IconButton>

            <IconButton
              onClick={onToggleActive}
              label={isActive ? "Ẩn" : "Hiện"}
              className={isActive ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}
            >
              {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
            </IconButton>

            <IconButton onClick={onDelete} label="Xóa" className="bg-red-50 text-red-500">
              <Trash2 size={15} />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  );
}

function MediaPreview({ media, label, isCover, onCover, onRemove }) {
  const isVideo = isVideoMedia(media);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border bg-white",
        isCover ? "border-[#58b368] shadow-[0_0_0_4px_rgba(88,179,104,.16)]" : "border-[#d8b77e]"
      )}
    >
      <div className="relative aspect-square bg-[#FFFAFA]">
        {isVideo ? (
          <video src={media.url} muted playsInline controls className="h-full w-full object-cover" />
        ) : (
          <img src={media.url} alt={media.originalName || media.name || "Media"} className="h-full w-full object-cover" />
        )}

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-red-500 shadow"
        >
          <X size={15} />
        </button>
      </div>

      <div className="p-2">
        <p className="truncate text-center text-[10px] font-bold uppercase tracking-wider text-[#8c672f]">
          {label}
        </p>

        {!isVideo && onCover && (
          <button
            type="button"
            onClick={onCover}
            className={cn(
              "mt-2 h-9 w-full rounded-xl text-[11px] font-bold uppercase",
              isCover ? "bg-[#58b368] text-white" : "bg-[#f6d77d] text-[#8c672f]"
            )}
          >
            {isCover ? "Ảnh đại diện" : "Chọn đại diện"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, placeholder, inputMode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        value={value ?? ""}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none focus:border-[#b98c49]"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">{label}</span>
      <textarea
        value={value ?? ""}
        rows={4}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none focus:border-[#b98c49]"
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4">
      <span className="text-sm font-bold text-[#3b2a18]">{label}</span>
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
            "ml-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
            checked && "translate-x-5"
          )}
        />
      </span>
    </label>
  );
}

function IconButton({ children, onClick, label, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-xs font-bold transition hover:-translate-y-0.5",
        className
      )}
    >
      {children}
      {label}
    </button>
  );
}
`);
