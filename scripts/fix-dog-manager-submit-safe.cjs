const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/*
  1) Ép handleSubmit luôn nhận event
*/
content = content.replace(
  /async\s+function\s+handleSubmit\s*\([^)]*\)\s*\{/,
  "async function handleSubmit(event) {"
);

content = content.replace(
  /function\s+handleSubmit\s*\([^)]*\)\s*\{/,
  "function handleSubmit(event) {"
);

content = content.replace(
  /const\s+handleSubmit\s*=\s*async\s*\([^)]*\)\s*=>\s*\{/,
  "const handleSubmit = async (event) => {"
);

content = content.replace(
  /const\s+handleSubmit\s*=\s*\([^)]*\)\s*=>\s*\{/,
  "const handleSubmit = (event) => {"
);

/*
  2) Thêm preventDefault an toàn
*/
if (!content.includes("event?.preventDefault?.();")) {
  content = content.replace(
    /(async\s+function\s+handleSubmit\s*\(\s*event\s*\)\s*\{)/,
    "$1\n    event?.preventDefault?.();"
  );

  content = content.replace(
    /(function\s+handleSubmit\s*\(\s*event\s*\)\s*\{)/,
    "$1\n    event?.preventDefault?.();"
  );

  content = content.replace(
    /(const\s+handleSubmit\s*=\s*async\s*\(\s*event\s*\)\s*=>\s*\{)/,
    "$1\n    event?.preventDefault?.();"
  );

  content = content.replace(
    /(const\s+handleSubmit\s*=\s*\(\s*event\s*\)\s*=>\s*\{)/,
    "$1\n    event?.preventDefault?.();"
  );
}

/*
  3) FormData phải an toàn, không được gọi event.currentTarget khi event undefined
*/
content = content.replace(
  /new FormData\(event\.currentTarget\)\.get\(["']colorThemeDraft["']\)/g,
  `(event?.currentTarget ? new FormData(event.currentTarget).get("colorThemeDraft") : "")`
);

/*
  4) Sau khi build payload, ép colorTheme lần cuối trước API
*/
if (!content.includes("submittedColorThemeSafe")) {
  content = content.replace(
    /(const\s+payload\s*=\s*buildDogPayload\([^;]+;)/,
    `$1
      const submittedColorThemeSafe = String(
        event?.currentTarget
          ? new FormData(event.currentTarget).get("colorThemeDraft") || ""
          : ""
      ).trim();

      payload.colorTheme = String(
        submittedColorThemeSafe || form.colorTheme || payload.colorTheme || "pink"
      ).trim();

      console.log("[dog-save] payload gửi lên API:", payload);`
  );
}

/*
  5) Log lỗi rõ hơn trong catch nếu chưa có
*/
if (!content.includes("[dog-save] lỗi lưu hồ sơ cún")) {
  content = content.replace(
    /(catch\s*\(\s*error\s*\)\s*\{)/,
    `$1
      console.error("[dog-save] lỗi lưu hồ sơ cún:", error);`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix DogManagerView submit: event an toàn + colorTheme được ép vào payload.");
