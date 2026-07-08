const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

function replaceBetween(source, startText, endText, replacement) {
  const start = source.indexOf(startText);
  if (start === -1) {
    throw new Error("Không tìm thấy block bắt đầu: " + startText);
  }

  const end = source.indexOf(endText, start);
  if (end === -1) {
    throw new Error("Không tìm thấy block kết thúc: " + endText);
  }

  return source.slice(0, start) + replacement + "\n\n" + source.slice(end);
}

// 1. Import thêm GripVertical và useState
content = content.replace(
  /import\s*\{([\s\S]*?)\}\s*from\s*"lucide-react";/,
  (match, imports) => {
    if (imports.includes("GripVertical")) return match;
    return match.replace("ImagePlus,", "GripVertical,\n  ImagePlus,");
  }
);

content = content.replace(
  'import { useEffect, useMemo } from "react";',
  'import { useEffect, useMemo, useState } from "react";'
);

// 2. Theme mặc định + localStorage màu custom
content = content.replace(
  /const THEME_OPTIONS = \[[\s\S]*?\];/,
  `const DEFAULT_THEME_OPTIONS = [
  { value: "pink", label: "Hồng mộng mơ", color: "#f2aab8", bg: "bg-[#f2aab8]", ring: "ring-[#f2aab8]" },
  { value: "blue", label: "Xanh bầu trời", color: "#b1cee3", bg: "bg-[#b1cee3]", ring: "ring-[#b1cee3]" },
  { value: "green", label: "Xanh lá mạ", color: "#c2d398", bg: "bg-[#c2d398]", ring: "ring-[#c2d398]" },
  { value: "purple", label: "Tím mộng mơ", color: "#c8bfe7", bg: "bg-[#c8bfe7]", ring: "ring-[#c8bfe7]" },
  { value: "orange", label: "Cam đào", color: "#fcd5b5", bg: "bg-[#fcd5b5]", ring: "ring-[#fcd5b5]" },
];

const DOG_THEME_STORAGE_KEY = "yepo:dog-card-custom-themes";

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function readSavedThemes() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(DOG_THEME_STORAGE_KEY);
    const values = JSON.parse(raw || "[]");

    return Array.isArray(values)
      ? values.filter(isHexColor).slice(0, 12)
      : [];
  } catch {
    return [];
  }
}

function writeSavedThemes(values) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      DOG_THEME_STORAGE_KEY,
      JSON.stringify(values.filter(isHexColor).slice(0, 12))
    );
  } catch {
    // localStorage có thể bị khóa ở một số trình duyệt.
  }
}

function saveThemeColor(color) {
  if (!isHexColor(color)) return [];

  const normalized = color.toLowerCase();
  const nextValues = [
    normalized,
    ...readSavedThemes().filter((item) => item.toLowerCase() !== normalized),
  ].slice(0, 12);

  writeSavedThemes(nextValues);
  return nextValues;
}

function removeThemeColor(color) {
  const normalized = String(color || "").toLowerCase();
  const nextValues = readSavedThemes().filter(
    (item) => item.toLowerCase() !== normalized
  );

  writeSavedThemes(nextValues);
  return nextValues;
}

function getFileKey(file) {
  return [
    file?.name || "",
    file?.size || 0,
    file?.lastModified || 0,
    file?.type || "",
  ].join("-");
}

function getMediaUrl(media) {
  return media?.url || media?.secureUrl || media?.secure_url || media?.imageUrl || "";
}

function getMediaStableKey(media) {
  if (media?.source === "new") return "file:" + media.fileKey;
  return "existing:" + getMediaUrl(media);
}

function sameArray(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}`
);

// 3. Thêm props setExistingMedia/mediaOrder
content = content.replace(
  /existingMedia = \[\],\s*\n  editingId,/,
  `existingMedia = [],
  setExistingMedia = () => {},
  mediaOrder,
  setMediaOrder,
  editingId,`
);

