const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf("function " + functionName);

  if (start === -1) {
    throw new Error("Không tìm thấy function " + functionName);
  }

  const braceStart = source.indexOf("{", start);
  let depth = 0;

  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Không tìm thấy kết thúc function " + functionName);
}

// 1. Khi bấm Lưu màu / Enter: bắt buộc set form.colorTheme = mã HEX
content = replaceFunction(
  content,
  "commitCustomThemeHex",
  `function commitCustomThemeHex() {
    const hex = normalizeHexDraft(customThemeHex);

    if (!hex) {
      setThemeHexError(
        "Mã HEX không hợp lệ. Ví dụ đúng: #f2aab8 hoặc f2aab8."
      );
      return;
    }

    setForm((current) => ({
      ...current,
      colorTheme: hex,
    }));

    setSavedCustomThemes(saveThemeColor(hex));
    setCustomThemeHex(hex);
    setThemeHexError("");
  }`
);

// 2. Khi chọn lại màu đã lưu, ô HEX cũng nhận màu đó
content = replaceFunction(
  content,
  "handleThemeChange",
  `function handleThemeChange(value, options = {}) {
    const nextValue = String(value || "").trim();

    setForm((current) => ({
      ...current,
      colorTheme: nextValue || "pink",
    }));

    if (isHexColor(nextValue)) {
      setCustomThemeHex(nextValue);
    }

    if (options.save && isHexColor(nextValue)) {
      setSavedCustomThemes(saveThemeColor(nextValue));
    }
  }`
);

// 3. Preview của ô nhập HEX phải hiện đúng màu đang chuẩn bị áp dụng
content = content.replace(
  /backgroundColor:\s*normalizeHexDraft\(customThemeHex\)\s*\|\|\s*"#ffffff",/g,
  `backgroundColor:
                        normalizeHexDraft(customThemeHex) ||
                        (isHexColor(form.colorTheme) ? form.colorTheme : "#ffffff"),`
);

// 4. Thêm text trạng thái để biết màu nào đang áp dụng
if (!content.includes("Màu đang áp dụng:")) {
  content = content.replace(
    /{themeHexError && \(\s*<p className="text-xs font-bold text-\[#d97c94\]">\s*{themeHexError}\s*<\/p>\s*\)}/,
    `{themeHexError && (
                  <p className="text-xs font-bold text-[#d97c94]">
                    {themeHexError}
                  </p>
                )}

                <p className="text-xs font-bold text-[#628296]">
                  Màu đang áp dụng: {form.colorTheme || "pink"}
                </p>`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix DogEditorPanel: màu HEX tùy chỉnh sẽ được áp dụng vào form.colorTheme.");
