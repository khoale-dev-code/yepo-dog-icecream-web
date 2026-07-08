const fs = require("fs");
const path = require("path");

function writeFile(relativePath, content) {
  const filePath = path.resolve(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated", relativePath);
}

writeFile("server/models/Topping.js", `import mongoose from "mongoose";

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

const toppingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
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

    sortOrder: {
      type: Number,
      default: 999,
    },

    isAvailable: {
      type: Boolean,
      default: true,
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

toppingSchema.pre("save", function syncToppingImage(next) {
  if (!this.imageUrl && this.media?.length) {
    const firstImage = this.media.find((item) => item.resourceType !== "video");
    this.imageUrl = firstImage?.url || "";
  }

  next();
});

const Topping = mongoose.models.Topping || mongoose.model("Topping", toppingSchema);

export default Topping;
`);

writeFile("server/routes/topping.routes.js", `import express from "express";
import Topping from "../models/Topping.js";

const router = express.Router();

function cleanPayload(payload = {}) {
  const next = { ...payload };

  delete next._id;
  delete next.id;
  delete next.__v;
  delete next.createdAt;
  delete next.updatedAt;

  next.name = String(next.name || "").trim();
  next.description = String(next.description || "").trim();
  next.price = Number(next.price || 0);
  next.sortOrder = Number(next.sortOrder || 999);
  next.imageUrl = String(next.imageUrl || "").trim();

  if (!Array.isArray(next.media)) {
    next.media = [];
  }

  if (!next.imageUrl && next.media.length) {
    const firstImage = next.media.find((item) => item.resourceType !== "video");
    next.imageUrl = firstImage?.url || "";
  }

  next.isAvailable = next.isAvailable !== false;
  next.isActive = next.isActive !== false;

  return next;
}

router.get("/", async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");

      filter.$or = [
        { name: regex },
        { description: regex },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
      filter.isAvailable = true;
    }

    if (status === "hidden") {
      filter.$or = [
        { isActive: false },
        { isAvailable: false },
      ];
    }

    const toppings = await Topping.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.json(toppings);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên topping.",
      });
    }

    const topping = await Topping.create(payload);

    res.status(201).json(topping);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const payload = cleanPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên topping.",
      });
    }

    const topping = await Topping.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!topping) {
      return res.status(404).json({
        message: "Không tìm thấy topping.",
      });
    }

    res.json(topping);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const topping = await Topping.findByIdAndDelete(req.params.id);

    if (!topping) {
      return res.status(404).json({
        message: "Không tìm thấy topping.",
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

writeFile("src/admin/toppings/ToppingManagerView.jsx", `import {
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { cn } from "../utils/adminUtils";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  media: [],
  sortOrder: "",
  isAvailable: true,
  isActive: true,
};

function getId(item) {
  return item?._id || item?.id || "";
}

function formatPrice(value) {
  const price = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
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

function getToppingImage(topping) {
  if (topping?.imageUrl) return topping.imageUrl;

  if (Array.isArray(topping?.media) && topping.media.length > 0) {
    const firstImage = topping.media.find((item) => !isVideoMedia(item));

    if (firstImage?.url) return firstImage.url;
  }

  return "";
}

function mapToppingToForm(topping) {
  return {
    name: topping.name || "",
    description: topping.description || "",
    price: String(topping.price ?? ""),
    imageUrl: topping.imageUrl || "",
    media: Array.isArray(topping.media) ? topping.media : [],
    sortOrder: String(topping.sortOrder ?? ""),
    isAvailable: topping.isAvailable !== false,
    isActive: topping.isActive !== false,
  };
}

function buildPayload(form) {
  return {
    name: String(form.name || "").trim(),
    description: String(form.description || "").trim(),
    price: Number(form.price || 0),
    imageUrl: form.imageUrl || getToppingImage(form),
    media: Array.isArray(form.media) ? form.media : [],
    sortOrder: Number(form.sortOrder || 999),
    isAvailable: Boolean(form.isAvailable),
    isActive: Boolean(form.isActive),
  };
}

async function requestToppings() {
  if (api.toppings?.list) {
    const result = await api.toppings.list();

    return Array.isArray(result) ? result : result.toppings || result.data || [];
  }

  const response = await fetch("/api/toppings", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Không tải được danh sách topping.");
  }

  return response.json();
}

async function createTopping(payload) {
  if (api.toppings?.create) return api.toppings.create(payload);

  const response = await fetch("/api/toppings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không tạo được topping.");
  }

  return response.json();
}

async function updateTopping(id, payload) {
  if (api.toppings?.update) return api.toppings.update(id, payload);

  const response = await fetch(\`/api/toppings/\${id}\`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không cập nhật được topping.");
  }

  return response.json();
}

async function deleteTopping(id) {
  if (api.toppings?.remove) return api.toppings.remove(id);
  if (api.toppings?.delete) return api.toppings.delete(id);

  const response = await fetch(\`/api/toppings/\${id}\`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Không xóa được topping.");
  }

  return response.json();
}

export function ToppingManagerView() {
  const [toppings, setToppings] = useState([]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    sortOrder: "1",
  }));
  const [editingId, setEditingId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedPreview = useMemo(() => {
    if (!selectedFile) return "";

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    loadToppings();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    };
  }, [selectedPreview]);

  const filteredToppings = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return toppings
      .filter((topping) => {
        const searchText = [topping.name, topping.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const isVisible = topping.isActive !== false && topping.isAvailable !== false;

        const matchQuery = !keyword || searchText.includes(keyword);
        const matchStatus =
          status === "all" ? true : status === "active" ? isVisible : !isVisible;

        return matchQuery && matchStatus;
      })
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  }, [toppings, query, status]);

  async function loadToppings() {
    try {
      setLoading(true);
      const data = await requestToppings();
      setToppings(Array.isArray(data) ? data : []);
    } catch (error) {
      alert(error.message || "Không tải được danh sách topping.");
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
      sortOrder: String(toppings.length + 1),
    });
  }

  function handleEdit(topping) {
    setEditingId(getId(topping));
    setSelectedFile(null);
    setForm(mapToppingToForm(topping));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        uploadedMedia = uploadResult.media || [];
      }

      const media = [...(form.media || []), ...uploadedMedia];
      const imageUrl =
        uploadedMedia[0]?.url ||
        form.imageUrl ||
        media.find((item) => !isVideoMedia(item))?.url ||
        "";

      const payload = buildPayload({
        ...form,
        media,
        imageUrl,
      });

      if (editingId) {
        await updateTopping(editingId, payload);
      } else {
        await createTopping(payload);
      }

      await loadToppings();
      resetForm();
    } catch (error) {
      alert(error.message || "Không lưu được topping.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa topping này không?")) return;

    try {
      await deleteTopping(id);
      await loadToppings();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      alert(error.message || "Không xóa được topping.");
    }
  }

  async function handleToggle(topping) {
    try {
      const isVisible = topping.isActive !== false && topping.isAvailable !== false;

      await updateTopping(getId(topping), {
        ...topping,
        isActive: !isVisible,
        isAvailable: !isVisible,
      });

      await loadToppings();
    } catch (error) {
      alert(error.message || "Không cập nhật trạng thái topping.");
    }
  }

  function removeSavedImage() {
    setForm((current) => ({
      ...current,
      imageUrl: "",
      media: [],
    }));
  }

  const imagePreview = selectedPreview || form.imageUrl || getToppingImage(form);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-5 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
          <Sparkles size={15} />
          Quản lý topping
        </p>

        <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
          Topping YEPO
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756144]">
          Thêm, sửa, xóa topping cho menu. Bố cục tối giản để thao tác nhanh trên cả điện thoại và máy tính.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
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
                {editingId ? "Cập nhật topping" : "Thêm topping"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff1f1] text-red-500"
                title="Hủy chỉnh sửa"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="grid gap-4">
            <Field
              label="Tên topping"
              value={form.name}
              required
              placeholder="Ví dụ: Trân châu, Pudding, Kem cheese..."
              onChange={(value) => update("name", value)}
            />

            <Textarea
              label="Mô tả ngắn"
              value={form.description}
              placeholder="Mô tả topping..."
              onChange={(value) => update("description", value)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Giá topping"
                value={form.price}
                inputMode="numeric"
                placeholder="10000"
                icon={DollarSign}
                onChange={(value) => update("price", value.replace(/[^\\d]/g, ""))}
              />

              <Field
                label="Thứ tự hiển thị"
                value={form.sortOrder}
                inputMode="numeric"
                placeholder="1"
                onChange={(value) => update("sortOrder", value.replace(/[^\\d]/g, ""))}
              />
            </div>

            <div className="rounded-[26px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-brand text-[#3b2a18]">
                  Hình topping
                </p>

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      removeSavedImage();
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-red-50 px-3 text-xs font-bold text-red-500"
                  >
                    <X size={13} />
                    Xóa ảnh
                  </button>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-[24px] border border-[#d8b77e] bg-white">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={form.name || "Topping"}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-44 place-items-center text-center text-[#b98c49]">
                    <div>
                      <ImagePlus size={36} className="mx-auto" />
                      <p className="mt-2 text-sm font-bold">Chưa có ảnh</p>
                    </div>
                  </div>
                )}
              </div>

              <label className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-brand text-white transition hover:bg-[#8c672f]">
                <UploadCloud size={17} />
                Chọn ảnh topping
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
                value={form.imageUrl ?? ""}
                placeholder="Hoặc dán URL ảnh..."
                onChange={(event) => update("imageUrl", event.target.value)}
                className="mt-3 h-11 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
              />
            </div>

            <Toggle
              label="Hiển thị topping"
              description="Tắt mục này nếu topping tạm hết hoặc chưa muốn hiển thị."
              checked={form.isActive && form.isAvailable}
              onChange={(checked) => {
                update("isActive", checked);
                update("isAvailable", checked);
              }}
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {editingId ? "Lưu thay đổi" : "Thêm topping"}
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
                Topping đã tạo
              </h2>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f6d77d] px-4 text-sm font-bold text-[#8c672f]"
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
                placeholder="Tìm topping..."
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

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="col-span-full rounded-[24px] bg-[#FFFAFA] p-8 text-center text-[#8c672f]">
                Đang tải topping...
              </div>
            ) : filteredToppings.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-8 text-center">
                <Tag size={38} className="mx-auto text-[#b98c49]" />
                <p className="mt-3 font-bold text-[#3b2a18]">
                  Chưa có topping phù hợp.
                </p>
              </div>
            ) : (
              filteredToppings.map((topping) => (
                <ToppingCard
                  key={getId(topping)}
                  topping={topping}
                  onEdit={() => handleEdit(topping)}
                  onDelete={() => handleDelete(getId(topping))}
                  onToggle={() => handleToggle(topping)}
                />
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function ToppingCard({ topping, onEdit, onDelete, onToggle }) {
  const image = getToppingImage(topping);
  const isVisible = topping.isActive !== false && topping.isAvailable !== false;

  return (
    <article className="overflow-hidden rounded-[26px] border border-[#d8b77e]/80 bg-[#FFFAFA]">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {image ? (
          <img
            src={image}
            alt={topping.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#b98c49]">
            <Tag size={38} />
          </div>
        )}

        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold",
            isVisible ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"
          )}
        >
          {isVisible ? "Đang hiện" : "Đang ẩn"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-black text-[#3b2a18]">
              {topping.name}
            </h3>

            <p className="mt-1 text-sm font-bold text-[#b98c49]">
              {formatPrice(topping.price)}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8c672f]">
            #{topping.sortOrder || 999}
          </span>
        </div>

        {topping.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#756144]">
            {topping.description}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <IconButton onClick={onEdit} label="Sửa" className="bg-[#b98c49] text-white">
            <Edit size={15} />
          </IconButton>

          <IconButton
            onClick={onToggle}
            label={isVisible ? "Ẩn" : "Hiện"}
            className={isVisible ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}
          >
            {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          </IconButton>

          <IconButton onClick={onDelete} label="Xóa" className="bg-red-50 text-red-500">
            <Trash2 size={15} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, required, placeholder, inputMode, icon: Icon }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c672f]"
          />
        )}

        <input
          value={value ?? ""}
          required={required}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10",
            Icon && "pl-10"
          )}
        />
      </div>
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
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4">
      <span>
        <span className="block text-sm font-bold text-[#3b2a18]">
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-[#756144]">
            {description}
          </span>
        )}
      </span>

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
        "inline-flex h-10 items-center justify-center gap-1 rounded-2xl px-2 text-xs font-bold transition hover:-translate-y-0.5",
        className
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
`);

function patchAdminPage() {
  const filePath = path.resolve(process.cwd(), "src/components/AdminPage.jsx");

  if (!fs.existsSync(filePath)) {
    console.log("Skip AdminPage.jsx");
    return;
  }

  const content = `import { AdminShell } from "../admin/components/AdminShell";
import { ProtectedAdmin } from "../admin/components/ProtectedAdmin";
import { RESOURCE_CONFIG } from "../admin/config/adminConfig";
import { DogManagerView } from "../admin/dogs/DogManagerView";
import { useAdminDashboard } from "../admin/hooks/useAdminDashboard";
import { useReservationWatcher } from "../admin/hooks/useReservationWatcher";
import { MenuManagerView } from "../admin/menu/MenuManagerView";
import { PromotionManagerView } from "../admin/promotions/PromotionManagerView.jsx";
import { ToppingManagerView } from "../admin/toppings/ToppingManagerView.jsx";
import { DashboardView } from "../admin/views/DashboardView";
import { ResourceView } from "../admin/views/ResourceView";
import { ShopView } from "../admin/views/ShopView";

export default function AdminPage() {
  return (
    <ProtectedAdmin>
      {({ admin, logout }) => <AdminContent admin={admin} logout={logout} />}
    </ProtectedAdmin>
  );
}

function AdminContent({ admin, logout }) {
  const adminDashboard = useAdminDashboard();

  const isDashboardTab = adminDashboard.activeTab === "dashboard";
  const isShopTab = adminDashboard.activeTab === "shop";
  const isMenuTab = adminDashboard.activeTab === "products";
  const isToppingsTab = adminDashboard.activeTab === "toppings";
  const isDogsTab = adminDashboard.activeTab === "dogs";
  const isPromotionsTab = adminDashboard.activeTab === "promotions";

  const activeResourceConfig = RESOURCE_CONFIG[adminDashboard.activeTab];

  useReservationWatcher({
    enabled: Boolean(admin),
    intervalMs: 18000,
  });

  return (
    <AdminShell
      activeTab={adminDashboard.activeTab}
      setActiveTab={adminDashboard.setActiveTab}
      shop={adminDashboard.data.shop}
      loading={adminDashboard.loading}
      saving={adminDashboard.saving}
      notice={adminDashboard.notice}
      error={adminDashboard.error}
      onRefresh={adminDashboard.loadAdminData}
      admin={admin}
      onLogout={logout}
    >
      {isDashboardTab && (
        <DashboardView
          summary={adminDashboard.data.summary}
          latestReservations={adminDashboard.data.latestReservations}
          products={adminDashboard.data.products}
          promotions={adminDashboard.data.promotions}
        />
      )}

      {isShopTab && (
        <ShopView
          form={adminDashboard.shopForm}
          setForm={adminDashboard.setShopForm}
          saving={adminDashboard.saving}
          onSubmit={adminDashboard.saveShop}
          onUpload={adminDashboard.uploadShopImage}
        />
      )}

      {isMenuTab && <MenuManagerView />}

      {isToppingsTab && <ToppingManagerView />}

      {isDogsTab && <DogManagerView />}

      {isPromotionsTab && <PromotionManagerView />}

      {activeResourceConfig &&
        !isMenuTab &&
        !isToppingsTab &&
        !isDogsTab &&
        !isPromotionsTab && (
          <ResourceView
            resource={adminDashboard.activeTab}
            config={activeResourceConfig}
            form={adminDashboard.forms[adminDashboard.activeTab]}
            files={adminDashboard.files[adminDashboard.activeTab] || []}
            items={adminDashboard.visibleItems}
            query={adminDashboard.query}
            editingId={adminDashboard.editing[adminDashboard.activeTab]}
            saving={adminDashboard.saving}
            setQuery={adminDashboard.setQuery}
            setFiles={(nextFiles) =>
              adminDashboard.updateFiles(adminDashboard.activeTab, nextFiles)
            }
            updateForm={adminDashboard.updateForm}
            onSubmit={(event) =>
              adminDashboard.saveResource(adminDashboard.activeTab, event)
            }
            onCancel={() => adminDashboard.resetResource(adminDashboard.activeTab)}
            onEdit={(item) =>
              adminDashboard.editResource(adminDashboard.activeTab, item)
            }
            onDelete={(id) =>
              adminDashboard.deleteResource(adminDashboard.activeTab, id)
            }
            onReservationStatus={adminDashboard.updateReservationStatus}
          />
        )}
    </AdminShell>
  );
}
`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched AdminPage.jsx");
}

function patchAdminConfig() {
  const filePath = path.resolve(process.cwd(), "src/admin/config/adminConfig.js");

  if (!fs.existsSync(filePath)) {
    console.log("Skip adminConfig.js");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  const lucideImport = content.match(/import\\s*\\{([\\s\\S]*?)\\}\\s*from\\s*["']lucide-react["'];?/);

  if (lucideImport) {
    const icons = lucideImport[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!icons.includes("IceCream2")) {
      icons.push("IceCream2");
    }

    const uniqueIcons = [...new Set(icons)].sort();

    content = content.replace(
      lucideImport[0],
      \`import { \${uniqueIcons.join(", ")} } from "lucide-react";\`
    );
  } else {
    content = \`import { IceCream2 } from "lucide-react";\\n\${content}\`;
  }

  if (!content.includes('id: "toppings"') && !content.includes("id: 'toppings'")) {
    const toppingTab = \`  {
    id: "toppings",
    label: "Topping",
    icon: IceCream2,
  },
\`;

    const productBlock = /(\\s*\\{\\s*id:\\s*["']products["'][\\s\\S]*?\\},)/;

    if (productBlock.test(content)) {
      content = content.replace(productBlock, \`$1\\n\${toppingTab}\`);
    } else {
      content = content.replace(
        /export const ADMIN_TABS\\s*=\\s*\\[/,
        \`export const ADMIN_TABS = [\\n\${toppingTab}\`
      );
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched adminConfig.js");
}

patchAdminPage();
patchAdminConfig();

console.log("Done. Topping admin is ready.");
