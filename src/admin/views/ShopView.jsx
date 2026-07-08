import {
  Building2,
  ImagePlus,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Save,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";

export function ShopView({
  form,
  setForm,
  saving,
  onSubmit,
}) {
  const [uploadingField, setUploadingField] = useState("");

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleUpload(field, fileList) {
    const files = Array.from(fileList || []);

    if (!files.length) return;

    setUploadingField(field);

    try {
      const result = await api.uploadMedia(files);
      const media = result.media?.[0];

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
          Cập nhật thông tin cửa hàng, ảnh logo, ảnh cover và ảnh hero hiển thị ở trang chủ.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
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
                placeholder="Dog cafe & ice cream"
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
                placeholder="09:00 - 22:00"
                onChange={(value) => update("openingHours", value)}
              />

              <Field
                label="Instagram"
                value={form.instagram}
                placeholder="https://instagram.com/..."
                icon={Instagram}
                onChange={(value) => update("instagram", value)}
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
                  value={form.googleMapsEmbedUrl}
                  placeholder="Dán link iframe/embed Google Maps..."
                  onChange={(value) => update("googleMapsEmbedUrl", value)}
                />
              </div>
            </div>
          </FormBlock>

          <FormBlock icon={ImagePlus} title="Hình ảnh cửa hàng">
            <div className="grid gap-4 lg:grid-cols-3">
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

              <ImageUploadBox
                title="Ảnh hero trang chủ"
                description="Ảnh chính ở khung lớn bên phải trang chủ."
                value={form.heroImageUrl}
                field="heroImageUrl"
                uploadingField={uploadingField}
                onChange={(value) => update("heroImageUrl", value)}
                onUpload={handleUpload}
                highlight
              />
            </div>
          </FormBlock>
        </div>

        <aside className="space-y-5">
          <section className="overflow-hidden rounded-[32px] border-2 border-[#B88046] bg-[#FFF5EB] p-4 shadow-[0_6px_0_#B88046]">
            <div className="mb-4 flex items-center gap-2 text-[#8C5A2B]">
              <Sparkles size={18} />
              <p className="text-sm font-bold uppercase tracking-widest">
                Preview ảnh hero
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border-2 border-[#B88046] bg-white p-2 shadow-[0_6px_0_#B88046] rotate-1 transition-transform duration-500 hover:rotate-0">
              {form.heroImageUrl || form.coverImageUrl ? (
                <img
                  src={form.heroImageUrl || form.coverImageUrl}
                  alt={form.name || "YEPO"}
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

              <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full border-2 border-[#B88046] bg-[#FFE4C4] text-[#8C5A2B] shadow-sm rotate-12">
                <Sparkles size={20} />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[#8C5A2B]">
              Ảnh này sẽ được dùng ở đoạn hero bên phải trang chủ.
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
          <img
            src={value}
            alt={title}
            className="h-36 w-full object-cover"
          />
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
