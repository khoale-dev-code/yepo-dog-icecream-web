const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/MenuManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/MenuManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");
let changed = false;

// 1. Bỏ layout 2 cột kiểu editor bên trái + list bên phải.
// Chỉ thay các class layout lớn có grid-cols-[...minmax...] để tránh đụng grid nhỏ bên trong form.
content = content.replace(
  /className="([^"]*?\bgrid\b[^"]*?(?:lg|xl|2xl):grid-cols-\[[^\]]*minmax[^\]]*\][^"]*?)"/g,
  (match, className) => {
    let nextClass = className
      .replace(/\bgrid\b/g, "")
      .replace(/\bgrid-cols-\[[^\]]+\]/g, "")
      .replace(/\b(?:sm|md|lg|xl|2xl):grid-cols-\[[^\]]+\]/g, "")
      .replace(/\b(?:sm|md|lg|xl|2xl):items-start\b/g, "")
      .replace(/\b(?:sm|md|lg|xl|2xl):items-stretch\b/g, "")
      .replace(/\b(?:sm|md|lg|xl|2xl):sticky\b/g, "")
      .replace(/\b(?:sm|md|lg|xl|2xl):top-[^\s"]+/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!nextClass.includes("space-y-")) {
      nextClass = `space-y-5 ${nextClass}`.trim();
    }

    changed = true;
    return `className="${nextClass}"`;
  }
);

// 2. Bỏ một số sticky/width cứng còn sót lại trong MenuManagerView nếu có.
const beforeCleanup = content;

content = content
  .replace(/\b(?:sm|md|lg|xl|2xl):sticky\b/g, "")
  .replace(/\b(?:sm|md|lg|xl|2xl):top-[^\s"]+/g, "")
  .replace(/\b(?:sm|md|lg|xl|2xl):max-h-\[[^\]]+\]/g, "")
  .replace(/\b(?:sm|md|lg|xl|2xl):max-w-\[[^\]]+\]/g, "")
  .replace(/\b(?:sm|md|lg|xl|2xl):overflow-y-auto\b/g, "");

if (content !== beforeCleanup) changed = true;

// 3. Nếu state mở form đang mặc định true thì chuyển về false để trang vào là thu gọn.
content = content.replace(
  /const\s+\[(formOpen|editorOpen|productEditorOpen|isEditorOpen),\s*(setFormOpen|setEditorOpen|setProductEditorOpen|setIsEditorOpen)\]\s*=\s*useState\(true\)/g,
  (match, stateName, setterName) => {
    changed = true;
    return `const [${stateName}, ${setterName}] = useState(false)`;
  }
);

fs.writeFileSync(filePath, content, "utf8");

if (changed) {
  console.log("Đã chỉnh MenuManagerView: form thêm sản phẩm ở trên, danh sách ở dưới, bỏ layout 2 cột.");
} else {
  console.log("Không tìm thấy layout 2 cột dạng phổ biến để thay. Hãy gửi file src/admin/menu/MenuManagerView.jsx nếu UI chưa đổi.");
}
