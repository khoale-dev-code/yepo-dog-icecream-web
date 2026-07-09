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

const neededFields = [
  "instagram",
  "instagramUrl",
  "googleMapsEmbedUrl",
  "googleMapEmbedUrl",
  "googleMapsUrl",
  "mapEmbedUrl",
  "heroImages",
  "heroImagePosition",
];

function ensureModelFields() {
  const files = walk("server");

  const modelFile = files.find((file) => {
    const code = fs.readFileSync(file, "utf8");
    return (
      code.includes("mongoose") &&
      code.includes("heroImageUrl") &&
      (code.includes("Shop") || code.includes("shopSchema"))
    );
  });

  if (!modelFile) {
    console.warn("Không tìm thấy Shop model. Bỏ qua patch model.");
    return;
  }

  let code = fs.readFileSync(modelFile, "utf8");

  const fieldsBlock = `
  instagram: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
  googleMapsEmbedUrl: { type: String, default: "" },
  googleMapEmbedUrl: { type: String, default: "" },
  googleMapsUrl: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
  heroImagePosition: { type: String, default: "center center" },
  heroImages: [
    {
      url: { type: String, default: "" },
      secureUrl: { type: String, default: "" },
      alt: { type: String, default: "" },
      objectPosition: { type: String, default: "center center" },
      sortOrder: { type: Number, default: 999 },
    },
  ],
`;

  if (!code.includes("googleMapsEmbedUrl") || !code.includes("heroImages")) {
    if (code.includes("heroImageUrl")) {
      code = code.replace(
        /heroImageUrl\s*:\s*[^,\n}]+,?/,
        (match) => `${match}
${fieldsBlock}`
      );
    } else {
      code = code.replace(
        /new\s+mongoose\.Schema\s*\(\s*\{/,
        (match) => `${match}
${fieldsBlock}`
      );
    }

    fs.writeFileSync(modelFile, code);
    console.log("✅ Patched Shop model:", modelFile);
  } else {
    console.log("✅ Shop model already has fields:", modelFile);
  }
}

function patchAllowListsAndPayloads() {
  const files = walk("server");

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");
    const original = code;

    if (!code.includes("heroImageUrl") && !code.includes("googleMapsEmbedUrl") && !code.includes("instagram")) {
      continue;
    }

    for (const quote of ['"', "'"]) {
      const token = quote + "heroImageUrl" + quote;

      if (code.includes(token)) {
        const inject = neededFields
          .map((field) => quote + field + quote)
          .filter((fieldToken) => !code.includes(fieldToken))
          .join(", ");

        if (inject) {
          code = code.replace(token, token + ", " + inject);
        }
      }
    }

    if (code !== original) {
      fs.writeFileSync(file, code);
      console.log("✅ Patched possible shop allow-list:", file);
    }
  }
}

ensureModelFields();
patchAllowListsAndPayloads();
