const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/toppings/ToppingManagerView.jsx");
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /isVideoMedia,\s*\n\s*mapToppingToForm,/,
  `getMediaUrl,
  isVideoMedia,
  mapToppingToForm,
  normalizeToppingMedia,`
);

content = content.replace(
  /uploadedMedia = uploadResult\.media \|\| \[\];/g,
  `uploadedMedia = normalizeToppingMedia(uploadResult.media || []);`
);

content = content.replace(
  /const imageUrl =\s*uploadedMedia\[0\]\?\.url \|\|\s*form\.imageUrl \|\|\s*media\.find\(\(item\) => !isVideoMedia\(item\)\)\?\.url \|\|\s*"";/,
  `const imageUrl =
        getMediaUrl(uploadedMedia[0]) ||
        form.imageUrl ||
        getMediaUrl(media.find((item) => !isVideoMedia(item))) ||
        "";`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Patched ToppingManagerView image handling.");
