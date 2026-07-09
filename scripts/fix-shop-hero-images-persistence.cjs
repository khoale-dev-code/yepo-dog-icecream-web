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

    if (/\.(jsx|js|mjs|cjs)$/.test(item.name)) files.push(full);
  }

  return files;
}

function patchShopViewSubmit() {
  const files = walk("src");

  const shopViewFile = files.find((file) => {
    const code = fs.readFileSync(file, "utf8");
    return (
      code.includes("export function ShopView") &&
      code.includes("HeroImagesManager") &&
      code.includes("heroImages")
    );
  });

  if (!shopViewFile) {
    console.warn("⚠️ Không tìm thấy ShopView mới có HeroImagesManager.");
    return;
  }

  let code = fs.readFileSync(shopViewFile, "utf8");

  if (!code.includes("function buildShopSavePayload")) {
    code = code.replace(
      "export function ShopView",
      `function buildShopSavePayload(form) {
  const heroImages = normalizeHeroImages(form).map((item, index) => ({
    id: item.id || \`hero-\${index + 1}\`,
    url: item.url || "",
    secureUrl: item.secureUrl || item.url || "",
    alt: item.alt || form?.name || "YEPO hero",
    objectPosition: item.objectPosition || "center center",
    sortOrder: index + 1,
  }));

  const instagram = getInstagramValue(form);
  const googleMapsEmbedUrl = getGoogleMapsValue(form);
  const primaryHero = heroImages[0];

  return {
    ...form,

    instagram,
    instagramUrl: instagram,

    googleMapsEmbedUrl,
    googleMapEmbedUrl: googleMapsEmbedUrl,
    googleMapsUrl: googleMapsEmbedUrl,
    mapEmbedUrl: googleMapsEmbedUrl,

    heroImages,
    heroImageUrl: primaryHero?.url || form?.heroImageUrl || "",
    heroImagePosition:
      primaryHero?.objectPosition ||
      form?.heroImagePosition ||
      "center center",
  };
}

export function ShopView`
    );
  }

  if (!code.includes("function handleShopViewSubmit")) {
    code = code.replace(
      "  function moveHeroImage(fromIndex, toIndex) {",
      `  function handleShopViewSubmit(event) {
    event.preventDefault();

    const payload = buildShopSavePayload(form);

    setForm(payload);

    window.requestAnimationFrame(() => {
      onSubmit?.(event, payload);
    });
  }

  function moveHeroImage(fromIndex, toIndex) {`
    );
  }

  code = code.replace(
    /<form\s+onSubmit=\{onSubmit\}/,
    '<form onSubmit={handleShopViewSubmit}'
  );

  fs.writeFileSync(shopViewFile, code);
  console.log("✅ Patched ShopView submit payload:", shopViewFile);
}