// 4. Thay logic media cũ bằng logic kéo thả + đồng bộ files/existingMedia
content = content.replace(
  /  const selectedPreviews = useMemo\(\(\) => \{[\s\S]*?\n  \}, \[existingMedia, selectedPreviews, form\.coverMediaKey\]\);\s*\n\s*function update/,
  `  const [dragIndex, setDragIndex] = useState(null);
  const [savedCustomThemes, setSavedCustomThemes] = useState(readSavedThemes);

  const safeFiles = Array.isArray(files) ? files : [];
  const safeExistingMedia = Array.isArray(existingMedia) ? existingMedia : [];

  const selectedPreviews = useMemo(() => {
    return safeFiles.map((file, index) => {
      const fileKey = getFileKey(file);

      return {
        url: URL.createObjectURL(file),
        type: file.type?.startsWith("video/") ? "video" : "image",
        resourceType: file.type?.startsWith("video/") ? "video" : "image",
        source: "new",
        newIndex: index,
        fileKey,
        file,
        name: file.name,
      };
    });
  }, [safeFiles]);

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  const existingPreviews = useMemo(() => {
    return safeExistingMedia
      .map((media, index) => {
        const url = getMediaUrl(media);

        if (!url) return null;

        return {
          ...media,
          url,
          type: isMediaVideo(media) ? "video" : "image",
          resourceType: isMediaVideo(media) ? "video" : "image",
          source: "existing",
          existingIndex: index,
          name: media.originalName || media.name || "Media hiện tại",
        };
      })
      .filter(Boolean);
  }, [safeExistingMedia]);

  const mediaItems = useMemo(() => {
    return [...existingPreviews, ...selectedPreviews].filter((item) => item.url);
  }, [existingPreviews, selectedPreviews]);

  const mediaKeys = useMemo(() => {
    return mediaItems.map(getMediaStableKey);
  }, [mediaItems]);

  const activeMediaOrder = useMemo(() => {
    if (Array.isArray(mediaOrder)) return mediaOrder;
    if (Array.isArray(form.mediaOrder)) return form.mediaOrder;
    return [];
  }, [mediaOrder, form.mediaOrder]);

  const orderedMediaItems = useMemo(() => {
    const map = new Map(mediaItems.map((item) => [getMediaStableKey(item), item]));
    const ordered = [];

    activeMediaOrder.forEach((key) => {
      const item = map.get(key);

      if (item) {
        ordered.push(item);
        map.delete(key);
      }
    });

    return [...ordered, ...map.values()];
  }, [mediaItems, activeMediaOrder]);

  useEffect(() => {
    setForm((current) => {
      const currentOrder = Array.isArray(current.mediaOrder)
        ? current.mediaOrder
        : [];

      const nextOrder = [
        ...currentOrder.filter((key) => mediaKeys.includes(key)),
        ...mediaKeys.filter((key) => !currentOrder.includes(key)),
      ];

      if (sameArray(currentOrder, nextOrder)) return current;

      return {
        ...current,
        mediaOrder: nextOrder,
      };
    });
  }, [setForm, mediaKeys.join("|")]);

  useEffect(() => {
    const currentCoverKey = String(form.coverMediaKey || "");
    const validKeys = orderedMediaItems.map(getMediaCoverKey);

    if (currentCoverKey && validKeys.includes(currentCoverKey)) return;

    const firstImage = orderedMediaItems.find((media) => !isMediaVideo(media));

    if (firstImage) {
      update("coverMediaKey", getMediaCoverKey(firstImage));
    }
  }, [orderedMediaItems, form.coverMediaKey]);

  function handlePickFiles(event) {
    const pickedFiles = Array.from(event.target.files || []).filter(Boolean);

    if (pickedFiles.length === 0) return;

    setFiles((currentFiles) => {
      const current = Array.isArray(currentFiles) ? currentFiles : [];
      const seen = new Set(current.map(getFileKey));
      const next = [...current];

      pickedFiles.forEach((file) => {
        const key = getFileKey(file);

        if (!seen.has(key)) {
          seen.add(key);
          next.push(file);
        }
      });

      return next;
    });

    event.target.value = "";
  }

  function getCoverKeyAfterOrder(targetItem, nextItems) {
    if (!targetItem) return "";

    const stableKey = getMediaStableKey(targetItem);

    const nextItem = nextItems.find(
      (item) => getMediaStableKey(item) === stableKey
    );

    if (!nextItem) return "";

    if (nextItem.source === "existing") {
      return "existing:" + getMediaUrl(nextItem);
    }

    const newFiles = nextItems.filter((item) => item.source === "new");
    const newIndex = newFiles.findIndex(
      (item) => getMediaStableKey(item) === stableKey
    );

    return newIndex >= 0 ? "new:" + newIndex : "";
  }

  function findFirstImageCoverKey(nextItems) {
    const firstImage = nextItems.find((item) => !isMediaVideo(item));
    return getCoverKeyAfterOrder(firstImage, nextItems);
  }

  function commitMediaItems(nextItems) {
    const currentCoverKey = String(form.coverMediaKey || "");
    const currentCoverItem = orderedMediaItems.find(
      (item) => getMediaCoverKey(item) === currentCoverKey
    );

    const nextOrder = nextItems.map(getMediaStableKey);

    update("mediaOrder", nextOrder);

    if (typeof setMediaOrder === "function") {
      setMediaOrder(nextOrder);
    }

    setExistingMedia(
      nextItems
        .filter((item) => item.source === "existing")
        .map((item) => item)
    );

    setFiles(
      nextItems
        .filter((item) => item.source === "new")
        .map((item) => item.file)
    );

    const nextCoverKey =
      getCoverKeyAfterOrder(currentCoverItem, nextItems) ||
      findFirstImageCoverKey(nextItems);

    update("coverMediaKey", nextCoverKey);
  }

  function moveMediaItem(fromIndex, toIndex) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= orderedMediaItems.length ||
      toIndex >= orderedMediaItems.length
    ) {
      return;
    }

    const nextItems = [...orderedMediaItems];
    const moved = nextItems.splice(fromIndex, 1)[0];
    nextItems.splice(toIndex, 0, moved);

    commitMediaItems(nextItems);
  }

  function removeMediaItem(targetItem) {
    const targetKey = getMediaStableKey(targetItem);
    const nextItems = orderedMediaItems.filter(
      (item) => getMediaStableKey(item) !== targetKey
    );

    commitMediaItems(nextItems);
  }

  function clearNewMedia() {
    const nextItems = orderedMediaItems.filter((item) => item.source !== "new");
    commitMediaItems(nextItems);
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(index) {
    if (dragIndex === null) return;

    moveMediaItem(dragIndex, index);
    setDragIndex(null);
  }

  function update`
);

