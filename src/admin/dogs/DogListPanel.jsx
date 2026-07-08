import {
  Edit3,
  Eye,
  EyeOff,
  ImageIcon,
  PawPrint,
  Star,
  Trash,
  Video,
} from "lucide-react";
import {
  getDogCardStyle,
  getDogFrameColor,
  getDogImageRingStyle,
  getDogMediaFrameStyle,
} from "../../lib/dogTheme";
import {
  cn,
  getDogMedia,
  getDogMediaUrl,
  getGenderLabel,
  getId,
  isDogVideoMedia,
} from "./dogUtils";

function getCoverMedia(dog) {
  const media = getDogMedia(dog);
  return media.find((item) => !isDogVideoMedia(item)) || media[0] || null;
}

function mergeDraftDog(dog, editingId, draftDog) {
  const dogId = getId(dog);
  const draftId = getId(draftDog) || String(editingId || "");

  if (!draftDog || !editingId || dogId !== draftId) return dog;

  return {
    ...dog,
    ...draftDog,
    _id: dog._id || draftDog._id || editingId,
    id: dog.id || draftDog.id || editingId,
  };
}

function getShortId(dog) {
  const rawId = getId(dog) || dog?.name || "000";
  return String(rawId).slice(-3).toUpperCase();
}

function getStarCount(value) {
  const numeric = Number(value || 100);
  return Math.max(1, Math.min(5, Math.round(numeric / 20)));
}

function isValidHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
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

export function DogListPanel({
  dogs = [],
  loading = false,
  editingId = "",
  draftDog = null,
  onEdit,
  onDelete,
  onToggle,
  onToggleActive,
  onToggleFeatured,
}) {
  const list = Array.isArray(dogs) ? dogs : [];

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#eadfce] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-bold text-[#7d6f61]">
          Đang tải danh sách cún...
        </p>
      </section>
    );
  }

  if (!list.length) {
    return (
      <section className="rounded-[2rem] border-2 border-dashed border-[#b98c49]/35 bg-white p-10 text-center shadow-sm">
        <PawPrint size={42} className="mx-auto text-[#b98c49]" />

        <h3 className="mt-4 text-xl font-extrabold text-[#3b2a18]">
          Chưa có hồ sơ cún
        </h3>

        <p className="mt-2 text-sm font-semibold text-[#7d6f61]">
          Tạo hồ sơ đầu tiên ở form phía trên.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#eadfce] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#b98c49]">
            Dog Cards
          </p>

          <h3 className="mt-1 text-2xl font-extrabold text-[#3b2a18]">
            Danh sách card cún
          </h3>
        </div>

        <p className="text-sm font-bold text-[#7d6f61]">{list.length} hồ sơ</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((dog) => {
          const displayDog = mergeDraftDog(dog, editingId, draftDog);
          const dogId = getId(dog);
          const isEditing = editingId && dogId === String(editingId);

          return (
            <DogCard
              key={dogId || dog.name}
              dog={displayDog}
              isEditing={Boolean(isEditing)}
              onEdit={() => onEdit?.(dog)}
              onDelete={() => onDelete?.(dog)}
              onToggleActive={() => {
                if (onToggleActive) return onToggleActive(dog);
                if (onToggle) return onToggle(dog);
                return undefined;
              }}
              onToggleFeatured={() => onToggleFeatured?.(dog)}
            />
          );
        })}
      </div>
    </section>
  );
}

