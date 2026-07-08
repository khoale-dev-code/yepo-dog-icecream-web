const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/components/AdminSidebar.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/components/AdminSidebar.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* Mobile bottom nav: chỉ icon, không còn chữ dưới icon */
content = content.replace(
  `"max-lg:min-w-[76px] max-lg:flex-col max-lg:justify-center max-lg:gap-1 max-lg:px-3 max-lg:py-2.5 max-lg:text-[11px]",`,
  `"max-lg:h-12 max-lg:w-12 max-lg:justify-center max-lg:p-0",`
);

/* Label tab: ẩn hoàn toàn trên mobile, desktop vẫn theo trạng thái sidebar */
content = content.replace(
  `"max-lg:block max-lg:leading-none",`,
  `"max-lg:hidden",`
);

/* Tooltip: icon mobile cũng có title khi hover/nhấn giữ */
content = content.replace(
  `title={isCollapsed ? tab.label : undefined}`,
  `title={tab.label}`
);

/* Mobile nav nhìn gọn hơn */
content = content.replace(
  `"max-lg:items-center max-lg:justify-start",`,
  `"max-lg:items-center max-lg:justify-center",`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cập nhật AdminSidebar: mobile bottom bar chỉ hiển thị icon.");
