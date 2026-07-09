const fs = require("fs");

function ensureViewport() {
  const file = "index.html";

  if (!fs.existsSync(file)) {
    console.warn("Không tìm thấy index.html");
    return;
  }

  let html = fs.readFileSync(file, "utf8");

  const viewport =
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />';

  if (html.includes('name="viewport"')) {
    html = html.replace(
      /<meta\s+name=["']viewport["'][^>]*>/i,
      viewport
    );
  } else {
    html = html.replace(/<head>/i, `<head>\n    ${viewport}`);
  }

  fs.writeFileSync(file, html);
  console.log("✅ Fixed viewport meta:", file);
}

function patchMenuPage() {
  const file = "src/pages/public/MenuPage.jsx";

  if (!fs.existsSync(file)) {
    console.warn("Không tìm thấy MenuPage.jsx");
    return;
  }

  let code = fs.readFileSync(file, "utf8");

  code = code.replace(
    '<main className="min-h-screen bg-[#FFFAFA] font-[\'Quicksand\'] text-[#2D2D2D]">',
    '<main data-public-page="menu" className="min-h-screen w-full max-w-none overflow-x-hidden bg-[#FFFAFA] font-[\'Quicksand\'] text-[#2D2D2D]">'
  );

  code = code.replace(
    '<div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">',
    '<div className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">'
  );

  fs.writeFileSync(file, code);
  console.log("✅ Patched MenuPage width:", file);
}

ensureViewport();
patchMenuPage();
