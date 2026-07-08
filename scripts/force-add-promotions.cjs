const fs = require("fs");
const path = require("path");

function findFiles(dir, filename, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findFiles(fullPath, filename, results);
    } else if (item === filename) {
      results.push(fullPath);
    }
  }

  return results;
}

function patchNavbar() {
  const navFiles = findFiles(path.resolve(process.cwd(), "src"), "PublicNavbar.jsx");

  if (!navFiles.length) {
    throw new Error("Không tìm thấy PublicNavbar.jsx");
  }

  for (const filePath of navFiles) {
    let content = fs.readFileSync(filePath, "utf8");

    const nextNavItems = `const navItems = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/about", label: "Về YEPO" },
  { to: "/menu", label: "Menu" },
  { to: "/promotions", label: "Khuyến mãi" },
  { to: "/posts", label: "Bài đăng" },
  { to: "/dogs", label: "Hồ sơ cún" },
];`;

    content = content.replace(
      /const navItems = \[[\s\S]*?\];/,
      nextNavItems
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log("Updated navbar:", path.relative(process.cwd(), filePath));
  }
}

function createPromotionsPage() {
  const dir = path.resolve(process.cwd(), "src/pages/public");
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, "PromotionsPage.jsx");

  if (fs.existsSync(filePath)) {
    console.log("PromotionsPage.jsx already exists");
    return;
  }

  const content = `import { CalendarDays, Gift, Tag } from "lucide-react";

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getMedia(item) {
  if (item?.imageUrl) return item.imageUrl;

  if (Array.isArray(item?.media) && item.media.length > 0) {
    const firstImage = item.media.find((media) => !isVideoMedia(media));
    if (firstImage?.url) return firstImage.url;
  }

  return "https://dummyimage.com/900x650/FFFAFA/b98c49.png&text=YEPO+PROMO";
}

function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

export default function PromotionsPage({ store }) {
  const promotions = getList(store, "promotions")
    .filter((promo) => promo.isActive !== false)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  return (
    <div className="space-y-10 py-6 sm:py-10">
      <section className="overflow-hidden rounded-[36px] border border-[#ead7b6] bg-[#FFFAFA] p-6 shadow-[0_20px_60px_rgba(115,81,34,.08)] sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
          <Gift size={15} />
          YEPO Promotions
        </span>

        <h1 className="mt-5 text-4xl font-black leading-tight text-[#2f2115] sm:text-5xl">
          Khuyến mãi tại YEPO
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#755b38]">
          Cập nhật các ưu đãi mới nhất dành cho khách ghé quán, thưởng thức menu và gặp những bé cún đáng yêu.
        </p>
      </section>

      {promotions.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promo) => {
            const title = promo.title || promo.name || "Khuyến mãi YEPO";
            const description =
              promo.description ||
              promo.content ||
              promo.caption ||
              "Ưu đãi đang được cập nhật tại YEPO.";
            const code = promo.code || promo.promoCode || promo.couponCode || "";
            const startDate = formatDate(promo.startDate || promo.validFrom);
            const endDate = formatDate(promo.endDate || promo.validTo);

            return (
              <article
                key={promo._id || promo.id}
                className="group overflow-hidden rounded-[32px] border border-[#ead7b6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(115,81,34,.10)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#FFFAFA]">
                  <img
                    src={getMedia(promo)}
                    alt={title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#b98c49] shadow-sm backdrop-blur">
                    <Tag size={13} />
                    Khuyến mãi
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="line-clamp-2 text-2xl font-black leading-tight text-[#2f2115]">
                    {title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#755b38]">
                    {description}
                  </p>

                  {(startDate || endDate) && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FFFAFA] px-4 py-3 text-xs font-bold text-[#8c672f]">
                      <CalendarDays size={15} />
                      <span>
                        {startDate || "Hiện tại"} {endDate ? \`- \${endDate}\` : ""}
                      </span>
                    </div>
                  )}

                  {code && (
                    <div className="mt-4 rounded-2xl border border-dashed border-[#b98c49] bg-[#f6d77d]/30 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8c672f]">
                        Mã ưu đãi
                      </p>
                      <p className="mt-1 text-xl font-black text-[#b98c49]">
                        {code}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[34px] border border-dashed border-[#ead7b6] bg-white px-6 py-14 text-center">
          <Gift size={44} className="mx-auto text-[#b98c49]" />
          <h3 className="mt-4 text-2xl font-black text-[#2f2115]">
            Chưa có khuyến mãi công khai
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#755b38]">
            Khi admin bật khuyến mãi, ưu đãi sẽ hiển thị ở đây.
          </p>
        </section>
      )}
    </div>
  );
}
`;

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Created PromotionsPage.jsx");
}

function patchAppRoute() {
  const filePath = path.resolve(process.cwd(), "src/App.jsx");

  if (!fs.existsSync(filePath)) {
    throw new Error("Không tìm thấy src/App.jsx");
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("PromotionsPage")) {
    const importTargets = [
      `import PostsPage from "./pages/public/PostsPage.jsx";`,
      `import DogsPage from "./pages/public/DogsPage.jsx";`,
      `import MenuPage from "./pages/public/MenuPage.jsx";`,
    ];

    let patchedImport = false;

    for (const target of importTargets) {
      if (content.includes(target)) {
        content = content.replace(
          target,
          `${target}
import PromotionsPage from "./pages/public/PromotionsPage.jsx";`
        );
        patchedImport = true;
        break;
      }
    }

    if (!patchedImport) {
      content = `import PromotionsPage from "./pages/public/PromotionsPage.jsx";
${content}`;
    }
  }

  if (!content.includes('path="/promotions"')) {
    const routeTargets = [
      `<Route path="/posts" element={<PostsPage store={store} />} />`,
      `<Route path="/dogs" element={<DogsPage store={store} />} />`,
      `<Route path="/menu" element={<MenuPage store={store} />} />`,
    ];

    let patchedRoute = false;

    for (const target of routeTargets) {
      if (content.includes(target)) {
        content = content.replace(
          target,
          `<Route path="/promotions" element={<PromotionsPage store={store} />} />
          ${target}`
        );
        patchedRoute = true;
        break;
      }
    }

    if (!patchedRoute) {
      console.log("Không tự chèn được route. Mở src/App.jsx kiểm tra Routes.");
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched App.jsx");
}

patchNavbar();
createPromotionsPage();
patchAppRoute();
