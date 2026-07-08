const fs = require("fs");
const path = require("path");

function patchAdminConfig() {
  const filePath = path.resolve(process.cwd(), "src/admin/config/adminConfig.js");
  if (!fs.existsSync(filePath)) {
    console.log("Skip adminConfig: file not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("Gift")) {
    content = content.replace(
      /from "lucide-react";/,
      (match) => match.replace(";", ", Gift;")
    );

    content = content.replace(
      /import\s*\{([\s\S]*?)\}\s*from "lucide-react";/,
      (match, icons) => {
        if (icons.includes("Gift")) return match;
        return `import {${icons}, Gift } from "lucide-react";`;
      }
    );
  }

  if (!content.includes('id: "promotions"')) {
    const item = `  {
    id: "promotions",
    label: "Khuyến mãi",
    icon: Gift,
  },
`;

    const insertTargets = [
      /(\s*\{\s*id:\s*"posts"[\s\S]*?\},)/,
      /(\s*\{\s*id:\s*"dogs"[\s\S]*?\},)/,
      /(\s*\{\s*id:\s*"products"[\s\S]*?\},)/,
    ];

    let inserted = false;

    for (const regex of insertTargets) {
      if (regex.test(content)) {
        content = content.replace(regex, `$1
${item}`);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      content = content.replace(/export const ADMIN_TABS = \[/, `export const ADMIN_TABS = [
${item}`);
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched adminConfig.");
}

function patchAdminPage() {
  const filePath = path.resolve(process.cwd(), "src/components/AdminPage.jsx");
  if (!fs.existsSync(filePath)) {
    console.log("Skip AdminPage: file not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("PromotionManagerView")) {
    const importLine = `import { PromotionManagerView } from "../admin/promotions/PromotionManagerView.jsx";`;

    const anchors = [
      `import { DogManagerView } from "../admin/dogs/DogManagerView.jsx";`,
      `import { MenuManagerView } from "../admin/menu/MenuManagerView.jsx";`,
    ];

    let imported = false;

    for (const anchor of anchors) {
      if (content.includes(anchor)) {
        content = content.replace(anchor, `${anchor}
${importLine}`);
        imported = true;
        break;
      }
    }

    if (!imported) {
      content = `${importLine}
${content}`;
    }
  }

  if (!content.includes('activeTab === "promotions"')) {
    const block = `
  if (activeTab === "promotions") {
    return <PromotionManagerView />;
  }
`;

    const targets = [
      /(\s*if\s*\(activeTab === "dogs"\)[\s\S]*?\n\s*\})/,
      /(\s*if\s*\(activeTab === "products"\)[\s\S]*?\n\s*\})/,
      /(\s*if\s*\(activeTab === "shop"\)[\s\S]*?\n\s*\})/,
    ];

    let inserted = false;

    for (const regex of targets) {
      if (regex.test(content)) {
        content = content.replace(regex, `$1
${block}`);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      console.log("Không tự chèn được PromotionManagerView. Cần mở AdminPage.jsx để thêm điều kiện activeTab.");
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched AdminPage.");
}

patchAdminConfig();
patchAdminPage();
