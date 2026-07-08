const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

function findFunctionEnd(source, functionName) {
  const start = source.indexOf("function " + functionName);
  if (start === -1) return -1;

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) return -1;

  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;

    if (depth === 0) return i + 1;
  }

  return -1;
}

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
  return "/menu/" + (product?.slug || getId(product) || slugify(product?.name));
}
`;

  const formatPriceEnd = findFunctionEnd(content, "formatPrice");

  if (formatPriceEnd === -1) {
    throw new Error("Không tìm thấy function formatPrice để chèn getProductPath");
  }

  content = content.slice(0, formatPriceEnd) + helper + content.slice(formatPriceEnd);
}

content = content.replace(
  /const products = getList\(store, "products"\)[\s\S]*?\.slice\(0, 4\);/,
  `const products = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
    .slice(0, 4);`
);

content = content.replace(
  /const posts = getList\(store, "posts"\)[\s\S]*?\.slice\(0, 2\);/,
  `const posts = getList(store, "posts")
    .filter(
      (item) =>
        item.isActive !== false &&
        item.isPublished !== false &&
        item.isPinned === true
    )
    .sort((a, b) => {
      const orderA = Number(a.sortOrder || a.order || 999);
      const orderB = Number(b.sortOrder || b.order || 999);

      if (orderA !== orderB) return orderA - orderB;

      return (
        new Date(b.createdAt || b.updatedAt || 0) -
        new Date(a.createdAt || a.updatedAt || 0)
      );
    })
    .slice(0, 2);`
);

const oldIconButton = `<div className="h-8 w-8 rounded-full bg-[#f6d77d]/30 grid place-items-center text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white">
                    <ArrowRight size={14} />
                  </div>`;

const newDetailLink = `<Link
                    to={getProductPath(product)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#f6d77d]/35 px-4 text-xs font-['Quicksand'] font-bold text-[#b98c49] transition-colors hover:bg-[#b98c49] hover:text-white"
                  >
                    Xem chi tiết
                    <ArrowRight size={14} />
                  </Link>`;

if (content.includes(oldIconButton)) {
  content = content.replace(oldIconButton, newDetailLink);
} else {
  content = content.replace(
    /<div className="h-8 w-8 rounded-full bg-\[#f6d77d\]\/30[\s\S]*?<ArrowRight size=\{14\} \/>\s*<\/div>/,
    newDetailLink
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cập nhật HomePage: thêm nút Xem chi tiết món, chỉ hiện món nổi bật và bài ghim.");
