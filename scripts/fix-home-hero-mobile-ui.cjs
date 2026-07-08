const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1) Hero container: mobile gọn hơn, desktop giữ rộng */
content = content.replace(
  `className="relative mx-4 overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white px-6 py-12 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:p-14 lg:mx-12 lg:p-20"`,
  `className="relative mx-3 overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white px-4 py-7 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:rounded-[2.5rem] sm:p-14 lg:mx-12 lg:p-20"`
);

content = content.replace(
  `className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center"`,
  `className="relative grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-12"`
);

/* 2) Badge YEPO: mobile ngắn hơn, desktop giữ đủ chữ */
content = content.replace(
  `<span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/30 bg-[#FFFAFA]/80 px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49] backdrop-blur-md">
              <Sparkles size={14} className="text-[#b98c49]" />
              YEPO Coffee & Pets
            </span>`,
  `<span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#b98c49]/30 bg-[#FFFAFA]/80 px-3 py-2 text-[10px] font-['Fredoka'] font-semibold uppercase tracking-[0.14em] text-[#b98c49] backdrop-blur-md sm:px-4 sm:text-xs sm:tracking-widest">
              <Sparkles size={14} className="shrink-0 text-[#b98c49]" />
              <span className="sm:hidden">YEPO Cafe & Pets</span>
              <span className="hidden sm:inline">YEPO Coffee & Pets</span>
            </span>`
);

/* 3) Title + mô tả: mobile nhỏ và dễ đọc hơn, desktop giữ size */
content = content.replace(
  `className="mt-8 font-['Quicksand'] text-4xl font-bold tracking-tight text-[#2D2D2D] sm:text-6xl lg:leading-[1.1]"`,
  `className="mt-6 font-['Quicksand'] text-[34px] font-bold leading-[1.12] tracking-tight text-[#2D2D2D] sm:mt-8 sm:text-6xl lg:leading-[1.1]"`
);

content = content.replace(
  `className="mt-6 text-base font-normal leading-relaxed text-[#666666] sm:text-lg"`,
  `className="mt-4 text-[15px] font-normal leading-7 text-[#666666] sm:mt-6 sm:text-lg sm:leading-relaxed"`
);

/* 4) CTA: mobile xếp dọc full width, desktop giữ ngang */
content = content.replace(
  `className="mt-10 flex flex-wrap gap-4"`,
  `className="mt-7 grid gap-3 sm:mt-10 sm:flex sm:flex-wrap sm:gap-4"`
);

content = content.replace(
  `className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#b98c49] px-8 text-sm font-['Quicksand'] font-bold text-white transition-all duration-300 hover:bg-[#a1783a] hover:shadow-lg hover:shadow-[#b98c49]/30"`,
  `className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-['Quicksand'] font-bold text-white transition-all duration-300 hover:bg-[#a1783a] hover:shadow-lg hover:shadow-[#b98c49]/30 sm:h-14 sm:px-8"`
);

content = content.replace(
  `className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#b98c49]/30 bg-white px-8 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all duration-300 hover:border-[#b98c49] hover:bg-[#FFFAFA]"`,
  `className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-[#b98c49]/30 bg-white px-6 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all duration-300 hover:border-[#b98c49] hover:bg-[#FFFAFA] sm:h-14 sm:px-8"`
);

/* 5) Metric: mobile thành 3 ô nhỏ, desktop giữ flex + separator */
content = content.replace(
  `className="mt-12 flex items-center gap-8 border-t border-[#b98c49]/20 pt-8"`,
  `className="mt-8 grid grid-cols-3 gap-2 border-t border-[#b98c49]/20 pt-5 sm:mt-12 sm:flex sm:items-center sm:gap-8 sm:pt-8"`
);

content = content.replaceAll(
  `<div className="h-10 w-px bg-[#b98c49]/20" />`,
  `<div className="hidden h-10 w-px bg-[#b98c49]/20 sm:block" />`
);

/* 6) Hero image: mobile thấp hơn, đẹp hơn; desktop vẫn square */
content = content.replace(
  `className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#b98c49]/20 shadow-2xl shadow-[#b98c49]/15 sm:aspect-square"`,
  `className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-[#b98c49]/20 shadow-2xl shadow-[#b98c49]/15 sm:aspect-square sm:rounded-[2rem]"`
);

/* 7) Thêm badge pet-friendly trong ảnh ở mobile */
content = content.replace(
  `<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />`,
  `<div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_12px_30px_rgba(185,140,73,0.18)] backdrop-blur-md sm:hidden">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6d77d]/45 text-[#b98c49]">
                  <PawPrint size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-['Fredoka'] font-semibold text-[#2D2D2D]">
                    Pet-friendly Cafe
                  </p>
                  <p className="truncate text-xs font-['Quicksand'] text-[#666666]">
                    Không gian mở & an toàn
                  </p>
                </div>
              </div>`
);

/* 8) MetricCard: mobile thành card nhỏ, desktop giữ cảm giác cũ */
content = content.replace(
  `function MetricCard({ label, value }) {
  return (
    <div>
      <p className="text-3xl font-['Fredoka'] font-semibold text-[#2D2D2D] sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-['Quicksand'] font-bold uppercase tracking-widest text-[#b98c49]">
        {label}
      </p>
    </div>
  );
}`,
  `function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#FFFAFA] px-2.5 py-3 text-center ring-1 ring-[#b98c49]/10 sm:bg-transparent sm:px-0 sm:py-0 sm:text-left sm:ring-0">
      <p className="text-2xl font-['Fredoka'] font-semibold text-[#2D2D2D] sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-['Quicksand'] font-bold uppercase leading-tight tracking-widest text-[#b98c49] sm:text-xs">
        {label}
      </p>
    </div>
  );
}`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cải thiện hero mobile:");
console.log("- Hero gọn hơn trên mobile");
console.log("- Badge YEPO rút gọn ở mobile");
console.log("- CTA full width dễ bấm");
console.log("- Ảnh thấp hơn, có badge Pet-friendly trong ảnh");
console.log("- Metric thành 3 ô nhỏ trên mobile");
console.log("- Desktop giữ nguyên bố cục chính");
