const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/dogs/DogManagerView.jsx");
let content = fs.readFileSync(filePath, "utf8");

content = content.replaceAll(
  "const payload = buildDogPayload(form, media);",
  "const payload = buildDogPayload(form, media, existingMedia.length);"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched DogManagerView.");
