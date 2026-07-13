import {
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Star,
  Video,
  Weight,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  getDogCardStyle,
  getDogImageRingStyle,
  getDogMediaFrameStyle,
} from "../../lib/dogTheme";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CARD_THEMES = {
  pink: {
    ribbon: "bg-[#d68395]",
    accentText: "text-[#b05b6f]",
    detailsBg: "bg-[#fffbf2]",
    modalBg: "bg-[#fff7fb]",
  },
  blue: {
    ribbon: "bg-[#8eb2ca]",
    accentText: "text-[#4a7a9c]",
    detailsBg: "bg-[#f7fafc]",
    modalBg: "bg-[#f5fbff]",
  },
  green: {
    ribbon: "bg-[#9db072]",
    accentText: "text-[#5e6e3a]",
    detailsBg: "bg-[#f9fff0]",
    modalBg: "bg-[#fbfff3]",
  },
  purple: {
    ribbon: "bg-[#a699d1]",
    accentText: "text-[#6c5b9c]",
    detailsBg: "bg-[#fcfaff]",
    modalBg: "bg-[#fcfaff]",
  },
  orange: {
    ribbon: "bg-[#e5b18a]",
    accentText: "text-[#a36b3e]",
    detailsBg: "bg-[#fffcf9]",
    modalBg: "bg-[#fff9f2]",
  },
};

const GENDER_THEME = {
  male: { bg: "bg-[#b1cee3]", text: "text-[#4a7a9c]" },
  female: { bg: "bg-[#f4b6c2]", text: "text-[#a85b6b]" },
  unknown: { bg: "bg-[#f2e3b6]", text: "text-[#a38638]" },
};

function getDogMedia(dog) {
  const media = Array.isArray(dog?.media)
    ? dog.media.filter((item) => item?.url)
    : [];

  if (media.length > 0) return media;

  if (dog?.imageUrl) {
    return [
      {
        url: dog.imageUrl,
        resourceType: "image",
        originalName: dog.name || "Dog image",
      },
    ];
  }

  return [];
}

function getDogImage(dog) {
  if (dog?.imageUrl) return dog.imageUrl;

  if (Array.isArray(dog?.media) && dog.media.length > 0) {
    const firstImage = dog.media.find((item) => !isVideoMedia(item));
    return firstImage?.url || dog.media[0]?.url || null;
  }

  return null;
}

function isVideoMedia(media) {
  const url = String(media?.url || "").toLowerCase();
  const type = String(media?.resourceType || media?.type || "").toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getGenderLabel(gender) {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Chưa rõ";
}

function getPatternLabel(pattern) {
  const labels = {
    solid: "Một màu",
    "two-tone": "Hai màu",
    spotted: "Đốm",
    dotted: "Chấm bi",
    brindle: "Vện",
    mixed: "Pha màu",
    other: "Khác",
  };

  return labels[pattern] || "Chưa cập nhật";
}

function formatList(value, fallback = "Chưa cập nhật") {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function getPresetThemeKey(dog) {
  const value = String(dog?.colorTheme || "pink");

  if (CARD_THEMES[value]) return value;

  return "pink";
}

function getStarCount(value) {
  const numeric = Number(value || 100);
  return Math.max(1, Math.min(5, Math.round(numeric / 20)));
}

function isValidHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function getCoatColorSwatches(dog) {
  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  const normalized = coatColors
    .map((color, index) => {
      const hex = String(color?.hex || "").trim();
      const name = String(
        color?.name || color?.label || "Màu lông " + (index + 1)
      ).trim();

      if (!isValidHex(hex)) return null;

      return { hex, name };
    })
    .filter(Boolean);

  if (normalized.length > 0) return normalized.slice(0, 2);

  if (dog?.coatColor) {
    return [
      {
        hex: "#ffffff",
        name: String(dog.coatColor),
      },
    ];
  }

  return [];
}

function isWhiteLikeColor(hex) {
  const value = String(hex || "").toLowerCase();

  return [
    "#ffffff",
    "#fff",
    "#fefefe",
    "#fafafa",
    "#f8f8f8",
    "#f7f7f7",
    "#f5f5f5",
  ].includes(value);
}

function CoatColorDots({ dog, className = "" }) {
  const coatColors = getCoatColorSwatches(dog);

  if (!coatColors.length) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm">
          <span className="h-4 w-4 rounded-full border-2 border-[#d9cfc2] bg-[#f7efe4] shadow-inner" />
        </span>

        <span className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm">
          <span className="h-4 w-4 rounded-full border-2 border-[#d9cfc2] bg-[#ece5da] shadow-inner" />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {coatColors.map((color, index) => {
        const whiteLike = isWhiteLikeColor(color.hex);

        return (
          <button
            key={color.hex + "-" + index}
            type="button"
            title={color.name}
            className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm transition hover:border-[#d8c4a5] hover:shadow"
            onClick={(event) => event.stopPropagation()}
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full shadow-inner",
                whiteLike
                  ? "border-2 border-[#cfc5b8]"
                  : "border-2 border-white"
              )}
              style={{ backgroundColor: color.hex }}
            />
          </button>
        );
      })}
    </div>
  );
}

