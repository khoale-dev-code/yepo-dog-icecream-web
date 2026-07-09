import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function getId(item) {
  return String(item?._id || item?.id || item?.slug || item?.name || "");
}

function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || media?.secureUrl || media?.secure_url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
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

function getToppingMedia(topping) {
  const media = Array.isArray(topping?.media)
    ? topping.media
        .map((item, index) => {
          const url = getMediaUrl(item);
          if (!url) return null;

          return {
            url,
            type: isVideoMedia(item) ? "video" : "image",
            name:
              typeof item === "string"
                ? `${topping?.name || "Topping"} ${index + 1}`
                : item.name ||
                  item.originalName ||
                  item.original_name ||
                  `${topping?.name || "Topping"} ${index + 1}`,
          };
        })
        .filter(Boolean)
    : [];

  if (media.length > 0) return media;

  const imageUrl =
    topping?.imageUrl ||
    topping?.image ||
    topping?.thumbnailUrl ||
    topping?.coverUrl ||
    "";

  return imageUrl
    ? [
        {
          url: imageUrl,
          type: "image",
          name: topping?.name || "Topping",
        },
      ]
    : [];
}

function getFirstImage(topping) {
  const media = getToppingMedia(topping);
  const image = media.find((item) => item.type !== "video");

  return image?.url || media[0]?.url || "";
}

function formatPrice(value) {
  const number = Number(value || 0);
  if (!number) return "Liên hệ";
  return `${number.toLocaleString("vi-VN")} đ`;
}

function getDescription(topping) {
  return (
    topping?.description ||
    topping?.shortDescription ||
    topping?.note ||
    "Topping này giúp món của bạn thơm ngon hơn, dễ ăn hơn và hợp với nhiều món kem/cà phê tại YEPO."
  );
}

function useLockBodyScroll(enabled) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyLeft = document.body.style.left;
    const previousBodyRight = document.body.style.right;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = "-" + scrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.left = previousBodyLeft;
      document.body.style.right = previousBodyRight;
      document.body.style.width = previousBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [enabled]);
}

export default function ToppingSection({ toppings = [] }) {
  const [activeTopping, setActiveTopping] = useState(null);

  if (!Array.isArray(toppings) || toppings.length === 0) return null;

  return (
    <section className="mt-6 rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_12px_42px_rgba(185,140,73,.08)] sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#8c672f]">
            <Plus size={14} />
            Topping
          </p>

          <h2 className="mt-3 text-2xl font-bold text-[#2D2D2D] sm:text-3xl">
            Thêm topping
          </h2>

          <p className="mt-2 text-sm font-medium leading-6 text-[#666666]">
            Bấm vào từng topping để xem mô tả, giá và thư viện ảnh chi tiết.
          </p>
        </div>

        <span className="hidden rounded-full bg-[#FFFAFA] px-3 py-1.5 text-xs font-bold text-[#8c672f] ring-1 ring-[#b98c49]/15 sm:inline-flex">
          {toppings.length} topping
        </span>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {toppings.slice(0, 16).map((topping) => (
          <ToppingCard
            key={getId(topping)}
            topping={topping}
            onClick={() => setActiveTopping(topping)}
          />
        ))}
      </div>

      {toppings.length > 1 && (
        <div className="mt-1 flex items-center justify-between rounded-2xl bg-[#FFFAFA] px-4 py-3 text-xs font-bold text-[#8c672f] sm:hidden">
          <span>Vuốt sang trái để xem thêm topping</span>
          <ArrowRight size={15} />
        </div>
      )}

      {activeTopping &&
        typeof document !== "undefined" &&
        createPortal(
          <ToppingDetailModal
            topping={activeTopping}
            onClose={() => setActiveTopping(null)}
          />,
          document.body
        )}
    </section>
  );
}

function ToppingCard({ topping, onClick }) {
  const image = getFirstImage(topping);
  const description = getDescription(topping);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[330px] w-[72vw] max-w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.75rem] border border-[#b98c49]/15 bg-[#FFFAFA] p-3 text-left shadow-[0_10px_28px_rgba(185,140,73,.08)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_44px_rgba(185,140,73,.13)] sm:w-auto sm:max-w-none"
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.45rem] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(246,215,125,.24),transparent_52%)]" />

        {image ? (
          <img
            src={image}
            alt={topping.name}
            className="relative z-10 h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 grid h-full place-items-center text-[#b98c49]">
            <Sparkles size={30} />
          </div>
        )}

        {topping.isFeatured === true && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-[#b98c49] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Hot
          </span>
        )}

        {getToppingMedia(topping).length > 1 && (
          <span className="absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {getToppingMedia(topping).length} ảnh
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2 pt-4">
        <p className="line-clamp-2 text-lg font-bold leading-tight text-[#2D2D2D]">
          {topping.name}
        </p>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#666666]">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-[#b98c49]">
            {formatPrice(topping.price)}
          </p>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#b98c49] ring-1 ring-[#b98c49]/15 transition group-hover:bg-[#b98c49] group-hover:text-white">
            <ArrowRight size={16} />
          </span>
        </div>

        <p className="mt-3 text-center text-xs font-bold text-[#8c672f]">
          Xem chi tiết
        </p>
      </div>
    </button>
  );
}

