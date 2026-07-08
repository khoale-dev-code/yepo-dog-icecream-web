const fs = require("fs");
const path = require("path");

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) return result;

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!["node_modules", "dist", ".git"].includes(item)) {
        walk(fullPath, result);
      }
    } else if (/\.(jsx|js)$/.test(item)) {
      result.push(fullPath);
    }
  }

  return result;
}

const files = walk(path.resolve(process.cwd(), "src"));
const pagePath = files.find((file) => {
  const content = fs.readFileSync(file, "utf8");
  return content.includes("export default function YepoBentoLanding");
});

if (!pagePath) {
  throw new Error("Không tìm thấy file chứa export default function YepoBentoLanding");
}

const newContent = String.raw`import React from "react";
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
    <div className="min-h-screen bg-[#FFFAFA] px-3 py-5 font-sans text-[#4A3320] selection:bg-[#f6d77d] selection:text-[#4A3320] sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex items-center justify-between rounded-[24px] border border-[#f6d77d]/45 bg-white/75 px-4 py-3 shadow-sm backdrop-blur sm:mb-8 sm:bg-transparent sm:px-2 sm:py-0 sm:shadow-none sm:backdrop-blur-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f6d77d]/25 text-[#b98c49] sm:h-auto sm:w-auto sm:bg-transparent">
              <PawPrint className="animate-bounce" size={24} />
            </span>

            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-[#4A3320] sm:text-2xl">
                YEPO
              </h1>
              <p className="text-[11px] font-semibold text-[#b98c49] sm:hidden">
                Ice Cream & Pet Cafe
              </p>
            </div>
          </div>

          <p className="hidden rounded-full bg-[#f6d77d]/20 px-4 py-1.5 text-sm font-medium text-[#b98c49] sm:block">
            Ice Cream & Pet Cafe
          </p>

          <a
            href="tel:0961229449"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b98c49] text-white shadow-lg shadow-[#b98c49]/20 sm:hidden"
            aria-label="Gọi đặt bàn"
          >
            <Phone size={17} />
          </a>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 md:auto-rows-[minmax(180px,auto)]">
          <section className="relative order-1 overflow-hidden rounded-[28px] border border-[#f6d77d]/40 bg-gradient-to-br from-[#f6d77d]/35 to-[#f6d77d]/10 p-5 shadow-sm transition-all hover:shadow-md sm:rounded-[32px] sm:p-10 md:col-span-8 md:p-12">
            <div className="absolute -right-10 -top-10 text-[#f6d77d]/40 opacity-50 transition-transform duration-700 group-hover:rotate-12 sm:-right-8 sm:-top-8">
              <Sparkles size={130} className="sm:h-[180px] sm:w-[180px]" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[#b98c49]/10 bg-white px-3 py-1.5 text-[11px] font-bold text-[#b98c49] shadow-sm sm:mb-6 sm:text-sm">
                <Heart size={14} className="shrink-0 fill-current" />
                <span className="truncate">Trạm sạc cảm xúc giữa lòng Sài Gòn</span>
              </span>

              <h2 className="mb-4 text-[32px] font-extrabold leading-[1.12] tracking-tight text-[#4A3320] sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.15]">
                Không chỉ là kem.
                <br />
                Là thế giới của những{" "}
                <span className="relative inline-block text-[#b98c49]">
                  idol bốn chân
                  <svg
                    className="absolute -bottom-1 left-0 w-full text-[#f6d77d] sm:-bottom-2"
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

              <p className="mb-6 text-[15px] font-medium leading-7 text-[#6B4E31] sm:text-base md:mb-8 md:max-w-xl md:text-lg md:leading-relaxed">
                Bỏ lại những muộn phiền ngoài kia. Bước qua cánh cửa YEPO để vị ngọt mát của kem tan trên đầu lưỡi, và để trái tim bạn tan chảy trước dàn nhân viên bốn chân đáng yêu. 🐾
              </p>

              <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-4">
                <a
                  href="tel:0961229449"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-6 text-sm font-bold text-white shadow-lg shadow-[#b98c49]/30 transition-colors hover:bg-[#4A3320] sm:h-auto sm:px-8 sm:py-3.5 sm:text-base"
                >
                  <Phone size={18} />
                  Gọi đặt bàn ngay
                </a>
              </div>
            </div>
          </section>

          <section className="group relative order-2 min-h-[260px] overflow-hidden rounded-[28px] bg-[#b98c49] shadow-md sm:min-h-[320px] sm:rounded-[32px] md:col-span-4 md:min-h-full">
            {MASCOT_IMAGE_URL ? (
              <img
                src={MASCOT_IMAGE_URL}
                alt="Idol YEPO"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#b98c49] to-[#8c672f]">
                <IceCream size={80} className="text-white/50" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/15 bg-black/20 p-4 text-white backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:bg-transparent sm:p-0 sm:backdrop-blur-0 sm:border-0">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#f6d77d] sm:text-xs">
                Gương mặt thương hiệu
              </p>
              <p className="text-lg font-bold leading-tight">
                Ghé YEPO để nựng tụi mình nha! 🐶
              </p>
            </div>
          </section>

          <section className="relative order-3 overflow-hidden rounded-[28px] bg-[#4A3320] p-5 text-white shadow-md sm:rounded-[32px] sm:p-8 md:col-span-5">
            <IceCream className="absolute -bottom-6 -right-6 text-white/5" size={140} />
            <div className="relative z-10">
              <PawPrint size={28} className="mb-4 text-[#f6d77d] opacity-80 sm:mb-6 sm:h-8 sm:w-8" />
              <p className="mb-4 text-lg font-semibold leading-7 sm:text-2xl sm:leading-relaxed">
                "A cozy world for sweet treats and lovable four-legged idols."
              </p>
              <p className="text-sm font-medium text-[#f6d77d]">
                — Thưởng thức kem ngon, ôm trọn bình yên.
              </p>
            </div>
          </section>

          <section className="order-4 grid gap-4 sm:grid-cols-2 md:contents">
            <InfoCard
              icon={MapPin}
              label="Tọa độ"
              title="237 Bến Vân Đồn"
              description="Phường Vĩnh Hội, TP. Hồ Chí Minh"
              className="md:col-span-4"
            />

            <InfoCard
              icon={Clock}
              label="Giờ đón khách"
              title="10am - 21pm"
              description="Mở cửa mỗi ngày"
              variant="yellow"
              className="md:col-span-3"
            />
          </section>
        </div>
      </div>
    </div>
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
        "flex min-h-[170px] flex-col justify-between rounded-[28px] p-5 shadow-sm sm:rounded-[32px] sm:p-8",
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

        <h3 className="mb-1 text-xl font-black leading-tight sm:text-2xl">
          {title}
        </h3>

        <p className="text-sm font-medium leading-6 text-[#6B4E31]">
          {description}
        </p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(pagePath, newContent, "utf8");

console.log("Đã cập nhật mobile UI cho:", pagePath);
