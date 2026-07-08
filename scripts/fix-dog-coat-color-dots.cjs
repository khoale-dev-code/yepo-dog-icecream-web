const fs = require("fs");
const path = require("path");

const clientPath = path.resolve(process.cwd(), "src/components/public/DogProfileCard.jsx");
const adminPath = path.resolve(process.cwd(), "src/admin/dogs/DogListPanel.jsx");

const coatHelper = `
function isValidHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function getCoatColorSwatches(dog) {
  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  const normalized = coatColors
    .map((color, index) => {
      const hex = String(color?.hex || "").trim();
      const name = String(
        color?.name || color?.label || "Màu lông " + (index + 1)
      ).trim();

      if (!isValidHex(hex)) return null;

      return {
        hex,
        name,
      };
    })
    .filter(Boolean);

  if (normalized.length > 0) {
    return normalized.slice(0, 2);
  }

  if (dog?.coatColor) {
    return [
      {
        hex: "#ffffff",
        name: String(dog.coatColor),
      },
    ];
  }

  return [];
}

function CoatColorDots({ dog, className = "" }) {
  const coatColors = getCoatColorSwatches(dog);

  if (!coatColors.length) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="h-4 w-4 rounded-full border-2 border-white bg-[#f7efe4] shadow" />
        <span className="h-4 w-4 rounded-full border-2 border-white bg-[#e8ded2] shadow" />
        <span className="text-[11px] font-bold text-[#d1a290]">
          Chưa có màu lông
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {coatColors.map((color, index) => (
        <span
          key={color.hex + "-" + index}
          className="h-4 w-4 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      ))}

      <span className="text-[11px] font-bold text-[#d1a290]">
        {coatColors.map((color) => color.name).join(" / ")}
      </span>
    </div>
  );
}
`;

function addCoatHelper(content) {
  if (content.includes("function CoatColorDots")) return content;

  if (content.includes("function getPresetThemeKey")) {
    return content.replace("function getPresetThemeKey", coatHelper + "\nfunction getPresetThemeKey");
  }

  if (content.includes("function DogCard")) {
    return content.replace("function DogCard", coatHelper + "\nfunction DogCard");
  }

  if (content.includes("export default")) {
    return content.replace("export default", coatHelper + "\nexport default");
  }

  return content + "\n" + coatHelper;
}

function replaceClientDots(content) {
  const regex = /<div\s+className="mt-4 flex items-center gap-2">\s*<span[\s\S]*?title=\{`Màu card:[\s\S]*?\/>\s*<span[\s\S]*?title=\{`Màu khung:[\s\S]*?\/>\s*<\/div>/m;

  if (regex.test(content)) {
    return content.replace(regex, '<CoatColorDots dog={dog} className="mt-4" />');
  }

  const regex2 = /<div\s+className="mt-4 flex items-center gap-2">\s*<span[\s\S]*?title=\{["']Màu card:[\s\S]*?\/>\s*<span[\s\S]*?title=\{["']Màu khung:[\s\S]*?\/>\s*<\/div>/m;

  if (regex2.test(content)) {
    return content.replace(regex2, '<CoatColorDots dog={dog} className="mt-4" />');
  }

  return content;
}

function replaceAdminDots(content) {
  const regex = /<div\s+className="flex shrink-0 items-center gap-1">\s*<span[\s\S]*?Màu card:[\s\S]*?\/>\s*<span[\s\S]*?Màu khung:[\s\S]*?\/>\s*<\/div>/m;

  if (regex.test(content)) {
    return content.replace(regex, '<CoatColorDots dog={dog} className="shrink-0" />');
  }

  const regex2 = /<div\s+className="mt-4 flex items-center gap-2">\s*<span[\s\S]*?Màu card:[\s\S]*?\/>\s*<span[\s\S]*?Màu khung:[\s\S]*?\/>\s*<\/div>/m;

  if (regex2.test(content)) {
    return content.replace(regex2, '<CoatColorDots dog={dog} className="mt-4" />');
  }

  return content;
}

if (!fs.existsSync(clientPath)) {
  throw new Error("Không tìm thấy src/components/public/DogProfileCard.jsx");
}

let client = fs.readFileSync(clientPath, "utf8");
client = addCoatHelper(client);
client = replaceClientDots(client);
fs.writeFileSync(clientPath, client, "utf8");
console.log("Đã fix client DogProfileCard: 2 chấm màu lấy từ coatColors.");

if (!fs.existsSync(adminPath)) {
  console.log("Không tìm thấy src/admin/dogs/DogListPanel.jsx, bỏ qua admin list.");
  process.exit(0);
}

let admin = fs.readFileSync(adminPath, "utf8");
admin = addCoatHelper(admin);
admin = replaceAdminDots(admin);
fs.writeFileSync(adminPath, admin, "utf8");
console.log("Đã fix admin DogListPanel: danh sách card hiển thị màu lông giống client.");
