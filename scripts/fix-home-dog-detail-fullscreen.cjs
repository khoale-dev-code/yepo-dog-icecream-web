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

// 1. Thêm icon cần dùng.
code = code.replace(/import\s*\{([\s\S]*?)\}\s*from "lucide-react";/, (match, names) => {
  const current = names
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  const required = [
    "ArrowLeft",
    "ArrowRight",
    "CalendarDays",
    "CheckCircle2",
    "ChevronLeft",
    "ChevronRight",
    "Clock3",
    "Heart",
    "IceCream2",
    "Loader2",
    "MessageSquare",
    "PawPrint",
    "Phone",
    "Play",
    "Sparkles",
    "Star",
    "UserRound",
    "Users",
    "Weight",
  ];

  const merged = Array.from(new Set([...current, ...required])).sort();

  return "import {\n  " + merged.join(",\n  ") + ",\n} from \"lucide-react\";";
});

// 2. Không dùng DogProfileCard trực tiếp ở homepage nữa.
code = code.replace(
  /\nimport DogProfileCard from ["']\.\.\/\.\.\/components\/public\/DogProfileCard["'];\n?/,
  "\n"
);

// 3. Thêm helper riêng cho dog detail ở homepage.
const helperBlock = String.raw`
function getHomeDogMedia(dog) {
  const media = Array.isArray(dog?.media)
    ? dog.media.filter((item) => item?.url)
    : [];

  if (media.length > 0) return media;

  if (dog?.imageUrl) {
    return [
      {
        url: dog.imageUrl,
        resourceType: "image",
        type: "image",
        originalName: dog.name || "Dog image",
      },
    ];
  }

  return [];
}

function getHomeDogImage(dog) {
  const media = getHomeDogMedia(dog);
  const firstImage = media.find((item) => !isVideoMedia(item)) || media[0];

  return firstImage?.url || "";
}

function getHomeDogGenderLabel(gender) {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Chưa rõ";
}

function getHomeDogPatternLabel(pattern) {
  const labels = {
    solid: "Một màu",
    "two-tone": "Hai màu",
    spotted: "Đốm",
    dotted: "Chấm bi",
    brindle: "Vện",
    mixed: "Pha màu",
    other: "Khác",
  };

  return labels[pattern] || "Chưa cập nhật";
}

function formatHomeDogList(value, fallback = "Chưa cập nhật") {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function formatHomeDogBirthday(value) {
  if (!value) return "Chưa cập nhật";

  return String(value).slice(0, 10);
}

`;

if (code.includes("function getHomeDogMedia(")) {
  code = code.replace(
    /function getHomeDogMedia[\s\S]*?\nexport default function HomePage/,
    helperBlock + "export default function HomePage"
  );
} else {
  code = code.replace("export default function HomePage", helperBlock + "export default function HomePage");
}

// 4. Thêm state active dog + lưu vị trí scroll homepage.
if (!code.includes("const [activeHomeDog, setActiveHomeDog] = useState(null);")) {
  code = code.replace(
    "  const shop = getShop(store);\n  const scrollY = useScrollY();",
    "  const shop = getShop(store);\n  const scrollY = useScrollY();\n  const [activeHomeDog, setActiveHomeDog] = useState(null);\n  const homeScrollRef = useRef(0);"
  );
}

// 5. Chèn open/close detail screen trước return của HomePage.
if (!code.includes("function openHomeDog(dog)")) {
  const homeStart = code.indexOf("export default function HomePage");
  const returnMarker = "\n  return (\n";
  const returnIndex = code.indexOf(returnMarker, homeStart);

  if (returnIndex === -1) {
    throw new Error("Không tìm thấy return chính trong HomePage.");
  }

  const handlers = String.raw`
  function openHomeDog(dog) {
    if (typeof window !== "undefined") {
      homeScrollRef.current =
        window.scrollY || document.documentElement.scrollTop || 0;
    }

    setActiveHomeDog(dog);

    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      });
    }
  }

  function closeHomeDog() {
    setActiveHomeDog(null);

    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: homeScrollRef.current || 0,
          left: 0,
          behavior: "auto",
        });
      });
    }
  }

  if (activeHomeDog) {
    return (
      <HomeDogDetailScreen
        dog={activeHomeDog}
        onClose={closeHomeDog}
      />
    );
  }

`;

  code = code.slice(0, returnIndex) + handlers + code.slice(returnIndex);
}

// 6. Đổi card cún homepage sang card riêng mở full detail screen.
code = code.replace(
  /<DogProfileCard dog=\{dog\} \/>/g,
  "<HomeDogPreviewCard dog={dog} onOpen={() => openHomeDog(dog)} />"
);

code = code.replace(
  /<HomeDogPreviewCard dog=\{dog\}(?:\s+onOpen=\{[^}]+\})?\s*\/>/g,
  "<HomeDogPreviewCard dog={dog} onOpen={() => openHomeDog(dog)} />"
);

