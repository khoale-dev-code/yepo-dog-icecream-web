const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

const candidates = walk("src").filter((file) => {
  const code = fs.readFileSync(file, "utf8");
  return (
    code.includes("Cài đặt YEPO") ||
    code.includes("export function ShopView") ||
    code.includes("Ảnh hero trang chủ")
  );
});

if (candidates.length === 0) {
  throw new Error("Không tìm thấy file ShopView/Cài đặt YEPO trong src.");
}

console.log("ShopView candidates:");
for (const file of candidates) {
  console.log(" -", file);
}

const target =
  candidates.find((file) => {
    const code = fs.readFileSync(file, "utf8");
    return code.includes("export function ShopView");
  }) || candidates[0];

const oldCode = fs.readFileSync(target, "utf8");
const apiImport =
  oldCode.match(/import\s+\{\s*api\s*\}\s+from\s+["'][^"']+["'];?/)?.[0] ||
  'import { api } from "../../lib/api";';

const content = `${apiImport}
import {
  Building2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Save,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const HERO_POSITION_OPTIONS = [
  { value: "center center", label: "Giữa ảnh" },
  { value: "center top", label: "Giữa - phía trên" },
  { value: "center bottom", label: "Giữa - phía dưới" },
  { value: "left center", label: "Bên trái" },
  { value: "right center", label: "Bên phải" },
  { value: "left top", label: "Trái - trên" },
  { value: "right top", label: "Phải - trên" },
  { value: "left bottom", label: "Trái - dưới" },
  { value: "right bottom", label: "Phải - dưới" },
];

function getMediaUrl(media) {
  if (!media) return "";
  if (typeof media === "string") return media;

  return (
    media.url ||
    media.secureUrl ||
    media.secure_url ||
    media.imageUrl ||
    media.src ||
    ""
  );
}

function normalizeHeroImages(form) {
  const fromArray = Array.isArray(form?.heroImages)
    ? form.heroImages
        .map((item, index) => {
          const url = getMediaUrl(item);

          if (!url) return null;

          return {
            id: item.id || item._id || \`\${url}-\${index}\`,
            url,
            secureUrl: item.secureUrl || item.secure_url || item.url || url,
            alt: item.alt || form?.name || "YEPO hero",
            objectPosition:
              item.objectPosition || form?.heroImagePosition || "center center",
            sortOrder: Number(item.sortOrder ?? index + 1),
          };
        })
        .filter(Boolean)
        .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999))
    : [];

  if (fromArray.length > 0) return fromArray;

  if (form?.heroImageUrl) {
    return [
      {
        id: "legacy-hero",
        url: form.heroImageUrl,
        secureUrl: form.heroImageUrl,
        alt: form?.name || "YEPO hero",
        objectPosition: form.heroImagePosition || "center center",
        sortOrder: 1,
      },
    ];
  }

  return [];
}

function makeHeroImageItem(media, index, form) {
  const url = getMediaUrl(media);

  if (!url) return null;

  return {
    id: \`\${Date.now()}-\${index}-\${Math.random().toString(16).slice(2)}\`,
    url,
    secureUrl: media.secureUrl || media.secure_url || media.url || url,
    alt: form?.name || "YEPO hero",
    objectPosition: "center center",
    sortOrder: index + 1,
  };
}

function getInstagramValue(form) {
  return form?.instagram || form?.instagramUrl || "";
}

function getGoogleMapsValue(form) {
  return (
    form?.googleMapsEmbedUrl ||
    form?.googleMapEmbedUrl ||
    form?.googleMapsUrl ||
    form?.mapEmbedUrl ||
    ""
  );
}

export function ShopView({ form, setForm, saving, onSubmit }) {
  const [uploadingField, setUploadingField] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const heroImages = useMemo(() => normalizeHeroImages(form), [form]);
  const primaryHero = heroImages[0];

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateInstagram(value) {
    setForm((current) => ({
      ...current,
      instagram: value,
      instagramUrl: value,
    }));
  }

  function updateGoogleMaps(value) {
    setForm((current) => ({
      ...current,
      googleMapsEmbedUrl: value,
      googleMapEmbedUrl: value,
      googleMapsUrl: value,
      mapEmbedUrl: value,
    }));
  }

  function updateHeroImages(nextImages) {
    const normalized = nextImages.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));

    setForm((current) => ({
      ...current,
      heroImages: normalized,
      heroImageUrl: normalized[0]?.url || "",
      heroImagePosition: normalized[0]?.objectPosition || "center center",
    }));
  }

  async function handleUpload(field, fileList) {
    const files = Array.from(fileList || []);

    if (!files.length) return;

    setUploadingField(field);

    try {
      const result = await api.uploadMedia(files);
      const mediaList = Array.isArray(result.media) ? result.media : [];

      if (field === "heroImages") {
        const newItems = mediaList
          .map((media, index) =>
            makeHeroImageItem(media, heroImages.length + index, form)
          )
          .filter(Boolean);

        if (newItems.length === 0) {
          throw new Error("Không lấy được URL ảnh hero sau khi upload.");
        }

        updateHeroImages([...heroImages, ...newItems]);
        return;
      }

      const media = mediaList[0];

      if (!media?.url) {
        throw new Error("Không lấy được URL ảnh sau khi upload.");
      }

      update(field, media.url);
    } catch (error) {
      alert(error.message || "Upload ảnh thất bại.");
    } finally {
      setUploadingField("");
    }
  }

  function addHeroUrl(url) {
    const cleanUrl = String(url || "").trim();

    if (!cleanUrl) return;

    updateHeroImages([
      ...heroImages,
      {
        id: \`url-\${Date.now()}\`,
        url: cleanUrl,
        secureUrl: cleanUrl,
        alt: form?.name || "YEPO hero",
        objectPosition: "center center",
        sortOrder: heroImages.length + 1,
      },
    ]);
  }

  function removeHeroImage(index) {
    updateHeroImages(heroImages.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateHeroImage(index, field, value) {
    updateHeroImages(
      heroImages.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function moveHeroImage(fromIndex, toIndex) {
    if (
      fromIndex === null ||
      toIndex === null ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= heroImages.length ||
      toIndex >= heroImages.length
    ) {
      return;
    }

    const next = [...heroImages];
    const [item] = next.splice(fromIndex, 1);

    next.splice(toIndex, 0, item);
    updateHeroImages(next);
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 space-y-5 overflow-x-hidden">
      <section className="overflow-hidden rounded-[32px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-5 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
          <Building2 size={15} />
          Thông tin cửa hàng
        </p>

        <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
          Cài đặt YEPO
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756144]">
          Cập nhật thông tin cửa hàng, liên hệ, Google Maps và bộ ảnh hero hiển thị ở trang chủ.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="space-y-5">
          <FormBlock icon={Building2} title="Thông tin cơ bản">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Tên cửa hàng"
                value={form.name}
                required
                placeholder="YEPO Dog & Ice Cream"
                onChange={(value) => update("name", value)}
              />

              <Field
                label="Dòng mô tả ngắn"
                value={form.tagline}
                placeholder="Dog & Ice Cream"
                onChange={(value) => update("tagline", value)}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Mô tả cửa hàng"
                  value={form.description}
                  placeholder="Mô tả ngắn về YEPO..."
                  onChange={(value) => update("description", value)}
                />
              </div>
            </div>
          </FormBlock>

          <FormBlock icon={Phone} title="Liên hệ">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Số điện thoại"
                value={form.phone}
                placeholder="090..."
                onChange={(value) => update("phone", value)}
              />

              <Field
                label="Giờ mở cửa"
                value={form.openingHours}
                placeholder="10:00 - 21:00"
                onChange={(value) => update("openingHours", value)}
              />

              <Field
                label="Instagram"
                value={getInstagramValue(form)}
                placeholder="https://instagram.com/yepo.dog.icecream"
                icon={Instagram}
                onChange={updateInstagram}
              />

              <Field
                label="Địa chỉ"
                value={form.address}
                placeholder="Địa chỉ cửa hàng"
                icon={MapPin}
                onChange={(value) => update("address", value)}
              />

              <div className="sm:col-span-2">
                <Textarea
                  label="Google Maps Embed URL"
                  value={getGoogleMapsValue(form)}
                  placeholder="Dán link iframe/embed Google Maps..."
                  onChange={updateGoogleMaps}
                />
              </div>
            </div>
          </FormBlock>

          <FormBlock icon={ImagePlus} title="Hình ảnh cửa hàng">
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadBox
                title="Logo"
                description="Hiển thị ở navbar và footer."
                value={form.logoUrl}
                field="logoUrl"
                uploadingField={uploadingField}
                onChange={(value) => update("logoUrl", value)}
                onUpload={handleUpload}
              />

              <ImageUploadBox
                title="Ảnh cover"
                description="Ảnh phụ dùng ở các khu vực giới thiệu."
                value={form.coverImageUrl}
                field="coverImageUrl"
                uploadingField={uploadingField}
                onChange={(value) => update("coverImageUrl", value)}
                onUpload={handleUpload}
              />
            </div>
          </FormBlock>

          <FormBlock icon={ImagePlus} title="Ảnh hero trang chủ">
            <HeroImagesManager
              form={form}
              images={heroImages}
              uploading={uploadingField === "heroImages"}
              dragIndex={dragIndex}
              setDragIndex={setDragIndex}
              onUpload={(files) => handleUpload("heroImages", files)}
              onAddUrl={addHeroUrl}
              onRemove={removeHeroImage}
              onUpdate={updateHeroImage}
              onMove={moveHeroImage}
            />
          </FormBlock>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <section className="overflow-hidden rounded-[32px] border-2 border-[#B88046] bg-[#FFF5EB] p-4 shadow-[0_6px_0_#B88046]">
            <div className="mb-4 flex items-center justify-between gap-3 text-[#8C5A2B]">
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                <p className="text-sm font-bold uppercase tracking-widest">
                  Preview ảnh hero
                </p>
              </div>

              {heroImages.length > 0 && (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold ring-1 ring-[#B88046]/35">
                  {heroImages.length} ảnh
                </span>
              )}
            </div>

            <div className="relative overflow-hidden rounded-[32px] border-2 border-[#B88046] bg-white p-2 shadow-[0_6px_0_#B88046] rotate-1 transition-transform duration-500 hover:rotate-0">
              {primaryHero?.url || form.coverImageUrl ? (
                <img
                  src={primaryHero?.url || form.coverImageUrl}
                  alt={form.name || "YEPO"}
                  style={{
                    objectPosition:
                      primaryHero?.objectPosition ||
                      form.heroImagePosition ||
                      "center center",
                  }}
                  className="h-[320px] w-full rounded-[24px] object-cover sm:h-[400px]"
                />
              ) : (
                <div className="grid h-[320px] w-full place-items-center rounded-[24px] bg-[#FFE4C4] text-center text-[#8C5A2B] sm:h-[400px]">
                  <div>
                    <ImagePlus size={42} className="mx-auto" />
                    <p className="mt-3 text-sm font-bold">
                      Chưa có ảnh hero
                    </p>
                  </div>
                </div>
              )}

              {heroImages.length > 1 && (
                <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  Ảnh chính 1/{heroImages.length}
                </div>
              )}

              <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full border-2 border-[#B88046] bg-[#FFE4C4] text-[#8C5A2B] shadow-sm rotate-12">
                <Sparkles size={20} />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#8C5A2B]">
              Ảnh đầu tiên trong danh sách là ảnh chính ở khung lớn bên phải trang chủ.
            </p>
          </section>

          <button
            type="submit"
            disabled={saving || Boolean(uploadingField)}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu thông tin cửa hàng
          </button>
        </aside>
      </section>
    </form>
  );
}

function HeroImagesManager({
  form,
  images,
  uploading,
  dragIndex,
  setDragIndex,
  onUpload,
  onAddUrl,
  onRemove,
  onUpdate,
  onMove,
}) {
  const [urlInput, setUrlInput] = useState("");

  function submitUrl() {
    const cleanUrl = urlInput.trim();

    if (!cleanUrl) return;

    onAddUrl(cleanUrl);
    setUrlInput("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border-2 border-[#b98c49]/60 bg-[#fff8f1] p-4 shadow-[0_10px_32px_rgba(185,140,73,.08)]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-base font-brand text-[#3b2a18]">
              Ảnh hero trang chủ
            </p>

            <p className="mt-1 text-xs leading-5 text-[#756144]">
              Ảnh chính ở khung lớn bên phải trang chủ. Có thể thêm nhiều ảnh, kéo thả đổi thứ tự và chọn vị trí hiển thị.
            </p>
          </div>

          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand text-white shadow-[0_12px_26px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f]">
            {uploading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UploadCloud size={17} />
            )}
            {uploading ? "Đang tải..." : "Upload nhiều ảnh"}
            <input
              type="file"
              accept="image/*,.gif"
              multiple
              className="hidden"
              onChange={(event) => {
                onUpload(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={urlInput}
            placeholder="Hoặc dán URL ảnh hero..."
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitUrl();
              }
            }}
            className="h-11 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
          />

          <button
            type="button"
            onClick={submitUrl}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/80 transition hover:bg-[#f6d77d]/20"
          >
            Thêm URL
          </button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid gap-3">
          {images.map((image, index) => (
            <HeroImageItem
              key={image.id || image.url}
              image={image}
              index={index}
              form={form}
              dragIndex={dragIndex}
              setDragIndex={setDragIndex}
              onMove={onMove}
              onRemove={onRemove}
              onUpdate={onUpdate}
              total={images.length}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[26px] border border-dashed border-[#d8b77e]/90 bg-[#FFFAFA] px-5 py-10 text-center text-[#8c672f]">
          <ImagePlus size={38} className="mx-auto" />
          <p className="mt-3 text-sm font-bold">
            Chưa có ảnh hero
          </p>
          <p className="mt-1 text-xs leading-5 text-[#756144]">
            Upload nhiều ảnh hoặc dán URL để tạo bộ ảnh hero trang chủ.
          </p>
        </div>
      )}
    </div>
  );
}

function HeroImageItem({
  image,
  index,
  form,
  dragIndex,
  setDragIndex,
  onMove,
  onRemove,
  onUpdate,
  total,
}) {
  const isDragging = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={() => setDragIndex(index)}
      onDragEnd={() => setDragIndex(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onMove(dragIndex, index);
        setDragIndex(null);
      }}
      className={[
        "grid gap-3 rounded-[24px] border bg-white p-3 shadow-sm transition sm:grid-cols-[132px_minmax(0,1fr)_auto]",
        isDragging
          ? "border-[#b98c49] opacity-70 ring-4 ring-[#f6d77d]/50"
          : "border-[#d8b77e]/80",
      ].join(" ")}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#d8b77e] bg-[#fff8f1]">
        <img
          src={image.url}
          alt={image.alt || form.name || "Hero"}
          style={{ objectPosition: image.objectPosition || "center center" }}
          className="h-36 w-full object-cover sm:h-full"
        />

        <span className="absolute left-2 top-2 rounded-full bg-[#b98c49] px-2.5 py-1 text-[10px] font-bold text-white">
          {index === 0 ? "Ảnh chính" : \`Ảnh \${index + 1}\`}
        </span>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex items-start gap-2">
          <GripVertical size={18} className="mt-3 shrink-0 cursor-grab text-[#b98c49]" />

          <div className="min-w-0 flex-1">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#3b2a18]">
                URL ảnh
              </span>

              <input
                value={image.url || ""}
                onChange={(event) => onUpdate(index, "url", event.target.value)}
                className="h-10 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[#3b2a18]">
              Mô tả ảnh
            </span>

            <input
              value={image.alt || ""}
              placeholder={form.name || "YEPO hero"}
              onChange={(event) => onUpdate(index, "alt", event.target.value)}
              className="h-10 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[#3b2a18]">
              Vị trí hiển thị
            </span>

            <select
              value={image.objectPosition || "center center"}
              onChange={(event) =>
                onUpdate(index, "objectPosition", event.target.value)
              }
              className="h-10 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-xs font-bold text-[#3b2a18] outline-none focus:border-[#b98c49]"
            >
              {HERO_POSITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-[#FFFAFA] px-3 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/80 disabled:opacity-40"
          >
            <ChevronUp size={14} />
            Lên
          </button>

          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index >= total - 1}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-[#FFFAFA] px-3 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/80 disabled:opacity-40"
          >
            <ChevronDown size={14} />
            Xuống
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="grid h-11 w-full place-items-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100 transition hover:bg-red-100 sm:w-11"
        aria-label="Xóa ảnh hero"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function FormBlock({ icon: Icon, title, children }) {
  return (
    <section className="rounded-[30px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <div className="mb-4 flex items-center gap-3 border-b border-[#d8b77e]/50 pb-4">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
          <Icon size={18} />
        </span>

        <h2 className="font-brand text-lg text-[#3b2a18]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Field({ label, value, onChange, required, placeholder, icon: Icon }) {
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
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10",
            Icon ? "pl-10" : "",
          ].join(" ")}
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
        placeholder={placeholder}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function ImageUploadBox({
  title,
  description,
  value,
  field,
  uploadingField,
  onChange,
  onUpload,
  highlight = false,
}) {
  const isUploading = uploadingField === field;

  return (
    <div
      className={[
        "rounded-[24px] border p-4",
        highlight
          ? "border-[#b98c49] bg-[#fff8f1]"
          : "border-[#d8b77e]/80 bg-[#FFFAFA]",
      ].join(" ")}
    >
      <p className="text-sm font-brand text-[#3b2a18]">{title}</p>

      <p className="mt-1 min-h-[38px] text-xs leading-5 text-[#756144]">
        {description}
      </p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-[#d8b77e] bg-white">
        {value ? (
          <img src={value} alt={title} className="h-36 w-full object-cover" />
        ) : (
          <div className="grid h-36 place-items-center text-[#b98c49]">
            <ImagePlus size={32} />
          </div>
        )}
      </div>

      <label className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-brand text-white transition hover:bg-[#8c672f]">
        {isUploading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <UploadCloud size={17} />
        )}

        {isUploading ? "Đang tải ảnh..." : "Upload ảnh"}

        <input
          type="file"
          accept="image/*,.gif"
          className="hidden"
          onChange={(event) => onUpload(field, event.target.files)}
        />
      </label>

      <input
        value={value ?? ""}
        placeholder="Hoặc dán URL ảnh..."
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 h-11 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
      />
    </div>
  );
}
`;

fs.writeFileSync(target, content, "utf8");

console.log("✅ Rebuilt active ShopView:", target);
