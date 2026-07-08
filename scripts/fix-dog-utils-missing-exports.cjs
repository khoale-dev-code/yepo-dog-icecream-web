const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/dogUtils.js");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/dogs/dogUtils.js");
}

let content = fs.readFileSync(filePath, "utf8");

const additions = `

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

  if (pickedFiles.length === 0) return [];

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
`;

if (!content.includes("export function collectDogSuggestions")) {
  content += additions;
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm collectDogSuggestions và uploadDogMedia vào dogUtils.js");
