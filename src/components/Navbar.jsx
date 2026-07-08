import { Instagram, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Menu", href: "#menu" },
  { label: "Idol cÃºn", href: "#dogs" },
  { label: "Báº£n Ä‘á»“", href: "#map" },
];

export default function Navbar({ shop }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="glass-card mx-auto flex max-w-7xl items-center justify-between rounded-[24px] border border-white/70 px-4 py-3">
        <a href="#top" className="flex items-center gap-3">
          <img src="/yepo-logo.svg" alt="YEPO" className="h-11 w-11 rounded-2xl shadow-sm" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-[#2b1b10]">YEPO</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#b1771d]">Dog & Ice Cream</p>
          </div>
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-white/65 p-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#6a4a2f] transition hover:bg-[#fff0bd] hover:text-[#2b1b10]"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/admin"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#6a4a2f] transition hover:bg-[#fff0bd] hover:text-[#2b1b10]"
          >
            Admin
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={shop.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#2b1b10] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(43,27,16,.18)] transition hover:-translate-y-0.5"
          >
            <MapPin size={16} />
            Chá»‰ Ä‘Æ°á»ng
          </a>
          <a
            href={shop.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#2b1b10] ring-1 ring-[#d8b77e] transition hover:bg-[#fff0bd]"
            aria-label="Instagram YEPO"
          >
            <Instagram size={18} />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#2b1b10] ring-1 ring-[#d8b77e] md:hidden"
          aria-label="Má»Ÿ menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="glass-card mx-auto mt-2 grid max-w-7xl gap-2 rounded-[24px] border border-white/70 p-3 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#2b1b10] hover:bg-white/70"
            >
              {item.label}
            </a>
          ))}
          <Link to="/admin" className="rounded-2xl px-4 py-3 text-sm font-semibold text-[#2b1b10] hover:bg-white/70">
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}



