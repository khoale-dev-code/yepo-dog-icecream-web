const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/CategoryPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/CategoryPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

const oldBlock = `  function handleToggle(category) {
    const id = getId(category);

    if (legacyMode && props.onToggleCategory) {
      props.onToggleCategory(category);
      return;
    }

    if (props.onToggle) {
      props.onToggle(category);
      return;
    }

    if (props.onToggleCategory) {
      props.onToggleCategory(id);
    }
  }`;

const newBlock = `  function handleToggle(category) {
    const id = getId(category);

    if (!id) {
      setNotice({
        type: "error",
        text: "Không tìm thấy ID danh mục để cập nhật.",
      });
      return;
    }

    // Legacy MenuManagerView thường nhận ID, không nhận cả object.
    // Nếu truyền object sẽ tạo request /api/categories/[object Object].
    if (props.onToggleCategory) {
      props.onToggleCategory(id);
      return;
    }

    if (props.onToggle) {
      props.onToggle(id, category);
    }
  }`;

if (!content.includes(oldBlock)) {
  throw new Error("Không tìm thấy block handleToggle cũ. Gửi mình file CategoryPanel.jsx hiện tại nếu patch không chạy.");
}

content = content.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix handleToggle: không còn gọi /api/categories/[object Object].");
