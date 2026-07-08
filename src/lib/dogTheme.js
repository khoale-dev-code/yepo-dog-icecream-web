export const DOG_CARD_THEME_COLORS = {
  pink: "#f2aab8",
  blue: "#b1cee3",
  green: "#c2d398",
  purple: "#c8bfe7",
  orange: "#fcd5b5",
};

export const DOG_CARD_THEME_OPTIONS = [
  { value: "pink", label: "Hồng YEPO", color: "#f2aab8" },
  { value: "blue", label: "Xanh baby", color: "#b1cee3" },
  { value: "green", label: "Xanh lá", color: "#c2d398" },
  { value: "purple", label: "Tím pastel", color: "#c8bfe7" },
  { value: "orange", label: "Cam kem", color: "#fcd5b5" },
];

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

export function getDogFrameColor(dog) {
  const value = String(dog?.frameColor || "").trim();

  if (isDogThemeHex(value)) return value.toLowerCase();

  return getDogThemeColor(dog);
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
      hexToRgba(color, 0.36) +
      " 0%, #ffffff 52%, #fffaf3 100%)",
    boxShadow: "0 18px 42px " + hexToRgba(color, 0.22),
  };
}

export function getDogMediaFrameStyle(dog) {
  const color = getDogFrameColor(dog);

  return {
    borderColor: color,
    background:
      "linear-gradient(180deg, " +
      hexToRgba(color, 0.95) +
      " 0%, " +
      hexToRgba(color, 0.42) +
      " 100%)",
    boxShadow: "inset 0 0 0 5px " + hexToRgba(color, 0.5),
  };
}

export function getDogImageRingStyle(dog) {
  const color = getDogFrameColor(dog);

  return {
    boxShadow: "0 0 0 8px " + hexToRgba(color, 0.65),
  };
}

export function getDogBadgeStyle(dog) {
  const color = getDogThemeColor(dog);

  return {
    backgroundColor: hexToRgba(color, 0.2),
    borderColor: hexToRgba(color, 0.55),
    color: "#3b2a18",
  };
}

export function getDogAccentStyle(dog) {
  return {
    color: getDogThemeColor(dog),
  };
}
