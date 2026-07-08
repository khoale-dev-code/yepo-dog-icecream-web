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

  if (!icons.includes("Newspaper")) icons.push("Newspaper");

  content = content.replace(
    importMatch[0],
    `import { ${[...new Set(icons)].sort().join(", ")} } from "lucide-react";`
  );
} else {
  content = `import { Newspaper } from "lucide-react";\n${content}`;
}

if (!content.includes('id: "posts"') && !content.includes("id: 'posts'")) {
  const postTab = `  {
    id: "posts",
    label: "Bài đăng",
    icon: Newspaper,
  },
`;

  if (content.includes('id: "promotions"')) {
    content = content.replace(
      /(\s*\{\s*id:\s*"promotions"[\s\S]*?\},)/,
      `${postTab}\n$1`
    );
  } else {
    content = content.replace(
      /export const ADMIN_TABS\s*=\s*\[/,
      `export const ADMIN_TABS = [\n${postTab}`
    );
  }
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đảm bảo tab Bài đăng.");
