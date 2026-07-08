import { Menu, X, PawPrint, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/about", label: "Về YEPO" },
  { to: "/menu", label: "Menu" },
  { to: "/promotions", label: "Khuyến mãi" },
  { to: "/posts", label: "Bài đăng" },
  { to: "/dogs", label: "Hồ sơ cún" },
];

export default function PublicNavbar({ shop, loading }) {
  const [isOpen, setIsOpen] = useState(false);

  const brand = useMemo(() => {
    return {
      name: shop?.name || "YEPO Dog & Ice Cream",
      logo:
        shop?.logoUrl ||
        "https://dummyimage.com/80x80/f7efe3/b98c49.png&text=YEPO",
    };
  }, [shop]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6d2ae] bg-[rgba(255,250,250,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-12 w-12 rounded-2xl border border-[#e6d2ae] bg-white object-cover shadow-sm"
          />

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#b98c49]">
              YEPO
            </p>
            <p className="truncate text-lg font-semibold text-[#3a2a1b]">
              {brand.name}
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/#reservation"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#b98c49] px-5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(185,140,73,.25)] transition hover:bg-[#9c7439]"
          >
            <CalendarDays size={17} />
            Đặt bàn
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e6d2ae] bg-white text-[#b98c49] lg:hidden"
          aria-label="Mở menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#e6d2ae] bg-[#fffafa] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.to}
                {...item}
                onClick={() => setIsOpen(false)}
              />
            ))}

            <a
              href="/#reservation"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-4 text-sm font-medium text-white"
            >
              <PawPrint size={16} />
              Đặt bàn
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "rounded-full px-4 py-2.5 text-sm font-medium transition",
          isActive
            ? "bg-[#f7efe3] text-[#b98c49]"
            : "text-[#6c5230] hover:bg-[#f7efe3] hover:text-[#b98c49]",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "rounded-2xl px-4 py-3 text-sm font-medium transition",
          isActive
            ? "bg-[#f7efe3] text-[#b98c49]"
            : "text-[#6c5230] hover:bg-[#f7efe3]",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}