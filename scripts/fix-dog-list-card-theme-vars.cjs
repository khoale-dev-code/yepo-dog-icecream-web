const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/DogListPanel.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

const helper = `
const DOG_CARD_THEME_COLORS = {
  pink: "#f2aab8",
  blue: "#b1cee3",
  green: "#c2d398",
  purple: "#c8bfe7",
  orange: "#fcd5b5",
};

function isDogCardHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function getDogCardThemeColor(dog) {
  const value = String(dog?.colorTheme || "").trim();

  if (isDogCardHexColor(value)) return value.toLowerCase();

  return DOG_CARD_THEME_COLORS[value] || DOG_CARD_THEME_COLORS.pink;
}

function hexToDogCardRgba(hex, alpha = 1) {
  const clean = String(hex || "").replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(clean)) {
    return "rgba(242,170,184," + alpha + ")";
  }

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

function getDogCardThemeStyle(dog) {
  const color = getDogCardThemeColor(dog);

  return {
    borderColor: color,
    background:
      "linear-gradient(180deg, " +
      hexToDogCardRgba(color, 0.24) +
      " 0%, #ffffff 46%, #fffaf3 100%)",
    boxShadow: "0 18px 42px " + hexToDogCardRgba(color, 0.18),
  };
}

function getDogArtThemeStyle(dog) {
  const color = getDogCardThemeColor(dog);

  return {
    background:
      "radial-gradient(circle at 50% 25%, " +
      hexToDogCardRgba(color, 0.45) +
      " 0%, " +
      hexToDogCardRgba(color, 0.16) +
      " 46%, #ffffff 100%)",
  };
}

function getDogImageRingStyle(dog) {
  return {
    boxShadow:
      "inset 0 0 0 4px " +
      hexToDogCardRgba(getDogCardThemeColor(dog), 0.5),
  };
}
`;

if (!content.includes("function getDogCardThemeStyle")) {
  content = content.replace(
    /function\s+DogCard\s*\(/,
    helper + "\nfunction DogCard("
  );
}

function insertDogCardVars(source) {
  const fnRegex = /function\s+DogCard\s*\([^)]*\)\s*\{/;

  if (!fnRegex.test(source)) {
    return source;
  }

  if (source.includes("const cardThemeStyle = getDogCardThemeStyle(dog);")) {
    return source;
  }

  return source.replace(
    fnRegex,
    (match) =>
      match +
      `
  const cardThemeStyle = getDogCardThemeStyle(dog);
  const artThemeStyle = getDogArtThemeStyle(dog);
  const imageRingStyle = getDogImageRingStyle(dog);`
  );
}

content = insertDogCardVars(content);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix DogListPanel: khai báo cardThemeStyle/artThemeStyle/imageRingStyle trong DogCard.");
