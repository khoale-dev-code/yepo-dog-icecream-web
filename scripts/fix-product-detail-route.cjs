const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/App.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/App.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Thêm import ProductDetailPage nếu chưa có
if (!content.includes("ProductDetailPage")) {
  const menuImportRegex = /import\s+MenuPage\s+from\s+["']\.\/pages\/public\/MenuPage(?:\.jsx)?["'];?/;

  if (!menuImportRegex.test(content)) {
    throw new Error("Không tìm thấy dòng import MenuPage trong App.jsx");
  }

  content = content.replace(
    menuImportRegex,
    `import MenuPage from "./pages/public/MenuPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";`
  );
}

// Thêm route /menu/:productId nếu chưa có
if (!content.includes('path="menu/:productId"')) {
  const menuRouteRegex = /<Route\s+path=["']menu["']\s+element=\{<MenuPage\s+store=\{store\}\s*\/>\}\s*\/>/;

  if (!menuRouteRegex.test(content)) {
    throw new Error("Không tìm thấy route path=\"menu\" trong App.jsx");
  }

  content = content.replace(
    menuRouteRegex,
    `<Route path="menu" element={<MenuPage store={store} />} />
          <Route path="menu/:productId" element={<ProductDetailPage store={store} />} />`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đảm bảo route /menu/:productId trong App.jsx");
