const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* Đảm bảo biến cho Signature Menu desktop showcase tồn tại */
const productStart = content.indexOf('  const featuredProducts = getList(store, "products")');
const dogStart = content.indexOf('  const featuredDogs = getList(store, "dogs")');

if (productStart !== -1 && dogStart !== -1 && dogStart > productStart) {
  const productBlock = `  const featuredProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const products = featuredProducts.slice(0, 6);
  const signatureProductTotal = featuredProducts.length;
  const primarySignatureProduct = products[0] || null;
  const secondarySignatureProducts = products.slice(1, 6);

`;

  content = content.slice(0, productStart) + productBlock + content.slice(dogStart);
}

/* Xóa sạch SignatureMenuCard cũ/bị lỗi và ghi lại component mới */
const getTodayIndex = content.indexOf("function getTodayValue");

if (getTodayIndex === -1) {
  throw new Error("Không tìm thấy function getTodayValue");
}

let cardStart = content.lastIndexOf("function SignatureMenuCard", getTodayIndex);

if (cardStart === -1) {
  cardStart = content.lastIndexOf("\n) {\n    return (\n      <Link", getTodayIndex);
}

if (cardStart === -1) {
  cardStart = getTodayIndex;
}

const newSignatureMenuCard = `function SignatureMenuCard({ product, index, variant = "compact" }) {
  const isHero = variant === "hero";
  const isMobile = variant === "mobile";

  const cardClass = [
    "group flex flex-col overflow-hidden border border-[#b98c49]/15 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45",
    isHero
      ? "min-h-full rounded-[2.25rem] shadow-[0_18px_55px_rgba(185,140,73,0.13)]"
      : "rounded-[1.75rem] shadow-[0_10px_34px_rgba(185,140,73,0.09)] hover:shadow-[0_18px_44px_rgba(185,140,73,0.14)]",
    isMobile ? "min-w-[82vw] max-w-[340px] snap-start" : "min-w-0",
  ].join(" ");

  const imageClass = [
    "relative overflow-hidden border-b border-[#b98c49]/10 bg-[#FFFAFA]",
    isHero ? "aspect-[16/10] p-7" : "aspect-[4/3] p-5",
  ].join(" ");

  return (
    <Link to={getProductPath(product)} className={cardClass}>
      <div className={imageClass}>
        <img
          src={getMedia(product)}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#2D2D2D] shadow-sm ring-1 ring-[#b98c49]/15">
          {product.category || product.categoryId?.name || "Signature"}
        </div>

        <div className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-[#f6d77d] text-sm font-['Fredoka'] font-bold text-[#8c672f] shadow-sm">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className={isHero ? "flex flex-1 flex-col p-7" : "flex flex-1 flex-col p-5"}>
        <h3
          className={
            isHero
              ? "line-clamp-2 text-3xl font-['Quicksand'] font-bold leading-tight text-[#2D2D2D]"
              : "line-clamp-2 text-xl font-['Quicksand'] font-bold leading-snug text-[#2D2D2D]"
          }
        >
          {product.name}
        </h3>

        <p
          className={
            isHero
              ? "mt-4 line-clamp-3 min-h-[84px] text-base leading-7 text-[#666666]"
              : "mt-3 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#666666]"
          }
        >
          {product.description || "Hương vị đặc trưng chỉ có tại YEPO."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span
            className={
              isHero
                ? "min-w-0 truncate text-2xl font-['Fredoka'] font-semibold text-[#2D2D2D]"
                : "min-w-0 truncate text-lg font-['Fredoka'] font-semibold text-[#2D2D2D]"
            }
          >
            {formatPrice(product.price)}
          </span>

          <span
            className={
              isHero
                ? "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition-colors group-hover:bg-[#a1783a]"
                : "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#f6d77d]/35 px-5 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white"
            }
          >
            Xem chi tiết
            <ArrowRight size={isHero ? 17 : 14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

`;

content = content.slice(0, cardStart) + newSignatureMenuCard + content.slice(getTodayIndex);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã xóa phần SignatureMenuCard bị lỗi và ghi lại component mới.");
