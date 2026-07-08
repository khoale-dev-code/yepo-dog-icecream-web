const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/PromotionsPage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/PromotionsPage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /const featuredPromotion\s*=\s*\n\s*promotions\.find\(\(promotion\)\s*=>\s*promotion\.isFeatured\)\s*\|\|\s*promotions\[0\];/,
  `const featuredPromotion = promotions[0];`
);

content = content.replace(
  /const featuredPromotion\s*=\s*promotions\.find\(\(promotion\)\s*=>\s*promotion\.isFeatured\)\s*\|\|\s*promotions\[0\];/,
  `const featuredPromotion = promotions[0];`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đổi client PromotionsPage: sortOrder quyết định promotion đầu tiên.");