function StarStrip({ value }) {
  const count = getStarCount(value);

  return (
    <div className="flex shrink-0 gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const active = index < count;

        return (
          <Star
            key={index}
            size={15}
            fill={active ? "currentColor" : "none"}
            className={active ? "text-white" : "text-white/45"}
          />
        );
      })}
    </div>
  );
}

export default function DogProfileCard({ dog }) {
  const [isOpen, setIsOpen] = useState(false);

  const image = getDogImage(dog);
  const isFeatured = dog?.isFeatured === true;

  const cardTheme = CARD_THEMES[getPresetThemeKey(dog)] || CARD_THEMES.pink;
  const genderTheme = GENDER_THEME[dog?.gender] || GENDER_THEME.unknown;

  const cardStyle = getDogCardStyle(dog);
  const frameStyle = getDogMediaFrameStyle(dog);
  const imageStyle = getDogImageRingStyle(dog);

  const personalityTags = Array.isArray(dog?.personalityTags)
    ? dog.personalityTags.slice(0, 3)
    : [];

  const favoriteTreats = Array.isArray(dog?.favoriteTreats)
    ? dog.favoriteTreats
    : [];

  const cardNumber = String(dog?.sortOrder || 1).padStart(3, "0");
  const cuteness = dog?.cutenessLevel || 70;

  const personalityText =
    dog?.personality ||
    personalityTags.join(", ") ||
    "Chưa cập nhật tính cách";

  const favoriteTreatText =
    favoriteTreats.length > 0
      ? favoriteTreats.join(", ")
      : dog?.favoriteTreat || "Chưa cập nhật";

  function openDetail() {
    setIsOpen(true);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail();
    }
  }

  return (
    <>
      <article
        style={cardStyle}
        role="button"
        tabIndex={0}
        onClick={openDetail}
        onKeyDown={handleKeyDown}
        className="group relative mx-auto flex w-full max-w-none cursor-pointer flex-col overflow-hidden rounded-[30px] border-2 p-3 shadow-[0_8px_24px_rgba(217,124,148,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#b98c49]/25 sm:max-w-[340px] sm:rounded-[32px]"
      >
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2",
            cardTheme.accentText
          )}
        >
          <h3 className="font-brand line-clamp-1 flex-1 break-words pr-2 text-[22px] font-medium uppercase tracking-[0.15em]">
            {dog?.name || "Vô danh"}
          </h3>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[13px] font-medium opacity-70">
              ID: {cardNumber}
            </span>
            <span className="text-lg font-black">+{cuteness * 25}</span>
          </div>
        </div>

        <div
          style={frameStyle}
          className="relative mx-1 aspect-[4/3] overflow-hidden rounded-[24px] border-[5px] border-[#fffcf2] p-2"
        >
          {image ? (
            <img
              style={imageStyle}
              src={image}
              alt={dog?.name}
              className="relative h-full w-full rounded-[16px] object-cover shadow-sm"
            />
          ) : (
            <div className="relative grid h-full w-full place-items-center rounded-[16px] bg-white/40 text-white">
              <PawPrint size={48} />
            </div>
          )}

          {isFeatured && (
            <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#ffda75] text-[#d49911] shadow-md">
              <Star size={18} fill="currentColor" />
            </div>
          )}

          <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b05b6f] shadow-sm">
            Bấm để xem chi tiết
          </div>
        </div>

        <div
          className={cn(
            "mx-2 mt-4 flex items-center justify-between rounded-full px-5 py-2.5 text-white shadow-inner",
            cardTheme.ribbon
          )}
        >
          <span className="mr-2 line-clamp-1 text-sm font-bold uppercase tracking-wide">
            {dog?.breed || "Chưa rõ giống"}
          </span>

          <StarStrip value={cuteness} />
        </div>

        <div
          className={cn(
            "mx-1 mb-1 mt-3 flex flex-1 flex-col rounded-[24px] p-4 shadow-inner",
            cardTheme.detailsBg
          )}
        >
          <p className="line-clamp-3 break-words text-[14px] font-medium leading-relaxed">
            <span className={cn("mr-1 font-bold", cardTheme.accentText)}>
              power:
            </span>
            <span className="text-[#b58b7f]">{personalityText}</span>
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Badge className={cn(genderTheme.bg, genderTheme.text)}>
              {getGenderLabel(dog?.gender)}
            </Badge>

            <Badge className="bg-[#e8f1f5] text-[#628296]">
              {dog?.weightKg ? `${dog.weightKg}kg` : "N/A"}
            </Badge>
          </div>

          <CoatColorDots
            dog={dog}
            className="mt-4 w-fit rounded-full bg-[#f8f3eb]/80 px-2 py-1 shadow-sm"
          />

          <div className="mt-auto flex flex-col gap-3 border-t-2 border-dashed border-[#fae8d2] pt-4">
            <div className="flex items-start gap-1.5 break-words leading-snug">
              <span className="shrink-0 text-[12px] font-bold uppercase tracking-wide text-[#d1a290]">
                MÓN YÊU THÍCH:
              </span>
              <span className="text-[13px] font-medium text-[#b58b7f]">
                {favoriteTreatText}
              </span>
            </div>
          </div>
        </div>
      </article>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <DogDetailModal
            dog={dog}
            cardTheme={cardTheme}
            genderTheme={genderTheme}
            onClose={() => setIsOpen(false)}
          />,
          document.body
        )}
    </>
  );
}

