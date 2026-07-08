const fs = require("fs");
const path = require("path");

function writeFile(relativePath, content) {
  fs.writeFileSync(path.resolve(process.cwd(), relativePath), content, "utf8");
  console.log("Updated", relativePath);
}

function patchDogModel() {
  const filePath = path.resolve(process.cwd(), "server/models/Dog.js");
  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("colorTheme")) {
    content = content.replace(
      /(\s+breed:\s*\{[\s\S]*?\n\s+\},)\s*\n\s+coatColor:/,
      `$1

    colorTheme: {
      type: String,
      default: "pink",
      trim: true,
    },

    coatColor:`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched server/models/Dog.js");
}

patchDogModel();

writeFile("src/admin/dogs/dogUtils.js", `export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getId(item) {
  return item?._id || item?.id || "";
}

export function isVideoMedia(media) {
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

export function getDogMedia(dog) {
  const media = Array.isArray(dog?.media) ? dog.media.filter((item) => item?.url) : [];

  if (media.length) return media;

  if (dog?.imageUrl) {
    return [
      {
        url: dog.imageUrl,
        resourceType: "image",
        originalName: dog.name || "Cún",
      },
    ];
  }

  return [];
}

export function getDogImage(dog) {
  if (dog?.imageUrl) return dog.imageUrl;

  const firstImage = getDogMedia(dog).find((media) => !isVideoMedia(media));

  return firstImage?.url || "";
}

export function getGenderLabel(gender) {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Chưa rõ";
}

export function getPatternLabel(pattern) {
  const labels = {
    solid: "Một màu",
    "two-tone": "Hai màu",
    spotted: "Đốm",
    dotted: "Chấm bi",
    brindle: "Vện",
    mixed: "Pha màu",
    other: "Khác",
  };

  return labels[pattern] || "Một màu";
}

export function uniqueTags(items = []) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

export function collectDogSuggestions(dogs = [], field) {
  const values = [];

  dogs.forEach((dog) => {
    if (Array.isArray(dog[field])) {
      values.push(...dog[field]);
    }
  });

  if (field === "favoriteTreats") {
    dogs.forEach((dog) => {
      String(dog.favoriteTreat || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.push(item));
    });
  }

  if (field === "personalityTags") {
    dogs.forEach((dog) => {
      String(dog.personality || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => values.push(item));
    });
  }

  return uniqueTags(values);
}

export function createEmptyDogForm(sortOrder = 1) {
  return {
    name: "",
    nickname: "",
    age: "",
    breed: "",
    colorTheme: "pink",
    coverMediaKey: "",
    gender: "unknown",
    birthday: "",
    weightKg: "",
    coatColor: "",
    coatColors: [
      {
        name: "Nâu caramel",
        hex: "#b98c49",
      },
    ],
    coatPattern: "solid",
    coatPatternDescription: "",
    favoriteTreats: [],
    personalityTags: [],
    cutenessLevel: "70",
    interactionNote: "",
    sortOrder: String(sortOrder),
    isFeatured: true,
    isActive: true,
  };
}

export function mapDogToForm(dog) {
  const favoriteTreats =
    Array.isArray(dog.favoriteTreats) && dog.favoriteTreats.length
      ? dog.favoriteTreats
      : String(dog.favoriteTreat || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  const personalityTags =
    Array.isArray(dog.personalityTags) && dog.personalityTags.length
      ? dog.personalityTags
      : String(dog.personality || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

  return {
    name: dog.name || "",
    nickname: dog.nickname || "",
    age: dog.age || "",
    breed: dog.breed || "",
    colorTheme: dog.colorTheme || "pink",
    coverMediaKey: dog.imageUrl ? \`existing:\${dog.imageUrl}\` : "",
    gender: dog.gender || "unknown",
    birthday: dog.birthday || "",
    weightKg: dog.weightKg ? String(dog.weightKg) : "",
    coatColor: dog.coatColor || "",
    coatColors:
      Array.isArray(dog.coatColors) && dog.coatColors.length
        ? dog.coatColors
        : [
            {
              name: dog.coatColor || "Nâu caramel",
              hex: "#b98c49",
            },
          ],
    coatPattern: dog.coatPattern || "solid",
    coatPatternDescription: dog.coatPatternDescription || "",
    favoriteTreats,
    personalityTags,
    cutenessLevel: String(dog.cutenessLevel || 70),
    interactionNote: dog.interactionNote || "",
    sortOrder: String(dog.sortOrder ?? 999),
    isFeatured: dog.isFeatured === true,
    isActive: dog.isActive !== false,
  };
}

function resolveCoverImageUrl(form, media = [], existingMediaCount = 0) {
  const coverKey = String(form.coverMediaKey || "");

  if (coverKey.startsWith("existing:")) {
    const url = coverKey.replace("existing:", "");
    const selected = media.find((item) => item.url === url);

    if (selected && !isVideoMedia(selected)) return selected.url;
    if (!selected) return url;
  }

  if (coverKey.startsWith("new:")) {
    const newIndex = Number(coverKey.replace("new:", ""));
    const selected = media[existingMediaCount + newIndex];

    if (selected && !isVideoMedia(selected)) return selected.url;
  }

  const firstImage = media.find((item) => !isVideoMedia(item));

  return firstImage?.url || "";
}

export function buildDogPayload(form, media, existingMediaCount = 0) {
  const coatColors = form.coatColors
    .map((item) => ({
      name: String(item.name || "").trim(),
      hex: String(item.hex || "#b98c49").trim(),
    }))
    .filter((item) => item.name || item.hex);

  const favoriteTreats = form.favoriteTreats
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const personalityTags = form.personalityTags
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  const imageUrl = resolveCoverImageUrl(form, media, existingMediaCount);

  return {
    name: form.name.trim(),
    nickname: form.nickname.trim(),
    age: form.age.trim(),
    breed: form.breed.trim(),
    colorTheme: form.colorTheme || "pink",
    gender: form.gender || "unknown",
    birthday: form.birthday || "",
    weightKg: Number(form.weightKg || 0),
    coatColor: form.coatColor.trim(),
    coatColors,
    coatPattern: form.coatPattern || "solid",
    coatPatternDescription: form.coatPatternDescription.trim(),
    favoriteTreats,
    favoriteTreat: favoriteTreats.join(", "),
    personalityTags,
    personality: personalityTags.join(", "),
    cutenessLevel: Math.min(100, Math.max(1, Number(form.cutenessLevel || 70))),
    interactionNote: form.interactionNote.trim(),
    sortOrder: Number(form.sortOrder || 999),
    isFeatured: Boolean(form.isFeatured),
    isActive: Boolean(form.isActive),
    imageUrl,
    media,
  };
}
`);

function patchDogManagerView() {
  const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");
  let content = fs.readFileSync(filePath, "utf8");

  content = content.replaceAll(
    "const payload = buildDogPayload(form, media);",
    "const payload = buildDogPayload(form, media, existingMedia.length);"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched DogManagerView.jsx");
}

function patchPublicDogProfileCard() {
  const filePath = path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx");

  if (!fs.existsSync(filePath)) {
    console.log("Skip public DogProfileCard.jsx because file not found");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (content.includes("function getDogMedia") && content.includes("function isVideoMedia")) {
    content = content.replace(
      /function getDogImage\\(dog\\) \\{[\\s\\S]*?\\n\\}/,
      `function getDogImage(dog) {
  if (dog?.imageUrl) return dog.imageUrl;

  const firstImage = getDogMedia(dog).find((media) => !isVideoMedia(media));

  return firstImage?.url || null;
}`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched public DogProfileCard.jsx");
}

patchDogManagerView();
patchPublicDogProfileCard();
