import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IceCream2,
  Loader2,
  MessageSquare,
  PawPrint,
  Phone,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DogProfileCard from "../../components/public/DogProfileCard";

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollY;
}

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={[
        "transition-all duration-700 ease-out will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        className,
      ].join(" ")}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function FloatingPaws({ scrollY, speed = 0.12, className = "" }) {
  const paws = [
    { top: "8%", left: "6%", size: 70, rot: -18 },
    { top: "62%", left: "88%", size: 56, rot: 22 },
    { top: "30%", left: "92%", size: 34, rot: -8 },
    { top: "78%", left: "10%", size: 42, rot: 12 },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {paws.map((paw, index) => (
        <PawPrint
          key={index}
          className="absolute text-[#b98c49]/10"
          style={{
            top: paw.top,
            left: paw.left,
            width: paw.size,
            height: paw.size,
            transform: `translateY(${
              scrollY * speed * (index % 2 ? 1 : -1)
            }px) rotate(${paw.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function getList(store, key) {
  return store?.[key] || store?.data?.[key] || [];
}

function getShop(store) {
  return store?.shop || store?.data?.shop || {};
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

function getMedia(item) {
  if (item?.imageUrl) return item.imageUrl;

  if (Array.isArray(item?.media) && item.media.length > 0) {
    const firstImage = item.media.find((media) => !isVideoMedia(media));
    if (firstImage?.url) return firstImage.url;
  }

  return "https://dummyimage.com/800x600/FFFAFA/b98c49.png&text=YEPO";
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
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
  return "/menu/" + (product?.slug || getId(product) || slugify(product?.name));
}

function getShortDescription(value, wordLimit = 8) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Xem chi tiết để biết thêm.";

  const words = text.split(" ").filter(Boolean);

  if (words.length <= wordLimit) return text;

  return words.slice(0, wordLimit).join(" ") + "...";
}

export default function HomePage({ store }) {
  const shop = getShop(store);
  const scrollY = useScrollY();

  const featuredProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const products = featuredProducts.slice(0, 6);
  const signatureProductTotal = featuredProducts.length;

  const allProducts = getList(store, "products")
    .filter((item) => item.isAvailable !== false)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999));

  const featuredDogs = getList(store, "dogs")
    .filter((dog) => dog.isActive !== false && dog.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
    .slice(0, 3);

  const posts = getList(store, "posts")
    .filter(
      (item) =>
        item.isActive !== false &&
        item.isPublished !== false &&
        item.isPinned === true
    )
    .sort((a, b) => {
      const orderA = Number(a.sortOrder || a.order || 999);
      const orderB = Number(b.sortOrder || b.order || 999);

      if (orderA !== orderB) return orderA - orderB;

      return (
        new Date(b.createdAt || b.updatedAt || 0) -
        new Date(a.createdAt || a.updatedAt || 0)
      );
    })
    .slice(0, 2);

  const heroProduct = products[0] || allProducts[0];
  const heroShift = Math.min(scrollY, 300);
  const heroImgTransform = `translateY(${heroShift * 0.08}px) scale(${
    1 + heroShift / 3000
  })`;

  return (
    <div className="min-h-screen space-y-20 bg-[#FFFAFA] py-8 font-['Quicksand'] sm:py-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <section className="relative mx-4 overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white px-6 py-12 shadow-[0_8px_40px_rgba(185,140,73,0.08)] sm:mx-8 sm:p-14 lg:mx-12 lg:p-20">
        <FloatingPaws scrollY={scrollY} />

        <div className="relative grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal className="z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/30 bg-[#FFFAFA]/80 px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49] backdrop-blur-md">
              <Sparkles size={14} className="text-[#b98c49]" />
              YEPO Coffee & Pets
            </span>

            <h1 className="mt-8 font-['Quicksand'] text-4xl font-bold tracking-tight text-[#2D2D2D] sm:text-6xl lg:leading-[1.1]">
              Trạm dừng chân bình yên giữa lòng thành phố.
            </h1>

            <p className="mt-6 text-base font-normal leading-relaxed text-[#666666] sm:text-lg">
              {shop?.description ||
                "Thưởng thức những ly cà phê nguyên bản, những món ngọt mềm mịn và chữa lành tâm hồn cùng những người bạn bốn chân đáng yêu nhất."}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#b98c49] px-8 text-sm font-['Quicksand'] font-bold text-white transition-all duration-300 hover:bg-[#a1783a] hover:shadow-lg hover:shadow-[#b98c49]/30"
              >
                Khám phá Menu
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="/#reservation"
                className="inline-flex h-14 items-center gap-2 rounded-full border-2 border-[#b98c49]/30 bg-white px-8 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all duration-300 hover:border-[#b98c49] hover:bg-[#FFFAFA]"
              >
                <CalendarDays size={18} className="text-[#b98c49]" />
                Đặt bàn trước
              </a>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-[#b98c49]/20 pt-8">
              <MetricCard label="Món đặc trưng" value={allProducts.length} />
              <div className="h-10 w-px bg-[#b98c49]/20" />
              <MetricCard label="Bé cún" value={featuredDogs.length} />
              <div className="h-10 w-px bg-[#b98c49]/20" />
              <MetricCard label="Câu chuyện" value={getList(store, "posts").length} />
            </div>
          </Reveal>

          <Reveal
            delay={120}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-[#b98c49]/20 shadow-2xl shadow-[#b98c49]/15 sm:aspect-square">
              <img
                src={shop?.heroImageUrl || shop?.coverImageUrl || getMedia(heroProduct)}
                alt={shop?.name || "YEPO"}
                className="h-full w-full object-cover transition-transform duration-700 ease-out"
                style={{ transform: heroImgTransform }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-6 hidden items-center gap-4 rounded-2xl border border-[#b98c49]/20 bg-white/90 p-5 shadow-[0_20px_40px_rgba(185,140,73,0.1)] backdrop-blur-xl sm:flex">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f6d77d]/30 text-[#b98c49]">
                <PawPrint size={20} />
              </div>
              <div>
                <p className="text-sm font-['Fredoka'] font-semibold text-[#2D2D2D]">
                  Pet-friendly Cafe
                </p>
                <p className="text-xs font-['Quicksand'] text-[#666666]">
                  Không gian mở & an toàn
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-4 space-y-10 sm:mx-8 lg:mx-12">
        <SectionHeader
          eyebrow="Our Furry Friends"
          title="Những nhân viên đáng yêu"
          description="Gương mặt thương hiệu của quán. Các bé luôn sẵn sàng chào đón bạn bằng sự ấm áp nhất."
          action={<LinkButton to="/dogs">Xem hồ sơ các bé</LinkButton>}
        />

        {featuredDogs.length > 0 ? (
          <section className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {featuredDogs.map((dog, index) => (
              <Reveal key={dog._id || dog.id || dog.name} delay={index * 100}>
                <DogProfileCard dog={dog} />
              </Reveal>
            ))}
          </section>
        ) : (
          <Reveal
            as="section"
            className="rounded-[2rem] border-2 border-dashed border-[#b98c49]/40 bg-[#FFFAFA] px-6 py-16 text-center"
          >
            <PawPrint size={40} className="mx-auto text-[#b98c49]" />
            <h3 className="mt-4 text-xl font-['Quicksand'] font-bold text-[#2D2D2D]">
              Chưa có thông tin cún
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#666666]">
              Vui lòng cập nhật danh sách các bé cún nổi bật trong phần quản trị.
            </p>
          </Reveal>
        )}
      </div>

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
                {products.map((product, index) => (
                  <SignatureMenuCard
                    key={product._id || product.id || product.name}
                    product={product}
                    index={index}
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

      <div className="mx-4 space-y-10 sm:mx-8 lg:mx-12">
        <SectionHeader
          eyebrow="Our Stories"
          title="Góc chuyện trò"
          description="Những mẩu chuyện nhỏ, thông báo sự kiện và khoảnh khắc đáng yêu tại quán."
          action={<LinkButton to="/posts">Xem tất cả bài viết</LinkButton>}
        />

        {posts.length > 0 ? (
          <section className="grid gap-8 lg:grid-cols-2">
            {posts.map((post, index) => (
              <Reveal
                key={post._id || post.id || post.title}
                delay={index * 120}
                as="article"
                className="group flex flex-col overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white shadow-sm transition-all duration-300 hover:border-[#b98c49]/50 hover:shadow-[0_10px_30px_rgba(185,140,73,0.1)] sm:flex-row"
              >
                <div className="relative overflow-hidden border-b border-[#b98c49]/10 sm:w-1/2 sm:border-b-0 sm:border-r">
                  <img
                    src={getMedia(post)}
                    alt={post.title}
                    className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6 sm:w-1/2 sm:p-8">
                  <p className="text-[11px] font-['Quicksand'] font-bold uppercase tracking-widest text-[#b98c49]">
                    Chuyện nhà YEPO
                  </p>
                  <h3 className="mt-3 text-xl font-['Quicksand'] font-bold leading-snug text-[#2D2D2D]">
                    {post.title || "Tiêu đề bài viết"}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-[#666666]">
                    {post.content || post.caption || "Nội dung đang cập nhật..."}
                  </p>
                  <Link
                    to="/posts"
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-['Quicksand'] font-bold text-[#b98c49] transition-opacity hover:opacity-70"
                  >
                    Đọc tiếp <ArrowRight size={16} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </section>
        ) : (
          <Reveal
            as="section"
            className="rounded-[2rem] border-2 border-dashed border-[#b98c49]/25 bg-white px-6 py-12 text-center"
          >
            <Sparkles size={38} className="mx-auto text-[#b98c49]" />
            <h3 className="mt-4 text-xl font-bold text-[#2D2D2D]">
              Chưa có bài viết ghim
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-[#666666]">
              Vào admin và ghim tối đa 2 bài muốn hiển thị ở homepage.
            </p>
          </Reveal>
        )}
      </div>

      <ReservationSection shop={shop} scrollY={scrollY} />
    </div>
  );
}

function SignatureMenuCard({ product, index }) {
  const shortDescription = getShortDescription(
    product.description || "Hương vị đặc trưng chỉ có tại YEPO.",
    8
  );

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

        <p className="mt-3 min-h-[48px] text-[15px] font-medium leading-7 text-[#666666]">
          {shortDescription}
        </p>

        <p className="mt-2 text-xs font-['Quicksand'] font-bold uppercase tracking-[0.12em] text-[#b98c49]/80">
          Xem chi tiết để đọc đầy đủ
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

function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;

  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function ReservationSection({ shop, scrollY }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    guestCount: "2",
    reservationDate: getTodayValue(),
    reservationTime: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [sectionRef, sectionVisible] = useReveal(0.05);

  const quickTimes = ["09:00", "10:30", "14:00", "16:30", "19:00"];

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#reservation") {
        setIsFormOpen(true);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\s+/g, "").trim();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const customerName = form.customerName.trim();
    const phone = normalizePhone(form.phone);
    const guestCount = Number(form.guestCount || 1);
    const reservationDate = form.reservationDate;
    const reservationTime = form.reservationTime;
    const note = form.note.trim();

    if (!customerName) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập họ tên để YEPO xác nhận lịch.",
      });
      return;
    }

    if (!phone || phone.length < 8) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập số điện thoại hợp lệ.",
      });
      return;
    }

    if (!Number.isFinite(guestCount) || guestCount < 1) {
      setMessage({
        type: "error",
        text: "Số khách phải lớn hơn 0.",
      });
      return;
    }

    if (!reservationDate || !reservationTime) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn đầy đủ ngày và giờ ghé quán.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customerName,
          name: customerName,
          phone,
          guestCount,
          guests: guestCount,
          partySize: guestCount,
          reservationDate,
          date: reservationDate,
          reservationTime,
          time: reservationTime,
          note,
          source: "home-page",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Không thể gửi yêu cầu đặt bàn."
        );
      }

      setMessage({
        type: "success",
        text: "YEPO đã nhận yêu cầu đặt bàn. Tụi mình sẽ liên hệ lại để xác nhận lịch nha.",
      });

      setForm({
        customerName: "",
        phone: "",
        guestCount: "2",
        reservationDate: getTodayValue(),
        reservationTime: "",
        note: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Không thể gửi yêu cầu đặt bàn. Bạn thử lại giúp YEPO nhé.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-4 sm:mx-8 lg:mx-12">
      <section
        id="reservation"
        ref={sectionRef}
        className={[
          "relative overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_8px_40px_rgba(185,140,73,0.08)] transition-all duration-700 ease-out sm:p-7 lg:p-8 motion-reduce:transition-none",
          sectionVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        ].join(" ")}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f6d77d]/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#b98c49]/10 blur-3xl" />
        <FloatingPaws scrollY={scrollY} speed={0.04} className="opacity-40" />

        <div className="relative z-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/20 bg-[#FFFAFA] px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                <CalendarDays size={15} />
                Reservation
              </span>

              <h2 className="mt-5 max-w-3xl font-['Quicksand'] text-3xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
                Đặt bàn trước để YEPO chuẩn bị chỗ thật thoải mái.
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#666666] sm:text-base">
                Gửi yêu cầu đặt bàn nhanh. YEPO sẽ liên hệ lại để xác nhận giờ trống, khu vực ngồi và lưu ý khi chơi cùng các bé cún.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => setIsFormOpen((current) => !current)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-7 text-sm font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition-all hover:bg-[#a1783a]"
              >
                <CalendarDays size={18} />
                {isFormOpen ? "Thu gọn form" : "Đặt bàn"}
              </button>

              {shop?.phone && (
                <a
                  href={"tel:" + shop.phone}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#b98c49]/20 bg-white px-7 text-sm font-['Quicksand'] font-bold text-[#b98c49] shadow-sm transition hover:bg-[#FFFAFA]"
                >
                  <Phone size={17} />
                  Gọi nhanh
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ReservationNote
              icon={Clock3}
              title="Nên đặt trước"
              text="Phù hợp cuối tuần hoặc khung giờ chiều tối."
            />
            <ReservationNote
              icon={PawPrint}
              title="Pet-friendly"
              text="Có thể sắp xếp khu vực gần các bé cún."
            />
            <ReservationNote
              icon={Phone}
              title="Xác nhận lại"
              text={
                shop?.phone
                  ? "Hotline: " + shop.phone
                  : "YEPO sẽ gọi hoặc nhắn lại."
              }
            />
          </div>

          {isFormOpen && (
            <form
              onSubmit={handleSubmit}
              className="mt-7 rounded-[2rem] border border-[#b98c49]/10 bg-[#FFFAFA] p-5 shadow-inner sm:p-7"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                    Request a table
                  </p>
                  <h3 className="mt-2 text-2xl font-['Quicksand'] font-bold text-[#2D2D2D]">
                    Thông tin đặt bàn
                  </h3>
                </div>

                <div className="hidden rounded-full bg-white px-5 py-2.5 text-xs font-['Quicksand'] font-bold text-[#b98c49] shadow-sm ring-1 ring-[#b98c49]/20 sm:block">
                  YEPO sẽ xác nhận lại
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ReservationField label="Họ tên" icon={UserRound}>
                  <input
                    value={form.customerName}
                    onChange={(event) => update("customerName", event.target.value)}
                    placeholder="Tên của bạn"
                    className="h-14 w-full rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <ReservationField label="Số điện thoại" icon={Phone}>
                  <input
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    inputMode="tel"
                    placeholder="090..."
                    className="h-14 w-full rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <ReservationField label="Số khách" icon={Users}>
                  <select
                    value={form.guestCount}
                    onChange={(event) => update("guestCount", event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                      <option key={count} value={count}>
                        {count} khách
                      </option>
                    ))}
                    <option value="9">9+ khách</option>
                  </select>
                </ReservationField>

                <ReservationField label="Ngày ghé" icon={CalendarDays}>
                  <input
                    type="date"
                    min={getTodayValue()}
                    value={form.reservationDate}
                    onChange={(event) => update("reservationDate", event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>
              </div>

              <div className="mt-5">
                <ReservationField label="Giờ dự kiến" icon={Clock3}>
                  <input
                    type="time"
                    value={form.reservationTime}
                    onChange={(event) => update("reservationTime", event.target.value)}
                    className="h-14 w-full rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {quickTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => update("reservationTime", time)}
                      className={[
                        "rounded-full border-2 px-4 py-2 text-[13px] font-['Fredoka'] font-semibold transition-all duration-200",
                        form.reservationTime === time
                          ? "border-[#b98c49] bg-[#b98c49] text-white shadow-md shadow-[#b98c49]/30"
                          : "border-[#EAE2D8] bg-white text-[#666666] hover:border-[#b98c49] hover:text-[#b98c49]",
                      ].join(" ")}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <ReservationField label="Ghi chú thêm" icon={MessageSquare}>
                  <textarea
                    value={form.note}
                    onChange={(event) => update("note", event.target.value)}
                    rows={3}
                    placeholder="Ví dụ: muốn ngồi gần khu vực cún, đi cùng trẻ nhỏ, cần bàn yên tĩnh..."
                    className="min-h-[110px] w-full resize-none rounded-2xl border-2 border-[#EAE2D8] bg-white p-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>
              </div>

              {message.text && (
                <div
                  className={[
                    "mt-5 rounded-2xl px-5 py-4 text-[15px] font-medium leading-relaxed",
                    message.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-600",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {message.type === "success" && (
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-8 text-base font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition-all hover:bg-[#a1783a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CalendarDays size={20} />
                  )}
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt bàn"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-[#b98c49]/20 bg-white px-8 text-base font-['Quicksand'] font-bold text-[#b98c49] transition hover:bg-[#FFFAFA]"
                >
                  Thu gọn
                </button>
              </div>

              <p className="mt-4 text-center text-[13px] leading-relaxed text-[#999999] sm:text-left">
                Khi gửi form, bạn đồng ý để YEPO liên hệ lại qua số điện thoại đã cung cấp nhằm xác nhận lịch đặt bàn.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function ReservationField({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-3 flex items-center gap-2 text-[15px] font-['Quicksand'] font-bold text-[#2D2D2D]">
        <Icon size={16} className="text-[#b98c49]" />
        {label}
      </span>
      {children}
    </label>
  );
}

function ReservationNote({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm">
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#b98c49] text-white shadow-sm">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[15px] font-['Quicksand'] font-bold text-[#2D2D2D]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#555555]">{text}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
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
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-['Quicksand'] text-3xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#666666] sm:text-base">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

function LinkButton({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm font-['Quicksand'] font-bold text-[#2D2D2D] transition-all"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-[#b98c49] transition-transform duration-300 group-hover:scale-x-100" />
      </span>
      <ArrowRight
        size={16}
        className="text-[#b98c49] transition-transform group-hover:translate-x-1"
      />
    </Link>
  );
}
