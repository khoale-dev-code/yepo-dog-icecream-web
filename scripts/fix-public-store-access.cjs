const fs = require("fs");
const path = require("path");

const publicPagesDir = path.resolve(process.cwd(), "src/pages/public");

for (const file of fs.readdirSync(publicPagesDir)) {
  if (!file.endsWith(".jsx")) continue;

  const filePath = path.join(publicPagesDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  content = content
    .replaceAll("store.data?.shop", "store.shop")
    .replaceAll("store.data?.products", "store.products")
    .replaceAll("store.data?.posts", "store.posts")
    .replaceAll("store.data?.dogs", "store.dogs")
    .replaceAll("store.data?.categories", "store.categories")
    .replaceAll("store.data?.toppings", "store.toppings")
    .replaceAll("store.data?.promotions", "store.promotions");

  fs.writeFileSync(filePath, content, "utf8");
}

console.log("Fixed public pages store access.");
