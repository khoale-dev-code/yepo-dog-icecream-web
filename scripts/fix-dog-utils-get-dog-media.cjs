const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

const addition = `

export function getDogMedia(dogOrMedia = {}) {
  if (Array.isArray(dogOrMedia)) {
    return normalizeDogMedia(dogOrMedia);
  }

  const media = dogOrMedia?.media || dogOrMedia?.images || [];

  const normalizedMedia = normalizeDogMedia(media);

  if (normalizedMedia.length > 0) {
    return normalizedMedia;
  }

  const fallbackUrl =
    dogOrMedia?.imageUrl ||
    dogOrMedia?.image ||
    dogOrMedia?.photoUrl ||
    dogOrMedia?.thumbnailUrl ||
    "";

  return fallbackUrl
    ? normalizeDogMedia([
        {
          url: fallbackUrl,
          resourceType: "image",
          type: "image",
          originalName: "Ảnh đại diện",
        },
      ])
    : [];
}

export function getDogCoverMedia(dog = {}) {
  const media = getDogMedia(dog);
  return media.find((item) => !isDogVideoMedia(item)) || media[0] || null;
}
`;

if (!content.includes("export function getDogMedia")) {
  content += addition;
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm getDogMedia/getDogCoverMedia vào dogUtils.js");
