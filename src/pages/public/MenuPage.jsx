import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  IceCream2,
  PawPrint,
  Plus,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PRODUCT_PAGE_SIZE = 10;

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function getId(item) {
  return String(item?._id || item?.id || "");
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getProductPath(product) {
  const id = getId(product);
  return `/menu/${id || product?.slug || slugify(product?.name || "")}`;
}

function getCategoryId(product) {
  const categoryId = product?.categoryId;
  const category = product?.category;

  if (categoryId && typeof categoryId === "object") {
    return String(categoryId._id || categoryId.id || "");
  }

  if (category && typeof category === "object") {
    return String(category._id || category.id || "");
  }

  return String(categoryId || "");
}

function getCategory(product) {
  const category = product?.category;
  const categoryId = product?.categoryId;

  if (category && typeof category === "object") {
    return category.name || category.title || "";
  }

  if (categoryId && typeof categoryId === "object") {
    return categoryId.name || categoryId.title || "";
  }

  return product?.category || product?.categoryName || product?.categoryTitle || "";
}

function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

function getMediaUrl(media) {
  if (!media) return "";
  if (typeof media === "string") return media;

  return (
    media.url ||
    media.secureUrl ||
    media.secure_url ||
    media.imageUrl ||
    media.src ||
    ""
  );
}

function getMedia(item) {
  if (Array.isArray(item?.media) && item.media.length > 0) {
    const firstImage = item.media.find((media) => !isVideoMedia(media));
    const url = getMediaUrl(firstImage || item.media[0]);
    if (url) return url;
  }

  return item?.imageUrl || item?.image || item?.thumbnailUrl || "";
}

function formatPrice(value) {
  const number = Number(value || 0);
  if (!number) return "Liên hệ";
  return `${number.toLocaleString("vi-VN")} đ`;
}

function getProductPrice(product) {
  if (product?.price) return Number(product.price);

  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    const prices = product.sizes
      .map((size) => Number(size.price || size.value || 0))
      .filter(Boolean);

    if (prices.length > 0) return Math.min(...prices);
  }

  return 0;
}

function getShortDescription(product) {
  return product?.description || "Hương vị dễ thương, được YEPO chuẩn bị mỗi ngày.";
}

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function categoryMatchesProduct(product, category) {
  const productCategoryId = getCategoryId(product);
  const productCategoryName = normalizeText(getCategory(product));

  const categoryId = String(category?.id || "");
  const categoryName = normalizeText(category?.name);

  return (
    Boolean(categoryId && productCategoryId && productCategoryId === categoryId) ||
    Boolean(categoryName && productCategoryName && productCategoryName === categoryName)
  );
}