function DogCard({
  dog,
  isEditing,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}) {
  const cover = getCoverMedia(dog);
  const coverUrl = getDogMediaUrl(cover);
  const isVideo = cover ? isDogVideoMedia(cover) : false;

  const cardStyle = getDogCardStyle(dog);
  const frameStyle = getDogMediaFrameStyle(dog);
  const imageRingStyle = getDogImageRingStyle(dog);
  const frameColor = getDogFrameColor(dog);
  const starCount = getStarCount(dog?.cutenessLevel);

  const description =
    dog?.personality ||
    dog?.interactionNote ||
    (Array.isArray(dog?.personalityTags) && dog.personalityTags.length
      ? dog.personalityTags.join(", ")
      : "") ||
    "Chưa có mô tả.";

  return (
    <article
      style={cardStyle}
      className={cn(
        "relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border-2 p-4 transition duration-300",
        isEditing ? "ring-4 ring-[#b98c49]/25" : "hover:-translate-y-1"
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute -left-8 top-20 h-28 w-28 rounded-full border-[14px] border-current" />
        <div className="absolute -right-10 bottom-32 h-36 w-36 rounded-full border-[18px] border-current" />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-[30px] font-light uppercase tracking-[0.22em] text-[#2d2015]">
            {dog.name || "YEPO Buddy"}
          </h4>

          <p className="mt-1 text-sm font-semibold tracking-[0.12em] text-[#8c672f]">
            ID: {getShortId(dog)}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleFeatured}
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-white shadow",
            dog.isFeatured
              ? "bg-[#f6d77d] text-[#b98c49]"
              : "bg-white/70 text-[#9b9b9b]"
          )}
          title="Bật/tắt nổi bật"
        >
          <Star size={18} fill="currentColor" />
        </button>
      </div>

      <div
        style={frameStyle}
        className="relative mt-7 rounded-[2rem] border-[8px] p-2"
      >
        <div className="relative aspect-square overflow-hidden rounded-[1.35rem] bg-white/60">
          {coverUrl ? (
            isVideo ? (
              <video
                src={coverUrl}
                muted
                playsInline
                className="h-full w-full object-cover"
                style={imageRingStyle}
              />
            ) : (
              <img
                src={coverUrl}
                alt={dog.name || "Cún YEPO"}
                className="h-full w-full object-cover"
                style={imageRingStyle}
              />
            )
          ) : (
            <div className="grid h-full place-items-center text-[#b98c49]">
              <ImageIcon size={44} />
            </div>
          )}

          {isVideo && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase text-white">
              <Video size={11} />
              Video
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-7 flex items-center justify-between gap-3">
        <p className="truncate text-xl font-semibold uppercase tracking-[0.18em] text-[#2d2015]">
          {dog.breed || "Chưa nhập giống"}
        </p>

        <CoatColorDots
          dog={dog}
          className="shrink-0 rounded-full bg-[#f8f3eb]/80 px-2 py-1 shadow-sm"
        />
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2.5">
        <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[#628296] shadow-sm">
          {getGenderLabel(dog.gender)}
        </span>

        {dog.weightKg && (
          <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[#628296] shadow-sm">
            {dog.weightKg}kg
          </span>
        )}

        <span className="rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-[#628296] shadow-sm">
          {starCount}
        </span>
      </div>

      <div className="relative mt-4 flex-1 rounded-[1.6rem] bg-white/55 p-4 shadow-inner ring-1 ring-white/70">
        <p className="line-clamp-3 text-base font-medium leading-7 text-[#7d6f61]">
          {description}
        </p>
      </div>

      <div className="relative mt-5 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-white text-[#3b2a18] shadow-sm ring-1 ring-white/80 transition hover:bg-[#fffaf3]"
          title="Sửa"
        >
          <Edit3 size={17} />
        </button>

        <button
          type="button"
          onClick={onToggleActive}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-white text-[#3b2a18] shadow-sm ring-1 ring-white/80 transition hover:bg-[#fffaf3]"
          title={dog.isActive === false ? "Hiện" : "Ẩn"}
        >
          {dog.isActive === false ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>

        <button
          type="button"
          onClick={onToggleFeatured}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-white text-[#3b2a18] shadow-sm ring-1 ring-white/80 transition hover:bg-[#fffaf3]"
          title="Nổi bật"
        >
          <Star size={17} fill={dog.isFeatured ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#fff1f1] text-[#d97c94] shadow-sm transition hover:bg-[#ffdfe7]"
          title="Xóa"
        >
          <Trash size={17} />
        </button>
      </div>

      {isEditing && (
        <div
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow"
          style={{ backgroundColor: frameColor }}
        >
          Đang sửa
        </div>
      )}
    </article>
  );
}

export default DogListPanel;
