const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1) Giữ homepage chỉ render tối đa 6 món nổi bật */
content = content.replace(
  /const featuredProducts = getList\(store, "products"\)[\s\S]*?const secondarySignatureProducts = products\.slice\(1, 6\);/,
  `const featuredProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const products = featuredProducts.slice(0, 6);
  const signatureProductTotal = featuredProducts.length;`
);

content = content.replace(
  /const featuredProducts = getList\(store, "products"\)[\s\S]*?const signatureProductTotal = featuredProducts\.length;/,
  `const featuredProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const products = featuredProducts.slice(0, 6);
  const signatureProductTotal = featuredProducts.length;`
);

/* 2) Thay toàn bộ Signature Menu section thành grid đều nhau */
const menuStart = content.indexOf("      {/* ☕ MENU SECTION */}");
const journalStart = content.indexOf("      {/* 📰 JOURNAL SECTION */}");

if (menuStart === -1) {
  throw new Error("Không tìm thấy MENU SECTION");
}

if (journalStart === -1 || journalStart <= menuStart) {
  throw new Error("Không tìm thấy JOURNAL SECTION sau MENU SECTION");
}

const newMenuSection = String.raw`      {/* ☕ MENU SECTION */}
      <div className="mx-4 space-y-6 sm:mx-8 sm:space-y-10 lg:mx-12">
        <SectionHeader
          eyebrow="Signature Menu"
          title="Hương vị mộc mạc"
          description="Các món nổi bật được chọn lọc để khách xem nhanh ở trang chủ. Menu đầy đủ sẽ nằm ở trang Menu để dễ tìm kiếm và lọc món."
          action={<LinkButton to="/menu">Xem toàn bộ Menu</LinkButton>}
        />

        <Reveal
          as="section"
          className="relative overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_18px_70px_rgba(185,140,73,0.1)] sm:p-7 lg:p-9"
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#f6d77d]/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#b98c49]/10 blur-3xl" />

          <div className="relative z-10 mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-4 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49] ring-1 ring-[#b98c49]/20">
                <IceCream2 size={15} />
                Featured picks
              </div>

              <h3 className="mt-4 text-3xl font-['Quicksand'] font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
                Món nổi bật hôm nay
              </h3>

              <p className="mt-3 max-w-3xl text-base leading-8 text-[#666666]">
                {signatureProductTotal > 0
                  ? "Trang chủ chỉ hiển thị tối đa 6 món nổi bật để giao diện nhẹ, đẹp và dễ xem. Các món còn lại nằm trong trang Menu đầy đủ."
                  : "Chưa có món nổi bật. Hãy bật trạng thái món nổi bật trong trang quản trị."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f6d77d]/35 px-5 py-3 text-sm font-['Quicksand'] font-bold text-[#8c672f]">
                {signatureProductTotal} món nổi bật
              </span>

              <Link
                to="/menu"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition hover:bg-[#a1783a]"
              >
                Vào Menu
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:gap-7">
                {products.map((product, i) => (
                  <SignatureMenuCard
                    key={product._id || product.id || product.name}
                    product={product}
                    index={i}
                  />
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] border border-[#b98c49]/10 bg-[#FFFAFA] p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium leading-7 text-[#666666]">
                  {signatureProductTotal > products.length
                    ? "Còn nhiều món khác trong menu đầy đủ. Khách có thể xem theo danh mục, topping và giá tại trang Menu."
                    : "Các món nổi bật đang được hiển thị đầy đủ tại trang chủ."}
                </p>

                <Link
                  to="/menu"
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-['Quicksand'] font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/20"
                >
                  Xem tất cả món
                  <ArrowRight size={16} />
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-[1.75rem] border-2 border-dashed border-[#b98c49]/25 bg-[#FFFAFA] px-5 py-12 text-center">
              <IceCream2 size={42} className="mx-auto text-[#b98c49]" />
              <h3 className="mt-4 text-xl font-['Quicksand'] font-bold text-[#2D2D2D]">
                Chưa có món nổi bật
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#666666]">
                Vào admin và bật “Món nổi bật” cho các món muốn trưng bày ở homepage.
              </p>
              <Link
                to="/menu"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-5 text-sm font-['Quicksand'] font-bold text-white transition hover:bg-[#a1783a]"
              >
                Xem menu
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </Reveal>
      </div>

`;

content = content.slice(0, menuStart) + newMenuSection + content.slice(journalStart);

/* 3) Thay SignatureMenuCard thành card đều nhau, hiển thị đầy đủ hơn */
const getTodayIndex = content.indexOf("function getTodayValue");

if (getTodayIndex === -1) {
  throw new Error("Không tìm thấy function getTodayValue");
}

let cardStart = content.lastIndexOf("function SignatureMenuCard", getTodayIndex);

if (cardStart === -1) {
  cardStart = getTodayIndex;
}

const newSignatureMenuCard = String.raw`function SignatureMenuCard({ product, index }) {
  return (
    <Link
      to={getProductPath(product)}
      className="group flex min-w-[84vw] snap-start flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_38px_rgba(185,140,73,0.1)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_20px_55px_rgba(185,140,73,0.16)] sm:min-w-0"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[#b98c49]/10 bg-[#FFFAFA] p-6">
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

      <div className="flex flex-1 flex-col p-6">
        <h3 className="min-h-[64px] text-2xl font-['Quicksand'] font-bold leading-tight text-[#2D2D2D]">
          {product.name}
        </h3>

        <p className="mt-3 min-h-[84px] text-[15px] leading-7 text-[#666666]">
          {product.description || "Hương vị đặc trưng chỉ có tại YEPO."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-7">
          <span className="min-w-0 text-xl font-['Fredoka'] font-semibold text-[#2D2D2D]">
            {formatPrice(product.price)}
          </span>

          <span className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f6d77d]/35 px-5 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white">
            Xem chi tiết
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

`;

content = content.slice(0, cardStart) + newSignatureMenuCard + content.slice(getTodayIndex);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã đổi Signature Menu thành các card đều nhau, desktop hiển thị đầy đủ hơn.");
