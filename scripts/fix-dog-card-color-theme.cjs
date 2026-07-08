const fs = require("fs");
const path = require("path");

/* =========================
   1) Fix DogListPanel render theo colorTheme
========================= */

const dogListPath = path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx");

if (fs.existsSync(dogListPath)) {
  let content = fs.readFileSync(dogListPath, "utf8");

  if (!content.includes("function getDogCardThemeColor")) {
    const helper = `
const DOG_CARD_THEME_COLORS = {
  pink: "#f2aab8",
  blue: "#b1cee3",
  green: "#c2d398",
  purple: "#c8bfe7",
  orange: "#fcd5b5",
};

function isDogHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function getDogCardThemeColor(dog) {
  const value = String(dog?.colorTheme || "").trim();

  if (isDogHexColor(value)) return value.toLowerCase();

  return DOG_CARD_THEME_COLORS[value] || DOG_CARD_THEME_COLORS.pink;
}

function hexToRgba(hex, alpha = 1) {
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
      hexToRgba(color, 0.22) +
      " 0%, #ffffff 44%, #fffaf3 100%)",
    boxShadow: "0 18px 42px " + hexToRgba(color, 0.18),
  };
}

function getDogArtThemeStyle(dog) {
  const color = getDogCardThemeColor(dog);

  return {
    background:
      "radial-gradient(circle at 50% 25%, " +
      hexToRgba(color, 0.45) +
      " 0%, " +
      hexToRgba(color, 0.16) +
      " 46%, #ffffff 100%)",
  };
}

function getDogImageRingStyle(dog) {
  return {
    boxShadow: "inset 0 0 0 4px " + hexToRgba(getDogCardThemeColor(dog), 0.5),
  };
}
`;

    content = content.replace("const GENDER_THEME = {", helper + "\nconst GENDER_THEME = {");
  }

  content = content.replace(
    /const theme = GENDER_THEME\[dog\.gender\] \|\| GENDER_THEME\.unknown;/,
    `const theme = GENDER_THEME[dog.gender] || GENDER_THEME.unknown;
  const cardThemeStyle = getDogCardThemeStyle(dog);
  const artThemeStyle = getDogArtThemeStyle(dog);
  const imageRingStyle = getDogImageRingStyle(dog);`
  );

  if (!content.includes("style={cardThemeStyle}")) {
    content = content.replace(
      /<article\s*\n\s*className=\{cn\(/,
      `<article
      style={cardThemeStyle}
      className={cn(`
    );
  }

  content = content.replace(
    /<div\s*\n\s*className=\{cn\(\s*\n\s*"absolute inset-0 bg-gradient-to-br",\s*\n\s*theme\.halo\s*\n\s*\)\}\s*\/>/,
    `<div
          className="absolute inset-0"
          style={artThemeStyle}
        />`
  );

  content = content.replace(
    /className=\{cn\(\s*\n\s*"relative h-full w-full object-cover ring-4 ring-inset",\s*\n\s*theme\.ring\s*\n\s*\)\}/,
    `className="relative h-full w-full object-cover"
            style={imageRingStyle}`
  );

  fs.writeFileSync(dogListPath, content, "utf8");
  console.log("Đã patch DogListPanel: card admin đổi màu theo dog.colorTheme.");
} else {
  console.log("Không tìm thấy DogListPanel.jsx, bỏ qua.");
}


/* =========================
   2) Fix dogUtils build payload luôn gửi colorTheme
========================= */

const dogUtilsPath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (fs.existsSync(dogUtilsPath)) {
  let content = fs.readFileSync(dogUtilsPath, "utf8");

  // Nếu buildDogPayload đã có colorTheme thì ép lại expression cho chắc.
  content = content.replace(
    /colorTheme\s*:\s*[^,\n]+,/g,
    `colorTheme: form.colorTheme || "pink",`
  );

  // Nếu buildDogPayload chưa có colorTheme, chèn vào return object của buildDogPayload.
  if (!/buildDogPayload[\s\S]*colorTheme\s*:/.test(content)) {
    content = content.replace(
      /(export\s+function\s+buildDogPayload\s*\(\s*form[\s\S]*?return\s*\{)/,
      `$1
    colorTheme: form.colorTheme || "pink",`
    );

    content = content.replace(
      /(function\s+buildDogPayload\s*\(\s*form[\s\S]*?return\s*\{)/,
      `$1
    colorTheme: form.colorTheme || "pink",`
    );
  }

  // Map edit form phải lấy lại màu đã lưu.
  content = content.replace(
    /colorTheme\s*:\s*dog\.colorTheme\s*\|\|\s*"pink",/g,
    `colorTheme: dog.colorTheme || "pink",`
  );

  fs.writeFileSync(dogUtilsPath, content, "utf8");
  console.log("Đã patch dogUtils: payload giữ colorTheme.");
} else {
  console.log("Không tìm thấy dogUtils.js, bỏ qua.");
}


/* =========================
   3) Fix DogManagerView ép payload trước khi gọi API
========================= */

const dogManagerPath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");

if (fs.existsSync(dogManagerPath)) {
  let content = fs.readFileSync(dogManagerPath, "utf8");

  if (!content.includes("payload.colorTheme = form.colorTheme || payload.colorTheme || \"pink\";")) {
    content = content.replace(
      /(const\s+payload\s*=\s*buildDogPayload\([^;]+;)/g,
      `$1
      payload.colorTheme = form.colorTheme || payload.colorTheme || "pink";`
    );
  }

  fs.writeFileSync(dogManagerPath, content, "utf8");
  console.log("Đã patch DogManagerView: ép lưu colorTheme trước API.");
} else {
  console.log("Không tìm thấy DogManagerView.jsx, bỏ qua.");
}


/* =========================
   4) Fix backend model không chặn mã hex
========================= */

const dogModelPath = path.resolve(process.cwd(), "server/models/Dog.js");

if (fs.existsSync(dogModelPath)) {
  let content = fs.readFileSync(dogModelPath, "utf8");

  content = content.replace(
    /colorTheme\s*:\s*\{[\s\S]*?default\s*:\s*["']pink["'][\s\S]*?\},/m,
    `colorTheme: { type: String, default: "pink" },`
  );

  fs.writeFileSync(dogModelPath, content, "utf8");
  console.log("Đã patch Dog model: colorTheme cho phép preset hoặc mã HEX.");
} else {
  console.log("Không tìm thấy server/models/Dog.js, bỏ qua.");
}
