const fs = require("fs");
const path = require("path");

function ensureImport(content, importPath) {
  if (content.includes("getDogMediaFrameStyle")) return content;

  return content.replace(
    /import\s+[^;]+;/,
    (match) =>
      match +
      `\nimport { getDogCardStyle, getDogMediaFrameStyle, getDogImageRingStyle } from "${importPath}";`
  );
}

function injectDogStyles(content, componentName) {
  if (content.includes("const dogFrameStyle = getDogMediaFrameStyle(dog);")) {
    return content;
  }

  const patterns = [
    new RegExp(`export\\\\s+default\\\\s+function\\\\s+${componentName}\\\\s*\\\\(([^)]*)\\\\)\\\\s*\\\\{`),
    new RegExp(`function\\\\s+${componentName}\\\\s*\\\\(([^)]*)\\\\)\\\\s*\\\\{`),
  ];

  for (const pattern of patterns) {
    if (pattern.test(content)) {
      return content.replace(pattern, (match) => {
        return (
          match +
          `
  const dogCardStyle = getDogCardStyle(dog);
  const dogFrameStyle = getDogMediaFrameStyle(dog);
  const dogImageStyle = getDogImageRingStyle(dog);`
        );
      });
    }
  }

  return content;
}

function applyStylesOnly(content) {
  // Card ngoài: chỉ thêm style màu, không đổi class/layout
  content = content.replace(
    /<article(?![^>]*style=)([^>]*className=)/,
    `<article style={dogCardStyle}$1`
  );

  // Khung ảnh: chỉ thêm style màu frameColor vào div ảnh sẵn có
  content = content.replace(
    /<div(?![^>]*style=)([^>]*className="[^"]*aspect-square[^"]*"[^>]*)>/,
    `<div style={dogFrameStyle}$1>`
  );

  // Ảnh/video: chỉ thêm ring màu frameColor, không đổi class/layout
  content = content.replace(
    /<img(?![^>]*style=)([^>]*className="[^"]*object-cover[^"]*"[^>]*)>/,
    `<img style={dogImageStyle}$1>`
  );

  content = content.replace(
    /<video(?![^>]*style=)([^>]*className="[^"]*object-cover[^"]*"[^>]*)>/,
    `<video style={dogImageStyle}$1>`
  );

  return content;
}

/* Client card */
const clientPath = path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx");

if (fs.existsSync(clientPath)) {
  let content = fs.readFileSync(clientPath, "utf8");

  content = ensureImport(content, "../../lib/dogTheme");
  content = injectDogStyles(content, "DogProfileCard");
  content = applyStylesOnly(content);

  fs.writeFileSync(clientPath, content, "utf8");
  console.log("Đã patch DogProfileCard: giữ UI cũ, chỉ thêm màu card/frame.");
}

/* Admin list card */
const adminListPath = path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx");

if (fs.existsSync(adminListPath)) {
  let content = fs.readFileSync(adminListPath, "utf8");

  content = ensureImport(content, "../../lib/dogTheme");
  content = injectDogStyles(content, "DogCard");
  content = applyStylesOnly(content);

  fs.writeFileSync(adminListPath, content, "utf8");
  console.log("Đã patch DogListPanel: giữ UI cũ, chỉ thêm màu card/frame.");
}
