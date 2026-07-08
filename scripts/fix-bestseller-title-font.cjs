const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/MenuPage.jsx");

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /<h2 className="mt-4 font-\['Fredoka'\] text-3xl font-(?:semibold|medium|normal) tracking-tight text-\[#2D2D2D\] sm:text-4xl">\s*Món nổi bật được yêu thích\s*<\/h2>/,
  `<h2 className="mt-4 font-['Quicksand'] text-3xl font-semibold leading-tight tracking-tight text-[#2D2D2D] sm:text-4xl">
            Món nổi bật được yêu thích
          </h2>`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đổi font tiêu đề Best Seller sang Quicksand để tránh lỗi hiển thị tiếng Việt.");
