const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("function getExistingMediaRemoveKey")) {
  content = content.replace(
    `function getMediaStableKey(media) {
  if (media?.source === "new") return "file:" + media.fileKey;
  return "existing:" + getMediaUrl(media);
}`,
    `function getMediaStableKey(media) {
  if (media?.source === "new") return "file:" + media.fileKey;
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
}`
  );
}

content = content.replace(
  `  const safeFiles = Array.isArray(files) ? files : [];
  const safeExistingMedia = Array.isArray(existingMedia) ? existingMedia : [];`,
  `  const safeFiles = Array.isArray(files) ? files : [];
  const removedExistingMediaKeys = Array.isArray(form.removedExistingMediaKeys)
    ? form.removedExistingMediaKeys
    : [];

  const safeExistingMedia = (Array.isArray(existingMedia) ? existingMedia : []).filter(
    (media) => !removedExistingMediaKeys.includes(getExistingMediaRemoveKey(media))
  );`
);

content = content.replace(
  `  function removeMediaItem(targetItem) {
    const targetKey = getMediaStableKey(targetItem);
    const nextItems = orderedMediaItems.filter(
      (item) => getMediaStableKey(item) !== targetKey
    );

    commitMediaItems(nextItems);
  }`,
  `  function removeMediaItem(targetItem) {
    if (targetItem?.source === "existing") {
      const removeKey = getExistingMediaRemoveKey(targetItem);

      if (removeKey) {
        setForm((current) => {
          const currentKeys = Array.isArray(current.removedExistingMediaKeys)
            ? current.removedExistingMediaKeys
            : [];

          if (currentKeys.includes(removeKey)) return current;

          return {
            ...current,
            removedExistingMediaKeys: [...currentKeys, removeKey],
          };
        });
      }
    }

    const targetKey = getMediaStableKey(targetItem);
    const nextItems = orderedMediaItems.filter(
      (item) => getMediaStableKey(item) !== targetKey
    );

    commitMediaItems(nextItems);
  }`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa DogEditorPanel: xóa được ảnh cũ khi edit và ẩn ngay khỏi UI.");
