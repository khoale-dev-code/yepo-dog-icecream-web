const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

// 1. Gỡ các dòng bị chèn sai dùng biến form ở sai scope
content = content.replace(
  /\s*removedExistingMediaKeys:\s*Array\.isArray\(form\?\.removedExistingMediaKeys\)\s*\?\s*form\.removedExistingMediaKeys\s*:\s*\[\],\s*/g,
  "\n"
);

content = content.replace(
  /\s*mediaOrder:\s*Array\.isArray\(form\?\.mediaOrder\)\s*\?\s*form\.mediaOrder\s*:\s*\[\],\s*/g,
  "\n"
);

// 2. Trong createEmptyDogForm chỉ được dùng giá trị mặc định, không dùng form
content = content.replace(
  /(function\s+createEmptyDogForm\s*\([^)]*\)\s*\{[\s\S]*?return\s*\{)/,
  (match) => {
    if (match.includes("removedExistingMediaKeys")) return match;

    return `${match}
    removedExistingMediaKeys: [],
    mediaOrder: [],`;
  }
);

content = content.replace(
  /(export\s+function\s+createEmptyDogForm\s*\([^)]*\)\s*\{[\s\S]*?return\s*\{)/,
  (match) => {
    if (match.includes("removedExistingMediaKeys")) return match;

    return `${match}
    removedExistingMediaKeys: [],
    mediaOrder: [],`;
  }
);

// 3. Trong buildDogPayload mới được dùng form để gửi danh sách ảnh đã xóa lên API
content = content.replace(
  /(function\s+buildDogPayload\s*\(\s*form[\s\S]*?return\s*\{)/,
  (match) => {
    if (match.includes("removedExistingMediaKeys")) return match;

    return `${match}
    removedExistingMediaKeys: Array.isArray(form?.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys
      : [],
    mediaOrder: Array.isArray(form?.mediaOrder) ? form.mediaOrder : [],`;
  }
);

content = content.replace(
  /(export\s+function\s+buildDogPayload\s*\(\s*form[\s\S]*?return\s*\{)/,
  (match) => {
    if (match.includes("removedExistingMediaKeys")) return match;

    return `${match}
    removedExistingMediaKeys: Array.isArray(form?.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys
      : [],
    mediaOrder: Array.isArray(form?.mediaOrder) ? form.mediaOrder : [],`;
  }
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa dogUtils: createEmptyDogForm không còn dùng biến form undefined.");
