import { BadgePercent, Filter, IceCreamBowl, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader";

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "Ä‘";
}

function ProductCard({ product, index }) {
  const image = product.media?.[0]?.url;
  const hasSale = Number(product.oldPrice || 0) > Number(product.price || 0);

  return (
    <article
      style={{ animationDelay: `${index * 50}ms` }}
      className="reveal-up group overflow-hidden rounded-[30px] border border-[#d8b77e] bg-white shadow-[0_18px_45px_rgba(74,45,25,.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_26px_70px_rgba(74,45,25,.14)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#fff0bd]">
        {image ? (
          <img
            src={image}
            alt={product.media?.[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-[#8c5924]">
            <IceCreamBowl size={56} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2b1b10]/55 via-transparent to-transparent opacity-80" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ffe169] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2b1b10]">
              <Star size={12} fill="currentColor" /> Ná»•i báº­t
            </span>
          )}
          {hasSale && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#bb421c]">
              <BadgePercent size={12} /> Sale
            </span>
          )}
        </div>
        <p className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#2b1b10] backdrop-blur">
          {product.category}
        </p>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold leading-tight text-[#2b1b10]">{product.name}</h3>
          <div className="shrink-0 text-right">
            {hasSale && <p className="text-xs font-semibold text-[#a99a83] line-through">{formatPrice(product.oldPrice)}</p>}
            <p className="text-lg font-semibold text-[#b98c49]">{formatPrice(product.price)}</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 min-h-[52px] text-sm leading-7 text-[#6f5a3e]">{product.description}</p>

        {product.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-[#f7efe3] px-3 py-1 text-[11px] font-medium text-[#8c5924]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function MenuSection({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState("Táº¥t cáº£");
  const [search, setSearch] = useState("");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = activeCategory === "Táº¥t cáº£" || product.category === activeCategory;
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        product.name?.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.tags?.join(" ").toLowerCase().includes(keyword);

      return matchCategory && matchSearch && product.isAvailable !== false;
    });
  }, [products, activeCategory, search]);

  return (
    <section id="menu" className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Signature menu"
            title="Menu kem & Ä‘á»“ uá»‘ng"
            description="Thiáº¿t káº¿ dáº¡ng card lá»›n, áº£nh rÃµ, giÃ¡ ná»•i báº­t vÃ  lá»c nhanh theo danh má»¥c Ä‘á»ƒ khÃ¡ch chá»n mÃ³n dá»… hÆ¡n trÃªn Ä‘iá»‡n thoáº¡i."
          />

          <div className="glass-card w-full rounded-[26px] border border-white/70 p-3 lg:max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c672f]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="TÃ¬m mÃ³n, vá»‹ kem, topping..."
                className="h-14 w-full rounded-2xl border border-[#d8b77e] bg-white/[0.08]0 pl-12 pr-4 text-sm font-medium text-[#2b1b10] outline-none transition placeholder:text-[#b59b74] focus:border-[#b98c49]"
              />
            </div>
          </div>
        </div>

        <div className="hide-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-[#2b1b10] text-white shadow-[0_14px_30px_rgba(43,27,16,.2)]"
                  : "bg-white text-[#6a4a2f] ring-1 ring-[#d8b77e] hover:bg-[#fff0bd]"
              }`}
            >
              <Filter size={15} />
              {category}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product._id || product.id || product.name} product={product} index={index} />
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <div className="mt-10 rounded-[30px] border border-dashed border-[#e8c87e] bg-white/70 p-10 text-center">
            <IceCreamBowl className="mx-auto text-[#b98c49]" size={42} />
            <p className="mt-4 font-display text-2xl font-semibold text-[#2b1b10]">KhÃ´ng tÃ¬m tháº¥y mÃ³n phÃ¹ há»£p</p>
            <p className="mt-2 text-sm text-[#6f5a3e]">Thá»­ Ä‘á»•i danh má»¥c hoáº·c tá»« khÃ³a tÃ¬m kiáº¿m.</p>
          </div>
        )}
      </div>
    </section>
  );
}



