const fs = require("fs");

const viteFile = fs.readdirSync(".").find((file) =>
  /^vite\.config\.(js|mjs|ts)$/.test(file)
);

if (!viteFile) {
  throw new Error("Không tìm thấy vite.config.js/mjs/ts");
}

let code = fs.readFileSync(viteFile, "utf8");

code = code
  .replace(/http:\/\/localhost:4000/g, "http://127.0.0.1:4000")
  .replace(/http:\/\/\[::1\]:4000/g, "http://127.0.0.1:4000");

if (!code.includes("proxy") || !code.includes("/api")) {
  code = code.replace(
    /server\s*:\s*\{/,
    `server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4000",
        changeOrigin: true,
        secure: false,
      },
    },`
  );
}

fs.writeFileSync(viteFile, code);
console.log("✅ Patched Vite proxy:", viteFile);
