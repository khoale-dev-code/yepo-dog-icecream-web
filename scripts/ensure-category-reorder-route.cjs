const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "server/routes/category.routes.js");

if (!fs.existsSync(filePath)) {
  console.log("Không tìm thấy server/routes/category.routes.js");
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf8");

if (content.includes('"/reorder"') || content.includes("'/reorder'")) {
  console.log("Đã có route reorder.");
  process.exit(0);
}

const modelImport =
  content.match(/import\s+(\w+)\s+from\s+["'][^"']*MenuCategory\.js["'];?/) ||
  content.match(/import\s+\{\s*(\w+)\s*\}\s+from\s+["'][^"']*MenuCategory\.js["'];?/);

const modelName = modelImport?.[1] || "MenuCategory";

const routerMatch =
  content.match(/const\s+router\s*=\s*express\.Router\(\);\s*/) ||
  content.match(/const\s+router\s*=\s*Router\(\);\s*/);

if (!routerMatch) {
  throw new Error("Không tìm thấy khai báo router trong category.routes.js");
}

const route = `
router.patch("/reorder", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({ message: "Danh sách id danh mục không hợp lệ." });
    }

    await ${modelName}.bulkWrite(
      ids.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $set: {
              sortOrder: index + 1,
              order: index + 1,
            },
          },
        },
      }))
    );

    const categories = await ${modelName}
      .find({})
      .sort({ sortOrder: 1, order: 1, createdAt: 1 });

    return res.json(categories);
  } catch (error) {
    return next(error);
  }
});

`;

content = content.replace(routerMatch[0], routerMatch[0] + route);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm PATCH /api/categories/reorder.");
