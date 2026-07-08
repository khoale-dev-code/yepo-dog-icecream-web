const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/components/AdminPage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/components/AdminPage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Đảm bảo import PromotionManagerView
const importLine = `import { PromotionManagerView } from "../admin/promotions/PromotionManagerView.jsx";`;

if (!content.includes(importLine)) {
  const imports = [...content.matchAll(/^import .+;$/gm)];

  if (imports.length) {
    const lastImport = imports[imports.length - 1][0];
    content = content.replace(lastImport, `${lastImport}\n${importLine}`);
  } else {
    content = `${importLine}\n${content}`;
  }
}

// Xóa block promotions đã chèn sai dùng activeTab không tồn tại
content = content.replace(
  /\n?\s*if\s*\(\s*activeTab\s*===\s*["']promotions["']\s*\)\s*\{\s*return\s*<PromotionManagerView\s*\/>\s*;\s*\}\s*/g,
  "\n"
);

// Tìm biến tab thật đang được dùng trong AdminPage
const conditionPatterns = [
  /if\s*\(\s*([A-Za-z0-9_.$?\[\]()]+)\s*===\s*["']dogs["']\s*\)/,
  /if\s*\(\s*([A-Za-z0-9_.$?\[\]()]+)\s*===\s*["']products["']\s*\)/,
  /if\s*\(\s*([A-Za-z0-9_.$?\[\]()]+)\s*===\s*["']shop["']\s*\)/,
  /if\s*\(\s*([A-Za-z0-9_.$?\[\]()]+)\s*===\s*["']dashboard["']\s*\)/,
  /if\s*\(\s*([A-Za-z0-9_.$?\[\]()]+)\s*===\s*["']posts["']\s*\)/,
];

let tabExpression = "";

for (const pattern of conditionPatterns) {
  const match = content.match(pattern);

  if (match?.[1] && match[1] !== "activeTab") {
    tabExpression = match[1];
    break;
  }
}

// Nếu không tìm được, thử các tên biến phổ biến
if (!tabExpression) {
  if (content.includes("dashboard.activeTab")) tabExpression = "dashboard.activeTab";
  else if (content.includes("dashboard?.activeTab")) tabExpression = "dashboard?.activeTab";
  else if (content.includes("adminDashboard.activeTab")) tabExpression = "adminDashboard.activeTab";
  else if (content.includes("state.activeTab")) tabExpression = "state.activeTab";
  else if (content.includes("currentTab")) tabExpression = "currentTab";
  else if (content.includes("activeResource")) tabExpression = "activeResource";
}

if (!tabExpression) {
  fs.writeFileSync(filePath, content, "utf8");
  throw new Error("Không tìm được biến tab thật trong AdminPage.jsx. Hãy gửi nội dung file này cho tôi.");
}

const promotionBlock = `
  if (${tabExpression} === "promotions") {
    return <PromotionManagerView />;
  }

`;

if (!content.includes(`${tabExpression} === "promotions"`)) {
  // Chèn trước block dogs/products/shop nếu có
  const insertPatterns = [
    new RegExp(`\\\\n\\\\s*if\\\\s*\\\\(\\\\s*${tabExpression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\\\s*===\\\\s*["']dogs["']\\\\s*\\\\)`),
    new RegExp(`\\\\n\\\\s*if\\\\s*\\\\(\\\\s*${tabExpression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\\\s*===\\\\s*["']products["']\\\\s*\\\\)`),
    new RegExp(`\\\\n\\\\s*if\\\\s*\\\\(\\\\s*${tabExpression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\\\s*===\\\\s*["']shop["']\\\\s*\\\\)`),
  ];

  let inserted = false;

  for (const pattern of insertPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, `\n${promotionBlock}$&`);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    const resourceIndex = content.indexOf("return <ResourceView");

    if (resourceIndex !== -1) {
      content =
        content.slice(0, resourceIndex) +
        promotionBlock +
        content.slice(resourceIndex);
      inserted = true;
    }
  }

  if (!inserted) {
    throw new Error("Không tự chèn được PromotionManagerView vào AdminPage.jsx.");
  }
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Fixed AdminPage.jsx");
console.log("Promotion tab expression:", tabExpression);
