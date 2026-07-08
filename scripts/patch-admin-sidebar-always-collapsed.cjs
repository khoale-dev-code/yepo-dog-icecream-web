const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/components/AdminSidebar.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/components/AdminSidebar.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Thêm useState cho sidebar tự quản lý trạng thái mở rộng/thu gọn.
if (!content.includes('import { useState } from "react";')) {
  content = content.replace(
    'import { Link } from "react-router-dom";',
    'import { useState } from "react";\nimport { Link } from "react-router-dom";'
  );
}

// Không nhận collapsed/onToggleCollapsed từ parent nữa.
content = content.replace(
  /\r?\n\s*collapsed,\r?\n\s*onToggleCollapsed,/,
  ""
);

// Thêm state local: mặc định thu gọn.
content = content.replace(
  /\}\)\s*\{\s*return\s*\(/,
  `}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isCollapsed = !detailOpen;

  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    setDetailOpen(false);
  }

  function handleToggleSidebarDetail() {
    setDetailOpen((value) => !value);
  }

  return (`
);

// Đổi toàn bộ logic collapsed sang isCollapsed.
content = content.replace(/\bcollapsed\b/g, "isCollapsed");

// Khi chọn tab thì tự thu gọn lại.
content = content.replace(
  /onClick=\{\(\) => setActiveTab\(tab\.id\)\}/g,
  "onClick={() => handleSelectTab(tab.id)}"
);

// Nút cuối sidebar dùng state local để mở/thu gọn.
content = content.replace(
  /onClick=\{onToggleCollapsed\}/g,
  "onClick={handleToggleSidebarDetail}"
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã chỉnh AdminSidebar: mặc định luôn thu gọn, bấm nút mới mở rộng.");
