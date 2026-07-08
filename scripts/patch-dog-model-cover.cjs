const fs = require("fs");
const path = require("path");

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

content = content.replace(
  `  if (!this.imageUrl && this.media?.length) {
    this.imageUrl = this.media[0].url;
  }`,
  `  if (!this.imageUrl && this.media?.length) {
    const firstImage = this.media.find((item) => item.resourceType !== "video");
    this.imageUrl = firstImage?.url || "";
  }`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched Dog model.");
