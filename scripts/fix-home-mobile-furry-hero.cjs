const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1) Hero badge: mobile gọn hơn, desktop vẫn giữ YEPO Coffee & Pets */
const oldHeroBadge = `<span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/30 bg-[#FFFAFA]/80 px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49] backdrop-blur-md">
              <Sparkles size={14} className="text-[#b98c49]" />
              YEPO Coffee & Pets
            </span>`;

const newHeroBadge = `<span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#b98c49]/30 bg-[#FFFAFA]/80 px-3 py-2 text-[10px] font-['Fredoka'] font-semibold uppercase tracking-[0.14em] text-[#b98c49] backdrop-blur-md sm:px-4 sm:text-xs sm:tracking-widest">
              <Sparkles size={14} className="shrink-0 text-[#b98c49]" />
              <span className="sm:hidden">YEPO Cafe & Pets</span>
              <span className="hidden sm:inline">YEPO Coffee & Pets</span>
            </span>`;

if (!content.includes(oldHeroBadge)) {
  throw new Error("Không tìm thấy hero badge YEPO Coffee & Pets để thay.");
}

content = content.replace(oldHeroBadge, newHeroBadge);

/* 2) Our Furry Friends: mobile kéo ngang, desktop vẫn grid */
const oldDogsSection = `{featuredDogs.length > 0 ? (
          <section className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featuredDogs.map((dog, index) => (
              <Reveal key={dog._id || dog.id || dog.name} delay={index * 100}>
                <DogProfileCard dog={dog} />
              </Reveal>
            ))}
          </section>
        ) : (`;

const newDogsSection = `{featuredDogs.length > 0 ? (
          <>
            <section className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3">
              {featuredDogs.map((dog, index) => (
                <Reveal
                  key={dog._id || dog.id || dog.name}
                  delay={index * 100}
                  className="min-w-[82vw] max-w-[360px] snap-start sm:min-w-0 sm:max-w-none"
                >
                  <DogProfileCard dog={dog} />
                </Reveal>
              ))}
            </section>

            {featuredDogs.length > 1 && (
              <div className="-mt-5 flex items-center justify-between rounded-2xl border border-[#b98c49]/10 bg-white px-4 py-3 text-xs font-['Quicksand'] font-bold text-[#8c672f] shadow-sm sm:hidden">
                <span>Lướt sang phải để xem thêm các bé</span>
                <ArrowRight size={15} />
              </div>
            )}
          </>
        ) : (`;

if (!content.includes(oldDogsSection)) {
  throw new Error("Không tìm thấy block Our Furry Friends để thay.");
}

content = content.replace(oldDogsSection, newDogsSection);

/* 3) Mobile hero spacing nhẹ hơn, desktop giữ nguyên */
content = content.replace(
  `className="relative mx-4 overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white px-6 py-12 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:p-14 lg:mx-12 lg:p-20"`,
  `className="relative mx-4 overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white px-5 py-9 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:rounded-[2.5rem] sm:p-14 lg:mx-12 lg:p-20"`
);

content = content.replace(
  `className="mt-8 font-['Quicksand'] text-4xl font-bold tracking-tight text-[#2D2D2D] sm:text-6xl lg:leading-[1.1]"`,
  `className="mt-6 font-['Quicksand'] text-3xl font-bold tracking-tight text-[#2D2D2D] sm:mt-8 sm:text-6xl lg:leading-[1.1]"`
);

content = content.replace(
  `className="mt-6 text-base font-normal leading-relaxed text-[#666666] sm:text-lg"`,
  `className="mt-4 text-sm font-normal leading-7 text-[#666666] sm:mt-6 sm:text-lg sm:leading-relaxed"`
);

content = content.replace(
  `className="mt-10 flex flex-wrap gap-4"`,
  `className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"`
);

content = content.replace(
  `className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#b98c49] px-8 text-sm font-['Quicksand'] font-bold text-white transition-all duration-300 hover:bg-[#a1783a] hover:shadow-lg hover:shadow-[#b98c49]/30"`,
  `className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-['Quicksand'] font-bold text-white transition-all duration-300 hover:bg-[#a1783a] hover:shadow-lg hover:shadow-[#b98c49]/30 sm:h-14 sm:px-8"`
);

content = content.replace(
  `className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#b98c49]/30 bg-white px-8 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all duration-300 hover:border-[#b98c49] hover:bg-[#FFFAFA]"`,
  `className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-[#b98c49]/30 bg-white px-6 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all duration-300 hover:border-[#b98c49] hover:bg-[#FFFAFA] sm:h-14 sm:px-8"`
);

content = content.replace(
  `className="mt-12 flex items-center gap-8 border-t border-[#b98c49]/20 pt-8"`,
  `className="mt-9 grid grid-cols-3 gap-3 border-t border-[#b98c49]/20 pt-6 sm:mt-12 sm:flex sm:items-center sm:gap-8 sm:pt-8"`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cải thiện homepage mobile:");
console.log("- Our Furry Friends kéo ngang ở mobile");
console.log("- Desktop Our Furry Friends vẫn giữ grid");
console.log("- YEPO Coffee & Pets gọn hơn ở mobile, desktop giữ nguyên");
