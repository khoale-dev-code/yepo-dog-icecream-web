import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Pin,
  Play,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  formatPostDate,
  getId,
  getPostContent,
  normalizePostMedia,
} from "./postUtils";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "published", label: "Đang hiện" },
  { value: "hidden", label: "Đang ẩn" },
  { value: "pinned", label: "Đã ghim" },
  { value: "media", label: "Có media" },
];

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
    <section className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-[24px] border border-[#d8b77e]/80 bg-white shadow-[0_14px_40px_rgba(87,61,28,.05)]">
        <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-brand uppercase tracking-[0.14em] text-[#b98c49]">
                Danh sách
              </p>

              <h2 className="mt-1 text-2xl font-black leading-tight text-[#3b2a18]">
                Bài đăng đã tạo
              </h2>

              <p className="mt-1 text-xs font-semibold leading-5 text-[#756144]">
                {posts.length} bài phù hợp với bộ lọc hiện tại.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px] lg:w-[540px]">
              <label className="relative block">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b98c49]"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm bài đăng..."
                  className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white pl-10 pr-3 text-sm font-semibold text-[#3b2a18] outline-none transition placeholder:text-[#9b8a72] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                />
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-3 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:hidden">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={[
                  "h-9 shrink-0 rounded-full px-4 text-xs font-bold transition",
                  status === option.value
                    ? "bg-[#b98c49] text-white shadow-[0_10px_22px_rgba(185,140,73,.18)]"
                    : "bg-white text-[#8c672f] ring-1 ring-[#d8b77e]/80",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyPostState />
        ) : (
          <div className="space-y-3 bg-[#FFFAFA] p-3 sm:space-y-4 sm:p-4">
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
      </div>

      <MediaViewer viewer={viewer} setViewer={setViewer} />
    </section>
  );
}