// 5. Thay const isCustomTheme cũ bằng bản có lưu theme
content = content.replace(
  /  \/\/ Cờ kiểm tra xem màu đang chọn có phải mã Hex tùy chỉnh không\s*\n  const isCustomTheme = form\.colorTheme && form\.colorTheme\.startsWith\("#"\);/,
  `  const isCustomTheme = isHexColor(form.colorTheme);

  const allThemeOptions = [
    ...DEFAULT_THEME_OPTIONS,
    ...savedCustomThemes.map((color, index) => ({
      value: color,
      label: "Màu đã lưu #" + (index + 1),
      color,
      bg: "",
      ring: "",
      saved: true,
    })),
  ];

  function handleThemeChange(value, options = {}) {
    update("colorTheme", value);

    if (options.save && isHexColor(value)) {
      setSavedCustomThemes(saveThemeColor(value));
    }
  }

  function handleRemoveSavedTheme(color) {
    setSavedCustomThemes(removeThemeColor(color));
  }`
);

// 6. Thay block Trading Card
content = replaceBetween(
  content,
  '        {/* KHU VỰC CHỌN MÀU THEME */}',
  '        <FormBlock icon={PawPrint} title="Thông tin cơ bản">',
  `        {/* KHU VỰC CHỌN MÀU THEME */}
        <FormBlock icon={Paintbrush} title="Giao diện thẻ bài (Trading Card)">
          <div className="block">
            <span className="mb-4 block text-sm font-bold text-[#628296]">
              Chọn màu chủ đạo
            </span>

            <div className="flex flex-wrap gap-4">
              {allThemeOptions.map((theme) => {
                const active =
                  form.colorTheme === theme.value ||
                  (!form.colorTheme && theme.value === "pink");

                return (
                  <label
                    key={theme.value}
                    className="group relative flex cursor-pointer flex-col items-center gap-2"
                    title={theme.label}
                  >
                    <input
                      type="radio"
                      name="colorTheme"
                      value={theme.value}
                      checked={active}
                      onChange={(event) => handleThemeChange(event.target.value)}
                      className="peer sr-only"
                    />

                    <span
                      className={cn(
                        "h-14 w-14 rounded-full shadow-sm ring-offset-4 ring-offset-[#f7fafc] transition-all duration-200 group-hover:scale-110 peer-checked:ring-4",
                        theme.bg,
                        theme.ring,
                        theme.saved && active ? "ring-4 ring-[#a8bcce]" : "",
                        theme.saved && !active ? "ring-1 ring-[#dbe6ec]" : ""
                      )}
                      style={theme.saved ? { backgroundColor: theme.color } : undefined}
                    />

                    {theme.saved && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleRemoveSavedTheme(theme.value);
                        }}
                        className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[#d97c94] shadow ring-1 ring-[#ffccd8]"
                        title="Xóa màu đã lưu"
                      >
                        <X size={11} />
                      </button>
                    )}

                    <span
                      className={cn(
                        "max-w-[76px] text-center text-[11px] font-bold transition-opacity",
                        active
                          ? "text-[#628296] opacity-100"
                          : "text-[#8fa7b8] opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {theme.label}
                    </span>
                  </label>
                );
              })}

              <label
                className="group relative flex cursor-pointer flex-col items-center gap-2"
                title="Màu tùy chỉnh"
              >
                <div
                  className={cn(
                    "relative h-14 w-14 overflow-hidden rounded-full shadow-sm ring-offset-4 ring-offset-[#f7fafc] transition-all duration-200 group-hover:scale-110",
                    isCustomTheme ? "ring-4 ring-[#a8bcce]" : "border-2 border-dashed border-[#a8bcce]"
                  )}
                  style={isCustomTheme ? { backgroundColor: form.colorTheme } : undefined}
                >
                  <input
                    type="color"
                    value={isCustomTheme ? form.colorTheme : "#ffffff"}
                    onChange={(event) =>
                      handleThemeChange(event.target.value, { save: true })
                    }
                    className="absolute -left-4 -top-4 h-24 w-24 cursor-pointer appearance-none border-none bg-transparent outline-none"
                  />

                  {!isCustomTheme && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#f0f4f7] text-[#a8bcce] transition-colors group-hover:bg-[#e1eaf0]">
                      <Plus size={20} />
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[11px] font-bold transition-opacity",
                    isCustomTheme
                      ? "text-[#628296] opacity-100"
                      : "text-[#8fa7b8] opacity-0 group-hover:opacity-100"
                  )}
                >
                  Tùy chỉnh
                </span>
              </label>
            </div>

            <p className="mt-4 text-xs font-medium leading-5 text-[#8fa7b8]">
              Màu tùy chỉnh sẽ được lưu lại trên trình duyệt này. Lần sau mở form sẽ thấy lại ở danh sách “Màu đã lưu”.
            </p>
          </div>
        </FormBlock>`
);

