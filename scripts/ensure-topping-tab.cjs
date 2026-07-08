const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/config/adminConfig.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/config/adminConfig.js");
}

let content = fs.readFileSync(filePath, "utf8");

const importMatch = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'];?/);

if (importMatch) {
  const icons = importMatch[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const icon of ["IceCream2", "Gift"]) {
    if (!icons.includes(icon)) icons.push(icon);
  }

  content = content.replace(
    importMatch[0],
    `import { ${[...new Set(icons)].sort().join(", ")} } from "lucide-react";`
  );
} else {
  content = `import { IceCream2, Gift } from "lucide-react";\n${content}`;
}

if (!content.includes('id: "toppings"')) {
  const toppingTab = `  {
    id: "toppings",
    label: "Topping",
    icon: IceCream2,
  },
`;

  if (content.includes('id: "products"')) {
    content = content.replace(
      /(\s*\{\s*id:\s*"products"[\s\S]*?\},)/,
      `$1
${toppingTab}`
    );
  } else {
    content = content.replace(
      /export const ADMIN_TABS\s*=\s*\[/,
      `export const ADMIN_TABS = [
${toppingTab}`
    );
  }
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Admin config đã có tab Topping.");
