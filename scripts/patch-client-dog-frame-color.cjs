const fs = require("fs");
const path = require("path");

const root = path.resolve(process.cwd(), "src");

function walk(dir) {
  const out = [];

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(item.name)) continue;
      out.push(...walk(full));
    } else if (/\.(jsx|js)$/.test(item.name)) {
      out.push(full);
    }
  }

  return out;
}

const files = walk(root);
const targets = files.filter((file) => {
  const content = fs.readFileSync(file, "utf8");
  return (
    content.includes("BẤM ĐỂ XEM CHI TIẾT") ||
    content.includes("Bấm để xem chi tiết") ||
    content.includes("bấm để xem chi tiết") ||
    content.includes("BAM DE XEM CHI TIET")
  );
});

if (!targets.length) {
  console.log("Không tìm thấy file client chứa text BẤM ĐỂ XEM CHI TIẾT.");
  console.log("Chạy lệnh này để tìm thủ công:");
  console.log('Select-String -Path src\\**\\*.jsx -Pattern "BẤM ĐỂ XEM CHI TIẾT","Bấm để xem chi tiết","ID:"');
  process.exit(0);
}

for (const filePath of targets) {
  let content = fs.readFileSync(filePath, "utf8");
  const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");

  console.log("Đang patch:", relative);

  const depth = relative
    .replace(/^src\//, "")
    .split("/")
    .slice(0, -1).length;

  const importPath = depth === 1 ? "../lib/dogTheme" : "../".repeat(depth) + "lib/dogTheme";

  if (!content.includes("getDogMediaFrameStyle") && !content.includes("from \"" + importPath + "\"")) {
    content = content.replace(
      /import\s+[^;]+;/,
      (match) =>
        match +
        `\nimport { getDogCardStyle, getDogMediaFrameStyle, getDogImageRingStyle, getDogThemeColor, getDogFrameColor } from "${importPath}";`
    );
  }

  if (!content.includes("getClientDogCardStyle")) {
    content = content.replace(
      /(?:export\s+default\s+)?function\s+([A-Z][A-Za-z0-9_]*)\s*\(/,
      (match) =>
        `function getClientDogCardStyle(dog) {
  return getDogCardStyle(dog);
}

function getClientDogFrameStyle(dog) {
  return getDogMediaFrameStyle(dog);
}

function getClientDogImageStyle(dog) {
  return getDogImageRingStyle(dog);
}

function getClientDogThemeDots(dog) {
  return {
    cardColor: getDogThemeColor(dog),
    frameColor: getDogFrameColor(dog),
  };
}

` + match
    );
  }

  /*
    Tìm đoạn map dog => (...) để khai báo style.
    Nếu file đã có dog trong scope nhưng không qua .map thì vẫn có thể cần sửa tay.
  */
  if (!content.includes("const clientDogFrameStyle = getClientDogFrameStyle(dog);")) {
    content = content.replace(
      /\.map\(\(dog\)\s*=>\s*\(/g,
      `.map((dog) => {
              const clientDogCardStyle = getClientDogCardStyle(dog);
              const clientDogFrameStyle = getClientDogFrameStyle(dog);
              const clientDogImageStyle = getClientDogImageStyle(dog);
              const clientDogDots = getClientDogThemeDots(dog);

              return (`
    );

    content = content.replace(
      /\)\s*\)\s*\}/g,
      `)
            })`
    );
  }

  /*
    Thêm style vào article/card ngoài nếu chưa có.
  */
  content = content.replace(
    /<article(?![^>]*style=)([^>]*className=)/g,
    `<article style={clientDogCardStyle}$1`
  );

  /*
    Thêm style vào khung ảnh. Ưu tiên div có aspect-square hoặc overflow-hidden ngay quanh ảnh.
  */
  content = content.replace(
    /<div(?![^>]*style=)([^>]*className="[^"]*(?:aspect-square|overflow-hidden)[^"]*")/g,
    `<div style={clientDogFrameStyle}$1`
  );

  /*
    Thêm ring style cho img/video để viền trong nhìn rõ.
  */
  content = content.replace(
    /<img(?![^>]*style=)([^>]*className="[^"]*object-cover[^"]*")/g,
    `<img style={clientDogImageStyle}$1`
  );

  content = content.replace(
    /<video(?![^>]*style=)([^>]*className="[^"]*object-cover[^"]*")/g,
    `<video style={clientDogImageStyle}$1`
  );

  /*
    Nếu card có dot màu, thêm biến để dễ hiển thị đúng màu sau này.
  */
  if (!content.includes("clientDogDots.frameColor")) {
    content = content.replace(
      /title=\{["']Màu khung[^}]*\}/g,
      `title={"Màu khung: " + clientDogDots.frameColor}`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
}

console.log("Đã patch client card để dùng dog.frameColor cho khung bên trong.");
