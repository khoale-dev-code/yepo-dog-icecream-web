const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

// Đảm bảo buildDogPayload luôn gửi removedExistingMediaKeys sang API
if (!content.includes("removedExistingMediaKeys")) {
  content = content.replace(
    /return\s*\{\s*/m,
    `return {
    removedExistingMediaKeys: Array.isArray(form?.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys
      : [],
    mediaOrder: Array.isArray(form?.mediaOrder) ? form.mediaOrder : [],`
  );
} else if (!/removedExistingMediaKeys\s*:\s*Array\.isArray\(form\?\.removedExistingMediaKeys\)/.test(content)) {
  content = content.replace(
    /return\s*\{\s*/m,
    `return {
    removedExistingMediaKeys: Array.isArray(form?.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys
      : [],
    mediaOrder: Array.isArray(form?.mediaOrder) ? form.mediaOrder : [],`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã patch dogUtils: payload sẽ gửi removedExistingMediaKeys/mediaOrder.");
