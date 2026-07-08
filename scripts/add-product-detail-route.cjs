const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/App.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/App.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("ProductDetailPage")) {
  content = content.replace(
    /import MenuPage from ["']\.\/pages\/public\/MenuPage["'];?/,
    `import MenuPage from "./pages/public/MenuPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";`
  );

  content = content.replace(
    `<Route path="menu" element={<MenuPage store={store} />} />`,
    `<Route path="menu" element={<MenuPage store={store} />} />
          <Route path="menu/:productId" element={<ProductDetailPage store={store} />} />`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm route /menu/:productId.");
