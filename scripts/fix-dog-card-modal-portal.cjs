const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/components/public/DogProfileCard.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes('from "react-dom"')) {
  content = content.replace(
    /import \{ useEffect, useMemo, useState \} from "react";/,
    'import { useEffect, useMemo, useState } from "react";\nimport { createPortal } from "react-dom";'
  );
}

const dogDetailModalBlock = /\{isOpen && \(\s*<DogDetailModal\s+dog=\{dog\}\s+cardTheme=\{cardTheme\}\s+genderTheme=\{genderTheme\}\s+onClose=\{\(\) => setIsOpen\(false\)\}\s*\/>\s*\)\}/m;

if (dogDetailModalBlock.test(content)) {
  content = content.replace(
    dogDetailModalBlock,
    `{isOpen &&
        typeof document !== "undefined" &&
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

const dogDexModalBlock = /\{isOpen && \(\s*<DogDexFullProfile\s+dog=\{dog\}\s+cardTheme=\{cardTheme\}\s+genderTheme=\{genderTheme\}\s+onClose=\{\(\) => setIsOpen\(false\)\}\s*\/>\s*\)\}/m;

if (dogDexModalBlock.test(content)) {
  content = content.replace(
    dogDexModalBlock,
    `{isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <DogDexFullProfile
            dog={dog}
            cardTheme={cardTheme}
            genderTheme={genderTheme}
            onClose={() => setIsOpen(false)}
          />,
          document.body
        )}`
  );
}

content = content.replace(
  /className="fixed inset-0 z-\[999\] flex [^"]*bg-\[#2d2015\]\/70[^"]*"/,
  'className="fixed inset-0 z-[999] flex items-end justify-center bg-[#2d2015]/70 p-2 backdrop-blur-sm sm:items-center sm:p-5"'
);

content = content.replace(
  /className="max-h-\[92vh\] w-full max-w-6xl overflow-hidden rounded-\[34px\] border-\[6px\] border-white shadow-\[0_28px_90px_rgba\(0,0,0,\.28\)\]"/,
  'className="relative max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-t-[30px] border-[6px] border-white shadow-[0_28px_90px_rgba(0,0,0,.28)] sm:rounded-[34px]"'
);

content = content.replace(
  /className="max-h-\[calc\(92vh-76px\)\] overflow-y-auto p-4 sm:p-5"/g,
  'className="max-h-[calc(94vh-76px)] overflow-x-hidden overflow-y-auto p-4 sm:p-5"'
);

content = content.replace(
  /className="grid gap-5 lg:grid-cols-\[minmax\(0,1\.1fr\)_420px\]"/g,
  'className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_420px]"'
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix modal DogProfileCard: render bằng createPortal, không còn bị kẹt trong card homepage.");
