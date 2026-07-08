const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "server/config/db.js");
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes('from "node:dns"')) {
  content = content.replace(
    `import mongoose from "mongoose";`,
    `import dns from "node:dns";
import mongoose from "mongoose";`
  );
}

if (!content.includes("dns.setServers")) {
  content = content.replace(
    /export async function connectDatabase\(\) \{/,
    `export async function connectDatabase() {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  dns.setDefaultResultOrder("ipv4first");`
  );
}

content = content.replace(
  /mongoose\.connect\(([^)]*)\)/,
  `mongoose.connect($1, {
    serverSelectionTimeoutMS: 20000,
    family: 4,
  })`
);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched server/config/db.js");
