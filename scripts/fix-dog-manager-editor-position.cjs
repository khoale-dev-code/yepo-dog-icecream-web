const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy DogManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* Ép payload gửi frameColor */
if (!content.includes("frameColorDraft")) {
  content = content.replace(
    /(payload\.colorTheme\s*=\s*String\([\s\S]*?\)\.trim\(\);)/,
    `$1

      const submittedFrameColor = String(
        event?.currentTarget
          ? new FormData(event.currentTarget).get("frameColorDraft") || ""
          : ""
      ).trim();

      payload.frameColor = String(
        submittedFrameColor || form.frameColor || payload.frameColor || ""
      ).trim();`
  );
} else if (!content.includes("payload.frameColor")) {
  content = content.replace(
    /(const\s+payload\s*=\s*buildDogPayload\([^;]+;)/,
    `$1
      payload.frameColor = String(form.frameColor || "").trim();`
  );
}

/* Bọc editor/list bằng order class */
function wrapFirstSelfClosingTag(source, tagName, marker, classExpression) {
  if (source.includes(marker)) return source;

  const regex = new RegExp("<" + tagName + "\\\\b[\\\\s\\\\S]*?\\\\/>", "m");
  const match = source.match(regex);

  if (!match) return source;

  const wrapped =
    `<div ${marker} className={${classExpression}}>\n` +
    match[0] +
    `\n</div>`;

  return source.replace(match[0], wrapped);
}

content = wrapFirstSelfClosingTag(
  content,
  "DogEditorPanel",
  'data-dog-editor-position="true"',
  'editingId ? "order-2" : "order-1"'
);

content = wrapFirstSelfClosingTag(
  content,
  "DogListPanel",
  'data-dog-list-position="true"',
  'editingId ? "order-1" : "order-2"'
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã chỉnh vị trí: thêm mới form trên, sửa form dưới danh sách.");
