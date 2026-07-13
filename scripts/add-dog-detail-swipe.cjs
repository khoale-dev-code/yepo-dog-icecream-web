const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) {
      files.push(full);
    }
  }

  return files;
}

const dogCardFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");

  return (
    code.includes("export default function DogProfileCard") &&
    code.includes("function DogDetailModal") &&
    code.includes("function getDogMedia")
  );
});

if (!dogCardFile) {
  throw new Error("Không tìm thấy DogProfileCard.jsx.");
}

let code = fs.readFileSync(dogCardFile, "utf8");

// 1. Thêm useRef vào React import
code = code.replace(
  'import { useEffect, useMemo, useState } from "react";',
  'import { useEffect, useMemo, useRef, useState } from "react";'
);

// Nếu file đã có useRef rồi thì không đổi gì thêm
code = code.replace(
  'import { useEffect, useMemo, useRef, useRef, useState } from "react";',
  'import { useEffect, useMemo, useRef, useState } from "react";'
);

// 2. Thêm touchStartRef vào DogDetailModal
if (!code.includes("const touchStartRef = useRef({ x: 0, y: 0 });")) {
  code = code.replace(
    "  const [activeIndex, setActiveIndex] = useState(0);\n\n  const activeMedia = media[activeIndex];",
    "  const [activeIndex, setActiveIndex] = useState(0);\n  const touchStartRef = useRef({ x: 0, y: 0 });\n\n  const activeMedia = media[activeIndex];"
  );
}

// 3. Thêm hàm vuốt sau goNext()
if (!code.includes("function handleTouchStart(event)")) {
  code = code.replace(
    /  function goNext\(\) \{[\s\S]*?  \}\n\n  return \(/,
    String.raw`  function goNext() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current + 1) % media.length);
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];

    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event) {
    if (media.length <= 1) return;

    const touch = event.changedTouches?.[0];

    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Chỉ nhận vuốt ngang rõ ràng, tránh nhầm với thao tác cuộn dọc.
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  return (`
  );
}

// 4. Gắn touch handlers vào khung ảnh chính trong modal
if (!code.includes("onTouchStart={handleTouchStart}")) {
  code = code.replace(
    /<div\s+style=\{modalFrameStyle\}\s+className="relative overflow-hidden/g,
    `<div
                style={modalFrameStyle}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden`
  );
}

// Nếu replace trên không trúng do file đã được format khác, thử pattern khác
if (!code.includes("onTouchStart={handleTouchStart}")) {
  code = code.replace(
    /<div\s+style=\{modalFrameStyle\}\s+className="relative\s+overflow-hidden/g,
    `<div
                style={modalFrameStyle}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden`
  );
}

if (!code.includes("onTouchStart={handleTouchStart}")) {
  throw new Error("Không gắn được touch handler vào khung ảnh. Hãy gửi lại file DogProfileCard.jsx hiện tại.");
}

fs.writeFileSync(dogCardFile, code, "utf8");

console.log("✅ Đã thêm vuốt tay đổi ảnh trong hồ sơ cún:", dogCardFile);
