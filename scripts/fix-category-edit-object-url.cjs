const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/CategoryPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/CategoryPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Thêm helper lấy id an toàn nếu chưa có
if (!content.includes("function getSafeCategoryId")) {
  content = content.replace(
    `function getCategoryName(item) {`,
    `function getSafeCategoryId(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  return String(value?._id || value?.id || "");
}

function getCategoryName(item) {`
  );
}

// Fix handleSubmit: khi update danh mục phải truyền id, không truyền event/object
content = content.replace(
  /function handleSubmit\(event\) \{[\s\S]*?\n  \}\n\n  function handleCancel/,
  `function handleSubmit(event) {
    if (legacyMode) {
      event.preventDefault();

      if (editingId && props.onUpdateCategory) {
        const categoryId = getSafeCategoryId(editingId);

        if (!categoryId) {
          setNotice({
            type: "error",
            text: "Không tìm thấy ID danh mục để cập nhật.",
          });
          return;
        }

        props.onUpdateCategory(categoryId);
        return;
      }

      if (!editingId && props.onCreateCategory) {
        props.onCreateCategory(event);
        return;
      }
    }

    if (props.onSubmit) {
      props.onSubmit(event);
      return;
    }

    if (props.onCategorySubmit) {
      props.onCategorySubmit(event);
      return;
    }

    event.preventDefault();
  }

  function handleCancel`
);

// Fix handleEdit: legacy startEditCategory cần object category
content = content.replace(
  /function handleEdit\(category\) \{[\s\S]*?\n  \}\n\n  function handleDelete/,
  `function handleEdit(category) {
    if (legacyMode && props.onStartEdit) {
      props.onStartEdit(category);
      return;
    }

    if (props.onEdit) {
      props.onEdit(category);
      return;
    }

    if (props.onEditCategory) {
      props.onEditCategory(category);
    }
  }

  function handleDelete`
);

// Fix handleToggle: legacy handleToggleCategory cần object category, không phải id
content = content.replace(
  /function handleToggle\(category\) \{[\s\S]*?\n  \}\n\n  async function persistOrder/,
  `function handleToggle(category) {
    const id = getSafeCategoryId(category);

    if (!id) {
      setNotice({
        type: "error",
        text: "Không tìm thấy ID danh mục để cập nhật.",
      });
      return;
    }

    if (legacyMode && props.onToggleCategory) {
      props.onToggleCategory(category);
      return;
    }

    if (props.onToggle) {
      props.onToggle(id, category);
      return;
    }

    if (props.onToggleCategory) {
      props.onToggleCategory(id);
    }
  }

  async function persistOrder`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix CategoryPanel: sửa danh mục truyền categoryId, toggle truyền đúng object cho legacy hook.");
