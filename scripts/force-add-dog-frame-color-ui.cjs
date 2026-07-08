const fs = require("fs");
const path = require("path");

const editorPath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(editorPath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogEditorPanel.jsx");
}

let content = fs.readFileSync(editorPath, "utf8");

function insertAfterStatement(source, token, addition) {
  if (source.includes(addition.trim().split("\n")[0].trim())) return source;

  const start = source.indexOf(token);
  if (start === -1) return source;

  const end = source.indexOf(";\n", start);
  if (end === -1) return source;

  return source.slice(0, end + 2) + addition + source.slice(end + 2);
}

/* 1) State nhập màu khung trong */
content = insertAfterStatement(
  content,
  "const [customThemeHex, setCustomThemeHex]",
  `
  const [customFrameHex, setCustomFrameHex] = useState(
    isHexColor(form.frameColor) ? form.frameColor : ""
  );
`
);

/* 2) Sync khi bấm edit cún cũ */
if (!content.includes("setCustomFrameHex(form.frameColor);")) {
  const effect = `
  useEffect(() => {
    if (isHexColor(form.frameColor)) {
      setCustomFrameHex(form.frameColor);
    }
  }, [form.frameColor]);
`;

  const colorEffectRegex =
    /useEffect\(\(\)\s*=>\s*\{[\s\S]*?form\.colorTheme[\s\S]*?\},\s*\[form\.colorTheme\]\s*\);/;

  if (colorEffectRegex.test(content)) {
    content = content.replace(colorEffectRegex, (match) => match + "\n" + effect);
  } else {
    content = insertAfterStatement(
      content,
      "const [customFrameHex, setCustomFrameHex]",
      "\n" + effect
    );
  }
}

/* 3) Hàm áp dụng/xóa màu khung */
if (!content.includes("function commitFrameHex()")) {
  const frameFunctions = `
  function commitFrameHex() {
    const hex = normalizeHexDraft(customFrameHex);

    if (!hex) {
      setThemeHexError("Mã HEX khung bên trong không hợp lệ. Ví dụ: #f6d77d.");
      return;
    }

    setForm((current) => ({
      ...current,
      frameColor: hex,
    }));

    setThemeHexError("");
  }

  function clearFrameHex() {
    setCustomFrameHex("");

    setForm((current) => ({
      ...current,
      frameColor: "",
    }));

    setThemeHexError("");
  }

`;

  const targets = [
    "function handleRemoveSavedTheme",
    "function updateCoatColor",
    "function handlePickFiles",
  ];

  let inserted = false;

  for (const target of targets) {
    const index = content.indexOf(target);

    if (index !== -1) {
      content = content.slice(0, index) + frameFunctions + content.slice(index);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    throw new Error("Không tìm thấy vị trí để thêm commitFrameHex.");
  }
}

/* 4) Tạo frameColorDraftValue trước return */
if (!content.includes("const frameColorDraftValue =")) {
  if (content.includes("const colorThemeDraftValue =")) {
    content = insertAfterStatement(
      content,
      "const colorThemeDraftValue",
      `
  const frameColorDraftValue =
    normalizeHexDraft(customFrameHex) || form.frameColor || "";
`
    );
  } else {
    content = content.replace(
      /const\s+coatColors\s*=\s*getInitialCoatColors\(form\);/,
      `const coatColors = getInitialCoatColors(form);
  const colorThemeDraftValue =
    normalizeHexDraft(customThemeHex) || form.colorTheme || "pink";
  const frameColorDraftValue =
    normalizeHexDraft(customFrameHex) || form.frameColor || "";`
    );
  }
}

/* 5) Hidden input để submit luôn gửi màu khung */
if (!content.includes('name="frameColorDraft"')) {
  if (content.includes('name="colorThemeDraft"')) {
    content = content.replace(
      /<input\s+type="hidden"\s+name="colorThemeDraft"\s+value=\{colorThemeDraftValue\}\s*\/>/,
      `<input type="hidden" name="colorThemeDraft" value={colorThemeDraftValue} />
      <input type="hidden" name="frameColorDraft" value={frameColorDraftValue} />`
    );
  } else {
    content = content.replace(
      /<form\s+onSubmit=\{onSubmit\}\s+className="grid gap-5">/,
      `<form onSubmit={onSubmit} className="grid gap-5">
      <input type="hidden" name="colorThemeDraft" value={colorThemeDraftValue} />
      <input type="hidden" name="frameColorDraft" value={frameColorDraftValue} />`
    );
  }
}

/* 6) UI chỉnh màu khung bên trong - chèn vào block Trading Card */
const frameUi = `
          <div className="rounded-3xl border border-[#eadfce] bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#3b2a18]">
              <Paintbrush size={16} />
              Màu khung bên trong card
            </p>

            <p className="mt-1 text-xs font-bold text-[#7d6f61]">
              Đây là màu khung/nền quanh ảnh bên trong card. Ví dụ trong ảnh mẫu là phần viền hồng.
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="h-11 w-11 rounded-2xl border border-white shadow"
                style={{
                  backgroundColor:
                    normalizeHexDraft(customFrameHex) ||
                    (isHexColor(form.frameColor) ? form.frameColor : "#ffffff"),
                }}
              />

              <input
                value={customFrameHex}
                onChange={(event) => {
                  setCustomFrameHex(event.target.value);
                  setThemeHexError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitFrameHex();
                  }
                }}
                placeholder="#f2aab8"
                className="h-11 flex-1 rounded-2xl border border-[#eadfce] bg-white px-4 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49]"
              />

              <button
                type="button"
                onClick={commitFrameHex}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#b98c49] px-5 text-sm font-extrabold text-white shadow"
              >
                Áp dụng khung
              </button>

              <button
                type="button"
                onClick={clearFrameHex}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#eadfce] bg-white px-5 text-sm font-extrabold text-[#3b2a18]"
              >
                Dùng màu card
              </button>
            </div>

            <p className="mt-2 text-xs font-bold text-[#628296]">
              Màu khung trong đang áp dụng: {form.frameColor || "theo màu card"}
            </p>
          </div>
`;

if (!content.includes("Màu khung bên trong card")) {
  const tradingStart = content.indexOf('title="Trading Card"');

  if (tradingStart === -1) {
    throw new Error("Không tìm thấy FormBlock Trading Card.");
  }

  const closeIndex = content.indexOf("</FormBlock>", tradingStart);

  if (closeIndex === -1) {
    throw new Error("Không tìm thấy điểm đóng Trading Card FormBlock.");
  }

  content = content.slice(0, closeIndex) + frameUi + "\n      " + content.slice(closeIndex);
}

fs.writeFileSync(editorPath, content, "utf8");

console.log("Đã thêm UI chỉnh màu khung bên trong card vào DogEditorPanel.");
