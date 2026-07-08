const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1) Desktop không chia 6 cột nữa, card sẽ to hơn */
content = content.replace(
  /sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 2xl:grid-cols-6/g,
  "sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 2xl:grid-cols-3"
);

/* 2) Làm card Signature Menu lớn hơn và thoáng hơn */
content = content.replace(
  /className="group flex min-w-\[78vw\] max-w-\[310px\] snap-start flex-col overflow-hidden rounded-\[1\.5rem\] border border-\[#b98c49\]\/15 bg-white shadow-\[0_6px_22px_rgba\(185,140,73,0\.08\)\] transition-all duration-300 hover:-translate-y-1 hover:border-\[#b98c49\]\/45 hover:shadow-\[0_14px_34px_rgba\(185,140,73,0\.14\)\] sm:min-w-0 sm:max-w-none"/g,
  'className="group flex min-w-[82vw] max-w-[340px] snap-start flex-col overflow-hidden rounded-[1.75rem] border border-[#b98c49]/15 bg-white shadow-[0_8px_28px_rgba(185,140,73,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_18px_44px_rgba(185,140,73,0.14)] sm:min-w-0 sm:max-w-none"'
);

/* 3) Tăng vùng ảnh để món nhìn rõ hơn */
content = content.replace(
  /className="relative aspect-\[4\/3\] overflow-hidden border-b border-\[#b98c49\]\/10 bg-\[#FFFAFA\] p-4"/g,
  'className="relative aspect-[4/3] overflow-hidden border-b border-[#b98c49]/10 bg-[#FFFAFA] p-5 sm:p-6 lg:aspect-[5/3]"'
);

/* 4) Tăng kích thước chữ và spacing trong card desktop */
content = content.replace(
  /className="flex flex-1 flex-col p-4 sm:p-5"/g,
  'className="flex flex-1 flex-col p-5 sm:p-6"'
);

content = content.replace(
  /className="line-clamp-1 text-base font-\['Quicksand'\] font-bold text-\[#2D2D2D\]"/g,
  'className="line-clamp-1 text-lg font-[\\'Quicksand\\'] font-bold text-[#2D2D2D] lg:text-xl"'
);

content = content.replace(
  /className="mt-2 line-clamp-2 min-h-\[40px\] text-sm leading-relaxed text-\[#666666\]"/g,
  'className="mt-2 line-clamp-2 min-h-[48px] text-sm leading-7 text-[#666666] lg:text-[15px]"'
);

content = content.replace(
  /className="min-w-0 truncate text-sm font-\['Fredoka'\] font-semibold text-\[#2D2D2D\]"/g,
  'className="min-w-0 truncate text-base font-[\\'Fredoka\\'] font-semibold text-[#2D2D2D] lg:text-lg"'
);

content = content.replace(
  /className="inline-flex h-9 shrink-0 items-center justify-center gap-1\.5 rounded-full bg-\[#f6d77d\]\/35 px-4 text-xs font-\['Quicksand'\] font-bold text-\[#b98c49\] transition-colors group-hover:bg-\[#b98c49\] group-hover:text-white"/g,
  'className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#f6d77d]/35 px-5 text-sm font-[\\'Quicksand\\'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white"'
);

/* 5) Card wrapper section rộng và cân hơn trên desktop */
content = content.replace(
  /className="relative overflow-hidden rounded-\[2rem\] border border-\[#b98c49\]\/20 bg-white p-4 shadow-\[0_8px_34px_rgba\(185,140,73,0\.08\)\] sm:p-6 lg:p-7"/g,
  'className="relative overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_8px_34px_rgba(185,140,73,0.08)] sm:p-6 lg:p-8"'
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã chỉnh Signature Menu desktop: card to hơn, tối đa 3 cột, ảnh và text rộng hơn.");