// 7. Thay block Hình ảnh & Video
content = replaceBetween(
  content,
  '        <FormBlock icon={ImagePlus} title="Hình ảnh & Video">',
  '        <FormBlock icon={PawPrint} title="Cài đặt hệ thống">',
  `        <FormBlock icon={ImagePlus} title="Hình ảnh & Video">
          <label className="block cursor-pointer rounded-[32px] border-4 border-dashed border-[#dbe6ec] bg-white p-8 text-center transition hover:border-[#a8bcce] hover:bg-[#f7fafc]">
            <ImagePlus className="mx-auto text-[#a8bcce]" size={40} />

            <p className="mt-3 text-base font-bold text-[#628296]">
              Kéo thả hoặc bấm để chọn Media
            </p>

            <p className="mt-1 text-sm text-[#8fa7b8]">
              {safeFiles.length
                ? safeFiles.length + " file mới đã chọn. Có thể kéo thả để đổi thứ tự."
                : "Hỗ trợ ảnh, GIF, Video ngắn. Có thể chọn nhiều file nhiều lần."}
            </p>

            <input
              type="file"
              multiple
              accept="image/*,.gif,video/*"
              className="hidden"
              onChange={handlePickFiles}
            />
          </label>

          {orderedMediaItems.length > 0 && (
            <div className="mt-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#628296]">
                    Thứ tự media
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#8fa7b8]">
                    Kéo thả để sắp xếp. Ảnh đang làm đại diện sẽ được giữ theo đúng media đã chọn.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#e8f1f5] px-3 py-1.5 text-xs font-black text-[#628296]">
                  {orderedMediaItems.length} media
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {orderedMediaItems.map((media, index) => (
                  <MediaPreview
                    key={getMediaStableKey(media)}
                    media={media}
                    index={index}
                    dragIndex={dragIndex}
                    label={
                      media.source === "existing"
                        ? "Đã lưu"
                        : "Mới #" + (index + 1)
                    }
                    coverMediaKey={form.coverMediaKey}
                    onSelectCover={(key) => update("coverMediaKey", key)}
                    onRemove={() => removeMediaItem(media)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onMoveLeft={() => moveMediaItem(index, index - 1)}
                    onMoveRight={() => moveMediaItem(index, index + 1)}
                    canMoveLeft={index > 0}
                    canMoveRight={index < orderedMediaItems.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {safeFiles.length > 0 && (
            <button
              type="button"
              onClick={clearNewMedia}
              className="mt-4 h-12 w-full rounded-2xl bg-[#ffebf0] text-sm font-bold text-[#d97c94] transition hover:bg-[#ffd6e2]"
            >
              Hủy toàn bộ media mới chọn
            </button>
          )}
        </FormBlock>`
);

