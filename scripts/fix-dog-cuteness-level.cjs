const fs = require("fs");
const path = require("path");

function patchFile(relativePath, patches) {
  const filePath = path.resolve(process.cwd(), relativePath);
  let content = fs.readFileSync(filePath, "utf8");

  for (const [from, to] of patches) {
    if (content.includes(from)) {
      content = content.replace(from, to);
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Patched ${relativePath}`);
}

patchFile("server/models/Dog.js", [
  ["max: 10,", "max: 100,"],
]);

patchFile("src/admin/dogs/dogUtils.js", [
  [
    "cutenessLevel: Number(form.cutenessLevel || 10),",
    "cutenessLevel: Math.min(100, Math.max(1, Number(form.cutenessLevel || 10))),"
  ],
]);

patchFile("src/admin/dogs/DogEditorPanel.jsx", [
  ["placeholder=\"1 - 10\"", "placeholder=\"1 - 100\""],
  [
    'onChange={(value) => update("cutenessLevel", value.replace(/[^\\d]/g, "").slice(0, 2))}',
    'onChange={(value) => update("cutenessLevel", value.replace(/[^\\d]/g, "").slice(0, 3))}'
  ],
]);

patchFile("src/components/public/DogProfileCard.jsx", [
  ["value={`${dog?.cutenessLevel || 10}/10`}", "value={`${dog?.cutenessLevel || 10}/100`}"],
]);
