const fs = require("fs");
const path = require("path");

const files = [
  path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx"),
  path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx"),
];

const helperCode = `
function isValidHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function getCoatColorSwatches(dog) {
  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  const normalized = coatColors
    .map((color, index) => {
      const hex = String(color?.hex || "").trim();
      const name = String(
        color?.name || color?.label || "Màu lông " + (index + 1)
      ).trim();

      if (!isValidHex(hex)) return null;

      return { hex, name };
    })
    .filter(Boolean);

  if (normalized.length > 0) return normalized.slice(0, 2);

  if (dog?.coatColor) {
    return [
      {
        hex: "#ffffff",
        name: String(dog.coatColor),
      },
    ];
  }

  return [];
}

function isWhiteLikeColor(hex) {
  const value = String(hex || "").toLowerCase();

  return [
    "#ffffff",
    "#fff",
    "#fefefe",
    "#fafafa",
    "#f8f8f8",
    "#f7f7f7",
    "#f5f5f5",
  ].includes(value);
}

function CoatColorDots({ dog, className = "" }) {
  const coatColors = getCoatColorSwatches(dog);

  if (!coatColors.length) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm">
          <span className="h-4 w-4 rounded-full border-2 border-[#d9cfc2] bg-[#f7efe4] shadow-inner" />
        </span>

        <span className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm">
          <span className="h-4 w-4 rounded-full border-2 border-[#d9cfc2] bg-[#ece5da] shadow-inner" />
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {coatColors.map((color, index) => {
        const whiteLike = isWhiteLikeColor(color.hex);

        return (
          <button
            key={color.hex + "-" + index}
            type="button"
            title={color.name}
            className="inline-flex items-center justify-center rounded-full border border-[#eadfce] bg-white px-2 py-1 shadow-sm transition hover:border-[#d8c4a5] hover:shadow"
            onClick={(event) => event.stopPropagation()}
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full shadow-inner",
                whiteLike
                  ? "border-2 border-[#cfc5b8]"
                  : "border-2 border-white"
              )}
              style={{ backgroundColor: color.hex }}
            />
          </button>
        );
      })}
    </div>
  );
}
`;

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf("function " + functionName);

  if (start === -1) return source;

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) return source;

  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  return source;
}

function removeFunction(source, functionName) {
  const start = source.indexOf("function " + functionName);

  if (start === -1) return source;

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) return source;

  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(0, start) + source.slice(i + 1);
    }
  }

  return source;
}

function ensureCoatHelper(content) {
  content = removeFunction(content, "isValidHex");
  content = removeFunction(content, "getCoatColorSwatches");
  content = removeFunction(content, "isWhiteLikeColor");
  content = removeFunction(content, "CoatColorDots");

  if (content.includes("function getPresetThemeKey")) {
    return content.replace(
      "function getPresetThemeKey",
      helperCode + "\nfunction getPresetThemeKey"
    );
  }

  if (content.includes("export function DogListPanel")) {
    return content.replace(
      "export function DogListPanel",
      helperCode + "\nexport function DogListPanel"
    );
  }

  if (content.includes("export default function")) {
    return content.replace(
      "export default function",
      helperCode + "\nexport default function"
    );
  }

  return content + "\n" + helperCode;
}

function normalizeRenderUsage(content) {
  content = content.replace(
    /<CoatColorDots\s+dog=\{dog\}\s+className="shrink-0"\s*\/>/g,
    '<CoatColorDots dog={dog} className="shrink-0 rounded-full bg-[#f8f3eb]/80 px-2 py-1 shadow-sm" />'
  );

  content = content.replace(
    /<CoatColorDots\s+dog=\{dog\}\s+className="mt-4"\s*\/>/g,
    '<CoatColorDots dog={dog} className="mt-4 rounded-full bg-[#f8f3eb]/80 px-2 py-1 shadow-sm" />'
  );

  return content;
}

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log("Bỏ qua, không tìm thấy:", filePath);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");

  content = ensureCoatHelper(content);
  content = normalizeRenderUsage(content);

  fs.writeFileSync(filePath, content, "utf8");

  console.log("Đã sửa hiển thị màu lông:", path.relative(process.cwd(), filePath));
}
