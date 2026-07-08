import { Instagram, MapPin, Navigation, Phone } from "lucide-react";
import SectionHeader from "./SectionHeader";

export default function MapSection({ shop }) {
  return (
    <section id="map" className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            eyebrow="Find us"
            title="Google Maps & thÃ´ng tin liÃªn há»‡"
            description="Báº£n Ä‘á»“ nhÃºng trá»±c tiáº¿p giÃºp khÃ¡ch má»Ÿ chá»‰ Ä‘Æ°á»ng nhanh, Ä‘áº·c biá»‡t phÃ¹ há»£p khi cháº¡y quáº£ng cÃ¡o hoáº·c gáº¯n link bio Instagram."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={shop.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#2b1b10] px-5 text-sm font-semibold text-white transition hover:-translate-y-1"
            >
              <Navigation size={17} /> Má»Ÿ Google Maps
            </a>
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#2b1b10] ring-1 ring-[#d8b77e] transition hover:-translate-y-1 hover:bg-[#fff0bd]"
            >
              <Instagram size={17} /> Instagram
            </a>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[42px] border border-[#d8b77e] bg-white shadow-[0_28px_90px_rgba(74,45,25,.12)] lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-[30px] bg-[#f7efe3] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c672f]">Äá»‹a chá»‰</p>
              <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-[#2b1b10]">{shop.address}</h3>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[26px] border border-[#d8b77e] p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 text-[#b98c49]" size={21} />
                  <div>
                    <p className="text-sm font-semibold text-[#2b1b10]">Gháº¿ ngá»“i & check-in</p>
                    <p className="mt-1 text-sm leading-6 text-[#6f5a3e]">KhÃ´ng gian sÃ¡ng, sáº¡ch, há»£p Ä‘i nhÃ³m báº¡n hoáº·c gia Ä‘Ã¬nh.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-[#d8b77e] p-5">
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 text-[#b98c49]" size={21} />
                  <div>
                    <p className="text-sm font-semibold text-[#2b1b10]">ThÃ´ng tin nhanh</p>
                    <p className="mt-1 text-sm leading-6 text-[#6f5a3e]">Giá» má»Ÿ cá»­a: {shop.openingHours}. Gáº·p cÃºn: {shop.dogInteractionHours}.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-[420px] bg-[#f7e9bd] p-3 lg:min-h-[560px]">
            <iframe
              title="YEPO Dog & Ice Cream Google Map"
              src={shop.googleMapsEmbedUrl}
              className="h-full min-h-[420px] w-full rounded-[32px] border-0 grayscale-[.08]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}