function patchShopViewParent() {
  const files = walk("src");

  const parentFiles = files.filter((file) => {
    const code = fs.readFileSync(file, "utf8");
    return code.includes("<ShopView") && code.includes("onSubmit=");
  });

  for (const file of parentFiles) {
    let code = fs.readFileSync(file, "utf8");
    const original = code;

    const formPropMatch = code.match(/<ShopView[\s\S]*?form=\{([A-Za-z0-9_$]+)\}[\s\S]*?onSubmit=\{([A-Za-z0-9_$]+)\}/);
    if (!formPropMatch) continue;

    const formName = formPropMatch[1];
    const handlerName = formPropMatch[2];

    const functionRegex = new RegExp(
      `(async\\s+function\\s+${handlerName}\\s*\\()([^)]*)(\\)\\s*\\{)`,
      "m"
    );

    const arrowRegex = new RegExp(
      `(const\\s+${handlerName}\\s*=\\s*async\\s*\\()([^)]*)(\\)\\s*=>\\s*\\{)`,
      "m"
    );

    if (functionRegex.test(code)) {
      code = code.replace(functionRegex, `$1$2, overrideShopForm$3`);
    } else if (arrowRegex.test(code)) {
      code = code.replace(arrowRegex, `$1$2, overrideShopForm$3`);
    } else {
      continue;
    }

    code = code.replace(/,\s*,/g, ",");

    const marker = `const submittedShopForm = overrideShopForm || ${formName};`;

    if (!code.includes(marker)) {
      const handlerStartRegex = new RegExp(
        `((?:async\\s+function\\s+${handlerName}|const\\s+${handlerName}\\s*=\\s*async)[\\s\\S]*?\\{)`,
        "m"
      );

      code = code.replace(
        handlerStartRegex,
        `$1
    ${marker}`
      );
    }

    const handlerBodyRegex = new RegExp(
      `((?:async\\s+function\\s+${handlerName}|const\\s+${handlerName}\\s*=\\s*async)[\\s\\S]*?)(api\\.|fetch\\()`,
      "m"
    );

    if (handlerBodyRegex.test(code) && !code.includes("heroImages: submittedShopForm.heroImages")) {
      code = code.replace(
        handlerBodyRegex,
        `$1
    const shopSavePayload = {
      ...submittedShopForm,
      instagram: submittedShopForm.instagram || submittedShopForm.instagramUrl || "",
      instagramUrl: submittedShopForm.instagram || submittedShopForm.instagramUrl || "",
      googleMapsEmbedUrl:
        submittedShopForm.googleMapsEmbedUrl ||
        submittedShopForm.googleMapEmbedUrl ||
        submittedShopForm.googleMapsUrl ||
        submittedShopForm.mapEmbedUrl ||
        "",
      googleMapEmbedUrl:
        submittedShopForm.googleMapsEmbedUrl ||
        submittedShopForm.googleMapEmbedUrl ||
        submittedShopForm.googleMapsUrl ||
        submittedShopForm.mapEmbedUrl ||
        "",
      googleMapsUrl:
        submittedShopForm.googleMapsEmbedUrl ||
        submittedShopForm.googleMapEmbedUrl ||
        submittedShopForm.googleMapsUrl ||
        submittedShopForm.mapEmbedUrl ||
        "",
      mapEmbedUrl:
        submittedShopForm.googleMapsEmbedUrl ||
        submittedShopForm.googleMapEmbedUrl ||
        submittedShopForm.googleMapsUrl ||
        submittedShopForm.mapEmbedUrl ||
        "",
      heroImages: Array.isArray(submittedShopForm.heroImages)
        ? submittedShopForm.heroImages
        : [],
      heroImageUrl:
        Array.isArray(submittedShopForm.heroImages) && submittedShopForm.heroImages[0]?.url
          ? submittedShopForm.heroImages[0].url
          : submittedShopForm.heroImageUrl || "",
      heroImagePosition:
        Array.isArray(submittedShopForm.heroImages) && submittedShopForm.heroImages[0]?.objectPosition
          ? submittedShopForm.heroImages[0].objectPosition
          : submittedShopForm.heroImagePosition || "center center",
    };

    $2`
      );
    }

    code = code
      .replace(new RegExp(`\\b${formName}\\b`, "g"), (match, offset) => {
        const before = code.slice(Math.max(0, offset - 80), offset);
        const after = code.slice(offset, offset + 120);

        if (before.includes("<ShopView")) return match;
        if (after.includes("setForm")) return match;
        if (before.includes("form={")) return match;

        return match;
      })
      .replace(/api\.([A-Za-z0-9_$]+)\((shopSavePayload|submittedShopForm|[A-Za-z0-9_$]+)\)/g, (match, method, arg) => {
        if (match.includes("shopSavePayload")) return match;

        if (
          method.toLowerCase().includes("shop") ||
          method.toLowerCase().includes("store")
        ) {
          return `api.${method}(shopSavePayload)`;
        }

        return match;
      });

    if (code !== original) {
      fs.writeFileSync(file, code);
      console.log("✅ Patched ShopView parent submit:", file);
    }
  }
}

function patchShopModel() {
  const files = walk("server");

  const modelFile = files.find((file) => {
    const code = fs.readFileSync(file, "utf8");
    return (
      code.includes("mongoose") &&
      code.includes("heroImageUrl") &&
      (code.includes("shopSchema") || code.includes("Shop"))
    );
  });

  if (!modelFile) {
    console.warn("⚠️ Không tìm thấy Shop model.");
    return;
  }

  let code = fs.readFileSync(modelFile, "utf8");

  const insertFields = `
  instagram: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
  googleMapsEmbedUrl: { type: String, default: "" },
  googleMapEmbedUrl: { type: String, default: "" },
  googleMapsUrl: { type: String, default: "" },
  mapEmbedUrl: { type: String, default: "" },
  heroImagePosition: { type: String, default: "center center" },
  heroImages: [
    {
      id: { type: String, default: "" },
      url: { type: String, default: "" },
      secureUrl: { type: String, default: "" },
      alt: { type: String, default: "" },
      objectPosition: { type: String, default: "center center" },
      sortOrder: { type: Number, default: 999 },
    },
  ],
`;

  if (!code.includes("heroImages")) {
    code = code.replace(
      /heroImageUrl\s*:\s*[^,\n}]+,?/,
      (match) => `${match}
${insertFields}`
    );
  }

  fs.writeFileSync(modelFile, code);
  console.log("✅ Patched Shop model:", modelFile);
}

function patchServerAllowLists() {
  const files = walk("server");

  const fields = [
    "instagram",
    "instagramUrl",
    "googleMapsEmbedUrl",
    "googleMapEmbedUrl",
    "googleMapsUrl",
    "mapEmbedUrl",
    "heroImages",
    "heroImagePosition",
  ];

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");
    const original = code;

    if (
      !code.includes("heroImageUrl") &&
      !code.includes("instagram") &&
      !code.includes("googleMaps")
    ) {
      continue;
    }

    code = code.replace(
      /\[([\s\S]*?["']heroImageUrl["'][\s\S]*?)\]/g,
      (match, body) => {
        let next = body;

        for (const field of fields) {
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

        for (const field of fields) {
          if (!new RegExp(`\\b${field}\\b`).test(next)) {
            next += `,\n    ${field}`;
          }
        }

        return `const {${next}} = req.body`;
      }
    );

    if (code !== original) {
      fs.writeFileSync(file, code);
      console.log("✅ Patched server shop allow-list:", file);
    }
  }
}

patchShopViewSubmit();
patchShopViewParent();
patchShopModel();
patchServerAllowLists();
