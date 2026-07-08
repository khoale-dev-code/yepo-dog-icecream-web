const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

function replaceFunction(source, names, replacement) {
  for (const name of names) {
    const index = source.indexOf(name);
    if (index === -1) continue;

    const braceStart = source.indexOf("{", index);
    if (braceStart === -1) continue;

    let depth = 0;

    for (let i = braceStart; i < source.length; i++) {
      if (source[i] === "{") depth += 1;
      if (source[i] === "}") depth -= 1;

      if (depth === 0) {
        return source.slice(0, index) + replacement + source.slice(i + 1);
      }
    }
  }

  return source + "\n\n" + replacement + "\n";
}

const helpers = `
function getDogPayloadMediaUrl(media) {
  return String(
    media?.url ||
      media?.secureUrl ||
      media?.secure_url ||
      media?.imageUrl ||
      ""
  );
}

function isDogPayloadVideo(media) {
  const type = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = getDogPayloadMediaUrl(media).toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getDogPayloadRemoveKey(media) {
  return String(
    media?.publicId ||
      media?.public_id ||
      media?.url ||
      media?.secureUrl ||
      media?.secure_url ||
      media?.imageUrl ||
      ""
  );
}

function normalizeDogPayloadMedia(media = []) {
  return (Array.isArray(media) ? media : [])
    .map((item, index) => {
      const url = getDogPayloadMediaUrl(item);
      if (!url) return null;

      const isVideo = isDogPayloadVideo(item);

      return {
        ...item,
        url,
        secureUrl: item?.secureUrl || item?.secure_url || url,
        publicId: item?.publicId || item?.public_id || "",
        resourceType: isVideo ? "video" : "image",
        type: isVideo ? "video" : "image",
        originalName: item?.originalName || item?.name || "Dog media " + (index + 1),
        sortOrder: index + 1,
        order: index + 1,
      };
    })
    .filter(Boolean);
}

function pickDogPayloadCover(media = []) {
  const firstImage = media.find((item) => !isDogPayloadVideo(item)) || media[0];
  return firstImage ? getDogPayloadMediaUrl(firstImage) : "";
}
`;

if (!content.includes("function getDogPayloadMediaUrl")) {
  content = helpers + "\n" + content;
}

const createEmptyDogForm = `export function createEmptyDogForm(nextSortOrder = 1) {
  return {
    name: "",
    nickname: "",
    age: "",
    breed: "",
    gender: "unknown",
    birthday: "",
    weightKg: "",
    colorTheme: "pink",
    coatColors: [{ name: "", hex: "#ffffff" }],
    coatColor: "",
    coatPattern: "solid",
    coatPatternDescription: "",
    personality: "",
    personalityTags: "",
    favoriteTreat: "",
    favoriteTreats: "",
    cutenessLevel: "100",
    interactionNote: "",
    sortOrder: String(nextSortOrder || 1),
    isFeatured: false,
    isActive: true,
    coverMediaKey: "",
    imageUrl: "",
    media: [],
    images: [],
    mediaOrder: [],
    removedExistingMediaKeys: [],
  };
}`;

content = replaceFunction(
  content,
  ["export function createEmptyDogForm", "function createEmptyDogForm"],
  createEmptyDogForm
);

