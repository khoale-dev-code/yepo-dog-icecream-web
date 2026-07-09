const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

const files = walk("src");

const footerFile = files.find((file) => {
  const code = fs.readFileSync(file, "utf8");
  return (
    code.includes("Đặt bàn nhanh") ||
    code.includes("Bạn có thể đặt bàn ngay") ||
    code.includes("@yepo.dog.icecream")
  );
});

if (!footerFile) {
  throw new Error(
    "Không tìm thấy file footer chứa 'Đặt bàn nhanh'. Hãy gửi mình file Footer hiện tại nếu script này lỗi."
  );
}

const oldCode = fs.readFileSync(footerFile, "utf8");

let componentName = "PublicFooter";

const defaultMatch = oldCode.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
const functionMatch = oldCode.match(/function\s+([A-Za-z0-9_]+)\s*\(/);

if (defaultMatch?.[1]) {
  componentName = defaultMatch[1];
} else if (functionMatch?.[1]) {
  componentName = functionMatch[1];
}

const newCode = `import {
  ArrowUp,
  CalendarDays,
  Clock3,
  Instagram,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";

function cleanPhone(value) {
  return String(value || "").replace(/[^0-9+]/g, "");
}

function getInstagramText(value) {
  const text = String(value || "").trim();

  if (!text) return "@yepo.dog.icecream";

  return text
    .replace("https://instagram.com/", "@")
    .replace("https://www.instagram.com/", "@")
    .replace(/\\/$/, "");
}

export default function ${componentName}({ shop = {} }) {
  const shopName = shop?.name || "YEPO Dog & Ice Cream";
  const phone = shop?.phone || "0961229449";
  const address =
    shop?.address ||
    "237 Bến Vân Đồn, Phường Vĩnh Hội, TP. Hồ Chí Minh";
  const openingHours = shop?.openingHours || "10:00 - 21:00";
  const instagram = getInstagramText(shop?.instagram || shop?.instagramUrl);

  function backToTop(event) {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  return (
    <footer
      data-yepo-public-footer="true"
      className="border-t border-[#b98c49]/15 bg-white font-['Quicksand'] text-[#4A3320]"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)] lg:items-start">
          <section className="rounded-[28px] border border-[#b98c49]/15 bg-[#FFFAFA] p-5 shadow-[0_12px_34px_rgba(185,140,73,.07)] sm:p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#b98c49] text-white shadow-sm">
                {shop?.logoUrl ? (
                  <img
                    src={shop.logoUrl}
                    alt={shopName}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <Sparkles size={22} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b98c49]">
                  YEPO
                </p>

                <h2 className="mt-1 text-2xl font-bold leading-tight text-[#2D2D2D]">
                  {shopName}
                </h2>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#756144]">
                  Không gian kem, cafe và những người bạn bốn chân đáng yêu. Ghé YEPO để thư giãn, nựng cún và thưởng thức món ngọt mỗi ngày.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FooterInfo icon={MapPin} text={address} />
              <FooterInfo icon={Clock3} text={openingHours} />
              <FooterInfo icon={Phone} text={phone} href={"tel:" + cleanPhone(phone)} />
              <FooterInfo icon={Instagram} text={instagram} />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#b98c49]/15 bg-[#FFFAFA] p-5 shadow-[0_12px_34px_rgba(185,140,73,.07)] sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b98c49]">
              Reservation
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#2D2D2D]">
              Đặt bàn nhanh
            </h3>

            <p className="mt-3 text-sm font-medium leading-7 text-[#756144]">
              Bạn có thể đặt bàn ngay từ nút trên thanh điều hướng hoặc nhắn tin qua Instagram để YEPO giữ chỗ cho bạn.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href="/#reservation"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(185,140,73,.22)] transition hover:bg-[#8c672f]"
              >
                <CalendarDays size={18} />
                Đặt bàn ngay
              </a>

              <a
                href={"tel:" + cleanPhone(phone)}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#b98c49] ring-1 ring-[#b98c49]/20 transition hover:bg-[#f6d77d]/20"
              >
                <Phone size={17} />
                Gọi YEPO
              </a>
            </div>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#b98c49]/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs font-semibold text-[#8c672f] sm:text-left">
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={backToTop}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#FFFAFA] px-4 text-xs font-bold text-[#b98c49] ring-1 ring-[#b98c49]/15 transition hover:bg-[#f6d77d]/20"
          >
            <ArrowUp size={14} />
            Về đầu trang
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterInfo({ icon: Icon, text, href }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f6d77d]/30 text-[#b98c49]">
        <Icon size={17} />
      </span>

      <span className="min-w-0 break-words text-sm font-semibold leading-6 text-[#756144]">
        {text}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-[#b98c49]/10 transition hover:bg-[#f6d77d]/15"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-[#b98c49]/10">
      {content}
    </div>
  );
}
`;

fs.writeFileSync(footerFile, newCode);
console.log("✅ Rebuilt footer:", footerFile);
