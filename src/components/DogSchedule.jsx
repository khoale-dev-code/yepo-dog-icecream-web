import { AlertCircle, Clock3, Dog, Heart, ShieldCheck } from "lucide-react";
import SectionHeader from "./SectionHeader";

const cards = [
  {
    icon: Clock3,
    title: "Khung giá» gáº·p cÃºn",
    text: "Gá»£i Ã½ khÃ¡ch Ä‘áº¿n Ä‘Ãºng ca Ä‘á»ƒ tráº£i nghiá»‡m trá»n váº¹n hÆ¡n.",
  },
  {
    icon: ShieldCheck,
    title: "KhÃ´ng gian sáº¡ch & kiá»ƒm soÃ¡t",
    text: "ThÃ´ng tin quy Ä‘á»‹nh rÃµ rÃ ng giÃºp khÃ¡ch má»›i yÃªn tÃ¢m trÆ°á»›c khi ghÃ©.",
  },
  {
    icon: Heart,
    title: "Mood therapy",
    text: "Kem, Ä‘á»“ uá»‘ng vÃ  cÃ¡c idol cÃºn táº¡o thÃ nh tráº£i nghiá»‡m check-in riÃªng cá»§a YEPO.",
  },
];

export default function DogSchedule({ shop }) {
  return (
    <section id="dogs" className="px-4 py-16 sm:px-6 lg:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[42px] border border-[#d8b77e] bg-[#2b1b10] text-white shadow-[0_28px_90px_rgba(43,27,16,.18)]">
        <div className="grid lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[440px] overflow-hidden bg-gradient-to-br from-[#ffe169] via-[#ffbf4c] to-[#76d5cb] p-8 sm:p-10">
            <div className="absolute inset-0 soft-grid opacity-40" />
            <div className="relative z-10 max-w-md">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7a4c2e]">
                <Dog size={15} /> 15 dog idols
              </p>
              <h2 className="font-display mt-6 text-5xl font-semibold leading-none tracking-tight text-[#2b1b10] sm:text-6xl">
                Äi Äƒn kem, vá» cÃ³ áº£nh xinh.
              </h2>
            </div>
            <div className="absolute bottom-8 right-8 grid h-48 w-48 place-items-center rounded-full bg-white/[0.08]0 text-[#7a4c2e] shadow-2xl backdrop-blur">
              <Dog size={102} strokeWidth={1.35} />
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <SectionHeader
              eyebrow="Dog interaction"
              title="Lá»‹ch gáº·p cÃºn rÃµ rÃ ng ngay trÃªn web"
              description="KhÃ¡ch sáº½ biáº¿t giá» má»Ÿ cá»­a, giá» gáº·p cÃºn vÃ  quy Ä‘á»‹nh trÆ°á»›c khi Ä‘áº¿n. Pháº§n nÃ y giáº£m nháº¯n tin há»i láº¡i vÃ  giÃºp tráº£i nghiá»‡m táº¡i quÃ¡n mÆ°á»£t hÆ¡n."
              tone="inverse"
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[26px] border border-white/10 bg-white/[0.08] p-5 backdrop-blur">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffe169] text-[#2b1b10]">
                      <Icon size={22} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{card.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-3 rounded-[30px] bg-white p-4 text-[#2b1b10] sm:grid-cols-2">
              <div className="rounded-[22px] bg-[#f7efe3] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8c672f]">Má»Ÿ cá»­a</p>
                <p className="mt-2 text-xl font-semibold">{shop.openingHours}</p>
              </div>
              <div className="rounded-[22px] bg-[#e9fbf8] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#197d72]">Gáº·p cÃºn</p>
                <p className="mt-2 text-xl font-semibold">{shop.dogInteractionHours}</p>
              </div>
              <div className="sm:col-span-2 rounded-[22px] bg-[#fff0ef] p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#bb421c]"><AlertCircle size={18} /> LÆ°u Ã½</p>
                <p className="mt-2 text-sm font-medium leading-6 text-[#6f5a3e]">{shop.note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