function EmptyPostState() {
  return (
    <div className="grid min-h-[240px] place-items-center bg-white px-6 py-10 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] text-[#b98c49]">
          <FileText size={34} />
        </div>

        <p className="mt-4 text-lg font-black text-[#3b2a18]">
          Chưa có bài đăng phù hợp
        </p>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#756144]">
          Thử đổi từ khóa tìm kiếm hoặc chọn lại trạng thái bài đăng.
        </p>
      </div>
    </div>
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
  const firstMedia = media[0];
  const isPublished = post.isPublished !== false && post.isActive !== false;
  const title = post.title || "Bài đăng YEPO";

  return (
    <article className="overflow-hidden rounded-[24px] border border-[#d8b77e]/80 bg-white shadow-[0_12px_34px_rgba(87,61,28,.05)]">
      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)]">
          <button
            type="button"
            onClick={() => firstMedia && onOpenMedia(media, 0)}
            disabled={!firstMedia}
            className="relative aspect-square overflow-hidden rounded-2xl border border-[#d8b77e]/70 bg-[#FFFAFA] disabled:cursor-default"
            aria-label="Xem media bài đăng"
          >
            {firstMedia ? (
              firstMedia.type === "video" ? (
                <>
                  <video
                    src={firstMedia.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white">
                      <Play size={17} fill="white" />
                    </span>
                  </span>
                </>
              ) : (
                <img
                  src={firstMedia.url}
                  alt={firstMedia.name || "Media"}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="grid h-full place-items-center text-[#b98c49]">
                <FileText size={26} />
              </div>
            )}

            {media.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                {media.length}
              </span>
            )}
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {post.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f6d77d]/45 px-2 py-1 text-[10px] font-bold uppercase text-[#8c672f]">
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

            <h3 className="mt-2 line-clamp-2 text-base font-black leading-snug text-[#3b2a18] sm:text-lg">
              {title}
            </h3>

            <p className="mt-1 text-xs font-semibold text-[#756144]">
              {formatPostDate(post.createdAt)}
            </p>

            {content && (
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#3b2a18] sm:line-clamp-4">
                {content}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[188px] lg:grid-cols-2">
          <IconButton
            label={post.isPinned ? "Bỏ ghim" : "Ghim"}
            onClick={() => onTogglePinned(post)}
            icon={Pin}
          />

          <IconButton
            label={isPublished ? "Ẩn" : "Hiện"}
            onClick={() => onTogglePublished(post)}
            icon={isPublished ? Eye : EyeOff}
          />

          <IconButton
            label="Sửa"
            onClick={() => onEdit(post)}
            icon={Edit3}
          />

          <IconButton
            label="Xóa"
            onClick={() => onDelete(post)}
            icon={Trash}
            danger
          />
        </div>
      </div>

      {media.length > 1 && (
        <PostMediaStrip media={media} onOpen={onOpenMedia} />
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
        "inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition active:scale-[0.98]",
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#d8b77e]/80 hover:bg-[#f6d77d]/30",
      ].join(" ")}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function PostMediaStrip({ media, onOpen }) {
  const visibleMedia = media.slice(0, 6);
  const extraCount = media.length - visibleMedia.length;

  return (
    <div className="border-t border-[#d8b77e]/70 bg-[#FFFAFA] px-3 py-3 sm:px-5">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleMedia.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => onOpen(media, index)}
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#d8b77e]/70 bg-white sm:h-24 sm:w-24"
            aria-label={`Mở media ${index + 1}`}
          >
            {item.type === "video" ? (
              <>
                <video
                  src={item.url}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  preload="metadata"
                  muted
                  playsInline
                />

                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white">
                    <Play size={17} fill="white" />
                  </span>
                </div>
              </>
            ) : (
              <img
                src={item.url}
                alt={item.name || "Media"}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            )}

            {extraCount > 0 && index === visibleMedia.length - 1 && (
              <div className="absolute inset-0 grid place-items-center bg-black/60 text-xl font-black text-white">
                +{extraCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function MediaViewer({ viewer, setViewer }) {
  const touchStartRef = useRef({ x: 0, y: 0 });

  const isOpen = viewer?.index !== null && viewer?.index !== undefined;
  const media = viewer?.media || [];
  const activeMedia = isOpen ? media[viewer.index] : null;
  const canMove = media.length > 1;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setViewer({ media: [], index: null });
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, viewer?.index, media.length, setViewer]);

  function closeViewer() {
    setViewer({ media: [], index: null });
  }

  function goPrev(event) {
    event?.stopPropagation?.();

    if (!canMove) return;

    setViewer((current) => ({
      media: current.media,
      index:
        (Number(current.index || 0) - 1 + current.media.length) %
        current.media.length,
    }));
  }

  function goNext(event) {
    event?.stopPropagation?.();

    if (!canMove) return;

    setViewer((current) => ({
      media: current.media,
      index: (Number(current.index || 0) + 1) % current.media.length,
    }));
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];

    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event) {
    if (!canMove) return;

    const touch = event.changedTouches?.[0];

    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      if (deltaX < 0) {
        goNext(event);
      } else {
        goPrev(event);
      }
    }
  }

  if (!isOpen || !activeMedia) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/92 text-white backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="text-sm font-bold">
            Media bài đăng
          </p>
          <p className="text-xs text-white/60">
            {Number(viewer.index || 0) + 1}/{media.length}
          </p>
        </div>

        <button
          type="button"
          onClick={closeViewer}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/12 text-white backdrop-blur transition hover:bg-white/20"
          aria-label="Đóng"
        >
          <X size={21} />
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        {activeMedia.type === "video" ? (
          <video
            key={activeMedia.url}
            src={activeMedia.url}
            controls
            playsInline
            className="h-full w-full bg-black object-contain"
          />
        ) : (
          <img
            key={activeMedia.url}
            src={activeMedia.url}
            alt={activeMedia.name || "Media"}
            draggable={false}
            className="h-full w-full object-contain"
          />
        )}

        {canMove && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
              aria-label="Media trước"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
              aria-label="Media sau"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {canMove && (
        <footer className="flex shrink-0 items-center justify-center gap-1.5 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
          {media.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => setViewer({ media, index })}
              className={[
                "h-1.5 rounded-full transition-all",
                index === viewer.index ? "w-6 bg-white" : "w-1.5 bg-white/35",
              ].join(" ")}
              aria-label={`Media ${index + 1}`}
            />
          ))}
        </footer>
      )}
    </div>
  );
}