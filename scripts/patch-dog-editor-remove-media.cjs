const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. Thêm hàm xóa từng file mới chọn
if (!content.includes("function removeSelectedFile(indexToRemove)")) {
  content = content.replace(
    `  function removeCoatColor(index) {
    setForm((current) => ({
      ...current,
      coatColors: current.coatColors.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  // Cờ kiểm tra xem màu đang chọn có phải mã Hex tùy chỉnh không`,
    `  function removeCoatColor(index) {
    setForm((current) => ({
      ...current,
      coatColors: current.coatColors.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function removeSelectedFile(indexToRemove) {
    const currentCoverKey = String(form.coverMediaKey || "");

    setFiles((currentFiles) => {
      const nextFiles = currentFiles.filter((_, index) => index !== indexToRemove);

      if (currentCoverKey === \`new:\${indexToRemove}\`) {
        update("coverMediaKey", "");
      } else if (currentCoverKey.startsWith("new:")) {
        const currentIndex = Number(currentCoverKey.replace("new:", ""));

        if (Number.isFinite(currentIndex) && currentIndex > indexToRemove) {
          update("coverMediaKey", \`new:\${currentIndex - 1}\`);
        }
      }

      return nextFiles;
    });
  }

  // Cờ kiểm tra xem màu đang chọn có phải mã Hex tùy chỉnh không`
  );
}

// 2. Đổi input file: chọn thêm file mới sẽ cộng dồn, không thay thế danh sách cũ
content = content.replace(
  `              onChange={(event) => setFiles(Array.from(event.target.files || []))}`,
  `              onChange={(event) => {
                const pickedFiles = Array.from(event.target.files || []);

                if (pickedFiles.length) {
                  setFiles((currentFiles) => [...currentFiles, ...pickedFiles]);
                }

                event.target.value = "";
              }}`
);

// 3. Truyền nút xóa cho media mới chọn
content = content.replace(
  `                <MediaPreview
                  key={media.url}
                  media={media}
                  label={\`Mới #\${index + 1}\`}
                  coverMediaKey={form.coverMediaKey}
                  onSelectCover={(key) => update("coverMediaKey", key)}
                />`,
  `                <MediaPreview
                  key={media.url}
                  media={media}
                  label={\`Mới #\${index + 1}\`}
                  coverMediaKey={form.coverMediaKey}
                  onSelectCover={(key) => update("coverMediaKey", key)}
                  onRemove={() => removeSelectedFile(index)}
                />`
);

// 4. Cập nhật MediaPreview để có nút X nếu có onRemove
content = content.replace(
  `function MediaPreview({ media, label, coverMediaKey, onSelectCover }) {`,
  `function MediaPreview({ media, label, coverMediaKey, onSelectCover, onRemove }) {`
);

if (!content.includes("title=\"Xóa media này\"")) {
  content = content.replace(
    `        {isVideo && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Video size={11} />
            Video
          </span>
        )}

        {isCover && (`,
    `        {isVideo && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-bold uppercase text-white">
            <Video size={11} />
            Video
          </span>
        )}

        {onRemove && (
          <button
            type="button"
            title="Xóa media này"
            onClick={onRemove}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#ffebf0] text-[#d97c94] shadow-md transition hover:scale-105 hover:bg-[#ffd6e2]"
          >
            <X size={16} />
          </button>
        )}

        {isCover && (`
  );
}

// 5. Nếu có nút X thì dấu check ảnh đại diện dịch xuống dưới để không bị đè
content = content.replace(
  `          <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#58b368] text-white shadow-md">
            <CheckCircle size={17} />
          </span>`,
  `          <span
            className={cn(
              "absolute right-2 grid h-7 w-7 place-items-center rounded-full bg-[#58b368] text-white shadow-md",
              onRemove ? "top-12" : "top-2"
            )}
          >
            <CheckCircle size={17} />
          </span>`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Updated DogEditorPanel: append multiple media and remove selected media one by one.");
