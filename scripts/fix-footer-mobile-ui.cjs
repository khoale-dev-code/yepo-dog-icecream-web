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
const footerPath = files.find((file) => {
  const content = fs.readFileSync(file, "utf8");
  return content.includes("export default function Footer");
});

if (!footerPath) {
  throw new Error("Không tìm thấy file Footer có export default function Footer");
}

const newFooter = `import {
  ExternalLink,
  Heart,
  Instagram,
  MapPin,
  PawPrint,
  Wifi,
  WifiOff,
} from "lucide-react";

function getLogo(shop) {
  return shop?.logoUrl || shop?.logo || shop?.imageUrl || "/yepo-logo.svg";
}

function normalizeUrl(value) {
  const text = String(value || "").trim();

  if (!text) return "";

  if (text.startsWith("http://") || text.startsWith("https://")) {
    return text;
  }

  return "https://" + text;
}

function getInstagramUrl(shop) {
  return normalizeUrl(shop?.instagramUrl || shop?.instagram);
}

function getMapsUrl(shop) {
  return normalizeUrl(shop?.googleMapsUrl || shop?.mapsUrl || shop?.mapUrl);
}

export default function Footer({ shop = {}, apiStatus }) {
  const logoUrl = getLogo(shop);
  const instagramUrl = getInstagramUrl(shop);
  const mapsUrl = getMapsUrl(shop);
  const connected = apiStatus === "connected";

  return (
    <footer className="px-3 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#2b1b10] text-white shadow-[0_18px_60px_rgba(43,27,16,0.2)] sm:rounded-[34px]">
        <div className="relative p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f6d77d]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-[#b98c49]/20 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center lg:justify-between">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
              <div className="grid h-18 w-18 place-items-center rounded-[26px] border border-white/15 bg-white/10 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.16)] sm:h-16 sm:w-16 sm:rounded-2xl">
                <img
                  src={logoUrl}
                  alt={shop?.name || "YEPO"}
                  className="h-full w-full rounded-[20px] object-contain"
                />
              </div>

              <div className="mt-4 min-w-0 sm:ml-4 sm:mt-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f6d77d] sm:hidden">
                  <PawPrint size={13} />
                  Pet-friendly Cafe
                </div>

                <p className="mt-3 line-clamp-2 font-display text-2xl font-semibold leading-tight sm:mt-0 sm:text-2xl">
                  {shop?.name || "YEPO Dog & Ice Cream"}
                </p>

                <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-white/68 sm:mx-0 sm:max-w-md">
                  {shop?.tagline || "Dog cafe & ice cream"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/[0.18]"
                >
                  <Instagram size={17} />
                  Instagram
                  <ExternalLink size={14} className="opacity-70" />
                </a>
              ) : (
                <span className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/45">
                  <Instagram size={17} />
                  Instagram
                </span>
              )}

              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ffe169] px-4 text-sm font-bold text-[#2b1b10] shadow-[0_10px_24px_rgba(255,225,105,0.2)] transition hover:-translate-y-0.5"
                >
                  <MapPin size={17} />
                  Chỉ đường
                  <ExternalLink size={14} className="opacity-70" />
                </a>
              ) : (
                <span className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 text-sm font-semibold text-white/45">
                  <MapPin size={17} />
                  Chỉ đường
                </span>
              )}
            </div>
          </div>

          <div className="relative mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="text-center text-xs font-semibold leading-6 text-white/55 sm:text-left">
              <p>
                © {new Date().getFullYear()} YEPO Dog & Ice Cream.
              </p>
              <p className="mt-1 hidden sm:block">
                Website React + Tailwind CSS v4 + MongoDB + Cloudinary.
              </p>
            </div>

            <div
              className={[
                "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-bold",
                connected
                  ? "bg-emerald-400/12 text-emerald-200 ring-1 ring-emerald-300/20"
                  : "bg-white/10 text-[#f6d77d] ring-1 ring-white/10",
              ].join(" ")}
            >
              {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {connected ? "API đã kết nối" : "Đang dùng dữ liệu fallback"}
            </div>
          </div>

          <div className="relative mt-5 flex items-center justify-center gap-1 text-[11px] font-semibold text-white/40 sm:hidden">
            Made with <Heart size={12} className="fill-current" /> for YEPO
          </div>
        </div>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync(footerPath, newFooter, "utf8");

console.log("Đã cập nhật Footer mobile UI tại:", footerPath);
