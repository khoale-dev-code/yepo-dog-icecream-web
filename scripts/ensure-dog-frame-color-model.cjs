const fs = require("fs");
const path = require("path");

const modelPath = path.resolve(process.cwd(), "server/models/Dog.js");

if (!fs.existsSync(modelPath)) {
  throw new Error("Không tìm thấy server/models/Dog.js");
}

let content = fs.readFileSync(modelPath, "utf8");

if (!content.includes("frameColor")) {
  content = content.replace(
    /colorTheme\s*:\s*\{\s*type\s*:\s*String\s*,\s*default\s*:\s*["']pink["']\s*\}\s*,/,
    'colorTheme: { type: String, default: "pink" },\n  frameColor: { type: String, default: "" },'
  );
}

fs.writeFileSync(modelPath, content, "utf8");

console.log("Đã thêm frameColor vào Dog model.");
