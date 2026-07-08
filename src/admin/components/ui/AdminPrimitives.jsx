import {
  Edit3,
  ImagePlus,
  Loader2,
  Save,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { cn } from "../../utils/adminUtils";

export function Alert({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={cn(
        "mt-4 rounded-2xl border px-4 py-3 text-sm font-brand",
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      {message}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="mt-6 grid min-h-[48vh] place-items-center rounded-[32px] border border-[#d8b77e] bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-[#b98c49]" size={36} />
        <p className="mt-3 text-sm font-brand text-[#6f5a3e]">
          Đang tải dashboard...
        </p>
      </div>
    </div>
  );
}

export function Panel({ title, icon: Icon, children }) {
  return (
    <section className="mobile-safe-card min-w-0 rounded-[30px] border border-[#d8b77e] bg-white p-4 shadow-[0_18px_60px_rgba(74,45,25,.07)] sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-[#e5c99c] pb-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
          <Icon size={20} />
        </div>

        <h3 className="font-sniglet text-2xl tracking-tight">{title}</h3>
      </div>

      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  inputMode,
  type = "text",
  icon: Icon,
  className = "",
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-2 text-sm font-brand text-[#3b2a18]">
        {Icon && <Icon size={15} />}
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-medium text-[#3b2a18] outline-none transition placeholder:text-[#b59b74] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm font-semibold leading-7 text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-medium text-[#3b2a18] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4 text-sm font-brand text-[#3b2a18]">
      {label}

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#b98c49]"
      />
    </label>
  );
}

export function FormField({ field, value, onChange }) {
  if (field.type === "toggle") {
    return (
      <Toggle
        label={field.label}
        checked={Boolean(value)}
        onChange={onChange}
      />
    );
  }

  if (field.type === "textarea") {
    return <TextArea label={field.label} value={value} onChange={onChange} />;
  }

  if (field.type === "select") {
    return (
      <Select
        label={field.label}
        value={value}
        onChange={onChange}
        options={field.options || []}
      />
    );
  }

  return (
    <Field
      label={field.label}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder}
      required={field.required}
      inputMode={field.inputMode}
      type={field.type || "text"}
    />
  );
}

export function FilePicker({ files, setFiles }) {
  return (
    <label className="block cursor-pointer rounded-3xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-4 text-center transition hover:bg-[#f7efe3]">
      <UploadCloud className="mx-auto text-[#b98c49]" size={30} />

      <p className="mt-2 text-sm font-brand">
        Upload ảnh / video lên Cloudinary
      </p>

      <p className="mt-1 text-xs font-medium text-[#6f5a3e]">
        {files.length ? `${files.length} file đã chọn` : "Có thể chọn nhiều file"}
      </p>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(event) => setFiles(Array.from(event.target.files || []))}
      />
    </label>
  );
}

export function ImageUploadCard({ label, src, onFiles }) {
  return (
    <div className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4">
      <p className="text-sm font-brand">{label}</p>

      <div className="mt-3 grid aspect-video place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#d8b77e]">
        {src ? (
          <img
            src={src}
            alt={label}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <ImagePlus size={34} className="text-[#b98c49]" />
        )}
      </div>

      <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 py-3 text-sm font-brand text-white">
        <UploadCloud size={16} />
        Upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onFiles(Array.from(event.target.files || []))}
        />
      </label>
    </div>
  );
}

export function SubmitButton({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white transition hover:bg-[#8c672f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
      {label}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search
        size={17}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c672f]"
      />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-11 pr-4 text-sm font-medium text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </div>
  );
}

export function IconButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-brand transition",
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-white text-[#b98c49] ring-1 ring-[#d8b77e] hover:bg-[#f7efe3]"
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export function Badge({ text, muted = false }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-brand",
        muted ? "bg-neutral-100 text-neutral-500" : "bg-[#f7efe3] text-[#8c672f]"
      )}
    >
      {text}
    </span>
  );
}

export function EmptyText({ text }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-3xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-8 text-center">
      <div>
        <ImagePlus className="mx-auto text-[#b98c49]" size={38} />
        <p className="mt-3 text-sm font-brand text-[#6f5a3e]">{text}</p>
      </div>
    </div>
  );
}

export function CardActions({ onEdit, onDelete }) {
  return (
    <div className="mt-4 flex gap-2">
      <IconButton icon={Edit3} label="Sửa" onClick={onEdit} />
      <IconButton icon={Trash2} label="Xóa" onClick={onDelete} danger />
    </div>
  );
}