// 7. Tạo/ghi đè HomeDogPreviewCard + HomeDogDetailScreen.
const homeDogComponents = String.raw`
function HomeDogPreviewCard({ dog, onOpen }) {
  const image = getHomeDogImage(dog);
  const tags = Array.isArray(dog?.personalityTags)
    ? dog.personalityTags.slice(0, 2)
    : [];
  const subtitle =
    dog?.breed ||
    dog?.nickname ||
    tags.join(", ") ||
    "YEPO friend";

  return (
    <article className="h-full overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_34px_rgba(185,140,73,0.1)]">
      <button
        type="button"
        onClick={onOpen}
        className="group flex h-full w-full flex-col text-left transition active:scale-[0.99] sm:hover:-translate-y-1"
        aria-label={"Xem chi tiết " + (dog?.name || "cún YEPO")}
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
              Bấm để xem chi tiết
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
              Xem ngay
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

function HomeDogDetailScreen({ dog, onClose }) {
  const media = getHomeDogMedia(dog);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const activeMedia = media[activeIndex];
  const isVideo = isVideoMedia(activeMedia);

  const personalityText =
    dog?.personality ||
    formatHomeDogList(dog?.personalityTags, "Chưa cập nhật tính cách");

  const favoriteTreatText = formatHomeDogList(
    dog?.favoriteTreats,
    dog?.favoriteTreat || "Chưa cập nhật"
  );

  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  function goPrevious() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current - 1 + media.length) % media.length);
  }

  function goNext() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current + 1) % media.length);
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];

    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleTouchEnd(event) {
    if (media.length <= 1) return;

    const touch = event.changedTouches?.[0];

    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  return (
    <main
      data-home-dog-detail="true"
      className="min-h-[100svh] w-full max-w-[100vw] overflow-x-hidden bg-[#FFFAFA] font-['Quicksand'] text-[#2D2D2D]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="sticky top-0 z-40 border-b border-[#b98c49]/15 bg-white/95 px-3 py-3 pt-[max(12px,env(safe-area-inset-top))] shadow-[0_8px_24px_rgba(87,61,28,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFAFA] text-[#3b2a18] ring-1 ring-[#b98c49]/10"
            aria-label="Quay lại trang chủ"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f6d77d]/35 text-[#b98c49] ring-1 ring-[#b98c49]/15">
            <PawPrint size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
              YEPO dog detail
            </p>

            <h1 className="truncate text-xl font-bold leading-tight text-[#2D2D2D]">
              {dog?.name || "Vô danh"}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-3 pb-[max(32px,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
        <section className="overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_18px_54px_rgba(115,81,34,.08)]">
          <div
            className="relative grid min-h-[260px] place-items-center bg-[#2f2115]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeMedia ? (
              isVideo ? (
                <video
                  key={activeMedia.url}
                  src={activeMedia.url}
                  controls
                  playsInline
                  className="block max-h-[72svh] min-h-[260px] w-full bg-[#2f2115] object-contain"
                />
              ) : (
                <img
                  key={activeMedia.url}
                  src={activeMedia.url}
                  alt={activeMedia.originalName || activeMedia.name || dog?.name || "Dog media"}
                  draggable={false}
                  className="block max-h-[72svh] w-auto max-w-full object-contain"
                />
              )
            ) : (
              <div className="grid min-h-[300px] place-items-center text-white">
                <PawPrint size={64} />
              </div>
            )}

            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft size={23} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight size={23} />
                </button>

                <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  {activeIndex + 1}/{media.length}
                </span>
              </>
            )}
          </div>

          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto bg-[#FFFAFA] px-3 py-3">
              {media.map((item, index) => {
                const active = index === activeIndex;
                const itemIsVideo = isVideoMedia(item);

                return (
                  <button
                    key={(item.url || "media") + "-" + index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={[
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white",
                      active
                        ? "border-[#b98c49] ring-2 ring-[#b98c49]/20"
                        : "border-[#ead7b6] opacity-70",
                    ].join(" ")}
                    aria-label={"Xem ảnh " + (index + 1)}
                  >
                    {itemIsVideo ? (
                      <div className="grid h-full w-full place-items-center bg-[#2f2115] text-white">
                        <Play size={20} fill="currentColor" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.originalName || item.name || "Media"}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-[2rem] border border-[#b98c49]/15 bg-white p-5 shadow-[0_14px_40px_rgba(115,81,34,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                Full profile
              </p>

              <h2 className="mt-2 break-words text-4xl font-bold leading-none text-[#2D2D2D]">
                {dog?.name || "Vô danh"}
              </h2>

              {dog?.nickname && (
                <p className="mt-2 text-base font-semibold leading-7 text-[#756144]">
                  “{dog.nickname}”
                </p>
              )}
            </div>

            {dog?.isFeatured && (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f6d77d]/55 text-[#b98c49]">
                <Star size={22} fill="currentColor" />
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <HomeDogDetailBox label="Giống / chủng loại" value={dog?.breed || "Chưa cập nhật"} />
            <HomeDogDetailBox label="Giới tính" value={getHomeDogGenderLabel(dog?.gender)} />
            <HomeDogDetailBox label="Tuổi" value={dog?.age || "Chưa cập nhật"} />
            <HomeDogDetailBox label="Sinh nhật" value={formatHomeDogBirthday(dog?.birthday)} icon={<CalendarDays size={15} />} />
            <HomeDogDetailBox label="Cân nặng" value={dog?.weightKg ? String(dog.weightKg) + " kg" : "Chưa cập nhật"} icon={<Weight size={15} />} />
            <HomeDogDetailBox label="Độ dễ thương" value={String(dog?.cutenessLevel || 70) + "/100"} />
            <HomeDogDetailBox label="Kiểu lông" value={getHomeDogPatternLabel(dog?.coatPattern)} />
            <HomeDogDetailBox label="Trạng thái" value={dog?.isActive === false ? "Đang ẩn" : "Đang hiển thị"} />
          </div>

          {coatColors.length > 0 && (
            <div className="mt-4 rounded-[22px] bg-[#FFFAFA] p-4 ring-1 ring-[#ead7b6]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#b98c49]">
                Màu lông
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {coatColors.map((color, index) => (
                  <span
                    key={(color.hex || color.name || "color") + "-" + index}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8c672f] ring-1 ring-[#ead7b6]"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-white shadow"
                      style={{ backgroundColor: color.hex || "#b98c49" }}
                    />
                    {color.name || color.hex}
                  </span>
                ))}
              </div>
            </div>
          )}

          <HomeDogLongDetail label="Tính cách" value={personalityText} />
          <HomeDogLongDetail label="Món yêu thích" value={favoriteTreatText} />

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(185,140,73,0.22)] sm:w-auto"
          >
            <ArrowLeft size={16} />
            Quay lại trang chủ
          </button>
        </section>
      </div>
    </main>
  );
}

function HomeDogDetailBox({ label, value, icon }) {
  return (
    <div className="rounded-[20px] bg-[#FFFAFA] px-4 py-3 ring-1 ring-[#ead7b6]">
      <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#b98c49]">
        {icon}
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold leading-6 text-[#8c672f]">
        {value}
      </p>
    </div>
  );
}

function HomeDogLongDetail({ label, value }) {
  return (
    <div className="mt-4 rounded-[20px] bg-[#FFFAFA] px-4 py-3 ring-1 ring-[#ead7b6]">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#b98c49]">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-line break-words text-sm font-medium leading-7 text-[#8c672f]">
        {value}
      </p>
    </div>
  );
}

`;

if (code.includes("function HomeDogPreviewCard(")) {
  code = code.replace(
    /function HomeDogPreviewCard[\s\S]*?\nfunction SignatureMenuCard/,
    homeDogComponents + "function SignatureMenuCard"
  );
} else {
  code = code.replace("function SignatureMenuCard", homeDogComponents + "function SignatureMenuCard");
}

fs.writeFileSync(homeFile, code, "utf8");

console.log("✅ Đã đổi homepage dog detail sang full-screen riêng:", homeFile);
