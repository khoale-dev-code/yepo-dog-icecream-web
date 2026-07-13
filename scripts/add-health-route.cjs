const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(js|mjs|cjs)$/.test(item.name)) {
      files.push(full);
    }
  }

  return files;
}

const serverFile = walk("server").find((file) => {
  const code = fs.readFileSync(file, "utf8");

  return (
    code.includes("express") &&
    code.includes("app.listen") &&
    code.includes("app.use")
  );
});

if (!serverFile) {
  throw new Error("Không tìm thấy file server chính có app.listen.");
}

let code = fs.readFileSync(serverFile, "utf8");

if (code.includes('/api/health') || code.includes("/api/health")) {
  console.log("✅ /api/health đã tồn tại:", serverFile);
  process.exit(0);
}

const healthRoute = `
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "YEPO Dog Ice Cream API",
    time: new Date().toISOString(),
  });
});

`;

const marker = /app\.use\(["']\/api\//;

if (marker.test(code)) {
  code = code.replace(marker, healthRoute + code.match(marker)[0]);
} else {
  code = code.replace(/app\.listen\(/, healthRoute + "app.listen(");
}

fs.writeFileSync(serverFile, code, "utf8");

console.log("✅ Đã thêm /api/health vào:", serverFile);
