const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/ProductEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/ProductEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// 1. Default props để tránh lỗi undefined khi mở form thêm/sửa sản phẩm
content = content.replace(
  /export function ProductEditorPanel\(\{\s*form,\s*setForm,\s*files,\s*setFiles,/,
  `export function ProductEditorPanel({
  form = {},
  setForm = () => {},
  files = [],
  setFiles = () => {},`
);

content = content.replace(
  /categories,\s*editingId,/,
  `categories = [],
  editingId,`
);

// 2. Bảo vệ các chỗ dùng files.map / files.length
content = content.replace(/\bfiles\.map\(/g, `(files || []).map(`);
content = content.replace(/\bfiles\.length\b/g, `(files || []).length`);

// 3. Thay nút mũi tên trái/phải bằng text ASCII an toàn trong JSX
content = content.replace(
  /(<button[\s\S]*?onClick=\{onMoveLeft\}[\s\S]*?title="[^"]*"[\s\S]*?>)[\s\S]*?(<\/button>)/,
  `$1
            {"<"}
          $2`
);

content = content.replace(
  /(<button[\s\S]*?onClick=\{onMoveRight\}[\s\S]*?title="[^"]*"[\s\S]*?>)[\s\S]*?(<\/button>)/,
  `$1
            {">"}
          $2`
);

// 4. Fix text nếu bị lỗi encoding
content = content.replace(/title="L[^"]*nh"/, `title="Lui anh"`);
content = content.replace(/title="Ti[^"]*nh"/, `title="Tien anh"`);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã repair ProductEditorPanel: fix encoding nút ảnh, default props, tránh lỗi undefined.");
