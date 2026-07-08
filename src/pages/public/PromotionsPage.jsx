import {
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Gift,
  Sparkles,
  Tag,
  TicketPercent,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// --- Các hàm Helper (Giữ nguyên logic của bạn) ---
function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
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

function getPromotionImage(promotion) {
  if (promotion?.imageUrl) return promotion.imageUrl;
  if (Array.isArray(promotion?.media) && promotion.media.length > 0) {
    const firstImage = promotion.media.find((item) => !isVideoMedia(item));
    if (firstImage?.url) return firstImage.url;
  }
  return "https://dummyimage.com/1000x720/FFFAFA/b98c49.png&text=YEPO+PROMOTION";
}

function getPromotionTitle(promotion) {
  return promotion.title || promotion.name || "Khuyến mãi YEPO";
}

function getPromotionDescription(promotion) {
  return (
    promotion.description ||
    promotion.content ||
    promotion.caption ||
    "Ưu đãi đang được cập nhật tại YEPO."
  );
}

function getPromotionCode(promotion) {
  return promotion.code || promotion.promoCode || promotion.couponCode || "";
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

function getDateText(promotion) {
  const startDate = formatDate(promotion.startDate || promotion.validFrom);
  const endDate = formatDate(promotion.endDate || promotion.validTo);

  if (startDate && endDate) return `${startDate} - ${endDate}`;
  if (startDate) return `Từ ${startDate}`;
  if (endDate) return `Đến ${endDate}`;
  return "";
}

// --- Component Chính ---
export default function PromotionsPage({ store }) {
  const promotions = getList(store, "promotions")
    .filter((promotion) => promotion.isActive !== false)
    .sort((a, b) => {
      const sortA = Number(a.sortOrder || 999);
      const sortB = Number(b.sortOrder || 999);
      if (sortA !== sortB) return sortA - sortB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const featuredPromotion = promotions[0];

  const otherPromotions = featuredPromotion
    ? promotions.filter(
        (promotion) =>
          (promotion._id || promotion.id) !==
          (featuredPromotion._id || featuredPromotion.id)
      )
    : promotions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-[#ead7b6]/60 bg-gradient-to-br from-[#FFFAFA] to-[#f6d77d]/10 p-6 shadow-sm sm:p-10 lg:p-12">
        {/* Background Decorations */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f6d77d]/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-[#b98c49]/10 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#b98c49] shadow-sm ring-1 ring-[#ead7b6]">
              <Sparkles size={16} />
              YEPO Promotions
            </span>

            <h1 className="mt-6 text-4xl font-black leading-[1.15] text-[#2f2115] sm:text-5xl lg:text-6xl tracking-tight">
              Khuyến mãi <span className="text-[#b98c49]">ngọt ngào</span> tại YEPO
            </h1>

            <p className="mt-6 text-base leading-relaxed text-[#755b38] sm:text-lg">
              Cập nhật các ưu đãi mới nhất dành cho khách ghé quán, thưởng thức kem ngon và vui đùa cùng các bé "nhân viên lắm lông" đáng yêu.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-8 text-sm font-bold text-white shadow-lg shadow-[#b98c49]/30 transition hover:-translate-y-1 hover:bg-[#8c672f]"
              >
                Xem menu
                <ArrowRight size={18} />
              </Link>
              <a
                href="/#reservation"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[#ead7b6] bg-white px-8 text-sm font-bold text-[#8c672f] transition hover:-translate-y-1 hover:bg-[#f6d77d]/20 hover:border-[#f6d77d]"
              >
                Đặt bàn ngay
              </a>
            </div>
          </div>

          {/* Featured Promotion Visual */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
            {featuredPromotion ? (
              <div className="relative group">
                <div className="absolute -inset-4 rounded-[36px] bg-[#f6d77d]/30 blur-lg transition duration-500 group-hover:bg-[#b98c49]/20" />
                <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-2xl">
                  <img
                    src={getPromotionImage(featuredPromotion)}
                    alt={getPromotionTitle(featuredPromotion)}
                    className="aspect-square sm:aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                  />
                  {getPromotionCode(featuredPromotion) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-12 text-white">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#f6d77d]">Mã ưu đãi đặc biệt</p>
                      <div className="mt-2 flex items-center justify-between gap-4">
                        <p className="text-3xl font-black">{getPromotionCode(featuredPromotion)}</p>
                        <PromoCopyButton code={getPromotionCode(featuredPromotion)} variant="dark" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid aspect-square sm:aspect-[4/3] w-full place-items-center rounded-[32px] border-2 border-dashed border-[#ead7b6] bg-white/50 text-center">
                <div className="text-[#b98c49]">
                  <Gift size={56} className="mx-auto opacity-50" />
                  <p className="mt-4 text-base font-bold text-[#755b38]">Chưa có chương trình nổi bật</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- PROMOTIONS LIST --- */}
      {otherPromotions.length > 0 ? (
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#2f2115] sm:text-3xl">Ưu đãi khác</h2>
            <span className="rounded-full bg-[#f6d77d]/30 px-4 py-1.5 text-sm font-bold text-[#8c672f]">
              {otherPromotions.length} chương trình
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherPromotions.map((promotion) => (
              <PromotionCard
                key={promotion._id || promotion.id || promotion.title}
                promotion={promotion}
              />
            ))}
          </div>
        </section>
      ) : (
        !featuredPromotion && (
          <section className="rounded-[32px] border border-dashed border-[#ead7b6] bg-[#FFFAFA] px-6 py-20 text-center shadow-sm">
            <Gift size={56} className="mx-auto text-[#b98c49]" />
            <h2 className="mt-6 text-2xl font-black text-[#2f2115]">
              Hiện chưa có chương trình khuyến mãi
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[#755b38]">
              Các mã giảm giá và quà tặng ngọt ngào sẽ sớm được cập nhật tại đây. Bạn quay lại sau nhé!
            </p>
            <Link
              to="/menu"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-[#b98c49] px-6 text-sm font-bold text-white transition hover:bg-[#8c672f]"
            >
              Khám phá Menu
              <ArrowRight size={17} />
            </Link>
          </section>
        )
      )}
    </div>
  );
}

// --- Component Thẻ Khuyến Mãi ---
function PromotionCard({ promotion }) {
  const title = getPromotionTitle(promotion);
  const description = getPromotionDescription(promotion);
  const code = getPromotionCode(promotion);
  const dateText = getDateText(promotion);
  const discountText = promotion.discountText || "";

  return (
    <article className="flex flex-col overflow-hidden rounded-[28px] border border-[#ead7b6]/60 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#b98c49]/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FFFAFA]">
        <img
          src={getPromotionImage(promotion)}
          alt={title}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#b98c49] shadow-sm backdrop-blur">
            <Tag size={12} /> Ưu đãi
          </span>
          {discountText && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#f6d77d] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#8c672f] shadow-sm">
              <TicketPercent size={12} /> {discountText}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="line-clamp-2 min-h-[56px] text-xl font-black leading-tight text-[#2f2115]">
          {title}
        </h3>
        
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-[#755b38]">
          {description}
        </p>

        <div className="mt-6 space-y-4">
          {dateText && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8c672f]">
              <CalendarDays size={16} className="text-[#b98c49]" />
              {dateText}
            </div>
          )}

          {code && (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-[#b98c49]/50 bg-[#f6d77d]/10 p-3">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#8c672f]">Mã ưu đãi</p>
                <p className="font-black text-[#b98c49] text-lg leading-none mt-1">{code}</p>
              </div>
              <PromoCopyButton code={code} />
            </div>
          )}
        </div>

        {promotion.linkUrl && (
          <a
            href={promotion.linkUrl}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFFAFA] py-3 text-sm font-bold text-[#b98c49] ring-1 ring-[#ead7b6] transition hover:bg-[#b98c49] hover:text-white hover:ring-[#b98c49]"
          >
            {promotion.linkLabel || "Xem chi tiết"}
            <ArrowRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}

// --- Nút Copy Mã Nhanh (UX Enhancement) ---
function PromoCopyButton({ code, variant = "light" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight = variant === "light";

  return (
    <button
      onClick={handleCopy}
      title="Sao chép mã"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${
        copied
          ? "bg-green-500 text-white"
          : isLight
          ? "bg-white text-[#b98c49] hover:bg-[#b98c49] hover:text-white shadow-sm"
          : "bg-white/20 text-white hover:bg-white hover:text-[#b98c49] backdrop-blur"
      }`}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
    </button>
  );
}