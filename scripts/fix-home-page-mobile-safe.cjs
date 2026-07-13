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

    if (/\.(jsx|js)$/.test(item.name)) {
      files.push(full);
    }
  }

  return files;
}

const homeFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");

  return (
    code.includes("export default function HomePage") &&
    code.includes("function ReservationSection") &&
    code.includes("function SignatureMenuCard")
  );
});

if (!homeFile) {
  throw new Error("Không tìm thấy HomePage.jsx.");
}

let code = fs.readFileSync(homeFile, "utf8");

// 1. Homepage không dùng DogProfileCard trực tiếp nữa để tránh modal/fixed gây lỗi viewport mobile.
code = code.replace(
  /\nimport DogProfileCard from ["']\.\.\/\.\.\/components\/public\/DogProfileCard["'];\n?/,
  "\n"
);

code = code.replace(
  /<DogProfileCard dog=\{dog\} \/>/g,
  "<HomeDogPreviewCard dog={dog} />"
);

// 2. Thêm hook nhận diện mobile để tắt parallax trên mobile thật.
if (!code.includes("function useIsMobile(")) {
  const marker = "function useReveal(threshold = 0.15) {";

  const hook = String.raw`
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

`;

  if (!code.includes(marker)) {
    throw new Error("Không tìm thấy vị trí để thêm useIsMobile.");
  }

  code = code.replace(marker, hook + marker);
}

// 3. Khai báo isMobile trong HomePage.
if (!code.includes("const isMobile = useIsMobile();")) {
  code = code.replace(
    "  const shop = getShop(store);\n  const scrollY = useScrollY();",
    "  const shop = getShop(store);\n  const scrollY = useScrollY();\n  const isMobile = useIsMobile();"
  );
}

// 4. Tắt transform/parallax ảnh hero trên mobile.
code = code.replace(
  /  const heroShift = Math\.min\(scrollY, 300\);\s+const heroImgTransform = `translateY\(\$\{heroShift \* 0\.08\}px\) scale\(\$\{\s+1 \+ heroShift \/ 3000\s+\}\)`;/,
  String.raw`  const heroShift = isMobile ? 0 : Math.min(scrollY, 300);
  const heroImgTransform = isMobile
    ? "none"
    : ` + "`" + String.raw`translateY(${heroShift * 0.08}px) scale(${
        1 + heroShift / 3000
      })` + "`" + `;`
);

// 5. Root page mobile-safe, không tràn ngang.
code = code.replace(
  `<div className="min-h-screen space-y-20 bg-[#FFFAFA] py-8 font-['Quicksand'] sm:py-12">`,
  `<div data-public-home-page="true" className="min-h-[100svh] w-full max-w-[100vw] overflow-x-hidden space-y-14 bg-[#FFFAFA] py-6 font-['Quicksand'] sm:space-y-20 sm:py-12">`
);

// 6. Hero section gọn hơn trên mobile.
code = code.replace(
  `className="relative mx-4 overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white px-5 py-9 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:rounded-[2.5rem] sm:p-14 lg:mx-12 lg:p-20"`,
  `className="relative mx-3 max-w-[calc(100vw-24px)] overflow-hidden rounded-[1.75rem] border border-[#b98c49]/20 bg-white px-4 py-7 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:max-w-none sm:rounded-[2.5rem] sm:p-14 lg:mx-12 lg:p-20"`
);

// 7. Ẩn floating paws trên mobile để tránh scroll-transform bị giật/lệch ở Chrome/Safari mobile.
code = code.replace(
  "<FloatingPaws scrollY={scrollY} />",
  '<FloatingPaws scrollY={scrollY} className="hidden sm:block" />'
);

code = code.replace(
  '<FloatingPaws scrollY={scrollY} speed={0.04} className="opacity-30" />',
  '<FloatingPaws scrollY={scrollY} speed={0.04} className="hidden opacity-30 sm:block" />'
);

// 8. Sửa h-13 vì Tailwind không ổn định bằng arbitrary height.
code = code.replace(/\bh-13\b/g, "h-[52px]");

// 9. Đánh dấu các carousel ngang để thêm CSS mobile-safe.
code = code.replace(
  /<section className="([^"]*snap-x snap-mandatory[^"]*overflow-x-auto[^"]*)"/g,
  '<section data-home-scroller="true" className="$1"'
);

