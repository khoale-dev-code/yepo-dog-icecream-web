const fs = require("fs");
const path = require("path");

/* dogUtils */
const utilsPath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (fs.existsSync(utilsPath)) {
  let content = fs.readFileSync(utilsPath, "utf8");

  if (!content.includes('frameColor: "",')) {
    content = content.replace(
      'colorTheme: "pink",',
      'colorTheme: "pink",\n    frameColor: "",'
    );
  }

  if (!content.includes('frameColor: dog.frameColor || "",')) {
    content = content.replace(
      'colorTheme: dog.colorTheme || "pink",',
      'colorTheme: dog.colorTheme || "pink",\n    frameColor: dog.frameColor || "",'
    );
  }

  if (!content.includes('frameColor: String(form.frameColor || "").trim(),')) {
    content = content.replace(
      'colorTheme: String(form.colorTheme || "pink").trim(),',
      'colorTheme: String(form.colorTheme || "pink").trim(),\n    frameColor: String(form.frameColor || "").trim(),'
    );
  }

  fs.writeFileSync(utilsPath, content, "utf8");
  console.log("Đã kiểm tra dogUtils frameColor.");
}

/* Dog model */
const modelPath = path.resolve(process.cwd(), "server/models/Dog.js");

if (fs.existsSync(modelPath)) {
  let content = fs.readFileSync(modelPath, "utf8");

  if (!content.includes("frameColor")) {
    content = content.replace(
      /colorTheme\s*:\s*\{\s*type\s*:\s*String\s*,\s*default\s*:\s*["']pink["']\s*\}\s*,/,
      'colorTheme: { type: String, default: "pink" },\n  frameColor: { type: String, default: "" },'
    );
  }

  fs.writeFileSync(modelPath, content, "utf8");
  console.log("Đã kiểm tra Dog model frameColor.");
}
