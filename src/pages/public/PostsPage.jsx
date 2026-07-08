import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Heart,
  Images,
  LayoutGrid,
  MapPin,
  MessageCircle,
  PawPrint,
  Pin,
  Play,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

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

function inferTypeFromUrl(url = "") {
  const cleanUrl = String(url || "").toLowerCase().split("?")[0];

  if (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".ogg")
  ) {
    return "video";
  }

  return "image";
}

function normalizePostMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item, index) => {
      const url = getMediaUrl(item);

      if (!url) return null;

      const type =
        typeof item === "string"
          ? inferTypeFromUrl(url)
          : item.type || item.resourceType || item.resource_type || inferTypeFromUrl(url);

      return {
        url,
        type,
        resourceType: type,
        name:
          typeof item === "string"
            ? `Media ${index + 1}`
            : item.name || item.originalName || `Media ${index + 1}`,
      };
    })
    .filter(Boolean);
}

function getPostContent(post) {
  return post?.content || post?.title || post?.excerpt || "";
}

function getPostTitle(post) {
  if (post?.title) return post.title;

  const firstLine = String(getPostContent(post))
    .split("\n")
    .find((line) => line.trim());

  return firstLine?.trim() || "Bài đăng YEPO";
}

function formatHours(shop) {
  if (shop?.openTime && shop?.closeTime) {
    return `${shop.openTime} – ${shop.closeTime}`;
  }

  return null;
}

