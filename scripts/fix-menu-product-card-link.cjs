const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/MenuPage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/MenuPage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Thêm Link import nếu chưa có
if (!content.includes('from "react-router-dom"')) {
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+["']react["'];?/,
    `import { $1 } from "react";
import { Link } from "react-router-dom";`
  );
} else if (!content.includes("Link")) {
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+["']react-router-dom["'];?/,
    (match, imports) => {
      const names = imports.split(",").map((item) => item.trim()).filter(Boolean);
      if (!names.includes("Link")) names.push("Link");
      return `import { ${names.join(", ")} } from "react-router-dom";`;
    }
  );
}

// Thêm helper lấy id/path nếu chưa có
if (!content.includes("function getProductPath")) {
  const helper = `
function getId(item) {
  return String(item?._id || item?.id || item?.slug || "");
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getProductPath(product) {
  return \`/menu/\${product.slug || getId(product) || slugify(product.name)}\`;
}
`;

  const insertAfter = content.indexOf("\nfunction ");
  if (insertAfter === -1) {
    content = helper + "\n" + content;
  } else {
    content = content.slice(0, insertAfter) + helper + content.slice(insertAfter);
  }
}

// Nếu ProductCard đang là article/div/button, ép bọc ngoài bằng Link.
// Cách này xử lý bản MenuPage phổ biến: function ProductCard({ product }) { ... return ( <article ...> ... </article> ); }
content = content.replace(
  /function ProductCard\(\{\s*product\s*\}\)\s*\{([\s\S]*?)return\s*\(\s*<article([\s\S]*?)<\/article>\s*\);\s*\}/,
  (match, beforeReturn, articleAttrsAndBody) => {
    return `function ProductCard({ product }) {${beforeReturn}return (
    <Link to={getProductPath(product)} className="block">
      <article${articleAttrsAndBody}</article>
    </Link>
  );
}`;
  }
);

// Nếu ProductCard đang return div lớn, cũng ép Link
content = content.replace(
  /function ProductCard\(\{\s*product\s*\}\)\s*\{([\s\S]*?)return\s*\(\s*<div([\s\S]*?)<\/div>\s*\);\s*\}/,
  (match, beforeReturn, divAttrsAndBody) => {
    if (match.includes("getProductPath(product)") || match.includes("<Link")) return match;

    return `function ProductCard({ product }) {${beforeReturn}return (
    <Link to={getProductPath(product)} className="block">
      <div${divAttrsAndBody}</div>
    </Link>
  );
}`;
  }
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đảm bảo ProductCard có Link sang trang chi tiết.");
