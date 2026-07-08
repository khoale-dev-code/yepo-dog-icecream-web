import {
  CalendarDays,
  CheckCircle,
  GripVertical,
  ImagePlus,
  Loader2,
  Palette,
  Paintbrush,
  PawPrint,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash,
  Video,
  Weight,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DOG_CARD_THEME_OPTIONS } from "../../lib/dogTheme";
import { cn, getPatternLabel } from "./dogUtils";

const STORAGE_KEY = "yepo_dog_card_custom_colors";

const PATTERNS = [
  "solid",
  "two-tone",
  "spotted",
  "dotted",
  "brindle",
  "mixed",
  "other",
];

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function normalizeHexDraft(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const withHash = raw.startsWith("#") ? raw : "#" + raw;
  return isHexColor(withHash) ? withHash.toLowerCase() : "";
}

function readSavedThemeColors() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");

    return Array.isArray(parsed)
      ? parsed.map(normalizeHexDraft).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function saveThemeColor(hex) {
  const normalized = normalizeHexDraft(hex);

  if (!normalized || typeof window === "undefined") {
    return readSavedThemeColors();
  }

  const next = [
    normalized,
    ...readSavedThemeColors().filter((item) => item !== normalized),
  ].slice(0, 12);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  return next;
}

function removeThemeColor(hex) {
  const normalized = normalizeHexDraft(hex);
  const next = readSavedThemeColors().filter((item) => item !== normalized);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return next;
}

function getMediaUrl(media) {
  return String(
    media?.url ||
      media?.secureUrl ||
      media?.secure_url ||
      media?.imageUrl ||
      ""
  );
}

