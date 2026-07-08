const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/main.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/main.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes('import SiteMeta from "./components/public/SiteMeta"')) {
  content = content.replace(
    'import "./index.css";',
    'import "./index.css";\nimport SiteMeta from "./components/public/SiteMeta";'
  );
}

if (!content.includes("<SiteMeta />")) {
  content = content.replace(
    /<StrictMode>\s*/,
    "<StrictMode>\n    <SiteMeta />\n    "
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã gắn SiteMeta vào main.jsx để favicon lấy từ shop.logoUrl.");