function DogDetailModal({ dog, cardTheme, genderTheme, onClose }) {
  const media = useMemo(() => getDogMedia(dog), [dog]);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const activeMedia = media[activeIndex];

  const modalCardStyle = getDogCardStyle(dog);
  const modalFrameStyle = getDogMediaFrameStyle(dog);
  const modalImageStyle = getDogImageRingStyle(dog);

  const personalityText =
    dog?.personality ||
    formatList(dog?.personalityTags, "Chưa cập nhật tính cách");

  const favoriteTreatText = formatList(
    dog?.favoriteTreats,
    dog?.favoriteTreat || "Chưa cập nhật"
  );

  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [onClose, media.length]);

  function goPrevious() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current - 1 + media.length) % media.length);
  }

  function goNext() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current + 1) % media.length);
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
    if (media.length <= 1) return;

    const touch = event.changedTouches?.[0];

    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Chỉ nhận vuốt ngang rõ ràng, tránh nhầm với thao tác cuộn dọc.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  return (
    <div
      className="fixed left-0 top-0 z-[99999] flex h-[100svh] min-h-[100svh] w-screen max-w-[100vw] overflow-hidden bg-[#2d2015]/75 p-0 backdrop-blur-sm sm:inset-0 sm:h-auto sm:min-h-0 sm:items-center sm:justify-center sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <section
        style={modalCardStyle}
        className="relative flex h-[100svh] max-h-[100svh] w-screen max-w-[100vw] flex-col overflow-hidden rounded-none border-0 shadow-[0_28px_90px_rgba(0,0,0,.28)] sm:h-auto sm:max-h-[92svh] sm:max-w-6xl sm:rounded-[34px] sm:border-[6px] sm:border-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={cn(
            "z-30 flex shrink-0 items-center justify-between gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-3",
            cardTheme.ribbon
          )}
        >
          <div className="min-w-0 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80 sm:text-[11px]">
              YEPO dog detail card
            </p>

            <h2 className="font-brand truncate text-2xl font-black uppercase tracking-[0.12em] sm:text-3xl">
              {dog?.name || "Vô danh"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-sm transition hover:bg-white"
            aria-label="Đóng chi tiết"
          >
            <X size={22} />
          </button>
        </header>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 pb-[max(18px,env(safe-area-inset-bottom))] sm:p-5",
            cardTheme.modalBg
          )}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:gap-5">
            <div className="min-w-0">
              <div
                style={modalFrameStyle}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden rounded-[26px] border-[5px] border-white p-2 shadow-inner sm:rounded-[30px] sm:border-[6px] sm:p-3"
              >
                <div className="overflow-hidden rounded-[20px] bg-white/45 sm:rounded-[22px]">
                  {activeMedia ? (
                    isVideoMedia(activeMedia) ? (
                      <video
                        key={activeMedia.url}
                        src={activeMedia.url}
                        controls
                        playsInline
                        className="block max-h-[70svh] min-h-[260px] w-full bg-[#2d2015] object-contain sm:max-h-[72vh]"
                      />
                    ) : (
                      <img
                        key={activeMedia.url}
                        style={modalImageStyle}
                        src={activeMedia.url}
                        alt={activeMedia.originalName || dog?.name || "Dog media"}
                        draggable={false}
                        className="block h-auto max-h-none w-full object-contain"
                      />
                    )
                  ) : (
                    <div className="grid min-h-[300px] w-full place-items-center text-white">
                      <PawPrint size={64} />
                    </div>
                  )}
                </div>

                {media.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md transition hover:bg-white sm:left-5 sm:h-11 sm:w-11"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md transition hover:bg-white sm:right-5 sm:h-11 sm:w-11"
                      aria-label="Ảnh tiếp theo"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {media.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {media.map((item, index) => {
                    const isActive = index === activeIndex;
                    const isVideo = isVideoMedia(item);

                    return (
                      <button
                        key={(item.url || "media") + "-" + index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 bg-white transition",
                          isActive
                            ? "border-[#b98c49]"
                            : "border-white opacity-70 hover:opacity-100"
                        )}
                        aria-label={"Xem media " + (index + 1)}
                      >
                        {isVideo ? (
                          <div className="grid h-full w-full place-items-center bg-[#2d2015] text-white">
                            <Video size={24} />
                          </div>
                        ) : (
                          <img
                            style={modalImageStyle}
                            src={item.url}
                            alt={item.originalName || "Media " + (index + 1)}
                            className="h-full w-full object-cover"
                          />
                        )}

                        {isVideo && (
                          <span className="absolute bottom-1 right-1 rounded-full bg-white/90 p-1 text-[#8c672f]">
                            <Video size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={cn(
                "rounded-[28px] p-4 shadow-inner sm:rounded-[30px] sm:p-5",
                cardTheme.detailsBg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.18em]",
                      cardTheme.accentText
                    )}
                  >
                    Full profile
                  </p>

                  <h3 className="mt-2 break-words text-4xl font-black uppercase leading-none text-[#5f4522]">
                    {dog?.name || "Vô danh"}
                  </h3>

                  {dog?.nickname && (
                    <p className="mt-2 break-words text-base font-medium leading-7 text-[#b58b7f]">
                      “{dog.nickname}”
                    </p>
                  )}
                </div>

                {dog?.isFeatured && (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ffda75] text-[#d49911] shadow">
                    <Star size={20} fill="currentColor" />
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailBox
                  label="Giống / chủng loại"
                  value={dog?.breed || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Giới tính"
                  value={getGenderLabel(dog?.gender)}
                />

                <DetailBox
                  label="Tuổi"
                  value={dog?.age || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Sinh nhật"
                  value={dog?.birthday || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Cân nặng"
                  value={dog?.weightKg ? String(dog.weightKg) + " kg" : "Chưa cập nhật"}
                  icon={<Weight size={15} />}
                />

                <DetailBox
                  label="Độ dễ thương"
                  value={String(dog?.cutenessLevel || 70) + "/100"}
                />

                <DetailBox
                  label="Kiểu lông"
                  value={getPatternLabel(dog?.coatPattern)}
                />

                <DetailBox
                  label="Trạng thái"
                  value={dog?.isActive === false ? "Đang ẩn" : "Đang hiển thị"}
                />
              </div>

              {coatColors.length > 0 && (
                <div className="mt-4 rounded-[22px] bg-white/75 p-4">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.14em]",
                      cardTheme.accentText
                    )}
                  >
                    Màu lông
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {coatColors.map((color, index) => (
                      <span
                        key={(color.hex || color.name || "color") + "-" + index}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8c672f]"
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full shadow-inner",
                            isWhiteLikeColor(color.hex)
                              ? "border-2 border-[#cfc5b8]"
                              : "border border-white"
                          )}
                          style={{ backgroundColor: color.hex || "#b98c49" }}
                        />
                        {color.name || color.hex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <LongDetail label="Tính cách" value={personalityText} />
              <LongDetail label="Món yêu thích" value={favoriteTreatText} />

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className={cn(genderTheme.bg, genderTheme.text)}>
                  {getGenderLabel(dog?.gender)}
                </Badge>

                <Badge className="bg-[#e8f1f5] text-[#628296]">
                  {dog?.weightKg ? String(dog.weightKg) + "kg" : "N/A"}
                </Badge>

                <Badge className="bg-[#fff1c7] text-[#a38638]">
                  {getPatternLabel(dog?.coatPattern)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailBox({ label, value, icon }) {
  return (
    <div className="rounded-[20px] bg-white/75 px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#d1a290]">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold leading-6 text-[#8c672f]">
        {value}
      </p>
    </div>
  );
}

function LongDetail({ label, value }) {
  return (
    <div className="mt-4 rounded-[20px] bg-white/75 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#d1a290]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-line break-words text-sm font-medium leading-7 text-[#8c672f]">
        {value}
      </p>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}
