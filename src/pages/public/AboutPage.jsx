import {
  Clock,
  Heart,
  IceCream,
  MapPin,
  PawPrint,
  Phone,
  Sparkles,
} from "lucide-react";

const MASCOT_IMAGE_URL =
  "https://instagram.fsgn2-10.fna.fbcdn.net/v/t51.82787-15/683789115_17872094964606126_6428776561352595400_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=109&ig_cache_key=Mzg4NTgwMDA2NzQ2NzEzMjAxOA%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0ueHBpZHMuMTQ0MC5zZHIucmVndWxhcl9waG90by5DMyJ9&_nc_ohc=vngeoBahMs0Q7kNvwGKs0Zo&_nc_oc=AdoysAORz18oKzgzZF_RlbQZ2C9aBk6zdSOlwS8kzubyGmfEkVvdomeXKgmQZJwRt19SL4l3NIVIPZqKanfqFeqi&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fsgn2-10.fna&_nc_gid=XRNJk382nM7IPqqKvUlr_Q&_nc_ss=7a22e&oh=00_AQAZ_KeAAOHGMaKorh3c7z_ri30YF5qc-bKU-LKoP2AZLA&oe=6A513DFF";

export default function YepoBentoLanding() {
  return (
    <main className="min-h-screen bg-[#FFFAFA] px-4 py-8 font-sans text-[#4A3320] selection:bg-[#f6d77d] selection:text-[#4A3320] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex items-center justify-between rounded-[28px] border border-[#f6d77d]/45 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f6d77d]/25 text-[#b98c49]">
              <PawPrint size={24} />
            </span>

            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-[#4A3320]">
                YEPO
              </h1>
              <p className="text-xs font-semibold text-[#b98c49]">
                Ice Cream & Pet Cafe
              </p>
            </div>
          </div>

          <p className="hidden rounded-full bg-[#f6d77d]/20 px-5 py-2 text-sm font-bold text-[#b98c49] sm:block">
            Ice Cream & Pet Cafe
          </p>

          <a
            href="tel:0961229449"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-bold text-white shadow-lg shadow-[#b98c49]/20"
          >
            <Phone size={17} />
            <span className="hidden sm:inline">Gọi đặt bàn</span>
          </a>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch lg:gap-6">
          <section className="group relative overflow-hidden rounded-[32px] border border-[#f6d77d]/40 bg-gradient-to-br from-[#f6d77d]/35 to-[#f6d77d]/10 p-6 shadow-sm lg:col-span-7 lg:min-h-[520px] lg:p-12">
            <div className="absolute -right-8 -top-8 text-[#f6d77d]/40 opacity-50 transition-transform duration-700 group-hover:rotate-12">
              <Sparkles size={180} />
            </div>

            <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center">
              <span className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-[#b98c49]/10 bg-white px-4 py-2 text-sm font-bold text-[#b98c49] shadow-sm">
                <Heart size={15} className="shrink-0 fill-current" />
                <span className="truncate">Trạm sạc cảm xúc giữa lòng Sài Gòn</span>
              </span>

              <h2 className="text-[38px] font-extrabold leading-[1.1] tracking-tight text-[#4A3320] sm:text-5xl lg:text-[58px]">
                Không chỉ là kem.
                <br />
                Là thế giới của những{" "}
                <span className="relative inline-block text-[#b98c49]">
                  idol Cún Đáng Yêu
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-[#f6d77d]"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 15 100 5"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                    />
                  </svg>
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#6B4E31] lg:text-lg">
                Bỏ lại những muộn phiền ngoài kia. Bước qua cánh cửa YEPO để vị ngọt mát của kem tan trên đầu lưỡi, và để trái tim bạn tan chảy trước dàn nhân viên bốn chân đáng yêu. 🐾
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="tel:0961229449"
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-7 text-sm font-bold text-white shadow-lg shadow-[#b98c49]/30 transition-colors hover:bg-[#4A3320]"
                >
                  <Phone size={18} />
                  Gọi đặt bàn ngay
                </a>
              </div>
            </div>
          </section>

          <section className="group relative min-h-[360px] overflow-hidden rounded-[32px] bg-[#b98c49] shadow-md lg:col-span-5 lg:min-h-[520px]">
            {MASCOT_IMAGE_URL ? (
              <img
                src={MASCOT_IMAGE_URL}
                alt="Idol YEPO"
                className="absolute inset-0 h-full w-full object-cover opacity-95 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#b98c49] to-[#8c672f]">
                <IceCream size={80} className="text-white/50" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 rounded-[26px] border border-white/20 bg-black/25 p-5 text-white backdrop-blur-md">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#f6d77d]">
                Gương mặt thương hiệu
              </p>
              <p className="text-2xl font-bold leading-tight">
                Ghé YEPO để nựng tụi mình nha! 🐶
              </p>
            </div>
          </section>

          <InfoCard
            icon={MapPin}
            label="Tọa độ"
            title="237 Bến Vân Đồn"
            description="Phường Vĩnh Hội, TP. Hồ Chí Minh"
            className="lg:col-span-4"
          />

          <InfoCard
            icon={Clock}
            label="Giờ đón khách"
            title="10am - 21pm"
            description="Mở cửa mỗi ngày"
            variant="yellow"
            className="lg:col-span-4"
          />

          <section className="relative overflow-hidden rounded-[32px] bg-[#4A3320] p-6 text-white shadow-md lg:col-span-4 lg:p-8">
            <IceCream className="absolute -bottom-6 -right-6 text-white/5" size={140} />
            <div className="relative z-10">
              <PawPrint size={30} className="mb-5 text-[#f6d77d] opacity-90" />
              <p className="text-xl font-semibold leading-8">
                “A cozy world for sweet treats and lovable four-legged idols.”
              </p>
              <p className="mt-5 text-sm font-medium text-[#f6d77d]">
                — Thưởng thức kem ngon, ôm trọn bình yên.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  title,
  description,
  variant = "white",
  className = "",
}) {
  const isYellow = variant === "yellow";

  return (
    <div
      className={[
        "flex min-h-[190px] flex-col justify-between rounded-[32px] p-6 shadow-sm lg:p-8",
        isYellow
          ? "bg-[#f6d77d] text-[#4A3320]"
          : "border-2 border-[#f6d77d]/30 bg-white text-[#4A3320] transition-colors hover:border-[#b98c49]",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "mb-5 flex h-12 w-12 items-center justify-center rounded-2xl",
          isYellow ? "bg-white/45 text-[#4A3320]" : "bg-[#f6d77d]/20 text-[#b98c49]",
        ].join(" ")}
      >
        <Icon size={23} />
      </div>

      <div>
        <p
          className={[
            "mb-2 text-xs font-bold uppercase tracking-wider",
            isYellow ? "text-[#4A3320]/75" : "text-[#b98c49]",
          ].join(" ")}
        >
          {label}
        </p>

        <h3 className="mb-1 text-2xl font-black leading-tight">
          {title}
        </h3>

        <p className="text-sm font-medium leading-6 text-[#6B4E31]">
          {description}
        </p>
      </div>
    </div>
  );
}
