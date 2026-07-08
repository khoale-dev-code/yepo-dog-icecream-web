const fs = require("fs");
const path = require("path");

function writeFile(relativePath, content) {
  const filePath = path.resolve(process.cwd(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  console.log("Updated", relativePath);
}

function createPromotionsPage() {
  writeFile("src/pages/public/PromotionsPage.jsx", `import {
  ArrowRight,
  CalendarDays,
  Gift,
  Sparkles,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

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

function getPromotionImage(promotion) {
  if (promotion?.imageUrl) return promotion.imageUrl;

  if (Array.isArray(promotion?.media) && promotion.media.length > 0) {
    const firstImage = promotion.media.find((item) => !isVideoMedia(item));
    if (firstImage?.url) return firstImage.url;
  }

  return "https://dummyimage.com/1000x720/FFFAFA/b98c49.png&text=YEPO+PROMOTION";
}

function getPromotionTitle(promotion) {
  return promotion.title || promotion.name || "Khuyến mãi YEPO";
}

function getPromotionDescription(promotion) {
  return (
    promotion.description ||
    promotion.content ||
    promotion.caption ||
    "Ưu đãi đang được cập nhật tại YEPO."
  );
}

function getPromotionCode(promotion) {
  return promotion.code || promotion.promoCode || promotion.couponCode || "";
}

function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

function getDateText(promotion) {
  const startDate = formatDate(promotion.startDate || promotion.validFrom);
  const endDate = formatDate(promotion.endDate || promotion.validTo);

  if (startDate && endDate) return \`\${startDate} - \${endDate}\`;
  if (startDate) return \`Từ \${startDate}\`;
  if (endDate) return \`Đến \${endDate}\`;

  return "";
}

export default function PromotionsPage({ store }) {
  const promotions = getList(store, "promotions")
    .filter((promotion) => promotion.isActive !== false)
    .sort((a, b) => {
      const sortA = Number(a.sortOrder || 999);
      const sortB = Number(b.sortOrder || 999);

      if (sortA !== sortB) return sortA - sortB;

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const featuredPromotion =
    promotions.find((promotion) => promotion.isFeatured) || promotions[0];

  const otherPromotions = featuredPromotion
    ? promotions.filter(
        (promotion) =>
          (promotion._id || promotion.id) !==
          (featuredPromotion._id || featuredPromotion.id)
      )
    : promotions;

  return (
    <div className="space-y-10 py-6 sm:py-10">
      <section className="relative overflow-hidden rounded-[40px] border border-[#ead7b6] bg-[#FFFAFA] p-6 shadow-[0_24px_80px_rgba(115,81,34,.08)] sm:p-8 lg:p-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#f6d77d]/55 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-[#b98c49]/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#b98c49] ring-1 ring-[#ead7b6]">
              <Sparkles size={15} />
              YEPO Promotions
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-[#2f2115] sm:text-5xl lg:text-6xl">
              Khuyến mãi ngọt ngào tại YEPO
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#755b38] sm:text-base">
              Cập nhật các ưu đãi mới nhất dành cho khách ghé quán, thưởng thức menu và gặp những bé cún đáng yêu.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_16px_36px_rgba(185,140,73,.22)] transition hover:-translate-y-0.5 hover:bg-[#8c672f]"
              >
                Xem menu
                <ArrowRight size={17} />
              </Link>

              <a
                href="/#reservation"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-[#ead7b6] bg-white px-6 text-sm font-bold text-[#8c672f] transition hover:-translate-y-0.5 hover:bg-[#f6d77d]/35"
              >
                Đặt bàn ngay
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rotate-1 overflow-hidden rounded-[36px] border-2 border-[#b98c49] bg-white p-3 shadow-[0_8px_0_#b98c49] transition hover:rotate-0">
              {featuredPromotion ? (
                <img
                  src={getPromotionImage(featuredPromotion)}
                  alt={getPromotionTitle(featuredPromotion)}
                  className="aspect-[4/3] w-full rounded-[28px] object-cover"
                />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center rounded-[28px] bg-[#f6d77d]/55 text-center text-[#b98c49]">
                  <div>
                    <Gift size={48} className="mx-auto" />
                    <p className="mt-3 text-sm font-black">
                      Chưa có khuyến mãi
                    </p>
                  </div>
                </div>
              )}
            </div>

            {featuredPromotion && getPromotionCode(featuredPromotion) && (
              <div className="absolute -bottom-4 left-5 right-5 rounded-[24px] border border-[#ead7b6] bg-white/95 px-5 py-4 shadow-[0_18px_40px_rgba(115,81,34,.16)] backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8c672f]">
                  Mã ưu đãi nổi bật
                </p>
                <p className="mt-1 text-2xl font-black text-[#b98c49]">
                  {getPromotionCode(featuredPromotion)}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {promotions.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion._id || promotion.id || promotion.title}
              promotion={promotion}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-[36px] border border-dashed border-[#ead7b6] bg-white px-6 py-16 text-center shadow-sm">
          <Gift size={48} className="mx-auto text-[#b98c49]" />
          <h2 className="mt-4 text-2xl font-black text-[#2f2115]">
            Chưa có khuyến mãi công khai
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#755b38]">
            Khi admin tạo khuyến mãi và bật trạng thái Công khai, ưu đãi sẽ hiển thị ở đây.
          </p>

          <Link
            to="/menu"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white"
          >
            Xem menu YEPO
            <ArrowRight size={17} />
          </Link>
        </section>
      )}
    </div>
  );
}

function PromotionCard({ promotion }) {
  const title = getPromotionTitle(promotion);
  const description = getPromotionDescription(promotion);
  const code = getPromotionCode(promotion);
  const dateText = getDateText(promotion);
  const discountText = promotion.discountText || "";

  return (
    <article className="group overflow-hidden rounded-[34px] border border-[#ead7b6] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(115,81,34,.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FFFAFA]">
        <img
          src={getPromotionImage(promotion)}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#b98c49] shadow-sm backdrop-blur">
          <Tag size={13} />
          Ưu đãi
        </div>

        {promotion.isFeatured && (
          <div className="absolute right-4 top-4 rounded-full bg-[#f6d77d] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#8c672f] shadow-sm">
            Nổi bật
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="line-clamp-2 text-2xl font-black leading-tight text-[#2f2115]">
          {title}
        </h2>

        {discountText && (
          <p className="mt-3 inline-flex rounded-full bg-[#f6d77d]/55 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8c672f]">
            {discountText}
          </p>
        )}

        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#755b38]">
          {description}
        </p>

        {dateText && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#FFFAFA] px-4 py-3 text-xs font-bold text-[#8c672f]">
            <CalendarDays size={15} />
            <span>{dateText}</span>
          </div>
        )}

        {code && (
          <div className="mt-4 rounded-2xl border border-dashed border-[#b98c49] bg-[#f6d77d]/30 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8c672f]">
              Mã ưu đãi
            </p>
            <p className="mt-1 text-2xl font-black tracking-wide text-[#b98c49]">
              {code}
            </p>
          </div>
        )}

        {promotion.linkUrl && (
          <a
            href={promotion.linkUrl}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-bold text-white transition hover:bg-[#8c672f]"
          >
            {promotion.linkLabel || "Xem chi tiết"}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}
`);
}

function patchNavbar() {
  const filePath = path.resolve(process.cwd(), "src/components/public/PublicNavbar.jsx");

  if (!fs.existsSync(filePath)) {
    console.log("Skip navbar: PublicNavbar.jsx not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  const nextNavItems = `const navItems = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/about", label: "Về YEPO" },
  { to: "/menu", label: "Menu" },
  { to: "/promotions", label: "Khuyến mãi" },
  { to: "/posts", label: "Bài đăng" },
  { to: "/dogs", label: "Hồ sơ cún" },
];`;

  content = content.replace(/const navItems = \[[\s\S]*?\];/, nextNavItems);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched PublicNavbar.jsx");
}

function patchApp() {
  const filePath = path.resolve(process.cwd(), "src/App.jsx");

  if (!fs.existsSync(filePath)) {
    console.log("Skip App.jsx: not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("PromotionsPage")) {
    const importLine = `import PromotionsPage from "./pages/public/PromotionsPage.jsx";`;

    const imports = [...content.matchAll(/^import .+;$/gm)];

    if (imports.length) {
      const lastImport = imports[imports.length - 1][0];
      content = content.replace(lastImport, `${lastImport}\n${importLine}`);
    } else {
      content = `${importLine}\n${content}`;
    }
  }

  if (!content.includes('path="/promotions"')) {
    const routeLine = `<Route path="/promotions" element={<PromotionsPage store={store} />} />`;

    const routeTargets = [
      `<Route path="/posts" element={<PostsPage store={store} />} />`,
      `<Route path="/dogs" element={<DogsPage store={store} />} />`,
      `<Route path="/menu" element={<MenuPage store={store} />} />`,
    ];

    let inserted = false;

    for (const target of routeTargets) {
      if (content.includes(target)) {
        content = content.replace(target, `${routeLine}
          ${target}`);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      console.log("Không tự chèn được route /promotions. Gửi mình src/App.jsx nếu route chưa hiện.");
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched App.jsx");
}

function patchPublicStoreRoute() {
  const filePath = path.resolve(process.cwd(), "server/routes/publicStore.routes.js");

  if (!fs.existsSync(filePath)) {
    console.log("Skip publicStore route: not found.");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  if (!content.includes("Promotion")) {
    const imports = [...content.matchAll(/^import .+;$/gm)];
    const importLine = `import Promotion from "../models/Promotion.js";`;

    if (imports.length) {
      const lastImport = imports[imports.length - 1][0];
      content = content.replace(lastImport, `${lastImport}
${importLine}`);
    } else {
      content = `${importLine}
${content}`;
    }
  }

  if (!content.includes("Promotion.find")) {
    const findTargets = [
      /const\s+promotions\s*=\s*await[\s\S]*?;/,
      /promotions\s*:/,
    ];

    if (!findTargets.some((pattern) => pattern.test(content))) {
      content = content.replace(
        /const\s+posts\s*=\s*await[\s\S]*?;/,
        (match) => `${match}
    const promotions = await Promotion.find({ isActive: { $ne: false } }).sort({
      sortOrder: 1,
      createdAt: -1,
    });`
      );

      content = content.replace(
        /posts,/,
        `posts,
      promotions,`
      );
    }
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log("Patched publicStore route if needed");
}

createPromotionsPage();
patchNavbar();
patchApp();
patchPublicStoreRoute();
