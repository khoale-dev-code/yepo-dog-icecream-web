const fs = require("fs");
const path = require("path");

const componentFile = path.normalize("src/components/RouteScrollTop.jsx");

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

function toImportPath(fromFile, targetFile) {
  let relative = path
    .relative(path.dirname(fromFile), targetFile)
    .replace(/\\/g, "/");

  if (!relative.startsWith(".")) relative = "./" + relative;

  return relative;
}

function addImport(code, file) {
  if (code.includes("RouteScrollTop")) return code;

  const importPath = toImportPath(file, componentFile);
  const importLine = `import RouteScrollTop from "${importPath}";`;

  const matches = [...code.matchAll(/^import .*;$/gm)];

  if (matches.length === 0) {
    return importLine + "\n" + code;
  }

  const last = matches[matches.length - 1];
  const insertAt = last.index + last[0].length;

  return code.slice(0, insertAt) + "\n" + importLine + code.slice(insertAt);
}

let patchedCount = 0;

for (const file of walk("src")) {
  if (path.normalize(file) === componentFile) continue;

  let code = fs.readFileSync(file, "utf8");

  if (!code.includes("<Outlet")) continue;
  if (code.includes("<RouteScrollTop />")) continue;

  code = addImport(code, file);

  code = code.replace(
    /<Outlet(\s*\/>|[^>]*>)/,
    `<RouteScrollTop />\n        <Outlet$1`
  );

  fs.writeFileSync(file, code);
  patchedCount += 1;
  console.log("✅ Patched layout:", file);
}

/**
 * Nếu project không dùng Outlet trong layout,
 * fallback gắn vào App.jsx.
 */
if (patchedCount === 0 && fs.existsSync("src/App.jsx")) {
  let code = fs.readFileSync("src/App.jsx", "utf8");

  if (!code.includes("<RouteScrollTop />")) {
    code = addImport(code, "src/App.jsx");

    if (/return\s*\(\s*<>/.test(code)) {
      code = code.replace(
        /return\s*\(\s*<>/,
        "return (\n    <>\n      <RouteScrollTop />"
      );
    } else {
      code = code.replace(
        /return\s*\(\s*(<[^>]+>)/,
        (match, tag) => `return (\n    ${tag}\n      <RouteScrollTop />`
      );
    }

    fs.writeFileSync("src/App.jsx", code);
    patchedCount += 1;
    console.log("✅ Patched App.jsx fallback");
  }
}

/**
 * Gỡ RouteScrollManager cũ nếu từng gắn ngoài RouterProvider.
 * Bản đó có thể chạy trước khi route mới render nên không triệt để.
 */
if (fs.existsSync("src/main.jsx")) {
  let main = fs.readFileSync("src/main.jsx", "utf8");

  main = main
    .replace(/^import RouteScrollManager.*\n/gm, "")
    .replace(/\s*<RouteScrollManager\s*\/>\n?/g, "\n");

  fs.writeFileSync("src/main.jsx", main);
}

console.log(`Done. Patched ${patchedCount} file(s).`);