// 10. Product card mobile bớt rộng để không gây overflow ở thiết bị thật.
code = code.replace(
  `className="group flex min-w-[84vw] snap-start flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_38px_rgba(185,140,73,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_20px_55px_rgba(185,140,73,0.16)] sm:min-w-0"`,
  `className="group flex min-w-[78vw] max-w-[340px] snap-start flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_38px_rgba(185,140,73,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_20px_55px_rgba(185,140,73,0.16)] sm:min-w-0 sm:max-w-none"`
);

// 11. Thêm HomeDogPreviewCard thay cho DogProfileCard trên homepage.
if (!code.includes("function HomeDogPreviewCard(")) {
  const homeDogCard = String.raw`
function HomeDogPreviewCard({ dog }) {
  const image = getMedia(dog);
  const tags = Array.isArray(dog?.personalityTags)
    ? dog.personalityTags.slice(0, 2)
    : [];
  const subtitle =
    dog?.breed ||
    dog?.nickname ||
    tags.join(", ") ||
    "YEPO friend";

  return (
    <Link
      to="/dogs"
      className="group flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_34px_rgba(185,140,73,0.1)] transition active:scale-[0.99] sm:hover:-translate-y-1 sm:hover:shadow-[0_18px_50px_rgba(185,140,73,0.16)]"
    >
      <div className="relative bg-[#FFFAFA] p-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#f6d77d]/25">
          {image ? (
            <img
              src={image}
              alt={dog?.name || "Cún YEPO"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#b98c49]">
              <PawPrint size={44} />
            </div>
          )}

          {dog?.isFeatured && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#b98c49] shadow-sm">
              <Sparkles size={13} />
              Nổi bật
            </span>
          )}

          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#8c672f] shadow-sm">
            Hồ sơ cún
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
          YEPO friend
        </p>

        <h3 className="mt-2 line-clamp-1 text-2xl font-['Quicksand'] font-bold leading-tight text-[#2D2D2D]">
          {dog?.name || "Vô danh"}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-sm font-medium leading-6 text-[#666666]">
          {subtitle}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="rounded-full bg-[#f6d77d]/35 px-3 py-1.5 text-xs font-bold text-[#8c672f]">
            {dog?.sortOrder ? "#" + dog.sortOrder : "YEPO"}
          </span>

          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#b98c49]">
            Xem thêm
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

`;

  code = code.replace("function SignatureMenuCard", homeDogCard + "function SignatureMenuCard");
}

fs.writeFileSync(homeFile, code, "utf8");

// 12. Thêm CSS chống tràn ngang và cải thiện scroll ngang trên mobile.
const cssFile = path.join("src", "index.css");

if (fs.existsSync(cssFile)) {
  let css = fs.readFileSync(cssFile, "utf8");

  const marker = "/* Home page mobile safe */";

  if (!css.includes(marker)) {
    css += String.raw`

/* Home page mobile safe */
@media (max-width: 640px) {
  [data-public-home-page="true"] {
    overflow-x: hidden !important;
    max-width: 100vw !important;
  }

  [data-public-home-page="true"] * {
    box-sizing: border-box;
  }

  [data-public-home-page="true"] img,
  [data-public-home-page="true"] video {
    max-width: 100%;
  }

  [data-public-home-page="true"] [data-home-scroller="true"] {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  [data-public-home-page="true"] [data-home-scroller="true"]::-webkit-scrollbar {
    display: none;
  }

  [data-reservation-form="true"],
  [data-reservation-form="true"] * {
    max-width: 100%;
  }

  [data-reservation-form="true"] input,
  [data-reservation-form="true"] select,
  [data-reservation-form="true"] textarea {
    min-width: 0 !important;
    max-width: 100% !important;
    font-size: 16px !important;
  }

  [data-reservation-form="true"] input[type="date"],
  [data-reservation-form="true"] input[type="time"],
  [data-reservation-form="true"] select {
    -webkit-appearance: none;
    appearance: none;
  }
}
`;
    fs.writeFileSync(cssFile, css, "utf8");
  }
}

console.log("✅ Đã cập nhật HomePage mobile-safe:", homeFile);
