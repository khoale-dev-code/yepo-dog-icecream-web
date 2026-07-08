const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

/* 1) Chỉ lấy danh sách món nổi bật, homepage chỉ render tối đa 6 món */
content = content.replace(
  /const products = getList\(store, "products"\)[\s\S]*?\.slice\(0, 4\);/,
  `const featuredProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const products = featuredProducts.slice(0, 6);
  const signatureProductTotal = featuredProducts.length;`
);

/* 2) Thay toàn bộ section Signature Menu */
const menuStart = content.indexOf("      {/* ☕ MENU SECTION */}");
const journalStart = content.indexOf("      {/* 📰 JOURNAL SECTION */}");

if (menuStart === -1) {
  throw new Error("Không tìm thấy marker MENU SECTION");
}

if (journalStart === -1 || journalStart <= menuStart) {
  throw new Error("Không tìm thấy marker JOURNAL SECTION sau MENU SECTION");
}

const newMenuSection = String.raw`      {/* ☕ MENU SECTION */}
      <div className="mx-4 space-y-6 sm:mx-8 sm:space-y-10 lg:mx-12">
        <SectionHeader
          eyebrow="Signature Menu"
          title="Hương vị mộc mạc"
          description="Homepage chỉ trưng bày các món nổi bật nhất. Toàn bộ menu đầy đủ sẽ nằm ở trang Menu để khách dễ tìm kiếm và lọc món."
          action={<LinkButton to="/menu">Xem toàn bộ Menu</LinkButton>}
        />

        <Reveal
          as="section"
          className="relative overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_8px_34px_rgba(185,140,73,0.08)] sm:p-6 lg:p-7"
        >
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f6d77d]/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-[#b98c49]/10 blur-3xl" />

          <div className="relative z-10 mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-4 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49] ring-1 ring-[#b98c49]/20">
                <IceCream2 size={15} />
                Featured picks
              </div>

              <h3 className="mt-3 text-xl font-['Quicksand'] font-bold text-[#2D2D2D] sm:text-2xl">
                Món nổi bật hôm nay
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#666666]">
                {signatureProductTotal > 0
                  ? "Đang hiển thị tối đa 6 món nổi bật để trang chủ luôn nhẹ, gọn và dễ xem trên điện thoại."
                  : "Chưa có món nổi bật. Hãy bật trạng thái món nổi bật trong trang quản trị."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f6d77d]/30 px-4 py-2 text-xs font-['Quicksand'] font-bold text-[#8c672f]">
                {signatureProductTotal} món nổi bật
              </span>

              <Link
                to="/menu"
                className="hidden h-11 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-5 text-xs font-['Quicksand'] font-bold text-white transition hover:bg-[#a1783a] sm:inline-flex"
              >
                Vào Menu
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 2xl:grid-cols-6">
                {products.map((product, i) => (
                  <SignatureMenuCard
                    key={product._id || product.id || product.name}
                    product={product}
                    index={i}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] border border-[#b98c49]/10 bg-[#FFFAFA] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium leading-relaxed text-[#666666]">
                  {signatureProductTotal > products.length
                    ? "Còn nhiều món khác trong menu đầy đủ. Khách có thể xem theo danh mục, topping và giá tại trang Menu."
                    : "Các món nổi bật đang được hiển thị đầy đủ tại trang chủ."}
                </p>

                <Link
                  to="/menu"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-['Quicksand'] font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/20"
                >
                  Xem tất cả món
                  <ArrowRight size={15} />
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

/* 3) Thêm component card riêng cho Signature Menu nếu chưa có */
const cardComponent = String.raw`
function SignatureMenuCard({ product, index }) {
  return (
    <Link
      to={getProductPath(product)}
      className="group flex min-w-[78vw] max-w-[310px] snap-start flex-col overflow-hidden rounded-[1.5rem] border border-[#b98c49]/15 bg-white shadow-[0_6px_22px_rgba(185,140,73,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b98c49]/45 hover:shadow-[0_14px_34px_rgba(185,140,73,0.14)] sm:min-w-0 sm:max-w-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[#b98c49]/10 bg-[#FFFAFA] p-4">
        <img
          src={getMedia(product)}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#2D2D2D] shadow-sm ring-1 ring-[#b98c49]/15">
          {product.category || product.categoryId?.name || "Signature"}
        </div>

        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#f6d77d] text-xs font-['Fredoka'] font-bold text-[#8c672f] shadow-sm">
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-1 text-base font-['Quicksand'] font-bold text-[#2D2D2D]">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-[#666666]">
          {product.description || "Hương vị đặc trưng chỉ có tại YEPO."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="min-w-0 truncate text-sm font-['Fredoka'] font-semibold text-[#2D2D2D]">
            {formatPrice(product.price)}
          </span>

          <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#f6d77d]/35 px-4 text-xs font-['Quicksand'] font-bold text-[#b98c49] transition-colors group-hover:bg-[#b98c49] group-hover:text-white">
            Chi tiết
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

`;

content = content.slice(0, menuStart) + newMenuSection + content.slice(journalStart);

if (!content.includes("function SignatureMenuCard")) {
  const insertBefore = content.indexOf("function getTodayValue");

  if (insertBefore === -1) {
    throw new Error("Không tìm thấy function getTodayValue để chèn SignatureMenuCard");
  }

  content = content.slice(0, insertBefore) + cardComponent + content.slice(insertBefore);
}

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã redesign Signature Menu:");
console.log("- Mobile dùng horizontal scroll snap");
console.log("- Desktop dùng grid");
console.log("- Homepage chỉ render tối đa 6 món nổi bật");
console.log("- Nếu có 1000 món, toàn bộ nằm ở trang /menu");
