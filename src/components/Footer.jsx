import { Instagram, MapPin } from "lucide-react";

export default function Footer({ shop, apiStatus }) {
  return (
    <footer className="px-4 pb-8 pt-10 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[34px] bg-[#2b1b10] p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src="/yepo-logo.svg" alt="YEPO" className="h-14 w-14 rounded-2xl" />
            <div>
              <p className="font-display text-2xl font-semibold">{shop.name}</p>
              <p className="mt-1 text-sm text-white/65">{shop.tagline}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.18]"
            >
              <Instagram size={17} /> Instagram
            </a>
            <a
              href={shop.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffe169] px-4 py-3 text-sm font-semibold text-[#2b1b10] transition hover:-translate-y-1"
            >
              <MapPin size={17} /> Chá»‰ Ä‘Æ°á»ng
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-5 text-xs font-semibold leading-6 text-white/55">
          <p>Â© {new Date().getFullYear()} YEPO Dog & Ice Cream. Website React + Tailwind CSS v4 + MongoDB + Cloudinary.</p>
          <p className="mt-1">API status: {apiStatus === "connected" ? "Ä‘Ã£ káº¿t ná»‘i MongoDB" : "Ä‘ang dÃ¹ng dá»¯ liá»‡u fallback khi chÆ°a cáº¥u hÃ¬nh server"}.</p>
        </div>
      </div>
    </footer>
  );
}



