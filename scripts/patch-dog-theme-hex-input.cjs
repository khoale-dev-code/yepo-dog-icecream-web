const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// Đảm bảo có useState
content = content.replace(
  'import { useEffect, useMemo } from "react";',
  'import { useEffect, useMemo, useState } from "react";'
);

// Thêm state cho ô nhập HEX
if (!content.includes("customThemeHex")) {
  content = content.replace(
    '  const [savedCustomThemes, setSavedCustomThemes] = useState(readSavedThemes);',
    `  const [savedCustomThemes, setSavedCustomThemes] = useState(readSavedThemes);
  const [customThemeHex, setCustomThemeHex] = useState("");
  const [themeHexError, setThemeHexError] = useState("");`
  );
}

// Thêm hàm chuẩn hóa HEX + lưu màu bằng Enter/nút Lưu
if (!content.includes("function normalizeHexDraft")) {
  content = content.replace(
    /  function handleRemoveSavedTheme\(color\) \{\s*setSavedCustomThemes\(removeThemeColor\(color\)\);\s*\}/,
    `  function handleRemoveSavedTheme(color) {
    setSavedCustomThemes(removeThemeColor(color));
  }

  function normalizeHexDraft(value) {
    const raw = String(value || "").trim().replace(/^#/, "");

    if (/^[0-9a-f]{3}$/i.test(raw)) {
      return (
        "#" +
        raw
          .split("")
          .map((char) => char + char)
          .join("")
          .toLowerCase()
      );
    }

    if (/^[0-9a-f]{6}$/i.test(raw)) {
      return "#" + raw.toLowerCase();
    }

    return "";
  }

  function commitCustomThemeHex() {
    const hex = normalizeHexDraft(customThemeHex);

    if (!hex) {
      setThemeHexError("Mã HEX không hợp lệ. Ví dụ đúng: #f2aab8 hoặc f2aab8.");
      return;
    }

    handleThemeChange(hex, { save: true });
    setCustomThemeHex(hex);
    setThemeHexError("");
  }`
  );
}

// Khi chọn lại màu đã lưu thì đồng bộ vào ô nhập HEX
if (!content.includes("setCustomThemeHex(form.colorTheme);")) {
  content = content.replace(
    '  const isCustomTheme = isHexColor(form.colorTheme);',
    `  const isCustomTheme = isHexColor(form.colorTheme);

  useEffect(() => {
    if (isCustomTheme) {
      setCustomThemeHex(form.colorTheme);
      setThemeHexError("");
    }
  }, [isCustomTheme, form.colorTheme]);`
  );
}

// Thay block color picker nhạy bằng ô nhập HEX
const customColorRegex = /              <label\s*\n\s*className="group relative flex cursor-pointer flex-col items-center gap-2"\s*\n\s*title="Màu tùy chỉnh"\s*\n\s*>\s*[\s\S]*?\n              <\/label>/;

const customHexBlock = [
'              <div',
'                className="flex min-w-[260px] flex-col gap-3 rounded-[24px] border-2 border-dashed border-[#a8bcce] bg-[#f7fafc] p-4"',
'              >',
'                <div className="flex items-center gap-3">',
'                  <span',
'                    className="h-14 w-14 shrink-0 rounded-full border-2 border-white shadow-sm ring-2 ring-[#dbe6ec]"',
'                    style={{',
'                      backgroundColor: isHexColor(customThemeHex)',
'                        ? normalizeHexDraft(customThemeHex)',
'                        : isCustomTheme',
'                          ? form.colorTheme',
'                          : "#ffffff",',
'                    }}',
'                  />',
'',
'                  <div className="min-w-0">',
'                    <p className="text-sm font-black text-[#628296]">',
'                      Màu tùy chỉnh',
'                    </p>',
'',
'                    <p className="mt-1 text-xs font-medium leading-5 text-[#8fa7b8]">',
'                      Nhập mã HEX rồi bấm Enter để lưu màu.',
'                    </p>',
'                  </div>',
'                </div>',
'',
'                <div className="flex gap-2">',
'                  <input',
'                    value={customThemeHex}',
'                    placeholder="#f2aab8"',
'                    spellCheck={false}',
'                    onChange={(event) => {',
'                      setCustomThemeHex(event.target.value);',
'                      setThemeHexError("");',
'                    }}',
'                    onKeyDown={(event) => {',
'                      if (event.key === "Enter") {',
'                        event.preventDefault();',
'                        commitCustomThemeHex();',
'                      }',
'                    }}',
'                    className="h-11 min-w-0 flex-1 rounded-2xl border-2 border-[#e1eaf0] bg-white px-4 text-sm font-bold text-[#456173] outline-none transition placeholder:text-[#a8bcce] focus:border-[#a8bcce]"',
'                  />',
'',
'                  <button',
'                    type="button"',
'                    onClick={commitCustomThemeHex}',
'                    className="h-11 shrink-0 rounded-2xl bg-[#8eb2ca] px-4 text-xs font-black uppercase tracking-wide text-white transition hover:bg-[#729db8]"',
'                  >',
'                    Lưu màu',
'                  </button>',
'                </div>',
'',
'                {themeHexError && (',
'                  <p className="text-xs font-bold text-[#d97c94]">',
'                    {themeHexError}',
'                  </p>',
'                )}',
'              </div>',
].join("\\n");

if (!customColorRegex.test(content)) {
  throw new Error("Không tìm thấy block Màu tùy chỉnh để thay. Gửi mình DogEditorPanel.jsx hiện tại nếu patch không chạy.");
}

content = content.replace(customColorRegex, customHexBlock);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đổi Trading Card custom color sang nhập mã HEX + Enter để lưu.");
