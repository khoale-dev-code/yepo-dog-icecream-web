import {
  ImagePlus,
  Loader2,
  Save,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "../utils/adminUtils";
import { getToppingImage } from "./toppingUtils";

export function ToppingPanel({
  open,
  editing,
  form,
  selectedPreview,
  submitting,
  onClose,
  onSubmit,
  onUpdate,
  onFileChange,
  onClearImage,
}) {
  const imagePreview = selectedPreview || form.imageUrl || getToppingImage(form);
  const isVisible = form.isActive !== false && form.isAvailable !== false;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        className="absolute inset-0 bg-[#2f2115]/35 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng panel"
      />

      <form
        onSubmit={onSubmit}
        className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden bg-[#FFFAFA] shadow-[-20px_0_60px_rgba(47,33,21,.18)] sm:rounded-l-[34px]"
      >
        <PanelHeader editing={editing} onClose={onClose} />

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <section className="rounded-[26px] border border-[#ead7b6] bg-white p-4">
            <p className="text-sm font-black text-[#3b2a18]">
              Thông tin topping
            </p>

            <div className="mt-4 grid gap-4">
              <Field
                label="Tên topping"
                value={form.name}
                required
                placeholder="Ví dụ: Trân châu, Pudding..."
                onChange={(value) => onUpdate("name", value)}
              />

              <Textarea
                label="Mô tả ngắn"
                value={form.description}
                placeholder="Mô tả topping..."
                onChange={(value) => onUpdate("description", value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Giá topping"
                  value={form.price}
                  inputMode="numeric"
                  placeholder="10000"
                  onChange={(value) =>
                    onUpdate("price", value.replace(/[^\d]/g, ""))
                  }
                />

                <Field
                  label="Thứ tự"
                  value={form.sortOrder}
                  inputMode="numeric"
                  placeholder="1"
                  onChange={(value) =>
                    onUpdate("sortOrder", value.replace(/[^\d]/g, ""))
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#ead7b6] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-[#3b2a18]">
                Hình topping
              </p>

              {imagePreview && (
                <button
                  type="button"
                  onClick={onClearImage}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-red-50 px-3 text-xs font-bold text-red-500"
                >
                  <X size={13} />
                  Xóa ảnh
                </button>
              )}
            </div>

            <div className="mt-3 overflow-hidden rounded-[24px] border border-[#d8b77e] bg-[#FFFAFA]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={form.name || "Topping"}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="grid h-52 place-items-center text-center text-[#b98c49]">
                  <div>
                    <ImagePlus size={38} className="mx-auto" />
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
                  if (file) onFileChange(file);
                  event.target.value = "";
                }}
              />
            </label>

            <input
              value={form.imageUrl ?? ""}
              placeholder="Hoặc dán URL ảnh..."
              onChange={(event) => {
                const url = event.target.value.trim();

                onFileChange(null);
                onUpdate("imageUrl", url);
                onUpdate(
                  "media",
                  url
                    ? [
                        {
                          url,
                          publicId: "",
                          resourceType: "image",
                          originalName: "URL image",
                        },
                      ]
                    : []
                );
              }}
              className="mt-3 h-11 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-xs text-[#3b2a18] outline-none focus:border-[#b98c49]"
            />
          </section>

          <Toggle
            label="Hiển thị topping"
            description="Tắt khi topping tạm hết hoặc chưa muốn hiện ngoài website."
            checked={isVisible}
            onChange={(checked) => {
              onUpdate("isActive", checked);
              onUpdate("isAvailable", checked);
            }}
          />
        </div>

        <div className="border-t border-[#ead7b6] bg-white p-5">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {editing ? "Lưu thay đổi" : "Thêm topping"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PanelHeader({ editing, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#ead7b6] bg-white p-5">
      <div>
        <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
          {editing ? "Chỉnh sửa" : "Tạo mới"}
        </p>

        <h2 className="mt-1 text-2xl font-black text-[#3b2a18]">
          {editing ? "Cập nhật topping" : "Thêm topping"}
        </h2>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFFAFA] text-[#8c672f]"
      >
        <X size={19} />
      </button>
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
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
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
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-[#d8b77e] bg-white p-4">
      <span>
        <span className="block text-sm font-black text-[#3b2a18]">
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
