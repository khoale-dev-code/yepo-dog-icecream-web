const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/toppings/toppingUtils.js");

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /export function buildToppingPayload\(form\) \{[\s\S]*?\n\}/,
  `export function buildToppingPayload(form) {
  const media = normalizeToppingMedia(form.media);
  const imageUrl = String(form.imageUrl || getToppingImage({ ...form, media }) || "").trim();

  const nextMedia =
    imageUrl && media.length === 0
      ? [
          {
            url: imageUrl,
            publicId: "",
            resourceType: "image",
            originalName: "URL image",
          },
        ]
      : media;

  return {
    name: String(form.name || "").trim(),
    description: String(form.description || "").trim(),
    price: Number(form.price || 0),
    imageUrl,
    image: imageUrl,
    thumbnailUrl: imageUrl,
    media: nextMedia,
    sortOrder: Number(form.sortOrder || 999),
    isAvailable: form.isAvailable !== false,
    isActive: form.isActive !== false,
  };
}`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Patched toppingUtils buildToppingPayload.");
