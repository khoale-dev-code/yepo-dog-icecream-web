const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/ProductEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/ProductEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1. Preview lưu index để xóa từng ảnh */
content = content.replace(
  /return\s+files\.map\(\(file\)\s*=>\s*\(\{/,
  `return files.map((file, index) => ({`
);

content = content.replace(
  /name:\s*file\.name,\s*\}\)\);/,
  `name: file.name,
      index,
    }));`
);

/* 2. Thêm hàm chọn nhiều ảnh dạng cộng dồn, không ghi đè */
if (!content.includes("function getFileKey(file)")) {
  content = content.replace(
    `  function removeSize(index) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.filter((_, sizeIndex) => sizeIndex !== index),
    }));
  }`,
    `  function removeSize(index) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.filter((_, sizeIndex) => sizeIndex !== index),
    }));
  }

  function getFileKey(file) {
    return [
      file?.name || "",
      file?.size || 0,
      file?.lastModified || 0,
      file?.type || "",
    ].join("-");
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

  function removeSelectedFile(index) {
    setFiles((current) => {
      const currentFiles = Array.isArray(current) ? current : [];
      return currentFiles.filter((_, fileIndex) => fileIndex !== index);
    });
  }`
  );
}

/* 3. Đổi onChange input file từ ghi đè sang cộng dồn */
content = content.replace(
  /onChange=\{\(event\)\s*=>\s*setFiles\(Array\.from\(event\.target\.files\s*\|\|\s*\[\]\)\)\}/g,
  `onChange={handlePickFiles}`
);

/* 4. Cập nhật text hướng dẫn */
content = content.replace(
  `"Sau khi chọn, hình sẽ hiện preview ngay bên dưới"`,
  `"Có thể chọn nhiều ảnh một lần hoặc chọn thêm nhiều lần"`
);

/* 5. Thêm nút xóa từng ảnh mới */
content = content.replace(
  /selectedPreviews\.map\(\(media,\s*index\)\s*=>\s*\(\s*<MediaPreview\s+key=\{media\.url\}\s+media=\{media\}\s+label=\{`Mới \$\{index \+ 1\}`\}\s*\/>\s*\)\)/s,
  `selectedPreviews.map((media, index) => (
                <MediaPreview
                  key={media.url}
                  media={media}
                  label={\`Mới \${index + 1}\`}
                  onRemove={() => removeSelectedFile(index)}
                />
              ))`
);

/* 6. MediaPreview nhận onRemove */
content = content.replace(
  /function MediaPreview\(\{\s*media,\s*label\s*\}\)\s*\{/,
  `function MediaPreview({ media, label, onRemove }) {`
);

content = content.replace(
  /<div className="overflow-hidden rounded-2xl border border-\[#d8b77e\] bg-\[#FFFAFA\]">/,
  `<div className="relative overflow-hidden rounded-2xl border border-[#d8b77e] bg-[#FFFAFA]">`
);

content = content.replace(
  /<p className="truncate px-2 py-1\.5 text-\[10px\] font-brand text-\[#8c672f\]">\s*\{label\}\s*<\/p>/,
  `<div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <p className="min-w-0 truncate text-[10px] font-brand text-[#8c672f]">
          {label}
        </p>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
            aria-label="Xóa ảnh này"
          >
            <X size={11} />
          </button>
        )}
      </div>`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa ProductEditorPanel: chọn được nhiều ảnh, chọn thêm không bị ghi đè, xóa từng ảnh được.");
