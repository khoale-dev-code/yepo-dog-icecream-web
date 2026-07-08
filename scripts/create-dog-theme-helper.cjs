const fs = require("fs");
const path = require("path");

const dir = path.resolve(process.cwd(), "src/lib");
fs.mkdirSync(dir, { recursive: true });

const filePath = path.join(dir, "dogTheme.js");

const content = `export const DOG_CARD_THEME_COLORS = {
  pink: "#f2aab8",
  blue: "#b1cee3",
  green: "#c2d398",
  purple: "#c8bfe7",
  orange: "#fcd5b5",
};

export function isDogThemeHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

export function getDogThemeColor(dogOrValue) {
  const value =
    typeof dogOrValue === "string"
      ? dogOrValue.trim()
      : String(dogOrValue?.colorTheme || "").trim();

  if (isDogThemeHex(value)) return value.toLowerCase();

  return DOG_CARD_THEME_COLORS[value] || DOG_CARD_THEME_COLORS.pink;
}

export function hexToRgba(hex, alpha = 1) {
  const clean = String(hex || "").replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(clean)) {
    return "rgba(242,170,184," + alpha + ")";
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

export function getDogCardStyle(dog) {
  const color = getDogThemeColor(dog);

  return {
    borderColor: color,
    background:
      "linear-gradient(180deg, " +
      hexToRgba(color, 0.28) +
      " 0%, #ffffff 48%, #fffaf3 100%)",
    boxShadow: "0 18px 42px " + hexToRgba(color, 0.22),
  };
}

export function getDogMediaFrameStyle(dog) {
  const color = getDogThemeColor(dog);

  return {
    background:
      "radial-gradient(circle at 50% 25%, " +
      hexToRgba(color, 0.5) +
      " 0%, " +
      hexToRgba(color, 0.18) +
      " 48%, #ffffff 100%)",
  };
}

export function getDogBadgeStyle(dog) {
  const color = getDogThemeColor(dog);

  return {
    backgroundColor: hexToRgba(color, 0.18),
    borderColor: hexToRgba(color, 0.55),
    color: "#3b2a18",
  };
}

export function getDogAccentStyle(dog) {
  return {
    color: getDogThemeColor(dog),
  };
}
`;

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã tạo/cập nhật src/lib/dogTheme.js");
