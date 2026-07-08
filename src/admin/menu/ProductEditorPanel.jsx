import {
  BadgePercent,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Layers3,
  Loader2,
  Plus,
  PlusCircle,
  Save,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice, formatVndInput } from "./menuUtils";

function getFileKey(file) {
  return [
    file?.name || "",
    file?.size || 0,
    file?.lastModified || 0,
    file?.type || "",
  ].join("-");
}

function getExistingMediaKey(media, index) {
  return (
    "existing:" +
    (media?.publicId ||
      media?.public_id ||
      media?.url ||
      media?.secureUrl ||
      index)
  );
}

function getMediaUrl(media) {
  return (
    media?.url ||
    media?.secureUrl ||
    media?.secure_url ||
    media?.imageUrl ||
    ""
  );
}

function isVideo(media) {
  const type = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(getMediaUrl(media)).toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function sameArray(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

export function ProductEditorPanel({
  form = {},
  setForm = () => {},
  files = [],
  setFiles = () => {},
  existingMedia = [],
  setExistingMedia = () => {},
  mediaOrder,
  setMediaOrder,
  isOpen = false,
  onToggleOpen,
  categories = [],
  editingId,
  submitting,
  productCount = 0,
  onSubmit,
  onCancel,
}) {
  const [dragIndex, setDragIndex] = useState(null);

  const safeFiles = Array.isArray(files) ? files : [];
  const safeExistingMedia = Array.isArray(existingMedia) ? existingMedia : [];

  const selectedPreviews = useMemo(() => {
    return safeFiles.map((file, index) => ({
      kind: "file",
      key: getFileKey(file),
      file,
      fileIndex: index,
      url: URL.createObjectURL(file),
      type: file.type?.startsWith("video/") ? "video" : "image",
      name: file.name,
    }));
  }, [safeFiles]);

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

  const existingPreviews = useMemo(() => {
    return safeExistingMedia.map((media, index) => ({
      kind: "existing",
      key: getExistingMediaKey(media, index),
      media,
      existingIndex: index,
      url: getMediaUrl(media),
      type: isVideo(media) ? "video" : "image",
      name: media?.originalName || media?.name || "Ảnh hiện tại",
    }));
  }, [safeExistingMedia]);

  const mediaItems = useMemo(() => {
    return [...existingPreviews, ...selectedPreviews].filter((item) => item.url);
  }, [existingPreviews, selectedPreviews]);

  const mediaItemKeys = useMemo(() => {
    return mediaItems.map((item) => item.key);
  }, [mediaItems]);

  const activeMediaOrder = useMemo(() => {
    if (Array.isArray(mediaOrder)) return mediaOrder;
    if (Array.isArray(form.mediaOrder)) return form.mediaOrder;
    return [];
  }, [mediaOrder, form.mediaOrder]);

  const orderedMediaItems = useMemo(() => {
    const map = new Map(mediaItems.map((item) => [item.key, item]));
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
        ...currentOrder.filter((key) => mediaItemKeys.includes(key)),
        ...mediaItemKeys.filter((key) => !currentOrder.includes(key)),
      ];

      if (sameArray(currentOrder, nextOrder)) return current;

      return {
        ...current,
        mediaOrder: nextOrder,
      };
    });
  }, [setForm, mediaItemKeys.join("|")]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateMoney(field, value) {
    update(field, formatVndInput(value));
  }

  function updateSize(index, field, value) {
    setForm((current) => ({
      ...current,
      sizes: (current.sizes || []).map((size, sizeIndex) =>
        sizeIndex === index
          ? {
              ...size,
              [field]:
                field === "price" || field === "oldPrice"
                  ? formatVndInput(value)
                  : value,
            }
          : size
      ),
    }));
  }

  function addSize() {
    setForm((current) => ({
      ...current,
      sizes: [
        ...(current.sizes || []),
        {
          name: "",
          price: "",
          oldPrice: "",
          isDefault: (current.sizes || []).length === 0,
        },
      ],
    }));
  }

  function removeSize(index) {
    setForm((current) => ({
      ...current,
      sizes: (current.sizes || []).filter((_, sizeIndex) => sizeIndex !== index),
    }));
  }

  function handlePickFiles(event) {
    const selectedFiles = Array.from(event.target.files || []).filter(Boolean);

    if (selectedFiles.length === 0) return;

    setFiles((current) => {
      const currentFiles = Array.isArray(current) ? current : [];
      const seenKeys = new Set(currentFiles.map(getFileKey));
      const nextFiles = [...currentFiles];

      selectedFiles.forEach((file) => {
        const key = getFileKey(file);

        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          nextFiles.push(file);
        }
      });

      return nextFiles;
    });

    event.target.value = "";
  }

  function commitMediaOrder(nextItems) {
    const nextKeys = nextItems.map((item) => item.key);

    update("mediaOrder", nextKeys);

    if (typeof setMediaOrder === "function") {
      setMediaOrder(nextKeys);
    }

    setExistingMedia(
      nextItems
        .filter((item) => item.kind === "existing")
        .map((item) => item.media)
    );

    setFiles(
      nextItems
        .filter((item) => item.kind === "file")
        .map((item) => item.file)
    );
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

    commitMediaOrder(nextItems);
  }

  function removeMediaItem(item) {
    const nextItems = orderedMediaItems.filter(
      (mediaItem) => mediaItem.key !== item.key
    );

    commitMediaOrder(nextItems);
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

  if (!isOpen) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
        <button
          type="button"
          onClick={onToggleOpen}
          className="group flex w-full items-center justify-between gap-4 bg-gradient-to-br from-white to-[#f7efe3]/70 p-5 text-left transition hover:from-[#FFFAFA] hover:to-[#f7efe3]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white shadow-sm">
              <PlusCircle size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                {editingId ? "Đang chỉnh sửa món" : "Thêm món mới"}
              </p>

              <h2 className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
                {editingId ? "Mở form chỉnh sửa" : "Tạo món mới"}
              </h2>

              <p className="mt-2 text-sm font-normal leading-6 text-[#756144]">
                Bấm dấu cộng để mở form. Thứ tự món mới đang gợi ý là #
                {productCount + 1}.
              </p>
            </div>
          </div>

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105">
            <Plus size={22} />
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <div className="border-b border-[#d8b77e]/60 bg-gradient-to-br from-white to-[#f7efe3]/70 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
              {editingId ? "Chỉnh sửa món" : "Thêm món mới"}
            </p>

            <h2 className="font-sniglet mt-2 text-3xl leading-none text-[#3b2a18]">
              {editingId ? "Cập nhật món" : "Thêm Món Mới"}
            </h2>

            <p className="mt-2 text-sm font-normal leading-6 text-[#756144]">
              Cập nhật tên, giá, hình ảnh và trạng thái hiển thị.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl bg-white px-3 text-xs font-brand text-[#8c672f] shadow-sm ring-1 ring-[#d8b77e]/70 transition hover:bg-[#f7efe3]"
          >
            <ChevronUp size={16} />
            Thu gọn
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 p-4 sm:p-5">
        <FormBlock icon={Layers3} title="Thông tin món">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Tên món"
              value={form.name}
              required
              placeholder="Ví dụ: Cà Phê Cốt Dừa"
              onChange={(value) => update("name", value)}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                Danh mục thực đơn
              </span>

              <select
                value={form.categoryId || ""}
                onChange={(event) => update("categoryId", event.target.value)}
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-normal text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <MoneyField
              label="Giá tiền (VNĐ)"
              value={form.price}
              required
              placeholder="35.000"
              onChange={(value) => updateMoney("price", value)}
            />

            <Field
              label="Thứ tự hiển thị"
              value={form.sortOrder}
              required
              inputMode="numeric"
              helper={"Tự động gợi ý #" + (productCount + 1) + " khi thêm món mới."}
              onChange={(value) =>
                update("sortOrder", value.replace(/[^\d]/g, ""))
              }
            />

            <MoneyField
              label="Giá cũ nếu có"
              value={form.oldPrice}
              placeholder="45.000"
              onChange={(value) => updateMoney("oldPrice", value)}
            />

            <TagInput
              label="Tags"
              value={form.tags}
              placeholder="Nhập tag rồi bấm Enter"
              onChange={(value) => update("tags", value)}
            />
          </div>

          <div className="mt-3">
            <label className="block">
              <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                Mô tả chi tiết món ăn
              </span>

              <textarea
                value={form.description || ""}
                onChange={(event) => update("description", event.target.value)}
                rows={4}
                placeholder="Mô tả tóm tắt nguyên liệu, hương vị đặc trưng, cách thưởng thức..."
                className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm font-normal leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />
            </label>
          </div>
        </FormBlock>

        <FormBlock icon={ImagePlus} title="Hình ảnh minh họa">
          <label className="block cursor-pointer rounded-[22px] border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-5 text-center transition hover:bg-[#f7efe3]">
            <ImagePlus className="mx-auto text-[#b98c49]" size={32} />

            <p className="mt-2 text-sm font-brand text-[#3b2a18]">
              Chọn ảnh / video cho món
            </p>

            <p className="mt-1 text-xs font-normal text-[#756144]">
              {safeFiles.length
                ? safeFiles.length +
                  " file mới đã chọn. Kéo thả ảnh để đổi thứ tự."
                : "Có thể chọn nhiều ảnh một lần hoặc chọn thêm nhiều lần"}
            </p>

            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handlePickFiles}
            />
          </label>

          {orderedMediaItems.length > 0 && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-[#756144]">
                  Kéo thả để đổi vị trí ảnh. Ảnh đầu tiên sẽ làm ảnh đại diện.
                </p>

                <span className="rounded-full bg-[#f7efe3] px-3 py-1 text-[11px] font-bold text-[#8c672f]">
                  {orderedMediaItems.length} file
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {orderedMediaItems.map((item, index) => (
                  <MediaPreview
                    key={item.key}
                    item={item}
                    index={index}
                    dragIndex={dragIndex}
                    label={
                      item.kind === "existing"
                        ? "Hiện tại"
                        : "Mới " + (index + 1)
                    }
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onMoveLeft={() => moveMediaItem(index, index - 1)}
                    onMoveRight={() => moveMediaItem(index, index + 1)}
                    onRemove={() => removeMediaItem(item)}
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
              onClick={() => {
                const nextItems = orderedMediaItems.filter(
                  (item) => item.kind !== "file"
                );

                commitMediaOrder(nextItems);
              }}
              className="mt-3 h-10 w-full rounded-2xl bg-red-50 text-sm font-brand text-red-600 transition hover:bg-red-100"
            >
              Xóa toàn bộ ảnh mới chọn
            </button>
          )}
        </FormBlock>

        <FormBlock icon={Plus} title="Size / lựa chọn">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-normal leading-5 text-[#756144]">
              Bỏ trống nếu món chỉ có một giá.
            </p>

            <button
              type="button"
              onClick={addSize}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-[#b98c49] px-3 text-xs font-brand text-white transition hover:bg-[#8c672f]"
            >
              <Plus size={15} />
              Thêm size
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {(form.sizes || []).length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-4 text-center text-sm font-normal text-[#756144]">
                Chưa có size. Hệ thống dùng giá chính.
              </div>
            )}

            {(form.sizes || []).map((size, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-2xl bg-[#FFFAFA] p-3 ring-1 ring-[#d8b77e]/70"
              >
                <input
                  value={size.name || ""}
                  onChange={(event) =>
                    updateSize(index, "name", event.target.value)
                  }
                  placeholder="Tên size"
                  className="h-11 rounded-xl border border-[#d8b77e] bg-white px-3 text-sm outline-none focus:border-[#b98c49]"
                />

                <div className="grid grid-cols-[1fr_1fr_44px] gap-2">
                  <input
                    value={size.price || ""}
                    onChange={(event) =>
                      updateSize(index, "price", event.target.value)
                    }
                    placeholder="Giá"
                    inputMode="numeric"
                    className="h-11 min-w-0 rounded-xl border border-[#d8b77e] bg-white px-3 text-sm outline-none focus:border-[#b98c49]"
                  />

                  <input
                    value={size.oldPrice || ""}
                    onChange={(event) =>
                      updateSize(index, "oldPrice", event.target.value)
                    }
                    placeholder="Giá cũ"
                    inputMode="numeric"
                    className="h-11 min-w-0 rounded-xl border border-[#d8b77e] bg-white px-3 text-sm outline-none focus:border-[#b98c49]"
                  />

                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="grid h-11 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                    aria-label="Xóa size"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </FormBlock>

        <FormBlock icon={BadgePercent} title="Trạng thái">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle
              label="Món nổi bật"
              checked={Boolean(form.isFeatured)}
              onChange={(checked) => update("isFeatured", checked)}
            />

            <Toggle
              label="Còn hàng / Đang bán"
              checked={form.isAvailable !== false}
              onChange={(checked) => update("isAvailable", checked)}
            />
          </div>
        </FormBlock>

        <div className="grid gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white shadow-[0_16px_40px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {editingId ? "Cập nhật món" : "Tạo món mới"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-brand text-[#756144] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3]"
            >
              <X size={18} />
              Hủy chỉnh sửa
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function FormBlock({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[24px] border border-[#d8b77e]/70 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
          <Icon size={17} />
        </span>

        <p className="font-brand text-[#3b2a18]">{title}</p>
      </div>

      {children}
    </div>
  );
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueTags(tags) {
  const seen = new Set();

  return tags.filter((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function TagInput({ label, value, onChange, placeholder }) {
  const tags = uniqueTags(normalizeTags(value));
  const [draft, setDraft] = useState("");

  function commitTag(rawValue = draft) {
    const nextTags = String(rawValue || "")
      .split(/[,\n]/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (nextTags.length === 0) return;

    const mergedTags = uniqueTags([...tags, ...nextTags]);
    onChange(mergedTags.join(", "));
    setDraft("");
  }

  function removeTag(tagToRemove) {
    const nextTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(nextTags.join(", "));
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <div className="rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 py-2 transition focus-within:border-[#b98c49] focus-within:ring-4 focus-within:ring-[#b98c49]/10">
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe3] px-3 py-1.5 text-xs font-brand text-[#8c672f] ring-1 ring-[#d8b77e]/70"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="grid h-4 w-4 place-items-center rounded-full bg-white text-[#b98c49] transition hover:bg-red-50 hover:text-red-600"
                  aria-label={"Xóa tag " + tag}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          value={draft}
          placeholder={tags.length ? "Thêm tag khác..." : placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.stopPropagation();
              commitTag();
            }

            if (event.key === "," && draft.trim()) {
              event.preventDefault();
              commitTag();
            }

            if (event.key === "Backspace" && !draft && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={() => {
            if (draft.trim()) commitTag();
          }}
          className="h-9 w-full bg-transparent text-sm font-normal text-[#3b2a18] outline-none placeholder:text-neutral-400"
        />
      </div>

      <p className="mt-1 text-[11px] font-normal text-[#8c672f]">
        Nhập một tag rồi bấm Enter. Có thể nhập nhiều tag bằng dấu phẩy.
      </p>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  inputMode,
  placeholder,
  helper,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <input
        value={value ?? ""}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-normal text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />

      {helper && (
        <p className="mt-1 text-[11px] font-normal text-[#8c672f]">{helper}</p>
      )}
    </label>
  );
}

function MoneyField({ label, value, onChange, required, placeholder }) {
  const number = Number(String(value || "").replace(/[^\d]/g, ""));

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
        {label}
      </span>

      <input
        value={value ?? ""}
        required={required}
        inputMode="numeric"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-normal text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />

      <p className="mt-1 text-[11px] font-normal text-[#8c672f]">
        Xem trước định dạng: {number > 0 ? formatPrice(number) : "0 ₫"}
      </p>
    </label>
  );
}

function MediaPreview({
  item,
  index,
  dragIndex,
  label,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
  onRemove,
  canMoveLeft,
  canMoveRight,
}) {
  const active = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-[#FFFAFA] transition",
        active
          ? "border-[#b98c49] opacity-70 ring-4 ring-[#b98c49]/10"
          : "border-[#d8b77e] hover:border-[#b98c49]/70",
      ].join(" ")}
    >
      <button
        type="button"
        className="absolute left-2 top-2 z-20 grid h-8 w-8 cursor-grab place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-sm ring-1 ring-[#d8b77e]/80 active:cursor-grabbing"
        title="Kéo để đổi vị trí"
      >
        <GripVertical size={15} />
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 z-20 grid h-8 w-8 place-items-center rounded-full bg-red-50 text-red-600 shadow-sm transition hover:bg-red-100"
        aria-label="Xóa ảnh này"
      >
        <X size={14} />
      </button>

      <div className="aspect-square bg-[#f7efe3]">
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
            alt={item.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-brand text-[#8c672f]">
            #{index + 1} · {label}
          </p>

          <p className="truncate text-[10px] text-[#756144]">{item.name}</p>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={!canMoveLeft}
            className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#8c672f] ring-1 ring-[#d8b77e] disabled:opacity-35"
            title="Lùi ảnh"
          >
            {"<"}
          </button>

          <button
            type="button"
            onClick={onMoveRight}
            disabled={!canMoveRight}
            className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#8c672f] ring-1 ring-[#d8b77e] disabled:opacity-35"
            title="Tiến ảnh"
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4 text-sm font-brand text-[#3b2a18] transition hover:bg-[#f7efe3]">
      {label}

      <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-neutral-200 transition has-[:checked]:bg-[#b98c49]">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />

        <span className="ml-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