function timeAgo(raw) {
  try {
    const diff = (Date.now() - new Date(raw)) / 1000;

    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

    return new Date(raw).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

function renderCaption(text) {
  if (!text) return null;

  return text.split(/(\s+)/).map((word, index) =>
    word.startsWith("#") ? (
      <span key={index} className="font-bold text-[#b98c49]">
        {word}
      </span>
    ) : (
      <span key={index}>{word}</span>
    )
  );
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    window.addEventListener("resize", handleResize, { passive: true });

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

function useLockBodyScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [enabled]);
}

export default function PostsPage({ store }) {
  const [activePost, setActivePost] = useState(null);
  const isMobile = useIsMobile();

  const shop = store?.shop || {};

  const posts = useMemo(() => {
    return getList(store, "posts")
      .filter((post) => post.isActive !== false && post.isPublished !== false)
      .map((post) => ({
        ...post,
        media: normalizePostMedia(post.media),
      }))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        const sortA = Number(a.order || a.sortOrder || 999);
        const sortB = Number(b.order || b.sortOrder || 999);

        if (sortA !== sortB) return sortA - sortB;

        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [store]);

  return (
    <main className="min-h-screen bg-[#FFFAFA] font-['Quicksand'] text-[#2D2D2D]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <ProfileHeader shop={shop} postCount={posts.length} />

        <section className="mt-8 overflow-hidden rounded-[2.25rem] border border-[#b98c49]/20 bg-white shadow-[0_8px_40px_rgba(185,140,73,0.08)]">
          <div className="flex items-center justify-center border-b border-[#b98c49]/15 bg-[#FFFAFA]">
            <div className="-mb-px inline-flex items-center gap-2 border-b-2 border-[#b98c49] px-5 py-4 text-xs font-['Fredoka'] font-semibold uppercase tracking-[0.16em] text-[#b98c49]">
              <LayoutGrid size={14} />
              Bài viết
            </div>
          </div>

          {posts.length > 0 ? (
            <div
              className="grid grid-cols-3 gap-1 bg-[#f2e2ca] p-1 sm:gap-2 sm:p-2 lg:gap-3 lg:p-3"
              role="list"
              aria-label="Bài đăng của YEPO"
            >
              {posts.map((post) => (
                <div key={post._id || post.id} role="listitem">
                  <PostGridCell post={post} onClick={() => setActivePost(post)} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyPosts />
          )}
        </section>
      </div>

      {activePost && isMobile && (
        <MobilePostDetail
          post={activePost}
          shop={shop}
          onClose={() => setActivePost(null)}
        />
      )}

      {activePost && !isMobile && (
        <DesktopPostModal
          post={activePost}
          shop={shop}
          onClose={() => setActivePost(null)}
        />
      )}
    </main>
  );
}

function ProfileHeader({ shop, postCount }) {
  const hours = formatHours(shop);
  const address = shop?.address;
  const handle =
    shop?.username ||
    shop?.name?.toLowerCase().replace(/\s+/g, "") ||
    "yepo";

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:p-8 lg:p-10">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f6d77d]/45 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#b98c49]/10 blur-3xl" />

      <div className="relative">
        <Link
          to="/menu"
          className="inline-flex items-center gap-1 text-xs font-['Fredoka'] font-semibold uppercase tracking-[0.12em] text-[#b98c49] transition hover:opacity-70"
        >
          <ChevronLeft size={15} />
          Xem thực đơn
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="mx-auto grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-[#FFFAFA] shadow-[0_0_0_3px_rgba(185,140,73,.25),0_16px_34px_rgba(185,140,73,.16)] sm:mx-0 sm:h-32 sm:w-32">
            {shop?.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name || "YEPO"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Coffee size={42} className="text-[#b98c49]" />
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-['Fredoka'] font-semibold uppercase tracking-[0.16em] text-[#b98c49]">
                  @{handle}
                </p>

                <h1 className="mt-2 font-['Quicksand'] text-3xl font-semibold tracking-tight text-[#2D2D2D] sm:text-4xl">
                  {shop?.name || "YEPO Dog & Ice Cream"}
                </h1>
              </div>

              <Link
                to="/menu"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-['Fredoka'] font-semibold text-white shadow-[0_12px_30px_rgba(185,140,73,.22)] transition hover:bg-[#a1783a]"
              >
                Xem menu
              </Link>
            </div>

            <div className="mt-5 flex justify-center gap-4 sm:justify-start">
              <div className="rounded-2xl border border-[#b98c49]/15 bg-[#FFFAFA] px-5 py-3 text-center">
                <span className="block font-['Fredoka'] text-2xl font-semibold text-[#2D2D2D]">
                  {postCount}
                </span>
                <span className="text-xs font-semibold text-[#666666]">
                  bài viết
                </span>
              </div>
            </div>

            {shop?.description && (
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#666666]">
                {shop.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {address && (
                <InfoPill icon={MapPin}>
                  {address}
                </InfoPill>
              )}

              {hours && (
                <InfoPill icon={Clock}>
                  {hours}
                </InfoPill>
              )}

              <InfoPill icon={CalendarDays}>
                Cập nhật mới từ YEPO
              </InfoPill>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/15 bg-[#FFFAFA] px-3 py-2 text-xs font-semibold text-[#756144]">
      <Icon size={14} className="text-[#b98c49]" />
      {children}
    </span>
  );
}

function EmptyPosts() {
  return (
    <div className="grid min-h-[360px] place-items-center bg-white px-6 py-16 text-center">
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-dashed border-[#b98c49]/45 bg-[#FFFAFA] text-[#b98c49]">
          <LayoutGrid size={30} />
        </div>

        <h2 className="mt-5 font-['Quicksand'] text-2xl font-semibold text-[#2D2D2D]">
          Chưa có bài đăng nào
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#666666]">
          YEPO sẽ sớm chia sẻ hình ảnh món mới, ưu đãi và những khoảnh khắc dễ thương tại quán.
        </p>
      </div>
    </div>
  );
}

function PostGridCell({ post, onClick }) {
  const [hovered, setHovered] = useState(false);
  const media = normalizePostMedia(post.media);
  const firstMedia = media[0];
  const hasMedia = media.length > 0;
  const isVideo = firstMedia?.type === "video";
  const isMulti = media.length > 1;
  const content = getPostContent(post);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative block aspect-square w-full overflow-hidden bg-[#FFFAFA] text-left outline-none"
      aria-label={`Mở bài viết ${getPostTitle(post)}`}
    >
      {hasMedia ? (
        isVideo ? (
          <video
            src={firstMedia.url}
            preload="metadata"
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <img
            src={firstMedia.url}
            alt={getPostTitle(post)}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[#FFFAFA] p-3">
          <p className="line-clamp-6 text-center text-[11px] font-semibold leading-5 text-[#756144] sm:text-sm">
            {content || "Bài đăng YEPO"}
          </p>
        </div>
      )}

      <div
        className={[
          "absolute inset-0 bg-[#2D2D2D]/45 transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      <div
        className={[
          "absolute inset-0 flex items-center justify-center gap-4 text-white transition-opacity duration-200",
          hovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <span className="inline-flex items-center gap-1 text-sm font-bold">
          <Heart size={17} fill="white" />
          {Number(post.likeCount || 0).toLocaleString("vi-VN")}
        </span>

        <span className="inline-flex items-center gap-1 text-sm font-bold">
          <MessageCircle size={17} fill="white" />
          {Number(post.commentCount || 0).toLocaleString("vi-VN")}
        </span>
      </div>

      <div className="absolute right-2 top-2 flex gap-1.5">
        {post.isPinned && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#b98c49] text-white shadow-sm">
            <Pin size={13} />
          </span>
        )}

        {isVideo && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm">
            <Play size={13} fill="white" />
          </span>
        )}

        {isMulti && !isVideo && (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm">
            <Images size={14} />
          </span>
        )}
      </div>
    </button>
  );
}

function MediaCarousel({ media = [], mode = "modal" }) {
  const [index, setIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const safeMedia = normalizePostMedia(media);
  const currentMedia = safeMedia[index];
  const canMove = safeMedia.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [media]);

  function goPrev(event) {
    event?.stopPropagation?.();
    if (!canMove) return;
    setIndex((current) => (current - 1 + safeMedia.length) % safeMedia.length);
  }

  function goNext(event) {
    event?.stopPropagation?.();
    if (!canMove) return;
    setIndex((current) => (current + 1) % safeMedia.length);
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!canMove) return;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      if (deltaX < 0) goNext(event);
      else goPrev(event);
    }
  }

  if (!currentMedia) {
    return (
      <div className="grid h-full min-h-[320px] place-items-center bg-[#111] text-sm text-white">
        Không có media
      </div>
    );
  }

  return (
    <div
      className={[
        "relative overflow-hidden bg-[#111]",
        mode === "page" ? "aspect-square w-full" : "h-full min-h-[420px] w-full",
      ].join(" ")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.type === "video" ? (
        <video
          key={currentMedia.url}
          src={currentMedia.url}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full bg-[#111] object-contain"
        />
      ) : (
        <img
          key={currentMedia.url}
          src={currentMedia.url}
          alt={currentMedia.name || `Media ${index + 1}`}
          draggable={false}
          className={[
            "absolute inset-0 h-full w-full bg-[#111]",
            mode === "page" ? "object-cover" : "object-contain",
          ].join(" ")}
        />
      )}

      {canMove && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white"
            aria-label="Media trước"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white"
            aria-label="Media sau"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {safeMedia.map((item, dotIndex) => (
              <button
                key={`${item.url}-${dotIndex}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex(dotIndex);
                }}
                className={[
                  "h-1.5 rounded-full transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
                ].join(" ")}
                aria-label={`Media ${dotIndex + 1}`}
              />
            ))}
          </div>

          <span className="absolute bottom-4 right-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {index + 1}/{safeMedia.length}
          </span>
        </>
      )}
    </div>
  );
}

function DesktopPostModal({ post, shop, onClose }) {
  useLockBodyScroll(true);

  const media = normalizePostMedia(post.media);
  const hasMedia = media.length > 0;
  const shopHandle =
    shop?.username ||
    shop?.name?.toLowerCase().replace(/\s+/g, "") ||
    "yepo";

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <article className="flex h-[min(88vh,780px)] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_90px_rgba(0,0,0,.35)]">
        <div className="w-[62%] min-w-0 bg-[#111]">
          {hasMedia ? (
            <MediaCarousel media={media} mode="modal" />
          ) : (
            <div className="grid h-full place-items-center bg-[#FFFAFA] p-10 text-center">
              <p className="max-w-md whitespace-pre-wrap text-lg font-semibold leading-8 text-[#3b2a18]">
                {getPostContent(post)}
              </p>
            </div>
          )}
        </div>

        <aside className="flex min-w-[320px] flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-[#b98c49]/15 p-4">
            <ShopAvatar shop={shop} small />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#2D2D2D]">
                {shopHandle}
              </p>
              <p className="text-xs text-[#999999]">
                {timeAgo(post.createdAt)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#756144] transition hover:bg-[#f6d77d]/30"
              aria-label="Đóng"
            >
              <X size={20} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <h2 className="font-['Quicksand'] text-xl font-semibold leading-snug text-[#2D2D2D]">
              {getPostTitle(post)}
            </h2>

            {getPostContent(post) && (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#3b2a18]">
                <span className="mr-1 font-bold">{shopHandle}</span>
                {renderCaption(getPostContent(post))}
              </p>
            )}
          </div>

          <div className="border-t border-[#b98c49]/15 p-4 text-xs text-[#999999]">
            Click ra ngoài hoặc nhấn ESC để đóng.
          </div>
        </aside>
      </article>
    </div>
  );
}

function MobilePostDetail({ post, shop, onClose }) {
  useLockBodyScroll(true);

  const media = normalizePostMedia(post.media);
  const hasMedia = media.length > 0;
  const shopHandle =
    shop?.username ||
    shop?.name?.toLowerCase().replace(/\s+/g, "") ||
    "yepo";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-y-auto bg-[#FFFAFA]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#b98c49]/15 bg-white/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#3b2a18]"
          aria-label="Quay lại"
        >
          <ArrowLeft size={21} />
        </button>

        <ShopAvatar shop={shop} small />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#2D2D2D]">
            {shopHandle}
          </p>
          <p className="text-xs text-[#999999]">
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </header>

      {hasMedia ? (
        <MediaCarousel media={media} mode="page" />
      ) : (
        <div className="grid min-h-[260px] place-items-center bg-white p-8 text-center">
          <p className="whitespace-pre-wrap text-base font-semibold leading-8 text-[#3b2a18]">
            {getPostContent(post)}
          </p>
        </div>
      )}

      <section className="bg-[#FFFAFA] px-4 py-5">
        <h2 className="font-['Quicksand'] text-xl font-semibold leading-snug text-[#2D2D2D]">
          {getPostTitle(post)}
        </h2>

        {getPostContent(post) && hasMedia && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#3b2a18]">
            <span className="mr-1 font-bold">{shopHandle}</span>
            {renderCaption(getPostContent(post))}
          </p>
        )}
      </section>
    </div>
  );
}

function ShopAvatar({ shop, small = false }) {
  return (
    <div
      className={[
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#b98c49]/20 bg-[#FFFAFA] text-[#b98c49]",
        small ? "h-10 w-10" : "h-12 w-12",
      ].join(" ")}
    >
      {shop?.logoUrl ? (
        <img
          src={shop.logoUrl}
          alt={shop?.name || "YEPO"}
          className="h-full w-full object-cover"
        />
      ) : (
        <PawPrint size={small ? 18 : 22} />
      )}
    </div>
  );
}
