const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/MenuPage.jsx");

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  `className="mt-4 font-['Fredoka'] text-3xl font-semibold tracking-tight text-[#2D2D2D] sm:text-4xl"`,
  `className="mt-4 font-['Fredoka'] text-3xl font-medium tracking-tight text-[#2D2D2D] sm:text-4xl"`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã giảm bold tiêu đề Best Seller.");
