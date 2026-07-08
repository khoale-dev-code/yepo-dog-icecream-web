const fs = require("fs");

const file = "src/components/public/DogProfileCard.jsx";

if (!fs.existsSync(file)) {
  throw new Error("Không tìm thấy file: " + file);
}

let code = fs.readFileSync(file, "utf8");

/**
 * 1. Thêm createPortal để modal không còn bị kẹt trong transform của card/HomePage.
 */
if (!code.includes('from "react-dom"')) {
  code = code.replace(
    'import { useEffect, useMemo, useState } from "react";',
    'import { useEffect, useMemo, useState } from "react";\nimport { createPortal } from "react-dom";'
  );
}

/**
 * 2. Render DogDetailModal bằng portal ra document.body.
 */
const inlineModalPattern =
  /\{isOpen && \(\s*<DogDetailModal\s+dog=\{dog\}\s+cardTheme=\{cardTheme\}\s+genderTheme=\{genderTheme\}\s+onClose=\{\(\) => setIsOpen\(false\)\}\s*\/>\s*\)\}/s;

if (!inlineModalPattern.test(code)) {
  console.warn("Không tìm thấy block modal inline. Có thể file đã được sửa trước đó.");
} else {
  code = code.replace(
    inlineModalPattern,
    `{isOpen &&
        createPortal(
          <DogDetailModal
            dog={dog}
            cardTheme={cardTheme}
            genderTheme={genderTheme}
            onClose={() => setIsOpen(false)}
          />,
          document.body
        )}`
  );
}

/**
 * 3. Đổi backdrop từ centered modal thành mobile bottom sheet.
 */
code = code.replace(
  'className="fixed inset-0 z-[999] flex items-center justify-center bg-[#2d2015]/70 p-3 backdrop-blur-sm sm:p-5"',
  'className="fixed inset-0 z-[9999] overflow-hidden bg-[#2d2015]/70 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"'
);

/**
 * 4. Đổi container modal để mobile luôn nằm dưới thanh địa chỉ trình duyệt.
 */
code = code.replace(
  'className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[34px] border-[6px] border-white shadow-[0_28px_90px_rgba(0,0,0,28)]"',
  'className="absolute inset-x-0 bottom-0 flex h-[92dvh] max-h-[calc(100dvh-16px)] w-full flex-col overflow-hidden rounded-t-[34px] border-x-[6px] border-t-[6px] border-white shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:relative sm:inset-auto sm:h-auto sm:max-h-[92dvh] sm:max-w-6xl sm:rounded-[34px] sm:border-[6px]"'
);

/**
 * 5. Header sticky để nút X luôn thấy khi cuộn.
 */
code = code.replace(
  '"flex items-center justify-between gap-3 px-4 py-3 sm:px-5"',
  '"sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5"'
);

/**
 * 6. Body modal scroll nội bộ, không kéo cả page.
 */
code = code.replace(
  '"max-h-[calc(92vh-76px)] overflow-y-auto p-4 sm:p-5"',
  '"min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5"'
);

/**
 * 7. Giữ overflow body đúng trạng thái cũ khi đóng modal.
 */
code = code.replace(
  `document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };`,
  `const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };`
);

fs.writeFileSync(file, code);
console.log("✅ Fixed mobile dog detail modal:", file);
