import {
  Coffee,
  Eye,
  EyeOff,
  ImagePlus,
  Link2,
  Megaphone,
  Pin,
  Play,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { isValidUrl, makeDraftFromFile, makeDraftFromUrl } from "./postUtils";

const TEMPLATES = [
  {
    label: "Món mới",
    icon: Coffee,
    text: "Món mới tại YEPO\n\nHôm nay quán có thêm món mới dành cho khách. Ghé YEPO để thử và cảm nhận hương vị nhé!",
  },
  {
    label: "Ưu đãi",
    icon: Megaphone,
    text: "Ưu đãi hôm nay\n\nYEPO đang có chương trình ưu đãi đặc biệt. Khách ghé quán để xem menu và chọn món yêu thích nhé!",
  },
];

export function PostComposer({
  form,
  setForm,
  mediaDrafts,
  setMediaDrafts,
  editing,
  submitting,
  onSubmit,
  onCancelEdit,
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const canSubmit = Boolean(form.content.trim() || mediaDrafts.length > 0);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyTemplate(text) {
    update("content", form.content.trim() ? `${form.content.trim()}\n\n${text}` : text);
  }

  function handlePickFiles(event) {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setMediaDrafts((current) => [...current, ...files.map(makeDraftFromFile)]);
    }
    event.target.value = "";
  }

  function handleAddUrl() {
    const url = urlInput.trim();

    if (!isValidUrl(url)) {
      alert("URL media chưa hợp lệ.");
      return;
    }

    setMediaDrafts((current) => [...current, makeDraftFromUrl(url)]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function removeMedia(localId) {
    setMediaDrafts((current) => {
      const removed = current.find((item) => item.localId === localId);

      if (removed?.source === "file" && removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return current.filter((item) => item.localId !== localId);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]"
    >
      <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
              {editing ? "Chỉnh sửa bài đăng" : "Soạn bài đăng mới"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#3b2a18]">
              {editing ? "Cập nhật nội dung" : "Đăng bài cho khách hàng"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756144]">
              Dòng đầu tiên nên là tiêu đề ngắn. Có thể thêm ảnh, GIF hoặc video.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <StatusButton
              active={form.isPublished}
              onClick={() => update("isPublished", !form.isPublished)}
              activeLabel="Công khai"
              inactiveLabel="Ẩn tạm"
              activeIcon={Eye}
              inactiveIcon={EyeOff}
            />

            <StatusButton
              active={form.isPinned}
              onClick={() => update("isPinned", !form.isPinned)}
              activeLabel="Đang ghim"
              inactiveLabel="Ghim bài"
              activeIcon={Pin}
              inactiveIcon={Pin}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;

            return (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template.text)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f6d77d]/35"
              >
                <Icon size={14} />
                {template.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
            Nội dung bài đăng
          </span>

          <textarea
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            rows={7}
            placeholder="YEPO đang có điều gì mới?"
            className="w-full resize-y rounded-[22px] border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
          />
        </label>

        <div className="rounded-[24px] border border-[#d8b77e] bg-[#FFFAFA] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-[#3b2a18]">Media bài viết</p>
              <p className="mt-1 text-xs leading-5 text-[#756144]">
                Chọn nhiều ảnh/video/GIF hoặc dán URL media.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f6d77d]/30">
                <Upload size={15} />
                Chọn file
                <input
                  type="file"
                  accept="image/*,video/*,.gif"
                  multiple
                  className="hidden"
                  onChange={handlePickFiles}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput((value) => !value)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f6d77d]/30"
              >
                <Link2 size={15} />
                Dán URL
              </button>
            </div>
          </div>

          {showUrlInput && (
            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={urlInput}
                onChange={(event) => setUrlInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="Dán URL ảnh, GIF hoặc video..."
                className="h-11 rounded-2xl border border-[#d8b77e] bg-white px-3 text-sm outline-none focus:border-[#b98c49]"
              />

              <button
                type="button"
                onClick={handleAddUrl}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-bold text-white"
              >
                <Plus size={15} />
                Thêm
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="h-11 rounded-2xl bg-white px-4 text-sm font-bold text-[#8c672f] ring-1 ring-[#d8b77e]"
              >
                Đóng
              </button>
            </div>
          )}

          {mediaDrafts.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mediaDrafts.map((media, index) => (
                <MediaDraftCard
                  key={media.localId}
                  media={media}
                  index={index}
                  onRemove={() => removeMedia(media.localId)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] border border-dashed border-[#d8b77e] bg-white p-6 text-center">
              <ImagePlus size={32} className="mx-auto text-[#b98c49]" />
              <p className="mt-2 text-sm font-bold text-[#3b2a18]">
                Chưa có media
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#d8b77e]/60 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {editing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-4 text-sm font-bold text-[#756144] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3]"
            >
              <X size={16} />
              Hủy chỉnh sửa
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-50"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {editing ? "Lưu thay đổi" : form.isPublished ? "Đăng bài" : "Lưu nháp ẩn"}
        </button>
      </div>
    </form>
  );
}

function StatusButton({
  active,
  onClick,
  activeLabel,
  inactiveLabel,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold transition ring-1",
        active
          ? "bg-[#b98c49] text-white ring-[#b98c49]"
          : "bg-white text-[#8c672f] ring-[#d8b77e] hover:bg-[#f6d77d]/30",
      ].join(" ")}
    >
      <Icon size={15} />
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

function MediaDraftCard({ media, index, onRemove }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d8b77e] bg-white">
      <div className="relative aspect-square bg-[#f7efe3]">
        {media.type === "video" ? (
          <>
            <video
              src={media.url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 grid place-items-center bg-black/20">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white">
                <Play size={18} fill="white" />
              </span>
            </div>
          </>
        ) : (
          <img
            src={media.url}
            alt={media.name || "Media"}
            className="h-full w-full object-cover"
          />
        )}

        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white">
          #{index + 1}
        </span>

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-xl bg-white text-red-500 shadow-sm"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-bold text-[#3b2a18]">
          {media.name || "Media"}
        </p>
        <p className="mt-1 text-xs text-[#756144]">
          {media.source === "file" ? "File chờ upload" : "URL / đã lưu"}
        </p>
      </div>
    </div>
  );
}
