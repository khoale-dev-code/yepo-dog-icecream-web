const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(js|mjs|cjs)$/.test(item.name)) files.push(full);
  }

  return files;
}

function backup(file) {
  const backupFile = `${file}.bak-shop-links`;
  if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(file, backupFile);
  }
}

const linkFields = [
  "instagram",
  "instagramUrl",
  "googleMapsEmbedUrl",
  "googleMapEmbedUrl",
  "googleMapsUrl",
  "mapEmbedUrl",
];

function patchShopModel() {
  const files = walk("server");

  const modelFile = files.find((file) => {
    const code = fs.readFileSync(file, "utf8");
    return (
      code.includes("mongoose") &&
      code.includes("heroImageUrl") &&
      /shop/i.test(file)
    );
  });

  if (!modelFile) {
    console.warn("Không tìm thấy Shop model. Bỏ qua bước model.");
    return;
  }

  let code = fs.readFileSync(modelFile, "utf8");
  const original = code;

  backup(modelFile);

  const fieldBlock = `
  instagram: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
  googleMapsEmbedUrl: { type: String, default: "" },
  googleMapEmbedUrl: { type: String, default: "" },
  googleMapsUrl: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
`;

  if (!code.includes("googleMapsEmbedUrl")) {
    code = code.replace(
      /heroImageUrl\s*:\s*[^,\n}]+,?/,
      (match) => `${match}
${fieldBlock}`
    );
  }

  if (code !== original) {
    fs.writeFileSync(modelFile, code);
    console.log("✅ Patched Shop model:", modelFile);
  } else {
    console.log("✅ Shop model đã có field link:", modelFile);
  }
}

function patchShopRoutes() {
  const files = walk("server").filter((file) => {
    const code = fs.readFileSync(file, "utf8");
    return /shop|store/i.test(file) && (
      code.includes("heroImageUrl") ||
      code.includes("instagram") ||
      code.includes("googleMaps")
    );
  });

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");
    const original = code;

    backup(file);

    code = code.replace(
      /\[([\s\S]*?["']heroImageUrl["'][\s\S]*?)\]/g,
      (match, body) => {
        let next = body;

        for (const field of linkFields) {
          if (!next.includes(`"${field}"`) && !next.includes(`'${field}'`)) {
            next += `, "${field}"`;
          }
        }

        return `[${next}]`;
      }
    );

    code = code.replace(
      /const\s+\{([\s\S]*?heroImageUrl[\s\S]*?)\}\s*=\s*req\.body/g,
      (match, body) => {
        let next = body;

        for (const field of linkFields) {
          if (!new RegExp(`\\b${field}\\b`).test(next)) {
            next += `,\n    ${field}`;
          }
        }

        return `const {${next}} = req.body`;
      }
    );

    if (code !== original) {
      fs.writeFileSync(file, code);
      console.log("✅ Patched route:", file);
    }
  }
}

patchShopModel();
patchShopRoutes();
