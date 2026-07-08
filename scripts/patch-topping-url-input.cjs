const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/toppings/ToppingPanel.jsx");

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  /onChange=\{\(event\) => onUpdate\("imageUrl", event\.target\.value\)\}/g,
  `onChange={(event) => {
                const url = event.target.value.trim();

                onFileChange(null);
                onUpdate("imageUrl", url);
                onUpdate(
                  "media",
                  url
                    ? [
                        {
                          url,
                          publicId: "",
                          resourceType: "image",
                          originalName: "URL image",
                        },
                      ]
                    : []
                );
              }}`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Patched ToppingPanel URL image input.");
