import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

function moneyInput(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function formatVndInput(value) {
  const digits = moneyInput(value);

  if (!digits) return "";

  return Number(digits).toLocaleString("vi-VN");
}

function formatMoneyPreview(value) {
  const digits = moneyInput(value);

  if (!digits) return "Chưa nhập giá";

  return Number(digits).toLocaleString("vi-VN") + " VNĐ";
}

export function ToppingPanel({
  open,
  editing,
  form,
  imageItems = [],
  submitting,
  onClose,
  onSubmit,
  onUpdate,
  onFilesAdd,
  onImageMove,
  onImageRemove,
  onClearImage,
}) {
  const mainImage = imageItems[0];

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, submitting, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2d2015]/55 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Đóng panel topping"
      />

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex h-[88dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[34px] border border-[#d8b77e]/80 bg-[#FFFAFA] shadow-[0_28px_90px_rgba(45,32,21,.28)]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#d8b77e]/60 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-[11px] font-brand uppercase tracking-[0.16em] text-[#b98c49]">
              <Sparkles size={14} />
              {editing ? "Chỉnh sửa topping" : "Thêm topping mới"}
            </p>

            <h2 className="font-sniglet mt-1 truncate text-2xl leading-tight text-[#3b2a18] sm:text-3xl">
              {editing ? "Cập nhật topping" : "Tạo topping"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#d8b77e]/70 transition hover:bg-[#f6d77d]/25 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
            <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#d8b77e]/65 bg-white shadow-sm">
              <div className="relative aspect-[16/8.5] bg-[#fff7eb] lg:aspect-[16/10]">
                {mainImage?.previewUrl ? (
                  <img
                    src={mainImage.previewUrl}
                    alt={form.name || "Topping"}
                    className="h-full w-full object-contain p-5"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-center text-[#b98c49]">
                    <div>
                      <ImagePlus size={42} className="mx-auto" />
                      <p className="mt-3 text-sm font-bold text-[#8c672f]">
                        Chưa có ảnh topping
                      </p>
                    </div>
                  </div>
                )}

                {imageItems.length > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-[#b98c49] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                    Ảnh bìa
                  </span>
                )}
              </div>

              <div className="grid gap-2 border-t border-[#d8b77e]/55 p-3 sm:grid-cols-2">
                <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#8c672f]">
                  <ImagePlus size={18} />
                  Thêm nhiều ảnh
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => {
                      onFilesAdd(event.target.files);
                      event.target.value = "";
                    }}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={onClearImage}
                  disabled={imageItems.length === 0}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-4 text-sm font-bold text-red-600 ring-1 ring-red-100 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Trash2 size={17} />
                  Xóa tất cả
                </button>
              </div>

              <div className="border-t border-[#d8b77e]/55 bg-[#FFFAFA] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#3b2a18]">
                      Thư viện ảnh topping
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-[#756144]">
                      Ảnh đầu tiên là ảnh bìa. Dùng Trước/Sau để đổi thứ tự.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/55">
                    {imageItems.length} ảnh
                  </span>
                </div>

                {imageItems.length > 0 ? (
                  <div className="grid max-h-[260px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                    {imageItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-2xl border border-[#d8b77e]/60 bg-white shadow-sm"
                      >
                        <div className="relative aspect-square">
                          <img
                            src={item.previewUrl}
                            alt={item.name || `Ảnh ${index + 1}`}
                            className="h-full w-full object-contain p-3"
                          />

                          <button
                            type="button"
                            onClick={() => onImageRemove(index)}
                            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                            aria-label="Xóa ảnh"
                          >
                            <X size={16} />
                          </button>

                          {index === 0 && (
                            <span className="absolute left-2 top-2 rounded-full bg-[#b98c49] px-2.5 py-1 text-[10px] font-bold text-white">
                              Bìa
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 border-t border-[#d8b77e]/45 p-2">
                          <button
                            type="button"
                            onClick={() => onImageMove(index, -1)}
                            disabled={index === 0}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#FFFAFA] text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/55 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft size={15} />
                            Trước
                          </button>

                          <button
                            type="button"
                            onClick={() => onImageMove(index, 1)}
                            disabled={index === imageItems.length - 1}
                            className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#FFFAFA] text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/55 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Sau
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8b77e]/70 bg-white px-4 py-8 text-center text-sm font-medium text-[#756144]">
                    Chưa có ảnh nào. Bấm “Thêm nhiều ảnh” để tải ảnh topping.
                  </div>
                )}
              </div>
            </section>

            <section className="min-w-0 space-y-4">
              <div className="grid gap-4 rounded-[28px] border border-[#d8b77e]/65 bg-white p-4 shadow-sm">
                <Field label="Tên topping" required>
                  <input
                    value={form.name || ""}
                    onChange={(event) => onUpdate("name", event.target.value)}
                    placeholder="Ví dụ: Kem cheese, trân châu..."
                    className="h-[52px] w-full rounded-2xl border border-[#d8b77e]/70 bg-[#FFFAFA] px-4 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Giá topping">
                    <div className="relative">
                      <input
                        value={formatVndInput(form.price)}
                        onChange={(event) =>
                          onUpdate("price", String(event.target.value || "").replace(/[^\d]/g, ""))
                        }
                        inputMode="numeric"
                        placeholder="10.000"
                        className="h-[52px] w-full rounded-2xl border border-[#d8b77e]/70 bg-[#FFFAFA] px-4 pr-16 text-sm font-bold text-[#3b2a18] outline-none transition placeholder:text-[#b8a589] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#f6d77d]/35 px-2.5 py-1 text-[11px] font-bold text-[#8c672f]">
                        VNĐ
                      </span>
                    </div>

                    <p className="mt-2 rounded-xl bg-[#f6d77d]/25 px-3 py-2 text-xs font-bold text-[#b98c49]">
                      {formatMoneyPreview(form.price)}
                    </p>
                  </Field>

                  <Field label="Thứ tự">
                    <input
                      value={form.sortOrder || ""}
                      onChange={(event) => onUpdate("sortOrder", event.target.value)}
                      inputMode="numeric"
                      placeholder="1"
                      className="h-[52px] w-full rounded-2xl border border-[#d8b77e]/70 bg-[#FFFAFA] px-4 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                    />
                  </Field>
                </div>

                <Field label="Mô tả topping">
                  <textarea
                    value={form.description || ""}
                    onChange={(event) => onUpdate("description", event.target.value)}
                    rows={5}
                    placeholder="Mô tả hương vị, món phù hợp dùng kèm, ghi chú cho khách..."
                    className="min-h-[128px] w-full resize-none rounded-2xl border border-[#d8b77e]/70 bg-[#FFFAFA] p-4 text-sm font-semibold leading-7 text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </Field>
              </div>

              <div className="grid gap-3 rounded-[28px] border border-[#d8b77e]/65 bg-white p-4 shadow-sm">
                <p className="flex items-center gap-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                  <BadgePercent size={15} />
                  Trạng thái
                </p>

                <Toggle
                  icon={form.isActive !== false ? Eye : EyeOff}
                  label="Công khai trên menu"
                  description="Tắt nếu muốn ẩn topping khỏi menu khách hàng."
                  checked={form.isActive !== false}
                  onChange={(checked) => onUpdate("isActive", checked)}
                />

                <Toggle
                  icon={form.isAvailable !== false ? Eye : EyeOff}
                  label="Đang bán"
                  description="Tắt khi topping tạm hết hàng."
                  checked={form.isAvailable !== false}
                  onChange={(checked) => onUpdate("isAvailable", checked)}
                />

                <Toggle
                  icon={Sparkles}
                  label="Topping nổi bật"
                  description="Dùng để ưu tiên hiển thị trong các khu vực nổi bật."
                  checked={Boolean(form.isFeatured)}
                  onChange={(checked) => onUpdate("isFeatured", checked)}
                />
              </div>
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-[#d8b77e]/60 bg-white p-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-[#FFFAFA] px-5 text-sm font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/70 transition hover:bg-[#f6d77d]/20 disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_14px_32px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Save size={19} />
            )}
            {submitting
              ? "Đang lưu..."
              : editing
                ? "Lưu thay đổi"
                : "Tạo topping"}
          </button>
        </footer>
      </form>
    </div>,
    document.body
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold text-[#3b2a18]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({ icon: Icon, label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[#d8b77e]/55 bg-[#FFFAFA] p-4 transition hover:bg-[#fff7eb]">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f6d77d]/35 text-[#b98c49]">
          <Icon size={18} />
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-bold text-[#3b2a18]">
            {label}
          </span>
          <span className="mt-1 block text-xs font-medium leading-5 text-[#756144]">
            {description}
          </span>
        </span>
      </div>

      <span className="relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-[#e4d6c3] transition has-[:checked]:bg-[#b98c49]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span className="ml-1 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