const mapDogToForm = `export function mapDogToForm(dog = {}, nextSortOrder = 1) {
  const media = normalizeDogPayloadMedia(dog.media || dog.images || []);
  const imageUrl = dog.imageUrl || pickDogPayloadCover(media);

  return {
    name: dog.name || "",
    nickname: dog.nickname || "",
    age: dog.age || "",
    breed: dog.breed || "",
    gender: dog.gender || "unknown",
    birthday: dog.birthday || "",
    weightKg: dog.weightKg ?? "",
    colorTheme: dog.colorTheme || "pink",
    coatColors:
      Array.isArray(dog.coatColors) && dog.coatColors.length
        ? dog.coatColors
        : [{ name: dog.coatColor || "", hex: "#ffffff" }],
    coatColor: dog.coatColor || "",
    coatPattern: dog.coatPattern || "solid",
    coatPatternDescription: dog.coatPatternDescription || "",
    personality: dog.personality || "",
    personalityTags: Array.isArray(dog.personalityTags)
      ? dog.personalityTags.join(", ")
      : dog.personalityTags || "",
    favoriteTreat: dog.favoriteTreat || "",
    favoriteTreats: Array.isArray(dog.favoriteTreats)
      ? dog.favoriteTreats.join(", ")
      : dog.favoriteTreats || "",
    cutenessLevel: String(dog.cutenessLevel ?? 100),
    interactionNote: dog.interactionNote || "",
    sortOrder: String(dog.sortOrder || nextSortOrder || 1),
    isFeatured: Boolean(dog.isFeatured),
    isActive: dog.isActive !== false,
    coverMediaKey: dog.coverMediaKey || (imageUrl ? "existing:" + imageUrl : ""),
    imageUrl,
    media,
    images: media,
    mediaOrder: media.map((item) => "existing:" + getDogPayloadMediaUrl(item)),
    removedExistingMediaKeys: [],
  };
}`;

content = replaceFunction(
  content,
  ["export function mapDogToForm", "function mapDogToForm"],
  mapDogToForm
);

const buildDogPayload = `export function buildDogPayload(form = {}, media = []) {
  const removedKeys = new Set(
    Array.isArray(form.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys.map(String)
      : []
  );

  const normalizedMedia = normalizeDogPayloadMedia(media).filter((item) => {
    const key = getDogPayloadRemoveKey(item);
    return !key || !removedKeys.has(key);
  });

  const imageUrl = pickDogPayloadCover(normalizedMedia);

  return {
    name: String(form.name || "").trim(),
    nickname: String(form.nickname || "").trim(),
    age: String(form.age || "").trim(),
    breed: String(form.breed || "").trim(),
    gender: form.gender || "unknown",
    birthday: form.birthday || "",
    weightKg:
      form.weightKg === "" || form.weightKg === null || form.weightKg === undefined
        ? undefined
        : Number(form.weightKg),
    colorTheme: form.colorTheme || "pink",
    coatColors:
      Array.isArray(form.coatColors) && form.coatColors.length
        ? form.coatColors
        : [{ name: "", hex: "#ffffff" }],
    coatColor:
      form.coatColor ||
      (Array.isArray(form.coatColors) && form.coatColors[0]
        ? form.coatColors[0].name
        : ""),
    coatPattern: form.coatPattern || "solid",
    coatPatternDescription: String(form.coatPatternDescription || "").trim(),
    personality: String(form.personality || "").trim(),
    personalityTags: Array.isArray(form.personalityTags)
      ? form.personalityTags
      : String(form.personalityTags || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    favoriteTreat: String(form.favoriteTreat || "").trim(),
    favoriteTreats: Array.isArray(form.favoriteTreats)
      ? form.favoriteTreats
      : String(form.favoriteTreats || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
    cutenessLevel: Number(form.cutenessLevel || 100),
    interactionNote: String(form.interactionNote || "").trim(),
    sortOrder: Number(form.sortOrder || 1),
    isFeatured: Boolean(form.isFeatured),
    isActive: form.isActive !== false,
    coverMediaKey: form.coverMediaKey || (imageUrl ? "existing:" + imageUrl : ""),
    imageUrl,
    media: normalizedMedia,
    images: normalizedMedia,
    mediaOrder: Array.isArray(form.mediaOrder) ? form.mediaOrder : [],
    removedExistingMediaKeys: Array.from(removedKeys),
  };
}`;

content = replaceFunction(
  content,
  ["export function buildDogPayload", "function buildDogPayload"],
  buildDogPayload
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã fix dogUtils: create/map/build payload đầy đủ media + colorTheme.");
