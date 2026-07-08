const fs = require("fs");
const path = require("path");

function patchModel() {
  const filePath = path.resolve(process.cwd(), "server/models/Shop.js");
  let content = fs.readFileSync(filePath, "utf8");

  const fields = [
    ["logoUrl", `    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
`],
    ["coverUrl", `    coverUrl: {
      type: String,
      default: "",
      trim: true,
    },
`],
    ["coverImageUrl", `    coverImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
`],
    ["heroImageUrl", `    heroImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
`],
    ["instagramUrl", `    instagramUrl: {
      type: String,
      default: "",
      trim: true,
    },
`],
  ];

  for (const [name, field] of fields) {
    if (!content.includes(`${name}:`)) {
      content = content.replace(
        /const shopSchema = new mongoose\.Schema\(\s*\{/,
        `const shopSchema = new mongoose.Schema({\n${field}`
      );
      console.log("Added field:", name);
    }
  }

  if (!content.includes("shopSchema.pre(\"save\"")) {
    content = content.replace(
      /\}\s*,\s*\{\s*timestamps:\s*true\s*\}\s*\);/,
      `},
  {
    timestamps: true,
  }
);

shopSchema.pre("save", function syncShopImageAliases(next) {
  if (this.coverImageUrl && !this.coverUrl) {
    this.coverUrl = this.coverImageUrl;
  }

  if (this.coverUrl && !this.coverImageUrl) {
    this.coverImageUrl = this.coverUrl;
  }

  next();
});`
    );
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched server/models/Shop.js");
}

function patchRoute() {
  const candidates = [
    "server/routes/shop.routes.js",
    "server/routes/shopRoutes.js",
  ];

  const filePath = candidates
    .map((item) => path.resolve(process.cwd(), item))
    .find((item) => fs.existsSync(item));

  if (!filePath) {
    console.log("Skip shop routes: file not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("normalizeShopPayload")) {
    content = content.replace(
      /import[\s\S]*?from[\s\S]*?;\s*/,
      (match) => `${match}
function normalizeShopPayload(payload = {}) {
  const next = { ...payload };

  if (next.instagram && !next.instagramUrl) {
    next.instagramUrl = next.instagram;
  }

  if (next.instagramUrl && !next.instagram) {
    next.instagram = next.instagramUrl;
  }

  if (next.coverImageUrl && !next.coverUrl) {
    next.coverUrl = next.coverImageUrl;
  }

  if (next.coverUrl && !next.coverImageUrl) {
    next.coverImageUrl = next.coverUrl;
  }

  return next;
}

`
    );
  }

  content = content.replaceAll(
    "req.body",
    "normalizeShopPayload(req.body)"
  );

  // Tránh thay quá tay trong chính hàm normalize.
  content = content.replaceAll(
    "normalizeShopPayload(normalizeShopPayload(req.body))",
    "normalizeShopPayload(req.body)"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched", path.relative(process.cwd(), filePath));
}

patchModel();
patchRoute();
