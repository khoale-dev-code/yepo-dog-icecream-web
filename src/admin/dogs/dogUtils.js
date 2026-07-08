export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getId(item) {
  return String(item?._id || item?.id || "");
}

export function getPatternLabel(value) {
  const labels = {
    solid: "Một màu",
    "two-tone": "Hai màu",
    spotted: "Đốm",
    dotted: "Chấm bi",
    brindle: "Vện",
    mixed: "Pha màu",
    other: "Khác",
  };

  return labels[value] || labels.solid;
}

export function getGenderLabel(value) {
  const labels = {
    male: "Đực",
    female: "Cái",
    unknown: "Chưa rõ",
  };

  return labels[value] || labels.unknown;
}

export function getDogMediaUrl(media) {
  if (!media) return "";
  if (typeof media === "string") return media;

  return String(
    media.url ||
      media.secureUrl ||
      media.secure_url ||
      media.imageUrl ||
      media.src ||
      ""
  );
}

export function isDogVideoMedia(media) {
  const type = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = getDogMediaUrl(media).toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

export function normalizeDogMedia(media = []) {
  return (Array.isArray(media) ? media : [])
    .map((item, index) => {
      const url = getDogMediaUrl(item);
      if (!url) return null;

      const isVideo = isDogVideoMedia(item);

      return {
        ...item,
        url,
        secureUrl: item?.secureUrl || item?.secure_url || url,
        publicId: item?.publicId || item?.public_id || "",
        resourceType: isVideo ? "video" : "image",
        type: isVideo ? "video" : "image",
        originalName:
          item?.originalName || item?.name || "Dog media " + (index + 1),
        sortOrder: Number(item?.sortOrder || item?.order || index + 1),
        order: Number(item?.order || item?.sortOrder || index + 1),
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));
}

export function getDogMedia(dogOrMedia = {}) {
  if (Array.isArray(dogOrMedia)) return normalizeDogMedia(dogOrMedia);

  const media = dogOrMedia?.media || dogOrMedia?.images || [];
  const normalizedMedia = normalizeDogMedia(media);

  if (normalizedMedia.length > 0) return normalizedMedia;

  const fallbackUrl =
    dogOrMedia?.imageUrl ||
    dogOrMedia?.image ||
    dogOrMedia?.photoUrl ||
    dogOrMedia?.thumbnailUrl ||
    "";

  if (!fallbackUrl) return [];

  return normalizeDogMedia([
    {
      url: fallbackUrl,
      resourceType: "image",
      type: "image",
      originalName: "Ảnh đại diện",
    },
  ]);
}

export function getDogImage(dog) {
  const media = getDogMedia(dog);
  const firstImage = media.find((item) => !isDogVideoMedia(item)) || media[0];

  return getDogMediaUrl(firstImage) || dog?.imageUrl || dog?.image || "";
}

export function getDogRemoveKey(media) {
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

export function createEmptyDogForm(nextSortOrder = 1) {
  return {
    name: "",
    nickname: "",
    age: "",
    breed: "",
    gender: "unknown",
    birthday: "",
    weightKg: "",
    colorTheme: "pink",
    frameColor: "",
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
}

export function mapDogToForm(dog = {}, nextSortOrder = 1) {
  const media = getDogMedia(dog);
  const imageUrl = dog.imageUrl || getDogImage({ ...dog, media });

  return {
    name: dog.name || "",
    nickname: dog.nickname || "",
    age: dog.age || "",
    breed: dog.breed || "",
    gender: dog.gender || "unknown",
    birthday: dog.birthday || "",
    weightKg: dog.weightKg ?? "",
    colorTheme: dog.colorTheme || "pink",
    frameColor: dog.frameColor || "",
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
    mediaOrder: media.map((item) => "existing:" + getDogMediaUrl(item)),
    removedExistingMediaKeys: [],
  };
}

function parseCommaList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildDogPayload(form = {}, media = []) {
  const removedKeys = new Set(
    Array.isArray(form.removedExistingMediaKeys)
      ? form.removedExistingMediaKeys.map(String)
      : []
  );

  const normalizedMedia = normalizeDogMedia(media).filter((item) => {
    const key = getDogRemoveKey(item);
    return !key || !removedKeys.has(key);
  });

  const imageUrl = getDogImage({ media: normalizedMedia });

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
    colorTheme: String(form.colorTheme || "pink").trim(),
    frameColor: String(form.frameColor || "").trim(),
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
    personalityTags: parseCommaList(form.personalityTags),
    favoriteTreat: String(form.favoriteTreat || "").trim(),
    favoriteTreats: parseCommaList(form.favoriteTreats),
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
}

function uniqueTextList(values = []) {
  const seen = new Set();

  return values
    .flatMap((value) => {
      if (Array.isArray(value)) return value;

      return String(value || "")
        .split(",")
        .map((item) => item.trim());
    })
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

export function collectDogSuggestions(dogs = []) {
  const list = Array.isArray(dogs) ? dogs : [];

  return {
    breedSuggestions: uniqueTextList(list.map((dog) => dog.breed)).slice(0, 30),
    favoriteSuggestions: uniqueTextList(
      list.flatMap((dog) => [dog.favoriteTreat, dog.favoriteTreats])
    ).slice(0, 30),
    personalitySuggestions: uniqueTextList(
      list.flatMap((dog) => [dog.personality, dog.personalityTags])
    ).slice(0, 30),
  };
}

export async function uploadDogMedia(api, files = []) {
  const pickedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
  if (!pickedFiles.length) return [];

  if (api?.uploadMedia) {
    const result = await api.uploadMedia(pickedFiles);
    const rawMedia = Array.isArray(result)
      ? result
      : result?.media || result?.files || result?.data || [];

    return normalizeDogMedia(rawMedia);
  }

  const formData = new FormData();

  pickedFiles.forEach((file) => {
    formData.append("files", file);
    formData.append("media", file);
  });

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể upload media cún.");
  }

  return normalizeDogMedia(data.media || data.files || data.data || []);
}

export async function requestDogs(api) {
  if (api?.dogs?.list) return api.dogs.list();
  if (api?.dogs?.getAll) return api.dogs.getAll();
  if (api?.dogs?.all) return api.dogs.all();

  const response = await fetch("/api/dogs", {
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể tải danh sách cún.");
  }

  return data;
}

export async function createDog(api, payload) {
  if (api?.dogs?.create) return api.dogs.create(payload);

  const response = await fetch("/api/dogs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể tạo hồ sơ cún.");
  }

  return data;
}

export async function updateDog(api, id, payload) {
  if (api?.dogs?.update) return api.dogs.update(id, payload);

  const response = await fetch("/api/dogs/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể cập nhật hồ sơ cún.");
  }

  return data;
}

export async function deleteDog(api, id) {
  if (api?.dogs?.delete) return api.dogs.delete(id);

  const response = await fetch("/api/dogs/" + id, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Không thể xóa hồ sơ cún.");
  }

  return data;
}
