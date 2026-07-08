const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "server/models/Shop.js");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("heroImageUrl")) {
  const field = `
    heroImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
`;

  if (content.includes("coverImageUrl")) {
    content = content.replace(
      /(\s+coverImageUrl:\s*\{[\s\S]*?\n\s+\},)/,
      `$1${field}`
    );
  } else if (content.includes("logoUrl")) {
    content = content.replace(
      /(\s+logoUrl:\s*\{[\s\S]*?\n\s+\},)/,
      `$1${field}`
    );
  } else {
    content = content.replace(
      /const shopSchema = new mongoose\.Schema\(\s*\{/,
      `const shopSchema = new mongoose.Schema({${field}`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Added heroImageUrl to Shop model.");
} else {
  console.log("heroImageUrl already exists.");
}