function isVideoMedia(media) {
  const type = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = getMediaUrl(media).toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getExistingMediaKey(media) {
  return "existing:" + getMediaUrl(media);
}

function getExistingMediaRemoveKey(media) {
  return String(
    media?.publicId ||
      media?.public_id ||
      media?.url ||
      media?.secureUrl ||
      media?.secure_url ||
      media?.imageUrl ||
      ""
  );
}

function stripMediaMeta(media = {}) {
  const { source, existingIndex, fileKey, previewUrl, file, ...clean } = media;
  return clean;
}

function sameArray(a = [], b = []) {
  if (a.length !== b.length) return false;

  return a.every((item, index) => item === b[index]);
}

function getInitialCoatColors(form) {
  if (Array.isArray(form?.coatColors) && form.coatColors.length) {
    return form.coatColors;
  }

  return [{ name: form?.coatColor || "", hex: "#ffffff" }];
}

function getStarScore(value) {
  const numericValue = Number(value || 100);
  return Math.max(1, Math.min(5, Math.round(numericValue / 20)));
}

export function DogEditorPanel({
  form = {},
  setForm,
  files = [],
  setFiles,
  existingMedia = [],
  setExistingMedia = () => {},
  mediaOrder,
  setMediaOrder,
  editingId,
  submitting,
  dogsCount = 0,
  favoriteSuggestions = [],
  personalitySuggestions = [],
  breedSuggestions = [],
  onSubmit,
  onCancel,
}) {
  const [savedCustomThemes, setSavedCustomThemes] = useState(() =>
    readSavedThemeColors()
  );
  const [customThemeHex, setCustomThemeHex] = useState(
    isHexColor(form.colorTheme) ? form.colorTheme : ""
  );
  const [customFrameHex, setCustomFrameHex] = useState(
    isHexColor(form.frameColor) ? form.frameColor : ""
  );
  const [themeHexError, setThemeHexError] = useState("");
  const [dragKey, setDragKey] = useState("");

  useEffect(() => {
    if (isHexColor(form.colorTheme)) {
      setCustomThemeHex(form.colorTheme);
    }
  }, [form.colorTheme]);

  useEffect(() => {
    if (isHexColor(form.frameColor)) {
      setCustomFrameHex(form.frameColor);
    }

    if (!form.frameColor) {
      setCustomFrameHex("");
    }
  }, [form.frameColor]);

  const removedKeys = useMemo(
    () => new Set((form.removedExistingMediaKeys || []).map(String)),
    [form.removedExistingMediaKeys]
  );

  const selectedPreviews = useMemo(
    () =>
      files.map((file, index) => ({
        kind: "new",
        key: "new:" + index,
        file,
        name: file.name || "Media mới",
        type: file.type || "",
        previewUrl: URL.createObjectURL(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [selectedPreviews]);

  const existingPreviews = useMemo(
    () =>
      (Array.isArray(existingMedia) ? existingMedia : [])
        .map((media, index) => {
          const url = getMediaUrl(media);
          if (!url) return null;

          const removeKey = getExistingMediaRemoveKey(media);
          if (removeKey && removedKeys.has(removeKey)) return null;

          return {
            kind: "existing",
            key: getExistingMediaKey(media),
            media: {
              ...media,
              url,
              secureUrl: media.secureUrl || media.secure_url || url,
              resourceType: isVideoMedia(media) ? "video" : "image",
              type: isVideoMedia(media) ? "video" : "image",
              sortOrder: Number(media.sortOrder || media.order || index + 1),
            },
          };
        })
        .filter(Boolean),
    [existingMedia, removedKeys]
  );

  const mediaItems = useMemo(() => {
    const items = [...existingPreviews, ...selectedPreviews];
    const order = Array.isArray(mediaOrder)
      ? mediaOrder
      : Array.isArray(form.mediaOrder)
        ? form.mediaOrder
        : [];

    if (!order.length) return items;

    const indexMap = new Map(order.map((key, index) => [key, index]));

    return [...items].sort((a, b) => {
      const aIndex = indexMap.has(a.key) ? indexMap.get(a.key) : 9999;
      const bIndex = indexMap.has(b.key) ? indexMap.get(b.key) : 9999;

      return aIndex - bIndex;
    });
  }, [existingPreviews, selectedPreviews, mediaOrder, form.mediaOrder]);

  const mediaKeys = useMemo(() => mediaItems.map((item) => item.key), [mediaItems]);

  useEffect(() => {
    const currentOrder = Array.isArray(form.mediaOrder) ? form.mediaOrder : [];

    if (!sameArray(currentOrder, mediaKeys)) {
      setForm((current) => ({
        ...current,
        mediaOrder: mediaKeys,
      }));
    }

    if (typeof setMediaOrder === "function") {
      setMediaOrder(mediaKeys);
    }

    if (mediaKeys.length && !mediaKeys.includes(form.coverMediaKey)) {
      const firstImage =
        mediaItems.find((item) => {
          if (item.kind === "new") {
            return !String(item.type || "").startsWith("video");
          }

          return !isVideoMedia(item.media);
        }) || mediaItems[0];

      setForm((current) => ({
        ...current,
        coverMediaKey: firstImage?.key || "",
      }));
    }
  }, [mediaKeys.join("|")]);

  const allThemeOptions = useMemo(
    () => [
      ...DOG_CARD_THEME_OPTIONS,
      ...savedCustomThemes.map((hex) => ({
        value: hex,
        label: hex,
        color: hex,
        custom: true,
      })),
    ],
    [savedCustomThemes]
  );

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleThemeChange(value) {
    const nextValue = String(value || "").trim();

    setForm((current) => ({
      ...current,
      colorTheme: nextValue || "pink",
    }));

    if (isHexColor(nextValue)) {
      setCustomThemeHex(nextValue);
    }

    setThemeHexError("");
  }

  function commitCustomThemeHex() {
    const hex = normalizeHexDraft(customThemeHex);

    if (!hex) {
      setThemeHexError("Mã HEX không hợp lệ. Ví dụ đúng: #f2aab8 hoặc f2aab8.");
      return;
    }

    setForm((current) => ({
      ...current,
      colorTheme: hex,
    }));

    setSavedCustomThemes(saveThemeColor(hex));
    setCustomThemeHex(hex);
    setThemeHexError("");
  }

  function handleRemoveSavedTheme(hex) {
    setSavedCustomThemes(removeThemeColor(hex));

    if (form.colorTheme === hex) {
      update("colorTheme", "pink");
    }
  }

  function handleFrameThemeChange(hex) {
    const nextHex = normalizeHexDraft(hex);

    setForm((current) => ({
      ...current,
      frameColor: nextHex,
    }));

    setCustomFrameHex(nextHex);
    setThemeHexError("");
  }

  function clearFrameHex() {
    setCustomFrameHex("");

    setForm((current) => ({
      ...current,
      frameColor: "",
    }));

    setThemeHexError("");
  }

  function updateCoatColor(index, field, value) {
    const next = [...getInitialCoatColors(form)];

    next[index] = {
      ...next[index],
      [field]: value,
    };

    setForm((current) => ({
      ...current,
      coatColors: next,
      coatColor: next.map((item) => item.name).filter(Boolean).join(", "),
    }));
  }

  function addCoatColor() {
    const next = [...getInitialCoatColors(form), { name: "", hex: "#ffffff" }];

    setForm((current) => ({
      ...current,
      coatColors: next,
    }));
  }

  function removeCoatColor(index) {
    const next = getInitialCoatColors(form).filter(
      (_, itemIndex) => itemIndex !== index
    );

    setForm((current) => ({
      ...current,
      coatColors: next.length ? next : [{ name: "", hex: "#ffffff" }],
      coatColor: next.map((item) => item.name).filter(Boolean).join(", "),
    }));
  }

  function handlePickFiles(event) {
    const pickedFiles = Array.from(event.target.files || []);
    if (!pickedFiles.length) return;

    setFiles((current) => [...current, ...pickedFiles]);
    event.target.value = "";
  }

  function getImageUrlAfterOrder(items) {
    const firstImage =
      items.find((item) => {
        if (item.kind === "new") {
          return !String(item.type || "").startsWith("video");
        }

        return !isVideoMedia(item.media);
      }) || items[0];

    if (!firstImage) return "";
    if (firstImage.kind === "existing") return getMediaUrl(firstImage.media);

    return form.imageUrl || "";
  }

  function commitMediaItems(nextItems, removedExistingKey = "") {
    const nextExistingMedia = nextItems
      .map((item, index) => {
        if (item.kind !== "existing") return null;

        return {
          ...stripMediaMeta(item.media),
          sortOrder: index + 1,
          order: index + 1,
        };
      })
      .filter(Boolean);

    const nextFiles = nextItems
      .filter((item) => item.kind === "new")
      .map((item) => item.file)
      .filter(Boolean);

    const nextNewItems = nextItems.filter((item) => item.kind === "new");

    const nextOrder = nextItems.map((item) =>
      item.kind === "existing"
        ? getExistingMediaKey(item.media)
        : "new:" + nextNewItems.indexOf(item)
    );

    const nextCoverItem =
      nextItems.find((item) => {
        if (item.kind === "new") {
          return !String(item.type || "").startsWith("video");
        }

        return !isVideoMedia(item.media);
      }) || nextItems[0];

    const nextCoverKey = nextCoverItem
      ? nextCoverItem.kind === "existing"
        ? getExistingMediaKey(nextCoverItem.media)
        : "new:" + nextNewItems.indexOf(nextCoverItem)
      : "";

    const nextImageUrl = getImageUrlAfterOrder(nextItems);

    setExistingMedia(nextExistingMedia);
    setFiles(nextFiles);

    if (typeof setMediaOrder === "function") {
      setMediaOrder(nextOrder);
    }

    setForm((current) => {
      const removedSet = new Set(
        Array.isArray(current.removedExistingMediaKeys)
          ? current.removedExistingMediaKeys.map(String)
          : []
      );

      if (removedExistingKey) {
        removedSet.add(removedExistingKey);
      }

      return {
        ...current,
        media: nextExistingMedia,
        images: nextExistingMedia,
        mediaOrder: nextOrder,
        coverMediaKey: nextCoverKey,
        imageUrl: nextImageUrl,
        removedExistingMediaKeys: Array.from(removedSet),
      };
    });
  }

  function removeMediaItem(item) {
    const removedExistingKey =
      item.kind === "existing" ? getExistingMediaRemoveKey(item.media) : "";

    const nextItems = mediaItems.filter((mediaItem) => mediaItem.key !== item.key);

    commitMediaItems(nextItems, removedExistingKey);
  }

  function moveMediaItem(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= mediaItems.length) return;

    const nextItems = [...mediaItems];
    const [picked] = nextItems.splice(fromIndex, 1);

    nextItems.splice(toIndex, 0, picked);
    commitMediaItems(nextItems);
  }

  function setCover(item) {
    setForm((current) => ({
      ...current,
      coverMediaKey: item.key,
      imageUrl: item.kind === "existing" ? getMediaUrl(item.media) : current.imageUrl,
    }));
  }

  const coatColors = getInitialCoatColors(form);
  const colorThemeDraftValue = form.colorTheme || "pink";
  const frameColorDraftValue = form.frameColor || "";

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="colorThemeDraft" value={colorThemeDraftValue} />
      <input type="hidden" name="frameColorDraft" value={frameColorDraftValue} />

      <FormBlock
        icon={Palette}
        title="Trading Card"
        description="Màu card ngoài, màu khung trong và số sao sẽ đồng bộ ra card admin/client."
      >
        <div className="grid gap-4">
          <div>
            <p className="mb-2 text-sm font-extrabold text-[#3b2a18]">
              Màu card ngoài
            </p>

            <div className="flex flex-wrap gap-2">
              {allThemeOptions.map((theme) => {
                const active = form.colorTheme === theme.value;

                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => handleThemeChange(theme.value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                      active
                        ? "border-[#b98c49] bg-[#fff7e6] text-[#3b2a18]"
                        : "border-[#eadfce] bg-white text-[#6f6254] hover:border-[#b98c49]/60"
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white shadow"
                      style={{ backgroundColor: theme.color }}
                    />

                    {theme.label}

                    {active && <CheckCircle size={14} />}

                    {theme.custom && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveSavedTheme(theme.value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            handleRemoveSavedTheme(theme.value);
                          }
                        }}
                        className="ml-1 rounded-full p-1 text-[#9d6c6c] hover:bg-white"
                      >
                        <X size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-[#b98c49]/35 bg-[#fffaf3] p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#3b2a18]">
              <Paintbrush size={16} />
              Tạo màu card tùy chỉnh
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="h-11 w-11 rounded-2xl border border-white shadow"
                style={{
                  backgroundColor:
                    normalizeHexDraft(customThemeHex) ||
                    (isHexColor(form.colorTheme) ? form.colorTheme : "#ffffff"),
                }}
              />

              <input
                value={customThemeHex}
                onChange={(event) => {
                  setCustomThemeHex(event.target.value);
                  setThemeHexError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitCustomThemeHex();
                  }
                }}
                placeholder="#f2aab8"
                className="h-11 flex-1 rounded-2xl border border-[#eadfce] bg-white px-4 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49]"
              />

              <button
                type="button"
                onClick={commitCustomThemeHex}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#b98c49] px-5 text-sm font-extrabold text-white shadow"
              >
                Lưu màu
              </button>
            </div>

            {themeHexError && (
              <p className="mt-2 text-xs font-bold text-[#d97c94]">
                {themeHexError}
              </p>
            )}

            <p className="mt-2 text-xs font-bold text-[#628296]">
              Màu card đang áp dụng: {form.colorTheme || "pink"}
            </p>
          </div>

          <div className="rounded-3xl border border-[#eadfce] bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#3b2a18]">
              <Paintbrush size={16} />
              Màu khung bên trong card
            </p>

            <p className="mt-1 text-xs font-bold text-[#7d6f61]">
              Màu này đổi phần khung/nền quanh ảnh bên trong card. Các màu cố định giống màu card ngoài.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {DOG_CARD_THEME_OPTIONS.map((theme) => {
                const active = form.frameColor === theme.color;

                return (
                  <button
                    key={"frame-" + theme.value}
                    type="button"
                    onClick={() => handleFrameThemeChange(theme.color)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                      active
                        ? "border-[#b98c49] bg-[#fff7e6] text-[#3b2a18]"
                        : "border-[#eadfce] bg-white text-[#6f6254] hover:border-[#b98c49]/60"
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white shadow"
                      style={{ backgroundColor: theme.color }}
                    />

                    {theme.label}

                    {active && <CheckCircle size={14} />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={clearFrameHex}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                  !form.frameColor
                    ? "border-[#b98c49] bg-[#fff7e6] text-[#3b2a18]"
                    : "border-[#eadfce] bg-white text-[#6f6254] hover:border-[#b98c49]/60"
                )}
              >
                Dùng màu card
                {!form.frameColor && <CheckCircle size={14} />}
              </button>
            </div>

            <p className="mt-2 text-xs font-bold text-[#628296]">
              Màu khung trong đang áp dụng: {form.frameColor || "theo màu card"}
            </p>
          </div>

          <StarRatingPicker
            value={form.cutenessLevel || 100}
            onChange={(nextValue) => update("cutenessLevel", String(nextValue))}
          />
        </div>
      </FormBlock>

      <FormBlock icon={PawPrint} title="Thông tin cơ bản">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tên cún">
            <input
              value={form.name || ""}
              onChange={(event) => update("name", event.target.value)}
              className="admin-input"
              placeholder="Mochi"
              required
            />
          </Field>

          <Field label="Nickname">
            <input
              value={form.nickname || ""}
              onChange={(event) => update("nickname", event.target.value)}
              className="admin-input"
              placeholder="Bé Mochi"
            />
          </Field>

          <Field label="Tuổi">
            <input
              value={form.age || ""}
              onChange={(event) => update("age", event.target.value)}
              className="admin-input"
              placeholder="2 tuổi"
            />
          </Field>

          <Field label="Giống">
            <input
              value={form.breed || ""}
              onChange={(event) => update("breed", event.target.value)}
              className="admin-input"
              placeholder="Corgi"
            />

            <SuggestionRow
              items={breedSuggestions}
              onPick={(value) => update("breed", value)}
            />
          </Field>

          <Field label="Giới tính">
            <select
              value={form.gender || "unknown"}
              onChange={(event) => update("gender", event.target.value)}
              className="admin-input"
            >
              <option value="unknown">Chưa rõ</option>
              <option value="male">Đực</option>
              <option value="female">Cái</option>
            </select>
          </Field>

          <Field label="Độ cute">
            <input
              type="number"
              min="1"
              max="100"
              value={form.cutenessLevel || 100}
              onChange={(event) => update("cutenessLevel", event.target.value)}
              className="admin-input"
            />
          </Field>
        </div>
      </FormBlock>

      <FormBlock icon={CalendarDays} title="Ngày sinh & cân nặng">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Sinh nhật">
            <input
              value={form.birthday || ""}
              onChange={(event) => update("birthday", event.target.value)}
              className="admin-input"
              placeholder="12/05 hoặc 2024-05-12"
            />
          </Field>

          <Field label="Cân nặng kg">
            <div className="relative">
              <Weight
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weightKg || ""}
                onChange={(event) => update("weightKg", event.target.value)}
                className="admin-input pl-11"
                placeholder="8.5"
              />
            </div>
          </Field>
        </div>
      </FormBlock>

      <FormBlock icon={Paintbrush} title="Màu lông">
        <div className="grid gap-3">
          {coatColors.map((color, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-3xl border border-[#eadfce] bg-white p-3 md:grid-cols-[1fr_120px_auto]"
            >
              <input
                value={color.name || ""}
                onChange={(event) =>
                  updateCoatColor(index, "name", event.target.value)
                }
                className="admin-input"
                placeholder="Trắng kem"
              />

              <input
                type="color"
                value={color.hex || "#ffffff"}
                onChange={(event) =>
                  updateCoatColor(index, "hex", event.target.value)
                }
                className="h-11 w-full rounded-2xl border border-[#eadfce] bg-white p-1"
              />

              <button
                type="button"
                onClick={() => removeCoatColor(index)}
                className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fff1f1] text-[#d97c94]"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCoatColor}
            className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#b98c49]/30 bg-[#fffaf3] px-4 py-2 text-sm font-extrabold text-[#b98c49]"
          >
            <Plus size={16} />
            Thêm màu lông
          </button>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Kiểu lông">
              <select
                value={form.coatPattern || "solid"}
                onChange={(event) => update("coatPattern", event.target.value)}
                className="admin-input"
              >
                {PATTERNS.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {getPatternLabel(pattern)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Mô tả kiểu lông">
              <input
                value={form.coatPatternDescription || ""}
                onChange={(event) =>
                  update("coatPatternDescription", event.target.value)
                }
                className="admin-input"
                placeholder="Tai nâu, thân trắng..."
              />
            </Field>
          </div>
        </div>
      </FormBlock>

      <FormBlock icon={ImagePlus} title="Ảnh / Video">
        <label className="grid cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-[#b98c49]/35 bg-[#fffaf3] px-5 py-8 text-center">
          <ImagePlus className="text-[#b98c49]" size={28} />

          <span className="mt-3 text-sm font-extrabold text-[#3b2a18]">
            Chọn nhiều ảnh hoặc video
          </span>

          <span className="mt-1 text-xs font-bold text-[#7d6f61]">
            Có thể sắp xếp, xóa ảnh cũ và đặt ảnh bìa
          </span>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handlePickFiles}
            className="hidden"
          />
        </label>

        {mediaItems.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mediaItems.map((item, index) => (
              <MediaPreview
                key={item.key}
                item={item}
                index={index}
                total={mediaItems.length}
                isCover={form.coverMediaKey === item.key}
                onCover={() => setCover(item)}
                onRemove={() => removeMediaItem(item)}
                onMoveUp={() => moveMediaItem(index, index - 1)}
                onMoveDown={() => moveMediaItem(index, index + 1)}
                onDragStart={() => setDragKey(item.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  const fromIndex = mediaItems.findIndex(
                    (mediaItem) => mediaItem.key === dragKey
                  );

                  moveMediaItem(fromIndex, index);
                  setDragKey("");
                }}
              />
            ))}
          </div>
        )}
      </FormBlock>

      <FormBlock icon={Sparkles} title="Tính cách & món thích">
        <div className="grid gap-4">
          <Field label="Tính cách">
            <textarea
              value={form.personality || ""}
              onChange={(event) => update("personality", event.target.value)}
              className="admin-input min-h-[92px] resize-none"
              placeholder="Thân thiện, thích được vuốt ve..."
            />
          </Field>

          <Field label="Tags tính cách">
            <input
              value={form.personalityTags || ""}
              onChange={(event) => update("personalityTags", event.target.value)}
              className="admin-input"
              placeholder="vui vẻ, hiền, thích chơi bóng"
            />

            <SuggestionRow
              items={personalitySuggestions}
              onPick={(value) =>
                update(
                  "personalityTags",
                  [form.personalityTags, value].filter(Boolean).join(", ")
                )
              }
            />
          </Field>

          <Field label="Món thích">
            <input
              value={form.favoriteTreat || ""}
              onChange={(event) => update("favoriteTreat", event.target.value)}
              className="admin-input"
              placeholder="Kem bí đỏ"
            />
          </Field>

          <Field label="Danh sách món thích">
            <input
              value={form.favoriteTreats || ""}
              onChange={(event) => update("favoriteTreats", event.target.value)}
              className="admin-input"
              placeholder="kem bí đỏ, snack gà"
            />

            <SuggestionRow
              items={favoriteSuggestions}
              onPick={(value) =>
                update(
                  "favoriteTreats",
                  [form.favoriteTreats, value].filter(Boolean).join(", ")
                )
              }
            />
          </Field>

          <Field label="Ghi chú tương tác">
            <textarea
              value={form.interactionNote || ""}
              onChange={(event) => update("interactionNote", event.target.value)}
              className="admin-input min-h-[92px] resize-none"
              placeholder="Thích được gọi tên trước khi chụp ảnh..."
            />
          </Field>
        </div>
      </FormBlock>

      <FormBlock icon={CheckCircle} title="Hiển thị">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Thứ tự">
            <input
              type="number"
              min="1"
              value={form.sortOrder || dogsCount + 1}
              onChange={(event) => update("sortOrder", event.target.value)}
              className="admin-input"
            />
          </Field>

          <Toggle
            label="Cún nổi bật"
            checked={Boolean(form.isFeatured)}
            onChange={(checked) => update("isFeatured", checked)}
          />

          <Toggle
            label="Đang hiển thị"
            checked={form.isActive !== false}
            onChange={(checked) => update("isActive", checked)}
          />
        </div>
      </FormBlock>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-3xl border border-[#eadfce] bg-white/95 p-3 shadow-2xl backdrop-blur sm:flex-row">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-extrabold text-white shadow disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {editingId ? "Lưu thay đổi" : "Tạo hồ sơ cún"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#eadfce] bg-white px-5 text-sm font-extrabold text-[#3b2a18]"
          >
            <X size={18} />
            Hủy sửa
          </button>
        )}
      </div>
    </form>
  );
}

function StarRatingPicker({ value, onChange }) {
  const activeStars = getStarScore(value);

  const labels = {
    1: "1 sao - cơ bản",
    2: "2 sao - dễ thương",
    3: "3 sao - nổi bật",
    4: "4 sao - rất nổi bật",
    5: "5 sao - superstar",
  };

  return (
    <div className="rounded-3xl border border-[#eadfce] bg-[#fffaf3] p-4">
      <p className="flex items-center gap-2 text-sm font-extrabold text-[#3b2a18]">
        <Star size={16} />
        Đánh giá sao trên card
      </p>

      <p className="mt-1 text-xs font-bold text-[#7d6f61]">
        Sao này sẽ hiển thị ở card admin và client. 1 sao = 20 điểm, 5 sao = 100 điểm.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => {
          const starNumber = index + 1;
          const active = starNumber <= activeStars;

          return (
            <button
              key={starNumber}
              type="button"
              onClick={() => onChange(starNumber * 20)}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-2xl border transition",
                active
                  ? "border-[#f6d77d] bg-[#f6d77d] text-[#b98c49] shadow"
                  : "border-[#eadfce] bg-white text-[#d8c7b4] hover:border-[#f6d77d]"
              )}
              title={labels[starNumber]}
            >
              <Star size={19} fill={active ? "currentColor" : "none"} />
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-[#3b2a18]">
          {labels[activeStars]}
        </p>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20">
          {activeStars}/5 sao
        </span>
      </div>
    </div>
  );
}

function FormBlock({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-[#eadfce] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f6d77d]/30 text-[#b98c49]">
          <Icon size={19} />
        </span>

        <div>
          <h3 className="text-base font-extrabold text-[#3b2a18]">{title}</h3>

          {description && (
            <p className="mt-1 text-sm font-semibold text-[#7d6f61]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7d6f61]">
        {label}
      </span>

      {children}
    </label>
  );
}

function SuggestionRow({ items = [], onPick }) {
  const list = Array.isArray(items) ? items.filter(Boolean).slice(0, 8) : [];
  if (!list.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {list.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="rounded-full bg-[#fffaf3] px-3 py-1 text-xs font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function MediaPreview({
  item,
  index,
  total,
  isCover,
  onCover,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const url = item.kind === "new" ? item.previewUrl : getMediaUrl(item.media);
  const isVideo =
    item.kind === "new"
      ? String(item.type || "").startsWith("video")
      : isVideoMedia(item.media);

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-sm"
    >
      <div className="relative aspect-square bg-[#fffaf3]">
        {isVideo ? (
          <video src={url} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <img src={url} alt="" className="h-full w-full object-cover" />
        )}

        <div className="absolute left-3 top-3 flex gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#3b2a18] shadow">
            {isVideo ? <Video size={15} /> : <ImagePlus size={15} />}
          </span>

          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#3b2a18] shadow">
            <GripVertical size={15} />
          </span>
        </div>

        {isCover && (
          <span className="absolute right-3 top-3 rounded-full bg-[#b98c49] px-3 py-1 text-xs font-extrabold text-white shadow">
            Ảnh bìa
          </span>
        )}
      </div>

      <div className="grid gap-2 p-3">
        <button
          type="button"
          onClick={onCover}
          className={cn(
            "h-9 rounded-2xl text-xs font-extrabold",
            isCover
              ? "bg-[#f6d77d]/35 text-[#3b2a18]"
              : "bg-[#fffaf3] text-[#b98c49]"
          )}
        >
          Đặt làm ảnh bìa
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-9 rounded-2xl border border-[#eadfce] text-xs font-extrabold text-[#3b2a18] disabled:opacity-40"
          >
            Lên
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="h-9 rounded-2xl border border-[#eadfce] text-xs font-extrabold text-[#3b2a18] disabled:opacity-40"
          >
            Xuống
          </button>

          <button
            type="button"
            onClick={onRemove}
            className="grid h-9 place-items-center rounded-2xl bg-[#fff1f1] text-[#d97c94]"
          >
            <Trash size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex h-full min-h-[76px] cursor-pointer items-center justify-between gap-3 rounded-3xl border border-[#eadfce] bg-white px-4 py-3">
      <span className="text-sm font-extrabold text-[#3b2a18]">{label}</span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#b98c49]"
      />
    </label>
  );
}

export default DogEditorPanel;