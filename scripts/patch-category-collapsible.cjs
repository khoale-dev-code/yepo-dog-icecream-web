const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/menu/MenuManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/menu/MenuManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Đảm bảo có useState
content = content.replace(
  /import\s+\{\s*([^}]*?)\s*\}\s+from\s+["']react["'];?/,
  (match, imports) => {
    const names = imports
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (!names.includes("useState")) names.push("useState");

    return `import { ${names.join(", ")} } from "react";`;
  }
);

// Thêm component wrapper đóng/mở nếu chưa có
if (!content.includes("function CollapsibleMenuBlock")) {
  content = content.replace(
    /export function MenuManagerView/,
    `function CollapsibleMenuBlock({
  open,
  onToggle,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 bg-gradient-to-br from-white to-[#f7efe3]/70 p-5 text-left transition hover:from-[#FFFAFA] hover:to-[#f7efe3]"
      >
        <div className="min-w-0">
          <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
            {eyebrow}
          </p>

          <h2 className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm font-normal leading-6 text-[#756144]">
              {description}
            </p>
          )}
        </div>

        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-[#d8b77e]/60 p-4 sm:p-5">
          {children}
        </div>
      )}
    </section>
  );
}

export function MenuManagerView`
  );
}

// Thêm state categoryPanelOpen mặc định false
if (!content.includes("categoryPanelOpen")) {
  content = content.replace(
    /export function MenuManagerView\([^)]*\)\s*\{/,
    (match) => {
      return `${match}
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);`;
    }
  );
}

// Wrap CategoryPanel self-closing bằng CollapsibleMenuBlock
if (!content.includes('eyebrow="Danh mục sản phẩm"')) {
  const categoryPanelRegex = /<CategoryPanel\b[\s\S]*?\/>/;

  if (!categoryPanelRegex.test(content)) {
    throw new Error("Không tìm thấy <CategoryPanel ... /> trong MenuManagerView.jsx. Gửi mình file này để mình chỉnh đúng cấu trúc hiện tại.");
  }

  content = content.replace(categoryPanelRegex, (match) => {
    return `<CollapsibleMenuBlock
          open={categoryPanelOpen}
          onToggle={() => setCategoryPanelOpen((value) => !value)}
          eyebrow="Danh mục sản phẩm"
          title="Quản lý danh mục"
          description="Bấm mở khi cần thêm, sửa hoặc sắp xếp danh mục. Mặc định thu gọn để trang gọn hơn."
        >
          ${match}
        </CollapsibleMenuBlock>`;
  });
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm đóng/mở cho phần Danh mục sản phẩm.");
