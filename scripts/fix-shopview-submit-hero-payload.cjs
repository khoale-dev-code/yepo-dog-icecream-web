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

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

const shopViewPath = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");
  return (
    code.includes("export function ShopView") &&
    code.includes("HeroImagesManager") &&
    code.includes("heroImages")
  );
});

if (!shopViewPath) {
  throw new Error("Không tìm thấy ShopView đang dùng heroImages.");
}

let code = fs.readFileSync(shopViewPath, "utf8");

if (!code.includes('from "react-dom"') && !code.includes("from 'react-dom'")) {
  code = code.replace(
    /import\s+\{\s*useMemo,\s*useState\s*\}\s+from\s+["']react["'];?/,
    (match) => `${match}\nimport { flushSync } from "react-dom";`
  );
}

if (!code.includes("function buildShopSubmitPayload")) {
  code = code.replace(
    "export function ShopView",
    `function buildShopSubmitPayload(form) {
  const heroImages = normalizeHeroImages(form).map((item, index) => ({
    id: item.id || \`hero-\${index + 1}\`,
    url: item.url || "",
    secureUrl: item.secureUrl || item.url || "",
    alt: item.alt || form?.name || "YEPO hero",
    objectPosition: item.objectPosition || "center center",
    sortOrder: index + 1,
  }));

  const primaryHero = heroImages[0];
  const instagram = getInstagramValue(form);
  const googleMapsEmbedUrl = getGoogleMapsValue(form);

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

if (!code.includes("function handleShopSubmit")) {
  code = code.replace(
    "  function moveHeroImage(fromIndex, toIndex) {",
    `  function handleShopSubmit(event) {
    event.preventDefault();

    const payload = buildShopSubmitPayload(form);

    flushSync(() => {
      setForm(payload);
    });

    onSubmit?.(event, payload);
  }

  function moveHeroImage(fromIndex, toIndex) {`
  );
}

code = code.replace(
  /<form\s+onSubmit=\{onSubmit\}/,
  '<form onSubmit={handleShopSubmit}'
);

fs.writeFileSync(shopViewPath, code, "utf8");

console.log("✅ Patched ShopView submit payload:", shopViewPath);
