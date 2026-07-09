const fs = require("fs");

const file = "src/components/public/toppings/ToppingSection.jsx";

if (!fs.existsSync(file)) {
  throw new Error("Không tìm thấy file: " + file);
}

let code = fs.readFileSync(file, "utf8");

// Fix lỗi String.raw để sót escape trong JSX/template literal
code = code
  .replace(/\\`/g, "`")
  .replace(/\\\$\{/g, "${");

fs.writeFileSync(file, code);

console.log("✅ Fixed escaped template literals in", file);