// 8. Thay MediaPreview bằng bản kéo thả
content = replaceBetween(
  content,
  'function MediaPreview({ media, label, coverMediaKey, onSelectCover, onRemove }) {',
  'function Toggle({ label, checked, onChange }) {',
  `function MediaPreview({
  media,
  index,
  dragIndex,
  label,
  coverMediaKey,
  onSelectCover,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}) {
  const isVideo = isMediaVideo(media);
  const coverKey = getMediaCoverKey(media);
  const isCover = coverMediaKey === coverKey;
  const active = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "overflow-hidden rounded-[20px] border-2 bg-white transition",
        active
          ? "border-[#8eb2ca] opacity-70 ring-4 ring-[#8eb2ca]/20"
          : isCover
            ? "border-[#58b368] shadow-[0_0_0_4px_rgba(88,179,104,.16)]"
            : "border-[#e1eaf0]"
      )}
    >
      <div className="relative aspect-square bg-[#f7fafc]">
        <button
          type="button"
          className="absolute left-2 top-2 z-20 grid h-8 w-8 cursor-grab place-items-center rounded-full border-2 border-white bg-white/95 text-[#628296] shadow-md active:cursor-grabbing"
          title="Kéo để đổi vị trí"
        >
          <GripVertical size={15} />
        </button>

        <button
          type="button"
          title="Xóa media này"
          onClick={onRemove}
          className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#ffebf0] text-[#d97c94] shadow-md transition hover:scale-105 hover:bg-[#ffd6e2]"
        >
          <X size={16} />
        </button>

        {isVideo ? (
          <video
            src={media.url}
            muted
            playsInline
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={media.url}
            alt={media.name}
            className="h-full w-full object-cover"
          />
        )}

        {isVideo && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Video size={11} />
            Video
          </span>
        )}

        {isCover && (
          <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-[#58b368] text-white shadow-md">
            <CheckCircle size={17} />
          </span>
        )}
      </div>

      <div className="bg-[#f0f4f7] px-2 py-2">
        <p className="truncate text-center text-[10px] font-bold uppercase tracking-wider text-[#8fa7b8]">
          #{index + 1} · {label}
        </p>

        {!isVideo ? (
          <button
            type="button"
            onClick={() => onSelectCover(coverKey)}
            className={cn(
              "mt-2 h-9 w-full rounded-xl text-[11px] font-black uppercase tracking-wide transition",
              isCover
                ? "bg-[#58b368] text-white"
                : "bg-white text-[#628296] hover:bg-[#e8f1f5]"
            )}
          >
            {isCover ? "Đang làm đại diện" : "Chọn làm đại diện"}
          </button>
        ) : (
          <p className="mt-2 rounded-xl bg-white px-2 py-2 text-center text-[10px] font-bold text-[#8fa7b8]">
            Video lưu trong thư viện
          </p>
        )}

        <div className="mt-2 grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className="h-8 rounded-xl bg-white text-xs font-black text-[#628296] ring-1 ring-[#e1eaf0] disabled:opacity-40"
          >
            {"<"}
          </button>

          <button
            type="button"
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className="h-8 rounded-xl bg-white text-xs font-black text-[#628296] ring-1 ring-[#e1eaf0] disabled:opacity-40"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}

`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã patch DogEditorPanel: kéo thả media, xóa media cũ/mới, chọn nhiều file, lưu màu custom Trading Card.");
