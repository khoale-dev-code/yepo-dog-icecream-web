import { ArrowUpRight, Clock3, Dog, IceCreamBowl, Instagram, MapPin, Sparkles } from "lucide-react";

function Stat({ value, label }) {
  return (
    <div className="rounded-[22px] border border-[#f2d99d] bg-white/70 p-4 shadow-sm">
      <p className="font-display text-3xl font-semibold text-[#2b1b10]">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-[#8c672f]">{label}</p>
    </div>
  );
}

export default function Hero({ shop }) {
  return (
    <section id="top" className="soft-grid relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 lg:pb-24 lg:pt-36">
      <div className="absolute left-[6%] top-28 hidden h-28 w-28 rounded-full bg-[#ffd66f]/40 blur-3xl sm:block" />
      <div className="absolute right-[8%] top-36 hidden h-36 w-36 rounded-full bg-[#84d4ca]/40 blur-3xl sm:block" />

      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
        <div className="reveal-up max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d8b77e] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#8c672f] shadow-sm">
            <Sparkles size={15} />
            Ice cream â€¢ Dog cafe â€¢ HCMC
          </div>

          <h1 className="font-display mt-6 text-[52px] font-semibold leading-[0.92] tracking-[-0.05em] text-[#2b1b10] sm:text-7xl lg:text-[88px]">
            Kem ngon,
            <span className="block text-[#e49a1b]">gáº·p idol cÃºn.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-[#614932] sm:text-lg">
            {shop.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#menu"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2b1b10] px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_18px_40px_rgba(43,27,16,.22)] transition hover:-translate-y-1"
            >
              Xem menu
              <IceCreamBowl size={18} />
            </a>
            <a
              href={shop.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold uppercase tracking-[0.08em] text-[#2b1b10] ring-1 ring-[#d8b77e] transition hover:-translate-y-1 hover:bg-[#fff2c7]"
            >
              Instagram
              <Instagram size={18} />
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <Stat value={shop.stats?.dogs || 15} label="Idol cÃºn" />
            <Stat value={shop.stats?.flavors || 12} label="Vá»‹ kem" />
            <Stat value="10-21" label="Má»Ÿ cá»­a" />
          </div>
        </div>

        <div className="relative min-h-[520px] lg:min-h-[650px]">
          <div className="floaty absolute left-0 top-8 z-20 rounded-[30px] border border-white/70 bg-white/[0.08]5 p-4 shadow-[0_22px_60px_rgba(74,45,25,.16)] backdrop-blur md:left-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0bd] text-[#8c5924]">
                <Clock3 size={22} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#b1771d]">Gáº·p cÃºn</p>
                <p className="text-sm font-semibold text-[#2b1b10]">{shop.dogInteractionHours}</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-6 top-12 h-[520px] rotate-[-4deg] rounded-[44px] bg-[#2b1b10] shadow-[0_40px_90px_rgba(43,27,16,.26)]" />
          <div className="absolute inset-x-0 top-0 overflow-hidden rounded-[44px] border-[10px] border-white bg-[#ffe6a0] shadow-[0_28px_80px_rgba(74,45,25,.18)] lg:inset-x-8">
            <div className="relative aspect-[4/5] min-h-[560px] overflow-hidden bg-gradient-to-br from-[#f7efe3] via-[#ffe2a2] to-[#c9f0e9]">
              <div className="absolute inset-0 opacity-50 soft-grid" />
              <div className="absolute left-8 top-10 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8c5924]">
                YEPO moment
              </div>

              <div className="absolute left-1/2 top-24 h-52 w-52 -translate-x-1/2 rounded-full bg-white/[0.08]0 blur-sm" />
              <div className="absolute left-1/2 top-20 grid h-56 w-56 -translate-x-1/2 place-items-center rounded-full bg-white text-[#7a4c2e] shadow-2xl">
                <Dog size={108} strokeWidth={1.4} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 rounded-t-[52px] bg-white/75 p-8 backdrop-blur">
                <p className="font-display text-4xl font-semibold text-[#2b1b10]">{shop.name}</p>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#6f5a3e]">{shop.tagline}</p>
                <div className="mt-5 flex items-start gap-3 rounded-[22px] bg-[#2b1b10] p-4 text-white">
                  <MapPin className="mt-1 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#ffd66f]">Äá»‹a chá»‰</p>
                    <p className="mt-1 text-sm font-medium leading-6">{shop.address}</p>
                  </div>
                  <ArrowUpRight className="ml-auto shrink-0" size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