function ToppingDetailModal({ topping, onClose }) {
  useLockBodyScroll(true);

  const media = useMemo(() => getToppingMedia(topping), [topping]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-[#2d2015]/65 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <article className="absolute inset-x-0 bottom-0 flex max-h-[94dvh] min-h-[74dvh] flex-col overflow-hidden rounded-t-[2.25rem] bg-[#FFFAFA] shadow-[0_-20px_60px_rgba(0,0,0,.24)] sm:relative sm:inset-auto sm:min-h-0 sm:w-full sm:max-w-5xl sm:rounded-[2.25rem]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#b98c49]/15 bg-white px-5 py-4 pt-[max(16px,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-[11px] font-['Fredoka'] font-bold uppercase tracking-[0.16em] text-[#b98c49]">
              Topping detail
            </p>
            <h3 className="mt-1 truncate text-xl font-bold text-[#2D2D2D]">
              {topping.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#b98c49]/15"
            aria-label="Đóng chi tiết topping"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(24px,env(safe-area-inset-bottom))] sm:p-5">
          <div className="grid gap-5 sm:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)] sm:items-start">
            <ToppingMediaCarousel media={media} name={topping.name} />

            <div className="rounded-[2rem] border border-[#b98c49]/12 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f6d77d]/35 px-3 py-2 text-xs font-bold text-[#8c672f]">
                  Topping
                </span>

                {topping.isAvailable === false ? (
                  <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-500">
                    Tạm hết
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                    Đang bán
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-[30px] font-bold leading-tight text-[#2D2D2D]">
                {topping.name}
              </h2>

              <p className="mt-3 text-3xl font-['Fredoka'] font-semibold text-[#b98c49]">
                {formatPrice(topping.price)}
              </p>

              <div className="mt-5 rounded-[1.5rem] bg-[#FFFAFA] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                  Mô tả
                </p>

                <p className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-8 text-[#66533c]">
                  {getDescription(topping)}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a
                  href="/#reservation"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#b98c49] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(185,140,73,.22)]"
                >
                  Đặt bàn ngay
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#FFFAFA] px-5 text-sm font-bold text-[#8c672f] ring-1 ring-[#b98c49]/15"
                >
                  Xem tiếp menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function ToppingMediaCarousel({ media = [], name }) {
  const [index, setIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const currentMedia = media[index];
  const canMove = media.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [media.length]);

  function goPrev(event) {
    event?.stopPropagation?.();
    if (!canMove) return;

    setIndex((current) => (current - 1 + media.length) % media.length);
  }

  function goNext(event) {
    event?.stopPropagation?.();
    if (!canMove) return;

    setIndex((current) => (current + 1) % media.length);
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

    if (Math.abs(deltaX) > 42 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      if (deltaX < 0) goNext(event);
      else goPrev(event);
    }
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-sm">
      <div
        className="relative aspect-square bg-[#fff7eb]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(246,215,125,.28),transparent_54%)]" />

        {currentMedia ? (
          currentMedia.type === "video" ? (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              playsInline
              className="relative z-10 h-full w-full bg-[#111] object-contain"
            />
          ) : (
            <img
              key={currentMedia.url}
              src={currentMedia.url}
              alt={currentMedia.name || name}
              draggable={false}
              className="relative z-10 h-full w-full object-contain p-5 sm:p-6"
            />
          )
        ) : (
          <div className="relative z-10 grid h-full place-items-center text-[#b98c49]">
            <ImageIcon size={48} />
          </div>
        )}

        {canMove && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#8c672f] shadow-lg backdrop-blur-sm"
              aria-label="Ảnh trước"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#8c672f] shadow-lg backdrop-blur-sm"
              aria-label="Ảnh tiếp"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
              {media.map((item, dotIndex) => (
                <button
                  key={item.url + "-" + dotIndex}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIndex(dotIndex);
                  }}
                  className={[
                    "h-2 rounded-full transition-all",
                    dotIndex === index
                      ? "w-7 bg-[#b98c49]"
                      : "w-2 bg-white/80 ring-1 ring-[#b98c49]/20",
                  ].join(" ")}
                  aria-label={"Xem ảnh " + (dotIndex + 1)}
                />
              ))}
            </div>

            <span className="absolute right-4 top-4 z-20 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1}/{media.length}
            </span>
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-[#b98c49]/10 bg-white p-3">
          {media.map((item, itemIndex) => (
            <button
              key={item.url + "-thumb-" + itemIndex}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={[
                "h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-[#FFFAFA] transition",
                itemIndex === index
                  ? "border-[#b98c49] ring-4 ring-[#f6d77d]/35"
                  : "border-[#b98c49]/15",
              ].join(" ")}
            >
              {item.type === "video" ? (
                <video
                  src={item.url}
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.name || name}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
