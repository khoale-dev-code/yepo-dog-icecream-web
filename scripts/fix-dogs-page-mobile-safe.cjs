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

const dogsFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");

  return (
    code.includes("export default function DogsPage") &&
    code.includes("PAGE_SIZE") &&
    code.includes("dogs")
  );
});

if (!dogsFile) {
  throw new Error("Không tìm thấy file DogsPage.jsx.");
}

const nextCode = String.raw`import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Heart,
  PawPrint,
  Play,
  Search,
  Sparkles,
  Star,
  Weight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 12;

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getDogSearchText(dog) {
  return [
    dog?.name,
    dog?.nickname,
    dog?.breed,
    dog?.gender,
    dog?.personality,
    dog?.favoriteTreat,
    ...(Array.isArray(dog?.personalityTags) ? dog.personalityTags : []),
    ...(Array.isArray(dog?.favoriteTreats) ? dog.favoriteTreats : []),
  ]
    .filter(Boolean)
    .join(" ");
}

function isVideoMedia(media) {
  const url = String(media?.url || "").toLowerCase();
  const type = String(media?.resourceType || media?.type || "").toLowerCase();

  return (
    type === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getDogMedia(dog) {
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

function getDogImage(dog) {
  if (dog?.imageUrl) return dog.imageUrl;

  const media = getDogMedia(dog);
  const firstImage = media.find((item) => !isVideoMedia(item)) || media[0];

  return firstImage?.url || "";
}

function getGenderLabel(gender) {
  if (gender === "male") return "Đực";
  if (gender === "female") return "Cái";
  return "Chưa rõ";
}

function getPatternLabel(pattern) {
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

function formatList(value, fallback = "Chưa cập nhật") {
  if (Array.isArray(value) && value.length > 0) {
    return value.filter(Boolean).join(", ");
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function formatBirthday(value) {
  if (!value) return "Chưa cập nhật";

  return String(value).slice(0, 10);
}

export default function DogsPage({ store }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeDog, setActiveDog] = useState(null);
  const listScrollRef = useRef(0);

  const dogs = useMemo(() => {
    return getList(store, "dogs")
      .filter((dog) => dog.isActive !== false)
      .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));
  }, [store]);

  const filteredDogs = useMemo(() => {
    const keyword = normalizeText(query);

    if (!keyword) return dogs;

    return dogs.filter((dog) =>
      normalizeText(getDogSearchText(dog)).includes(keyword)
    );
  }, [dogs, query]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const visibleDogs = filteredDogs.slice(0, visibleCount);
  const featuredCount = dogs.filter((dog) => dog.isFeatured === true).length;
  const hasMore = visibleCount < filteredDogs.length;

  function handleLoadMore() {
    setVisibleCount((current) => current + PAGE_SIZE);
  }

  function openDog(dog) {
    if (typeof window !== "undefined") {
      listScrollRef.current =
        window.scrollY || document.documentElement.scrollTop || 0;
    }

    setActiveDog(dog);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  }

  function closeDog() {
    setActiveDog(null);

    requestAnimationFrame(() => {
      window.scrollTo({
        top: listScrollRef.current || 0,
        left: 0,
        behavior: "auto",
      });
    });
  }

  if (activeDog) {
    return <DogDetailPage dog={activeDog} onBack={closeDog} />;
  }

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#FFFAFA] px-3 py-5 text-[#2f2115] sm:px-0 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <section className="relative overflow-hidden rounded-[28px] border border-[#ead7b6] bg-white p-4 shadow-[0_18px_54px_rgba(115,81,34,.08)] sm:rounded-[36px] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f6d77d]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#b98c49]/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b98c49] ring-1 ring-[#ead7b6]">
              <PawPrint size={14} />
              Hồ sơ cún
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="max-w-3xl text-3xl font-black leading-tight text-[#2f2115] sm:text-5xl">
                  Tất cả những bé cún của YEPO
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#755b38] sm:text-base">
                  Xem hồ sơ, tính cách và những điều đáng yêu của các bé cún đang được bật công khai tại YEPO.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                <InfoPill icon={PawPrint} label="Tổng hồ sơ" value={dogs.length} />
                <InfoPill icon={Heart} label="Nổi bật" value={featuredCount} />
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#ead7b6] bg-[#FFFAFA] p-3 sm:max-w-xl">
              <label className="flex h-12 items-center gap-3 rounded-2xl bg-white px-4 ring-1 ring-[#ead7b6]/70 focus-within:ring-2 focus-within:ring-[#b98c49]/40">
                <Search size={18} className="shrink-0 text-[#b98c49]" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên, giống, tính cách..."
                  className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-[#2f2115] outline-none placeholder:text-[#a58a65] sm:text-sm"
                />
              </label>
            </div>
          </div>
        </section>

        {dogs.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                  Danh sách cún
                </p>

                <p className="mt-1 text-sm font-semibold text-[#755b38]">
                  Đang hiển thị {visibleDogs.length}/{filteredDogs.length} hồ sơ
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#8c672f] shadow-sm ring-1 ring-[#ead7b6] sm:inline-flex">
                <Sparkles size={14} />
                YEPO friends
              </div>
            </div>

            {filteredDogs.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                  {visibleDogs.map((dog) => (
                    <DogListCard
                      key={dog._id || dog.id || dog.name}
                      dog={dog}
                      onOpen={() => openDog(dog)}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(185,140,73,0.22)] transition hover:bg-[#8c672f] sm:w-auto"
                    >
                      Xem thêm 12 bé
                      <ArrowRight size={16} />
                    </button>

                    <p className="mt-3 text-xs font-semibold text-[#a58a65]">
                      Còn {filteredDogs.length - visibleDogs.length} hồ sơ chưa hiển thị.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <section className="rounded-[30px] border border-dashed border-[#ead7b6] bg-white px-6 py-12 text-center">
                <Search size={38} className="mx-auto text-[#b98c49]" />

                <p className="mt-4 text-lg font-black text-[#2f2115]">
                  Không tìm thấy bé cún phù hợp.
                </p>

                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-5 text-sm font-bold text-white"
                >
                  Xóa tìm kiếm
                  <ArrowRight size={15} />
                </button>
              </section>
            )}
          </section>
        ) : (
          <section className="rounded-[30px] border border-dashed border-[#ead7b6] bg-white px-6 py-14 text-center shadow-sm">
            <PawPrint size={42} className="mx-auto text-[#b98c49]" />

            <p className="mt-4 text-lg font-black text-[#2f2115]">
              Chưa có hồ sơ cún công khai.
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#755b38]">
              Vào admin và bật trạng thái công khai cho hồ sơ cún để hiển thị tại đây.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function DogListCard({ dog, onOpen }) {
  const image = getDogImage(dog);
  const personalityTags = Array.isArray(dog?.personalityTags)
    ? dog.personalityTags.slice(0, 3)
    : [];
  const isFeatured = dog?.isFeatured === true;

  return (
    <article className="overflow-hidden rounded-[30px] border border-[#ead7b6] bg-white shadow-[0_14px_36px_rgba(115,81,34,.08)]">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={"Xem chi tiết " + (dog?.name || "cún YEPO")}
      >
        <div className="relative bg-[#FFFAFA] p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#f6d77d]/20">
            {image ? (
              <img
                src={image}
                alt={dog?.name || "Cún YEPO"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-[#b98c49]">
                <PawPrint size={48} />
              </div>
            )}

            {isFeatured && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#b98c49] shadow-sm">
                <Star size={13} fill="currentColor" />
                Nổi bật
              </span>
            )}

            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#8c672f] shadow-sm">
              Bấm để xem chi tiết
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-1 text-2xl font-black leading-tight text-[#2f2115]">
                {dog?.name || "Vô danh"}
              </h2>

              <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#755b38]">
                {dog?.breed || "Chưa rõ giống"}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#f6d77d]/40 px-3 py-1 text-xs font-black text-[#8c672f]">
              {dog?.sortOrder ? "#" + dog.sortOrder : "YEPO"}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#755b38]">
            {dog?.personality ||
              personalityTags.join(", ") ||
              "Chưa cập nhật tính cách"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip>{getGenderLabel(dog?.gender)}</Chip>
            <Chip>{dog?.weightKg ? dog.weightKg + "kg" : "N/A"}</Chip>
            <Chip>{dog?.favoriteTreat || "YEPO friend"}</Chip>
          </div>
        </div>
      </button>
    </article>
  );
}

function DogDetailPage({ dog, onBack }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const media = getDogMedia(dog);
  const activeMedia = media[activeIndex];
  const isVideo = isVideoMedia(activeMedia);

  const personalityText =
    dog?.personality || formatList(dog?.personalityTags, "Chưa cập nhật tính cách");

  const favoriteTreatText = formatList(
    dog?.favoriteTreats,
    dog?.favoriteTreat || "Chưa cập nhật"
  );

  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-[#FFFAFA] text-[#2f2115]">
      <header className="sticky top-0 z-40 border-b border-[#ead7b6] bg-white/95 px-3 py-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFAFA] text-[#2f2115] ring-1 ring-[#ead7b6]"
            aria-label="Quay lại danh sách cún"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
              Hồ sơ cún YEPO
            </p>

            <h1 className="truncate text-xl font-black leading-tight text-[#2f2115]">
              {dog?.name || "Vô danh"}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-3 pb-[max(28px,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6">
        <section className="overflow-hidden rounded-[30px] border border-[#ead7b6] bg-white shadow-[0_18px_54px_rgba(115,81,34,.08)]">
          <div className="bg-[#2f2115]">
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
                  className="block h-auto max-h-none w-full bg-[#2f2115] object-contain"
                />
              )
            ) : (
              <div className="grid min-h-[300px] place-items-center text-white">
                <PawPrint size={64} />
              </div>
            )}
          </div>

          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto bg-[#FFFAFA] px-3 py-3">
              {media.map((item, index) => (
                <button
                  key={(item.url || "") + "-" + index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white",
                    activeIndex === index
                      ? "border-[#b98c49] ring-2 ring-[#b98c49]/20"
                      : "border-[#ead7b6]",
                  ].join(" ")}
                  aria-label={"Xem media " + (index + 1)}
                >
                  {isVideoMedia(item) ? (
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
              ))}
            </div>
          )}
        </section>

        <section className="mt-4 rounded-[30px] border border-[#ead7b6] bg-white p-5 shadow-[0_14px_40px_rgba(115,81,34,.06)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                Full profile
              </p>

              <h2 className="mt-2 break-words text-4xl font-black leading-none text-[#2f2115]">
                {dog?.name || "Vô danh"}
              </h2>

              {dog?.nickname && (
                <p className="mt-2 text-base font-semibold leading-7 text-[#755b38]">
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
            <DetailBox label="Giống / chủng loại" value={dog?.breed || "Chưa cập nhật"} />
            <DetailBox label="Giới tính" value={getGenderLabel(dog?.gender)} />
            <DetailBox label="Tuổi" value={dog?.age || "Chưa cập nhật"} />
            <DetailBox label="Sinh nhật" value={formatBirthday(dog?.birthday)} icon={<CalendarDays size={15} />} />
            <DetailBox label="Cân nặng" value={dog?.weightKg ? dog.weightKg + " kg" : "Chưa cập nhật"} icon={<Weight size={15} />} />
            <DetailBox label="Độ dễ thương" value={(dog?.cutenessLevel || 70) + "/100"} />
            <DetailBox label="Kiểu lông" value={getPatternLabel(dog?.coatPattern)} />
            <DetailBox label="Trạng thái" value={dog?.isActive === false ? "Đang ẩn" : "Đang hiển thị"} />
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

          <LongDetail label="Tính cách" value={personalityText} />
          <LongDetail label="Món yêu thích" value={favoriteTreatText} />

          <div className="mt-5 flex flex-wrap gap-2">
            <Chip>{getGenderLabel(dog?.gender)}</Chip>
            <Chip>{dog?.weightKg ? dog.weightKg + "kg" : "N/A"}</Chip>
            <Chip>{getPatternLabel(dog?.coatPattern)}</Chip>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-[#ead7b6] bg-[#FFFAFA] p-3 text-center shadow-sm sm:min-w-[130px] sm:text-left">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#f6d77d]/45 text-[#b98c49] sm:mx-0">
        <Icon size={17} />
      </div>

      <p className="mt-2 text-2xl font-black leading-none text-[#2f2115]">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#b98c49]">
        {label}
      </p>
    </div>
  );
}

function DetailBox({ label, value, icon }) {
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

function LongDetail({ label, value }) {
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

function Chip({ children }) {
  return (
    <span className="whitespace-nowrap rounded-full bg-[#f6d77d]/35 px-3 py-1.5 text-xs font-bold text-[#8c672f]">
      {children}
    </span>
  );
}
`;

fs.writeFileSync(dogsFile, nextCode, "utf8");

console.log("✅ Đã thay DogsPage bằng bản mobile-safe:", dogsFile);
