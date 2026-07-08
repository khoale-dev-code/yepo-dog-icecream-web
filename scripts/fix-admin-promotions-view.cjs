const fs = require("fs");
const path = require("path");

function ensureGiftInAdminConfig() {
  const filePath = path.resolve(process.cwd(), "src/admin/config/adminConfig.js");

  if (!fs.existsSync(filePath)) {
    throw new Error("Không tìm thấy src/admin/config/adminConfig.js");
  }

  let content = fs.readFileSync(filePath, "utf8");

  const lucideImport = content.match(/import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'][^;\n]*;?/);

  if (lucideImport) {
    const icons = lucideImport[1]
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!icons.includes("Gift")) {
      icons.push("Gift");
    }

    const uniqueIcons = [...new Set(icons)].sort();
    content = content.replace(
      lucideImport[0],
      `import { ${uniqueIcons.join(", ")} } from "lucide-react";`
    );
  } else {
    content = `import { Gift } from "lucide-react";\n${content}`;
  }

  if (!content.includes('id: "promotions"')) {
    const promotionTab = `  {
    id: "promotions",
    label: "Khuyến mãi",
    icon: Gift,
  },
`;

    if (content.includes('id: "posts"')) {
      content = content.replace(
        /(\s*\{\s*id:\s*"posts"[\s\S]*?\},)/,
        `${promotionTab}$1`
      );
    } else if (content.includes('id: "dogs"')) {
      content = content.replace(
        /(\s*\{\s*id:\s*"dogs"[\s\S]*?\},)/,
        `${promotionTab}$1`
      );
    } else {
      content = content.replace(
        /export const ADMIN_TABS = \[/,
        `export const ADMIN_TABS = [\n${promotionTab}`
      );
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Fixed adminConfig.js");
}

function patchAdminPage() {
  const filePath = path.resolve(process.cwd(), "src/components/AdminPage.jsx");

  if (!fs.existsSync(filePath)) {
    throw new Error("Không tìm thấy src/components/AdminPage.jsx");
  }

  let content = fs.readFileSync(filePath, "utf8");

  const importLine = `import { PromotionManagerView } from "../admin/promotions/PromotionManagerView.jsx";`;

  if (!content.includes("PromotionManagerView")) {
    const importMatches = [...content.matchAll(/^import .+;$/gm)];

    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1][0];
      content = content.replace(lastImport, `${lastImport}\n${importLine}`);
    } else {
      content = `${importLine}\n${content}`;
    }
  }

  if (!content.includes('activeTab === "promotions"')) {
    const block = `  if (activeTab === "promotions") {
    return <PromotionManagerView />;
  }

`;

    const fallbackPatterns = [
      /(\s*return\s+<ResourceView[\s\S]*?;)/,
      /(\s*return\s*\(\s*<ResourceView[\s\S]*?\);)/,
      /(\s*return\s+<DashboardView[\s\S]*?;)/,
    ];

    let inserted = false;

    for (const pattern of fallbackPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, `\n${block}$1`);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      const marker = "function AdminContent";
      const index = content.indexOf(marker);

      if (index !== -1) {
        const nextReturn = content.indexOf("return", index);

        if (nextReturn !== -1) {
          content = content.slice(0, nextReturn) + block + content.slice(nextReturn);
          inserted = true;
        }
      }
    }

    if (!inserted) {
      fs.writeFileSync(filePath, content, "utf8");
      throw new Error("Không tự chèn được vào AdminPage.jsx. Gửi mình nội dung file AdminPage.jsx để mình chèn chính xác.");
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Fixed AdminPage.jsx");
}

ensureGiftInAdminConfig();
patchAdminPage();

console.log("Done. Promotion admin tab is connected.");
