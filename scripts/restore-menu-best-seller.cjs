const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/MenuPage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/MenuPage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

if (!content.includes("const bestSellerProducts = useMemo")) {
  content = content.replace(
    `  const filteredProducts = useMemo(() => {`,
    `  const bestSellerProducts = useMemo(() => {
    return products.filter((item) => item.isFeatured === true).slice(0, 20);
  }, [products]);

  const filteredProducts = useMemo(() => {`
  );
}

if (!content.includes("{bestSellerProducts.length > 0 && (")) {
  content = content.replace(
    `        <section className="mt-5">`,
    `        {bestSellerProducts.length > 0 && (
          <BestSellerSection products={bestSellerProducts} />
        )}

        <section className="mt-5">`
  );
}

if (!content.includes("function BestSellerSection")) {
  content = content.replace(
    `function ProductPager({ products }) {`,
    `function BestSellerSection({ products }) {
  const scrollerRef = useRef(null);

  function scrollByCard(direction) {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * Math.min(scroller.clientWidth * 0.85, 720),
      behavior: "smooth",
    });
  }

  return (
    <section className="mt-5 rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_8px_34px_rgba(185,140,73,0.07)] sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#8c672f]">
            <Crown size={14} />
            Best Seller
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#2D2D2D] sm:text-2xl">
            Món nổi bật được yêu thích
          </h2>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#b98c49]/15 transition hover:bg-[#f6d77d]/25"
            aria-label="Best seller trước"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#b98c49]/15 transition hover:bg-[#f6d77d]/25"
            aria-label="Best seller sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {products.map((product) => (
          <BestSellerCard key={getId(product)} product={product} />
        ))}
      </div>
    </section>
  );
}

function BestSellerCard({ product }) {
  const image = getMedia(product);
  const category = getCategory(product);

  return (
    <Link
      to={getProductPath(product)}
      className="group grid w-[250px] shrink-0 snap-start grid-cols-[92px_minmax(0,1fr)] overflow-hidden rounded-[1.5rem] border border-[#b98c49]/15 bg-[#FFFAFA] shadow-[0_6px_22px_rgba(185,140,73,.06)] transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_44px_rgba(185,140,73,.13)] sm:w-[300px] sm:grid-cols-[112px_minmax(0,1fr)]"
    >
      <div className="relative aspect-square bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(246,215,125,.25),transparent_48%)]" />

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain p-3 transition group-hover:scale-105"
          />
        ) : (
          <div className="relative z-10 grid h-full place-items-center text-[#b98c49]">
            <IceCream2 size={30} />
          </div>
        )}

        <span className="absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-[#b98c49] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
          <Crown size={10} />
          Best
        </span>
      </div>

      <div className="flex min-w-0 flex-col p-3">
        {category && (
          <span className="mb-2 inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-[#f6d77d]/30 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8c672f]">
            <Tag size={10} />
            <span className="truncate">{category}</span>
          </span>
        )}

        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#2D2D2D]">
          {product.name}
        </h3>

        <p className="mt-auto pt-2 text-sm font-bold text-[#b98c49]">
          {formatPrice(getProductPrice(product))}
        </p>
      </div>
    </Link>
  );
}

function ProductPager({ products }) {`
  );
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã thêm lại Best Seller dạng compact ngang, không chiếm diện tích.");
