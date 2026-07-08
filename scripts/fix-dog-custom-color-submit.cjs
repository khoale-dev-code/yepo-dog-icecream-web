const fs = require("fs");
const path = require("path");

/* =========================
   1) DogEditorPanel: thêm hidden input colorThemeDraft
========================= */

const editorPath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(editorPath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let editor = fs.readFileSync(editorPath, "utf8");

// Tạo biến colorThemeDraftValue trước return
if (!editor.includes("const colorThemeDraftValue =")) {
  editor = editor.replace(
    /const\s+coatColors\s*=\s*getInitialCoatColors\(form\);/,
    `const coatColors = getInitialCoatColors(form);
  const colorThemeDraftValue =
    normalizeHexDraft(customThemeHex) || form.colorTheme || "pink";`
  );
}

// Thêm hidden input ngay đầu form để DogManagerView luôn đọc được màu mới nhất
if (!editor.includes('name="colorThemeDraft"')) {
  editor = editor.replace(
    /<form\s+onSubmit=\{onSubmit\}\s+className="grid gap-5">/,
    `<form onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="colorThemeDraft" value={colorThemeDraftValue} />`
  );
}

// Khi bấm Lưu màu, vẫn ép luôn form.colorTheme
editor = editor.replace(
  /setForm\(\(current\)\s*=>\s*\(\{\s*\.\.\.current,\s*colorTheme:\s*hex,\s*\}\)\);/g,
  `setForm((current) => ({
      ...current,
      colorTheme: hex,
    }));`
);

fs.writeFileSync(editorPath, editor, "utf8");
console.log("Đã patch DogEditorPanel: submit luôn mang colorThemeDraft mới nhất.");


/* =========================
   2) DogManagerView: đọc colorThemeDraft khi submit
========================= */

const managerPath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");

if (!fs.existsSync(managerPath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogManagerView.jsx");
}

let manager = fs.readFileSync(managerPath, "utf8");

if (!manager.includes("colorThemeDraft")) {
  manager = manager.replace(
    /(const\s+payload\s*=\s*buildDogPayload\([^;]+;)/,
    `$1
      const submittedColorTheme = String(
        new FormData(event.currentTarget).get("colorThemeDraft") ||
          form.colorTheme ||
          payload.colorTheme ||
          "pink"
      ).trim();

      payload.colorTheme = submittedColorTheme;`
  );
} else if (!manager.includes("new FormData(event.currentTarget).get(\"colorThemeDraft\")")) {
  manager = manager.replace(
    /(payload\.colorTheme\s*=\s*[^;]+;)/,
    `const submittedColorTheme = String(
        new FormData(event.currentTarget).get("colorThemeDraft") ||
          form.colorTheme ||
          payload.colorTheme ||
          "pink"
      ).trim();

      payload.colorTheme = submittedColorTheme;`
  );
}

fs.writeFileSync(managerPath, manager, "utf8");
console.log("Đã patch DogManagerView: payload.colorTheme lấy từ colorThemeDraft.");


/* =========================
   3) dogUtils: buildDogPayload không được ghi đè màu custom
========================= */

const utilsPath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (fs.existsSync(utilsPath)) {
  let utils = fs.readFileSync(utilsPath, "utf8");

  utils = utils.replace(
    /colorTheme\s*:\s*[^,\n]+,/g,
    `colorTheme: form.colorTheme || "pink",`
  );

  fs.writeFileSync(utilsPath, utils, "utf8");
  console.log("Đã kiểm tra dogUtils colorTheme.");
}
