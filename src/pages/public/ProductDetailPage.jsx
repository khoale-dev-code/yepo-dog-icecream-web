import {
  ArrowLeft,
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  Clock,
  Crown,
  ImageIcon,
  PawPrint,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function getId(item) {
  return String(item?._id || item?.id || item?.slug || "");
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
  return `/menu/${product?.slug || getId(product) || slugify(product?.name)}`;
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

function getProductMedia(product) {
  const media = Array.isArray(product?.media)
    ? product.media
        .map((item) => ({
          url: getMediaUrl(item),
          type: isVideoMedia(item) ? "video" : "image",
          name: item?.name || item?.originalName || product?.name || "Sản phẩm",
        }))
        .filter((item) => item.url)
    : [];

  if (media.length > 0) return media;

  const imageUrl =
    product?.imageUrl ||
    product?.image ||
    product?.thumbnailUrl ||
    product?.coverUrl ||
    "";

  return imageUrl
    ? [
        {
          url: imageUrl,
          type: "image",
          name: product?.name || "Sản phẩm",
        },
      ]
    : [];
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

function getCategory(product) {
  return product?.category || product?.categoryName || product?.categoryTitle || "";
}

function normalizeSizes(product) {
  if (!Array.isArray(product?.sizes)) return [];

  return product.sizes
    .map((size, index) => {
      if (typeof size === "string") {
        return {
          name: size,
          price: "",
        };
      }

      return {
        name: size.name || size.label || `Size ${index + 1}`,
        price: size.price || size.value || "",
      };
    })
    .filter((size) => size.name || size.price);
}

function normalizeTags(product) {
  if (!Array.isArray(product?.tags)) return [];

  return product.tags
    .map((tag) => String(tag || "").trim())
    .filter(Boolean);
}

export default function ProductDetailPage({ store }) {
  const { productId } = useParams();
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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

  const product = useMemo(() => {
    const decoded = decodeURIComponent(productId || "");

    return products.find((item) => {
      const ids = [
        item._id,
        item.id,
        item.slug,
        slugify(item.name),
        getId(item),
      ]
        .filter(Boolean)
        .map(String);

      return ids.includes(decoded);
    });
  }, [productId, products]);

  const media = useMemo(() => getProductMedia(product), [product]);
  const activeMedia = media[activeMediaIndex] || media[0];
  const sizes = normalizeSizes(product);
  const tags = normalizeTags(product);
  const category = getCategory(product);
  const price = getProductPrice(product);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return products
      .filter((item) => getId(item) !== getId(product))
      .filter((item) => {
        if (!category) return item.isFeatured === true;
        return getCategory(item) === category;
      })
      .slice(0, 8);
  }, [products, product, category]);

  function goPrev() {
    if (media.length <= 1) return;
    setActiveMediaIndex((current) => (current - 1 + media.length) % media.length);
  }

  function goNext() {
    if (media.length <= 1) return;
    setActiveMediaIndex((current) => (current + 1) % media.length);
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#FFFAFA] px-4 py-16 font-['Quicksand'] text-[#2D2D2D]">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
        `}</style>

        <div className="mx-auto grid max-w-2xl place-items-center rounded-[2rem] border border-[#b98c49]/20 bg-white px-6 py-16 text-center shadow-[0_8px_40px_rgba(185,140,73,.08)]">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#f6d77d]/40 text-[#b98c49]">
            <ShoppingBag size={30} />
          </div>

          <h1 className="mt-5 font-['Quicksand'] text-3xl font-bold text-[#2D2D2D]">
            Không tìm thấy sản phẩm
          </h1>

          <p className="mt-3 max-w-md text-sm font-medium leading-7 text-[#666666]">
            Sản phẩm có thể đã bị ẩn hoặc đường dẫn không còn đúng.
          </p>

          <Link
            to="/menu"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-bold text-white transition hover:bg-[#a1783a]"
          >
            <ArrowLeft size={17} />
            Quay lại menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFAFA] font-['Quicksand'] text-[#2D2D2D]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#8c672f] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/25"
        >
          <ArrowLeft size={17} />
          Quay lại menu
        </Link>

        <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:items-start">
          <div className="overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white shadow-[0_16px_50px_rgba(185,140,73,.1)] sm:rounded-[2.25rem]">
            <div className="relative aspect-square bg-[#fff7eb]">
              {activeMedia ? (
                activeMedia.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    playsInline
                    className="h-full w-full bg-[#111] object-contain"
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 sm:p-6"
                  />
                )
              ) : (
                <div className="grid h-full place-items-center text-[#b98c49]">
                  <ImageIcon size={56} />
                </div>
              )}

              {product.isFeatured === true && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#b98c49] px-4 py-2 text-[11px] font-['Fredoka'] font-bold uppercase tracking-[0.12em] text-white shadow-lg">
                  <Crown size={15} />
                  Best Seller
                </span>
              )}

              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#8c672f] shadow-lg transition hover:bg-white"
                    aria-label="Ảnh trước"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#8c672f] shadow-lg transition hover:bg-white"
                    aria-label="Ảnh tiếp"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="hide-scrollbar flex gap-3 overflow-x-auto border-t border-[#b98c49]/15 bg-white p-4">
                {media.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    onClick={() => setActiveMediaIndex(index)}
                    className={[
                      "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-[#FFFAFA] transition",
                      index === activeMediaIndex
                        ? "border-[#b98c49] ring-4 ring-[#f6d77d]/35"
                        : "border-[#b98c49]/15 hover:border-[#b98c49]/45",
                    ].join(" ")}
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.name || product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <article className="relative overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_16px_50px_rgba(185,140,73,.1)] sm:rounded-[2.25rem] sm:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#f6d77d]/35 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap gap-2">
                {category && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-3 py-2 text-xs font-['Fredoka'] font-bold uppercase tracking-[0.1em] text-[#8c672f] ring-1 ring-[#b98c49]/15">
                    <Tag size={14} />
                    {category}
                  </span>
                )}

                {product.isAvailable === false ? (
                  <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-['Fredoka'] font-bold text-neutral-500">
                    Tạm hết
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-['Fredoka'] font-bold text-emerald-700">
                    Đang bán
                  </span>
                )}
              </div>

              <h1 className="mt-5 font-['Quicksand'] text-[34px] font-bold leading-[1.08] tracking-tight text-[#2D2D2D] sm:text-5xl">
                {product.name || "Sản phẩm YEPO"}
              </h1>

              <p className="mt-4 font-['Fredoka'] text-[34px] font-semibold leading-none text-[#b98c49] sm:text-4xl">
                {formatPrice(price)}
              </p>

              {product.description && (
                <p className="mt-5 whitespace-pre-wrap text-[15px] font-medium leading-8 text-[#66533c] sm:text-base">
                  {product.description}
                </p>
              )}

              {sizes.length > 0 && (
                <section className="mt-7">
                  <h2 className="text-xs font-['Fredoka'] font-bold uppercase tracking-[0.16em] text-[#8c672f]">
                    Size / lựa chọn
                  </h2>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {sizes.map((size, index) => (
                      <div
                        key={`${size.name}-${index}`}
                        className="rounded-2xl border border-[#b98c49]/15 bg-[#FFFAFA] p-4"
                      >
                        <p className="font-['Quicksand'] font-bold text-[#2D2D2D]">
                          {size.name}
                        </p>

                        {size.price && (
                          <p className="mt-1 text-sm font-['Fredoka'] font-semibold text-[#b98c49]">
                            {formatPrice(size.price)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tags.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-xs font-['Fredoka'] font-bold text-[#8c672f]"
                    >
                      <Sparkles size={13} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <a
                  href="/#reservation"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_14px_34px_rgba(185,140,73,.25)] transition hover:bg-[#a1783a]"
                >
                  <Clock size={18} />
                  Đặt bàn ngay
                </a>

                <Link
                  to="/promotions"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-6 text-sm font-bold text-[#8c672f] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/25"
                >
                  <BadgePercent size={18} />
                  Xem khuyến mãi
                </Link>
              </div>
            </div>
          </article>
        </section>

        {toppings.length > 0 && (
          <section className="mt-10 rounded-[2rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_12px_42px_rgba(185,140,73,.08)] sm:rounded-[2.25rem] sm:p-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#f6d77d]/35 px-3 py-2 text-xs font-['Fredoka'] font-bold uppercase tracking-[0.14em] text-[#8c672f]">
                <Plus size={14} />
                Topping
              </p>

              <h2 className="mt-3 font-['Quicksand'] text-2xl font-bold text-[#2D2D2D]">
                Thêm topping yêu thích
              </h2>
            </div>

            <div className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {toppings.slice(0, 4).map((topping) => (
                <div
                  key={getId(topping)}
                  className="w-[70vw] max-w-[260px] shrink-0 snap-start rounded-[1.5rem] border border-[#b98c49]/15 bg-[#FFFAFA] p-4 sm:w-auto sm:max-w-none"
                >
                  <div className="aspect-square overflow-hidden rounded-[1.25rem] bg-white">
                    {getProductMedia(topping)[0]?.url ? (
                      <img
                        src={getProductMedia(topping)[0].url}
                        alt={topping.name}
                        className="h-full w-full object-contain p-3"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[#b98c49]">
                        <PawPrint size={28} />
                      </div>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-2 font-['Quicksand'] font-bold text-[#2D2D2D]">
                    {topping.name}
                  </p>

                  <p className="mt-1 text-sm font-['Fredoka'] font-semibold text-[#b98c49]">
                    {formatPrice(topping.price)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedProducts.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                  Recommended
                </p>
                <h2 className="mt-1 font-['Quicksand'] text-2xl font-bold text-[#2D2D2D] sm:text-3xl">
                  Có thể bạn cũng thích
                </h2>
              </div>

              <Link
                to="/menu"
                className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/20"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <RelatedProductCard key={getId(item)} item={item} />
              ))}
            </div>

            {relatedProducts.length > 1 && (
              <div className="mt-1 flex items-center justify-between rounded-2xl border border-[#b98c49]/10 bg-white px-4 py-3 text-xs font-bold text-[#8c672f] shadow-sm sm:hidden">
                <span>Vuốt sang trái để xem thêm món</span>
                <ChevronRight size={15} />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function RelatedProductCard({ item }) {
  const media = getProductMedia(item)[0];

  return (
    <Link
      to={getProductPath(item)}
      className="group flex min-h-[360px] w-[76vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/15 bg-white shadow-[0_12px_34px_rgba(185,140,73,.1)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(185,140,73,.14)] sm:min-h-[330px] sm:w-auto sm:max-w-none"
    >
      <div className="relative aspect-[1.05/1] bg-[#FFFAFA]">
        {media?.url ? (
          <img
            src={media.url}
            alt={item.name}
            className="h-full w-full object-contain p-5 transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#b98c49]">
            <ShoppingBag size={36} />
          </div>
        )}

        {item.isFeatured === true && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#b98c49] px-3 py-1.5 text-[10px] font-['Fredoka'] font-bold uppercase tracking-wider text-white">
            <Crown size={12} />
            Best
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {getCategory(item) && (
          <span className="mb-3 inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-[#f6d77d]/30 px-3 py-1.5 text-[10px] font-['Fredoka'] font-bold uppercase tracking-[0.1em] text-[#8c672f]">
            <Tag size={12} />
            <span className="truncate">{getCategory(item)}</span>
          </span>
        )}

        <p className="line-clamp-2 font-['Quicksand'] text-xl font-bold leading-tight text-[#2D2D2D] sm:text-lg">
          {item.name}
        </p>

        <p className="mt-auto pt-5 font-['Fredoka'] text-xl font-semibold text-[#b98c49]">
          {formatPrice(getProductPrice(item))}
        </p>
      </div>
    </Link>
  );
}
