const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogEditorPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy DogEditorPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* Import palette từ dogTheme */
if (!content.includes('from "../../lib/dogTheme"')) {
  content = content.replace(
    /import\s+\{\s*cn,\s*getPatternLabel\s*\}\s+from\s+["']\.\/dogUtils["'];/,
    (match) =>
      match +
      '\nimport { DOG_CARD_THEME_OPTIONS } from "../../lib/dogTheme";'
  );
}

/* State frameColor */
if (!content.includes("const [customFrameHex, setCustomFrameHex]")) {
  content = content.replace(
    /const\s+\[customThemeHex,\s*setCustomThemeHex\]\s*=\s*useState\([\s\S]*?\);\s*/,
    (match) =>
      match +
      `  const [customFrameHex, setCustomFrameHex] = useState(
    isHexColor(form.frameColor) ? form.frameColor : ""
  );
`
  );
}

/* Sync frameColor khi bấm sửa */
if (!content.includes("setCustomFrameHex(form.frameColor);")) {
  content = content.replace(
    /useEffect\(\(\)\s*=>\s*\{[\s\S]*?setCustomThemeHex\(form\.colorTheme\);[\s\S]*?\},\s*\[form\.colorTheme\]\s*\);/,
    (match) =>
      match +
      `

  useEffect(() => {
    if (isHexColor(form.frameColor)) {
      setCustomFrameHex(form.frameColor);
    }
  }, [form.frameColor]);`
  );
}

/* Hàm đổi màu khung */
if (!content.includes("function handleFrameThemeChange")) {
  content = content.replace(
    /function\s+handleThemeChange\(value\)\s*\{[\s\S]*?\n\s*\}/,
    (match) =>
      match +
      `

  function handleFrameThemeChange(value) {
    const nextValue = String(value || "").trim();

    setForm((current) => ({
      ...current,
      frameColor: nextValue,
    }));

    if (isHexColor(nextValue)) {
      setCustomFrameHex(nextValue);
    }

    setThemeHexError("");
  }

  function commitFrameHex() {
    const hex = normalizeHexDraft(customFrameHex);

    if (!hex) {
      setThemeHexError("Mã HEX khung bên trong không hợp lệ. Ví dụ: #f2aab8.");
      return;
    }

    setForm((current) => ({
      ...current,
      frameColor: hex,
    }));

    setCustomFrameHex(hex);
    setThemeHexError("");
  }

  function clearFrameHex() {
    setCustomFrameHex("");

    setForm((current) => ({
      ...current,
      frameColor: "",
    }));

    setThemeHexError("");
  }`
  );
}

/* Hidden input */
if (!content.includes("const frameColorDraftValue =")) {
  content = content.replace(
    /const\s+colorThemeDraftValue\s*=[\s\S]*?;/,
    `const colorThemeDraftValue =
    normalizeHexDraft(customThemeHex) || form.colorTheme || "pink";
  const frameColorDraftValue =
    normalizeHexDraft(customFrameHex) || form.frameColor || "";`
  );
}

if (!content.includes('name="frameColorDraft"')) {
  content = content.replace(
    /<input\s+type="hidden"\s+name="colorThemeDraft"\s+value=\{colorThemeDraftValue\}\s*\/>/,
    `<input type="hidden" name="colorThemeDraft" value={colorThemeDraftValue} />
      <input type="hidden" name="frameColorDraft" value={frameColorDraftValue} />`
  );
}

/* UI palette cho khung bên trong */
const framePresetUi = `
          <div className="rounded-3xl border border-[#eadfce] bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-extrabold text-[#3b2a18]">
              <Paintbrush size={16} />
              Màu khung bên trong card
            </p>

            <p className="mt-1 text-xs font-bold text-[#7d6f61]">
              Màu này sẽ đổi phần khung/nền quanh ảnh bên trong card. Các màu cố định giống phần màu card ở trên.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {DOG_CARD_THEME_OPTIONS.map((theme) => {
                const active = form.frameColor === theme.color;

                return (
                  <button
                    key={"frame-" + theme.value}
                    type="button"
                    onClick={() => handleFrameThemeChange(theme.color)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                      active
                        ? "border-[#b98c49] bg-[#fff7e6] text-[#3b2a18]"
                        : "border-[#eadfce] bg-white text-[#6f6254] hover:border-[#b98c49]/60"
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white shadow"
                      style={{ backgroundColor: theme.color }}
                    />
                    {theme.label}
                    {active && <CheckCircle size={14} />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={clearFrameHex}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-bold transition",
                  !form.frameColor
                    ? "border-[#b98c49] bg-[#fff7e6] text-[#3b2a18]"
                    : "border-[#eadfce] bg-white text-[#6f6254] hover:border-[#b98c49]/60"
                )}
              >
                Dùng màu card
                {!form.frameColor && <CheckCircle size={14} />}
              </button>
            </div>

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
            </div>

            <p className="mt-2 text-xs font-bold text-[#628296]">
              Màu khung trong đang áp dụng: {form.frameColor || "theo màu card"}
            </p>
          </div>
`;

if (!content.includes("Các màu cố định giống phần màu card ở trên")) {
  const tradingIndex = content.indexOf('title="Trading Card"');

  if (tradingIndex === -1) {
    throw new Error("Không tìm thấy block Trading Card.");
  }

  const endIndex = content.indexOf("</FormBlock>", tradingIndex);

  if (endIndex === -1) {
    throw new Error("Không tìm thấy điểm đóng Trading Card.");
  }

  content = content.slice(0, endIndex) + framePresetUi + "\n      " + content.slice(endIndex);
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm palette cố định cho màu khung bên trong card.");
