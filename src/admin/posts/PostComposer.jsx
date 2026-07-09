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

  const content = String(form.content || "");
  const canSubmit = Boolean(content.trim() || mediaDrafts.length > 0);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyTemplate(text) {
    update("content", content.trim() ? `${content.trim()}\n\n${text}` : text);
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
      data-admin-post-composer="true"
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]"
    >
      <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-brand uppercase tracking-[0.14em] text-[#b98c49] sm:text-xs">
              {editing ? "Chỉnh sửa bài đăng" : "Soạn bài đăng mới"}
            </p>

            <h2 className="mt-2 text-2xl font-black leading-tight text-[#3b2a18] sm:text-3xl">
              {editing ? "Cập nhật nội dung" : "Đăng bài cho khách hàng"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#756144]">
              Dòng đầu tiên nên là tiêu đề ngắn. Có thể thêm ảnh, GIF hoặc video.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
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

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;

            return (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template.text)}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f6d77d]/35"
              >
                <Icon size={14} />
                {template.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:space-y-5 sm:p-5">
        <label className="block">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="block text-sm font-brand text-[#3b2a18]">
              Nội dung bài đăng
            </span>

            <span className="rounded-full bg-[#f6d77d]/35 px-2.5 py-1 text-[11px] font-bold text-[#8c672f]">
              {content.trim().length} ký tự
            </span>
          </div>

          <textarea
            value={content}
            onChange={(event) => update("content", event.target.value)}
            rows={7}
            placeholder="YEPO đang có điều gì mới?"
            className="min-h-[190px] w-full resize-y rounded-[22px] border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-base leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
          />
        </label>

        <section className="overflow-hidden rounded-[24px] border border-[#d8b77e] bg-[#FFFAFA]">
          <div className="border-b border-[#d8b77e]/60 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-[#3b2a18]">Media bài viết</p>

                <p className="mt-1 text-xs leading-5 text-[#756144]">
                  Chọn nhiều ảnh/video/GIF hoặc dán URL media.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-xs font-bold text-white shadow-[0_10px_24px_rgba(185,140,73,.18)] transition hover:bg-[#8c672f] sm:bg-white sm:text-[#8c672f] sm:shadow-none sm:ring-1 sm:ring-[#d8b77e] sm:hover:bg-[#f6d77d]/30">
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f6d77d]/30"
                >
                  <Link2 size={15} />
                  Dán URL
                </button>
              </div>
            </div>

            {showUrlInput && (
              <div className="mt-4 rounded-[20px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-3">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
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
                    className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-base text-[#3b2a18] outline-none focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:text-sm"
                  />

                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(185,140,73,.18)]"
                  >
                    <Plus size={15} />
                    Thêm
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlInput(false);
                      setUrlInput("");
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-bold text-[#8c672f] ring-1 ring-[#d8b77e]"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

          {mediaDrafts.length > 0 ? (
            <div className="p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#756144]">
                  {mediaDrafts.length} media đang chờ đăng
                </p>

                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/80">
                  Vuốt ngang để xem
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
                {mediaDrafts.map((media, index) => (
                  <MediaDraftCard
                    key={media.localId}
                    media={media}
                    index={index}
                    onRemove={() => removeMedia(media.localId)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 sm:p-4">
              <div className="rounded-[22px] border border-dashed border-[#d8b77e] bg-white px-5 py-8 text-center">
                <ImagePlus size={34} className="mx-auto text-[#b98c49]" />

                <p className="mt-3 text-sm font-bold text-[#3b2a18]">
                  Chưa có media
                </p>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#756144]">
                  Thêm ảnh/video để bài đăng sinh động hơn trên trang khách hàng.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-[#d8b77e]/60 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-0">
            {editing && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-4 text-sm font-bold text-[#756144] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3] sm:w-auto"
              >
                <X size={16} />
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-50 sm:h-12 sm:w-auto"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            {editing
              ? "Lưu thay đổi"
              : form.isPublished
                ? "Đăng bài"
                : "Lưu nháp ẩn"}
          </button>
        </div>
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
        "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-bold transition ring-1 active:scale-[0.98] sm:h-10 sm:rounded-full",
        active
          ? "bg-[#b98c49] text-white ring-[#b98c49] shadow-[0_10px_24px_rgba(185,140,73,.18)]"
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
    <article className="w-[72vw] max-w-[260px] shrink-0 overflow-hidden rounded-[20px] border border-[#d8b77e] bg-white shadow-sm sm:w-auto sm:max-w-none">
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
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-2xl bg-white text-red-500 shadow-sm ring-1 ring-red-100"
          aria-label="Xóa media"
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
    </article>
  );
}