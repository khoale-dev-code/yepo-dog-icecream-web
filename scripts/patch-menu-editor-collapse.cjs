const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/MenuManagerView.jsx");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("const [isEditorOpen, setIsEditorOpen]")) {
  content = content.replace(
    'const [editingProductId, setEditingProductId] = useState("");',
    'const [editingProductId, setEditingProductId] = useState("");\n  const [isEditorOpen, setIsEditorOpen] = useState(false);'
  );
}

if (!content.includes("setIsEditorOpen(false);\n      await loadData();")) {
  content = content.replace(
    "resetProductForm(nextCount);\n      await loadData();",
    "resetProductForm(nextCount);\n      setIsEditorOpen(false);\n      await loadData();"
  );
}

if (!content.includes("setIsEditorOpen(true);\n    window.scrollTo")) {
  content = content.replace(
    "setFiles([]);\n    window.scrollTo({ top: 0, behavior: \"smooth\" });",
    "setFiles([]);\n    setIsEditorOpen(true);\n    window.scrollTo({ top: 0, behavior: \"smooth\" });"
  );
}

if (!content.includes("isOpen={isEditorOpen}")) {
  content = content.replace(
    "existingMedia={existingMedia}\n            categories={categories}",
    "existingMedia={existingMedia}\n            isOpen={isEditorOpen}\n            onToggleOpen={() => setIsEditorOpen((current) => !current)}\n            categories={categories}"
  );
}

content = content.replace(
  'onCancel={() => resetProductForm(products.length)}',
  'onCancel={() => {\n              resetProductForm(products.length);\n              setIsEditorOpen(false);\n            }}'
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched MenuManagerView.jsx with collapsible product editor.");
