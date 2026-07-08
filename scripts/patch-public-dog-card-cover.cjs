const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("function isVideoMedia")) {
  content = content.replace(
    "function cn(...classes) {",
    `function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function cn(...classes) {`
  );
}

content = content.replace(
  /function getDogImage\(dog\) \{[\s\S]*?\n\}/,
  `function getDogImage(dog) {
  if (dog?.imageUrl) return dog.imageUrl;

  if (Array.isArray(dog?.media) && dog.media.length > 0) {
    const firstImage = dog.media.find((item) => !isVideoMedia(item));
    return firstImage?.url || null;
  }

  return null;
}`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched public DogProfileCard.");
