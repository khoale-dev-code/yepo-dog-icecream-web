const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy DogManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* Đảm bảo payload luôn gửi frameColor khi lưu */
if (!content.includes("payload.frameColor = String(form.frameColor || payload.frameColor || \"\").trim();")) {
  content = content.replace(
    /(const\s+payload\s*=\s*buildDogPayload\([^;]+;)/,
    `$1
      payload.colorTheme = String(form.colorTheme || payload.colorTheme || "pink").trim();
      payload.frameColor = String(form.frameColor || payload.frameColor || "").trim();`
  );
}

/* Truyền draftDog vào DogListPanel để khi đang chỉnh màu, card list đổi màu ngay */
content = content.replace(
  /<DogListPanel\b([\s\S]*?)\/>/,
  (match, props) => {
    if (match.includes("draftDog=")) return match;

    return `<DogListPanel${props}
        editingId={editingId}
        draftDog={editingId ? { ...form, _id: editingId, id: editingId } : null}
      />`;
  }
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã patch DogManagerView: lưu frameColor + preview live ở danh sách.");