function productMatchesQuery(product, keyword) {
  if (!keyword) return true;

  const text = [
    product.name,
    product.description,
    getCategory(product),
    ...(Array.isArray(product.tags) ? product.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes(keyword);
}

export default function MenuPage({ store }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const products = useMemo(() => {
    return getList(store, "products")
      .filter((product) => product.isActive !== false)
      .sort((a, b) => {
        const sortA = Number(a.sortOrder || a.order || 999);
        const sortB = Number(b.sortOrder || b.order || 999);

        if (sortA !== sortB) return sortA - sortB;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [store]);

  const toppings = useMemo(() => {
    return getList(store, "toppings")
      .filter((item) => item.isActive !== false && item.isAvailable !== false)
      .sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));
  }, [store]);

  const categories = useMemo(() => {
    const fromAdmin = getList(store, "categories")
      .filter((category) => category.isActive !== false)
      .map((category) => ({
        id: String(category._id || category.id || category.slug || category.name || ""),
        name: category.name || category.title,
        sortOrder: Number(category.sortOrder || category.order || 999),
      }))
      .filter((category) => category.name)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (fromAdmin.length > 0) return fromAdmin;

    return [...new Set(products.map(getCategory).filter(Boolean))].map((name) => ({
      id: name,
      name,
      sortOrder: 999,
    }));
  }, [store, products]);

  const searchedProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return products.filter((product) => productMatchesQuery(product, keyword));
  }, [products, query]);

  const menuSections = useMemo(() => {
    const usedProductIds = new Set();

    if (activeCategory !== "all") {
      const selectedCategory =
        categories.find(
          (category) =>
            category.id === activeCategory || category.name === activeCategory
        ) || {
          id: activeCategory,
          name: activeCategory,
        };

      const sectionProducts = searchedProducts.filter((product) =>
        categoryMatchesProduct(product, selectedCategory)
      );

      return sectionProducts.length
        ? [
            {
              id: selectedCategory.id || selectedCategory.name,
              name: selectedCategory.name,
              products: sectionProducts,
            },
          ]
        : [];
    }

    const groupedSections = categories
      .map((category) => {
        const sectionProducts = searchedProducts.filter((product) => {
          if (usedProductIds.has(getId(product))) return false;

          const matched = categoryMatchesProduct(product, category);

          if (matched) {
            usedProductIds.add(getId(product));
          }

          return matched;
        });

        return {
          id: category.id || category.name,
          name: category.name,
          products: sectionProducts,
        };
      })
      .filter((section) => section.products.length > 0);

    const otherProducts = searchedProducts.filter(
      (product) => !usedProductIds.has(getId(product))
    );

    if (otherProducts.length > 0) {
      groupedSections.push({
        id: "other",
        name: "Món khác",
        products: otherProducts,
      });
    }

    return groupedSections;
  }, [activeCategory, categories, searchedProducts]);

  const displayedProducts = useMemo(() => {
    return menuSections.flatMap((section) => section.products);
  }, [menuSections]);

  const bestSellerProducts = useMemo(() => {
    return displayedProducts
      .filter((item) => item.isFeatured === true)
      .slice(0, 20);
  }, [displayedProducts]);

  const activeCategoryName =
    activeCategory === "all"
      ? "Tất cả danh mục"
      : categories.find(
          (category) =>
            category.id === activeCategory || category.name === activeCategory
        )?.name || "Danh mục";

  return (
    <main className="min-h-screen bg-[#FFFAFA] font-['Quicksand'] text-[#2D2D2D]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_8px_34px_rgba(185,140,73,0.07)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                <PawPrint size={14} />
                YEPO Menu
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
                {activeCategoryName}
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#666666]">
                {activeCategory === "all"
                  ? "Mỗi danh mục được tách thành một cụm riêng. Vuốt ngang để xem từng nhóm 10 món."
                  : "Đang lọc theo một danh mục. Bấm Tất cả để xem đầy đủ các mục."}
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
                />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm món yêu thích..."
                  className="h-[52px] w-full rounded-2xl border border-[#b98c49]/20 bg-[#FFFAFA] pl-11 pr-11 text-sm font-semibold text-[#2D2D2D] outline-none transition placeholder:text-[#9c8a72] focus:border-[#b98c49] focus:bg-white focus:ring-4 focus:ring-[#b98c49]/10"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#8c672f] shadow-sm"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>
          </div>

          <div className="hide-scrollbar mt-4 flex gap-2 overflow-x-auto border-t border-[#b98c49]/10 pt-4">
            <CategoryButton
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            >
              Tất cả
            </CategoryButton>

            {categories.map((category) => (
              <CategoryButton
                key={category.id}
                active={
                  activeCategory === category.id ||
                  activeCategory === category.name
                }
                onClick={() => setActiveCategory(category.id || category.name)}
              >
                {category.name}
              </CategoryButton>
            ))}
          </div>
        </section>

        {bestSellerProducts.length > 0 && (
          <BestSellerSection products={bestSellerProducts} />
        )}

        <section className="mt-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#666666]">
              Hiển thị {displayedProducts.length} món
            </p>

            <span className="rounded-full bg-[#f6d77d]/35 px-3 py-1.5 text-xs font-bold text-[#8c672f]">
              10 món / trang
            </span>
          </div>

          {menuSections.length > 0 ? (
            menuSections.map((section) => (
              <CategoryProductSection
                key={section.id}
                section={section}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </section>

        {toppings.length > 0 && <ToppingSection toppings={toppings} />}
      </div>
    </main>
  );
}

function CategoryButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition sm:px-5 sm:py-3",
        active
          ? "bg-[#b98c49] text-white shadow-[0_12px_28px_rgba(185,140,73,.22)]"
          : "bg-white text-[#8c672f] ring-1 ring-[#b98c49]/20 hover:bg-[#f6d77d]/25",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function CategoryProductSection({ section }) {
  return (
    <section className="rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_8px_34px_rgba(185,140,73,0.07)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
            Category
          </p>

          <h2 className="mt-1 text-2xl font-bold text-[#2D2D2D]">
            {section.name}
          </h2>
        </div>

        <span className="shrink-0 rounded-full bg-[#f6d77d]/35 px-3 py-1.5 text-xs font-bold text-[#8c672f]">
          {section.products.length} món
        </span>
      </div>

      <ProductPager products={section.products} />
    </section>
  );
}

function BestSellerSection({ products }) {
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

function ProductPager({ products }) {
  const pages = useMemo(
    () => chunkItems(products, PRODUCT_PAGE_SIZE),
    [products]
  );

  const scrollerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
    scrollerRef.current?.scrollTo({
      left: 0,
      behavior: "auto",
    });
  }, [products.length]);

  function goToPage(index) {
    const nextIndex = Math.max(0, Math.min(index, pages.length - 1));
    const scroller = scrollerRef.current;

    setCurrentPage(nextIndex);

    if (scroller) {
      scroller.scrollTo({
        left: scroller.clientWidth * nextIndex,
        behavior: "smooth",
      });
    }
  }

  function handleScroll(event) {
    const element = event.currentTarget;
    const nextPage = Math.round(element.scrollLeft / element.clientWidth);

    if (nextPage !== currentPage) {
      setCurrentPage(Math.max(0, Math.min(nextPage, pages.length - 1)));
    }
  }

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-[2rem] border border-[#b98c49]/15 bg-white p-3 shadow-[0_10px_35px_rgba(185,140,73,.07)] sm:p-4">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
      >
        {pages.map((pageProducts, pageIndex) => (
          <div
            key={pageIndex}
            className="min-w-full snap-start"
            aria-label={`Trang sản phẩm ${pageIndex + 1}`}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-5">
              {pageProducts.map((product) => (
                <UniformProductCard
                  key={getId(product)}
                  product={product}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {pages.length > 1 && (
        <div className="mt-4 flex flex-col gap-3 border-t border-[#b98c49]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center text-xs font-bold text-[#8c672f] sm:text-left">
            Trang {currentPage + 1}/{pages.length}
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#b98c49]/15 transition hover:bg-[#f6d77d]/25 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex max-w-[180px] items-center gap-1 overflow-hidden sm:max-w-none">
              {pages.map((_, index) => {
                const showDot =
                  pages.length <= 7 ||
                  index === 0 ||
                  index === pages.length - 1 ||
                  Math.abs(index - currentPage) <= 1;

                if (!showDot) {
                  if (index === currentPage - 2 || index === currentPage + 2) {
                    return (
                      <span
                        key={index}
                        className="px-1 text-xs font-bold text-[#b98c49]/50"
                      >
                        ...
                      </span>
                    );
                  }

                  return null;
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToPage(index)}
                    className={[
                      "h-2.5 rounded-full transition-all",
                      index === currentPage
                        ? "w-8 bg-[#b98c49]"
                        : "w-2.5 bg-[#b98c49]/25 hover:bg-[#b98c49]/45",
                    ].join(" ")}
                    aria-label={`Đến trang ${index + 1}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= pages.length - 1}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#FFFAFA] text-[#8c672f] ring-1 ring-[#b98c49]/15 transition hover:bg-[#f6d77d]/25 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UniformProductCard({ product }) {
  const image = getMedia(product);
  const category = getCategory(product);

  return (
    <Link
      to={getProductPath(product)}
      className="group flex min-h-[250px] flex-col overflow-hidden rounded-[1.45rem] border border-[#b98c49]/15 bg-[#FFFAFA] shadow-[0_6px_22px_rgba(185,140,73,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#b98c49]/35 hover:bg-white hover:shadow-[0_18px_44px_rgba(185,140,73,.13)] sm:min-h-[290px]"
    >
      <div className="relative aspect-square bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(246,215,125,.25),transparent_48%)]" />

        {image ? (
          <img
            src={image}
            alt={product.name}
            className="relative z-10 h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105 sm:p-4"
          />
        ) : (
          <div className="relative z-10 grid h-full place-items-center text-[#b98c49]">
            <IceCream2 size={34} />
          </div>
        )}

        {product.isFeatured === true && (
          <span className="absolute left-2 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-[#b98c49] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
            <Crown size={10} />
            Best
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        {category && (
          <span className="mb-2 inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-[#f6d77d]/30 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#8c672f]">
            <Tag size={10} />
            <span className="truncate">{category}</span>
          </span>
        )}

        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#2D2D2D] sm:text-base">
          {product.name}
        </h3>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#666666]">
          {getShortDescription(product)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-sm font-bold text-[#b98c49]">
            {formatPrice(getProductPrice(product))}
          </p>

          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#b98c49] ring-1 ring-[#b98c49]/15 transition group-hover:bg-[#b98c49] group-hover:text-white">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ToppingSection({ toppings }) {
  return (
    <section className="mt-6 rounded-[2rem] border border-[#b98c49]/20 bg-white p-4 shadow-[0_12px_42px_rgba(185,140,73,.08)] sm:p-6">
      <div className="mb-4">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#8c672f]">
          <Plus size={14} />
          Topping
        </p>

        <h2 className="mt-3 text-2xl font-bold text-[#2D2D2D] sm:text-3xl">
          Thêm topping
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {toppings.slice(0, 8).map((topping) => (
          <ToppingCard key={getId(topping)} topping={topping} />
        ))}
      </div>
    </section>
  );
}

function ToppingCard({ topping }) {
  const image = getMedia(topping);

  return (
    <div className="rounded-[1.5rem] border border-[#b98c49]/15 bg-[#FFFAFA] p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_35px_rgba(185,140,73,.1)]">
      <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-white">
        {image ? (
          <img
            src={image}
            alt={topping.name}
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#b98c49]">
            <Sparkles size={26} />
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm font-bold text-[#2D2D2D]">
        {topping.name}
      </p>

      <p className="mt-1 text-sm font-bold text-[#b98c49]">
        {formatPrice(topping.price)}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-dashed border-[#b98c49]/35 bg-white px-6 py-14 text-center">
      <PawPrint size={40} className="mx-auto text-[#b98c49]" />

      <h2 className="mt-4 text-xl font-bold text-[#2D2D2D]">
        Chưa tìm thấy món phù hợp
      </h2>

      <p className="mt-2 text-sm text-[#666666]">
        Thử đổi từ khóa hoặc chọn danh mục khác nhé.
      </p>
    </div>
  );
}
