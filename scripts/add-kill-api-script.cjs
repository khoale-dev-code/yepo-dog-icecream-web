const fs = require("fs");

const packagePath = "package.json";
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));

pkg.scripts = {
  ...(pkg.scripts || {}),
  "kill:api": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/kill-api.ps1"
};

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
console.log("Added npm script: kill:api");
