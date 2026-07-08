import {
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Pin,
  Play,
  Search,
  Trash,
} from "lucide-react";
import { useEffect } from "react";
import {
  formatPostDate,
  getId,
  getPostContent,
  normalizePostMedia,
} from "./postUtils";

export function PostList({
  posts,
  query,
  setQuery,
  status,
  setStatus,
  onEdit,
  onDelete,
  onTogglePublished,
  onTogglePinned,
  viewer,
  setViewer,
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-[#d8b77e]/80 bg-white p-4 shadow-[0_14px_40px_rgba(87,61,28,.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
              Danh sách
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#3b2a18]">
              Bài đăng đã tạo
            </h2>
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px] lg:w-[520px]">
            <label className="relative block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm bài đăng..."
                className="h-11 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-10 pr-3 text-sm outline-none focus:border-[#b98c49]"
              />
            </label>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-sm font-bold text-[#3b2a18] outline-none focus:border-[#b98c49]"
            >
              <option value="all">Tất cả</option>
              <option value="published">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
              <option value="pinned">Đã ghim</option>
              <option value="media">Có media</option>
            </select>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#d8b77e] bg-white p-8 text-center">
          <FileText size={40} className="mx-auto text-[#b98c49]" />
          <p className="mt-3 text-lg font-black text-[#3b2a18]">
            Chưa có bài đăng phù hợp
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={getId(post)}
              post={post}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePublished={onTogglePublished}
              onTogglePinned={onTogglePinned}
              onOpenMedia={(media, index) => setViewer({ media, index })}
            />
          ))}
        </div>
      )}

      <MediaViewer viewer={viewer} setViewer={setViewer} />
    </section>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
  onTogglePublished,
  onTogglePinned,
  onOpenMedia,
}) {
  const content = getPostContent(post);
  const media = normalizePostMedia(post.media);
  const isPublished = post.isPublished !== false && post.isActive !== false;

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#d8b77e]/80 bg-white shadow-[0_12px_34px_rgba(87,61,28,.05)]">
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-black text-[#3b2a18]">
              {post.title || "Bài đăng YEPO"}
            </p>

            {post.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f6d77d]/40 px-2 py-1 text-[10px] font-bold uppercase text-[#8c672f]">
                <Pin size={11} />
                Ghim
              </span>
            )}

            <span
              className={[
                "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                isPublished
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-neutral-100 text-neutral-500",
              ].join(" ")}
            >
              {isPublished ? "Đang hiện" : "Đang ẩn"}
            </span>
          </div>

          <p className="mt-1 text-xs font-semibold text-[#756144]">
            {formatPostDate(post.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:flex">
          <IconButton label={post.isPinned ? "Bỏ ghim" : "Ghim"} onClick={() => onTogglePinned(post)} icon={Pin} />
          <IconButton label={isPublished ? "Ẩn" : "Hiện"} onClick={() => onTogglePublished(post)} icon={isPublished ? Eye : EyeOff} />
          <IconButton label="Sửa" onClick={() => onEdit(post)} icon={Edit3} />
          <IconButton label="Xóa" onClick={() => onDelete(post)} icon={Trash} danger />
        </div>
      </div>

      {content && (
        <div className="px-4 pb-4 sm:px-5">
          <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-[#3b2a18] line-clamp-5">
            {content}
          </p>
        </div>
      )}

      {media.length > 0 && (
        <PostMediaGrid media={media} onOpen={onOpenMedia} />
      )}
    </article>
  );
}

function IconButton({ label, onClick, icon: Icon, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={[
        "inline-flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-bold transition sm:w-10 sm:px-0",
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#d8b77e] hover:bg-[#f6d77d]/30",
      ].join(" ")}
    >
      <Icon size={16} />
      <span className="ml-1 sm:hidden">{label}</span>
    </button>
  );
}

function PostMediaGrid({ media, onOpen }) {
  const visibleMedia = media.slice(0, 4);
  const extraCount = media.length - visibleMedia.length;

  return (
    <div
      className={[
        "grid gap-[2px] border-t border-[#d8b77e] bg-[#d8b77e]",
        visibleMedia.length === 1 ? "grid-cols-1" : "grid-cols-2",
      ].join(" ")}
    >
      {visibleMedia.map((item, index) => (
        <button
          key={`${item.url}-${index}`}
          type="button"
          onClick={() => onOpen(media, index)}
          className={[
            "group relative overflow-hidden bg-[#FFFAFA] text-left",
            visibleMedia.length === 1 ? "aspect-video" : "aspect-square",
          ].join(" ")}
        >
          {item.type === "video" ? (
            <>
              <video
                src={item.url}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                preload="metadata"
                muted
                playsInline
              />
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white">
                  <Play size={22} fill="white" />
                </span>
              </div>
            </>
          ) : (
            <img
              src={item.url}
              alt={item.name || "Media"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          )}

          {extraCount > 0 && index === visibleMedia.length - 1 && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-black text-white">
              +{extraCount}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function MediaViewer({ viewer, setViewer }) {
  const isOpen = viewer?.index !== null && viewer?.index !== undefined;
  const media = viewer?.media || [];
  const activeMedia = isOpen ? media[viewer.index] : null;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") setViewer({ media: [], index: null });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setViewer]);

  if (!isOpen || !activeMedia) return null;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/85 p-4 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setViewer({ media: [], index: null })}
        className="absolute right-4 top-4 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-[#3b2a18]"
      >
        Đóng
      </button>

      {activeMedia.type === "video" ? (
        <video
          src={activeMedia.url}
          controls
          playsInline
          className="max-h-[86vh] max-w-[94vw] rounded-2xl bg-black object-contain"
        />
      ) : (
        <img
          src={activeMedia.url}
          alt={activeMedia.name || "Media"}
          className="max-h-[86vh] max-w-[94vw] rounded-2xl object-contain"
        />
      )}
    </div>
  );
}
