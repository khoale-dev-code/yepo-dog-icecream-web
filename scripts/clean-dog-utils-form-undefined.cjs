const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

function replaceFunction(source, functionName, replacement) {
  const patterns = [
    "export function " + functionName,
    "function " + functionName,
  ];

  let start = -1;

  for (const pattern of patterns) {
    start = source.indexOf(pattern);
    if (start !== -1) break;
  }

  if (start === -1) {
    return source + "\n\n" + replacement + "\n";
  }

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) {
    throw new Error("Không tìm thấy dấu { của " + functionName);
  }

  let depth = 0;

  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Không tìm thấy kết thúc hàm " + functionName);
}

if (!content.includes("function getDogMediaUrlForPayload")) {
  content =
`function getDogMediaUrlForPayload(media) {
  return String(
    media?.url ||
      media?.secureUrl ||
      media?.secure_url ||
      media?.imageUrl ||
      ""
  );
}

function isDogVideoForPayload(media) {
  const type = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = getDogMediaUrlForPayload(media).toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function normalizeDogMediaForPayload(media = []) {
  return (Array.isArray(media) ? media : [])
    .map((item, index) => {
      const url = getDogMediaUrlForPayload(item);
      if (!url) return null;

      const isVideo = isDogVideoForPayload(item);

      return {
        ...item,
        url,
        secureUrl: item?.secureUrl || item?.secure_url || url,
        publicId: item?.publicId || item?.public_id || "",
        resourceType: isVideo ? "video" : "image",
        type: isVideo ? "video" : "image",
        originalName:
          item?.originalName || item?.name || "Dog media " + (index + 1),
        sortOrder: index + 1,
        order: index + 1,
      };
    })
    .filter(Boolean);
}

function pickDogCoverImageUrl(media = []) {
  const firstImage = media.find((item) => !isDogVideoForPayload(item)) || media[0];
  return firstImage ? getDogMediaUrlForPayload(firstImage) : "";
}

function getDogRemoveKeyForPayload(media) {
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

` + content;
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

const mapDogToForm = `export function mapDogToForm(dog = {}, nextSortOrder = 1) {
  const media = normalizeDogMediaForPayload(dog.media || dog.images || []);
  const imageUrl = dog.imageUrl || pickDogCoverImageUrl(media);

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
    mediaOrder: media.map((item) => "existing:" + getDogMediaUrlForPayload(item)),
    removedExistingMediaKeys: [],
  };
}`;

const buildDogPayload = `export function buildDogPayload(form = {}, media = []) {
  const removedKeys = new Set(
    Array.isArray(form.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys.map(String)
      : []
  );

  const normalizedMedia = normalizeDogMediaForPayload(media).filter((item) => {
    const key = getDogRemoveKeyForPayload(item);
    return !key || !removedKeys.has(key);
  });

  const imageUrl = pickDogCoverImageUrl(normalizedMedia);

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

content = replaceFunction(content, "createEmptyDogForm", createEmptyDogForm);
content = replaceFunction(content, "mapDogToForm", mapDogToForm);
content = replaceFunction(content, "buildDogPayload", buildDogPayload);

// Kiểm tra lại: createEmptyDogForm tuyệt đối không được còn form.
const createStart = content.indexOf("export function createEmptyDogForm");
const createEnd = content.indexOf("export function mapDogToForm", createStart);
const createBlock = content.slice(createStart, createEnd);

if (createBlock.includes("form.")) {
  throw new Error("createEmptyDogForm vẫn còn form. Patch chưa sạch.");
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã sửa sạch dogUtils: createEmptyDogForm không còn form undefined.");
