const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Đổi default function thành named export function
content = content.replace(
  /export\s+default\s+function\s+DogEditorPanel\s*\(/,
  "export function DogEditorPanel("
);

// Nếu đang là function thường thì đổi thành named export
content = content.replace(
  /(^|\n)function\s+DogEditorPanel\s*\(/,
  "$1export function DogEditorPanel("
);

// Thêm default export ở cuối để file vẫn tương thích nếu chỗ khác import default
if (!content.includes("export default DogEditorPanel;")) {
  content += "\n\nexport default DogEditorPanel;\n";
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix DogEditorPanel: có cả named export và default export.");
