const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/MenuManagerView.jsx");
let content = fs.readFileSync(filePath, "utf8");

if (
  content.indexOf("<ProductEditorPanel") !== -1 &&
  content.indexOf("<CategoryPanel") !== -1 &&
  content.indexOf("<ProductEditorPanel") < content.indexOf("<CategoryPanel")
) {
  const pattern =
    /(\s*)<ProductEditorPanel([\s\S]*?)\/>\s*\n\s*<CategoryPanel([\s\S]*?)\/>/m;

  content = content.replace(
    pattern,
    (_, indent, productProps, categoryProps) => {
      return `${indent}<CategoryPanel${categoryProps}/>\n\n${indent}<ProductEditorPanel${productProps}/>`;
    }
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated order: CategoryPanel is now above ProductEditorPanel.");
} else {
  console.log("No change needed. CategoryPanel may already be above ProductEditorPanel.");
}
