const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/MenuManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/MenuManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

const hasSetterState =
  /const\s*\[\s*existingMedia\s*,\s*setExistingMedia\s*\]\s*=\s*useState/.test(content);

if (content.includes("setExistingMedia={setExistingMedia}") && !hasSetterState) {
  content = content.replace(
    /setExistingMedia=\{setExistingMedia\}/g,
    `setExistingMedia={() => {}}`
  );

  console.log("Đã thay setExistingMedia bằng fallback để tránh lỗi undefined.");
} else {
  console.log("MenuManagerView ổn hoặc đã có setExistingMedia state.");
}

fs.writeFileSync(filePath, content, "utf8");
