import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Coffee,
  LogOut,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ADMIN_TABS } from "../config/adminConfig";
import { cn } from "../utils/adminUtils";

export function AdminSidebar({
  activeTab,
  setActiveTab,
  shop,
  loading,
  onRefresh,
  admin,
  onLogout,
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isCollapsed = !detailOpen;

  useEffect(() => {
    setMounted(true);
    document.body.classList.add("admin-mobile-dock-active");

    return () => {
      document.body.classList.remove("admin-mobile-dock-active");
    };
  }, []);

  function handleSelectTab(tabId) {
    setActiveTab(tabId);
    setDetailOpen(false);
  }

  function handleToggleSidebarDetail() {
    setDetailOpen((value) => !value);
  }

  const mobileDock =
    mounted &&
    createPortal(
      <nav
        data-admin-mobile-dock="true"
        className="hide-scrollbar fixed inset-x-0 bottom-0 z-[9999] flex items-center gap-2 overflow-x-auto overflow-y-hidden border-t-2 border-[#b98c49] bg-[#f6d77d] px-3 pt-2 shadow-[0_-14px_34px_rgba(185,140,73,.22)] lg:hidden"
        style={{
          height: "calc(72px + env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border-2 transition-all duration-200",
                active
                  ? "border-[#FFFAFA] bg-[#FFFAFA] text-[#b98c49] shadow-[0_3px_0_rgba(137,94,32,.24)]"
                  : "border-transparent bg-[#FFFAFA]/42 text-[#8c672f] active:scale-95"
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.7 : 2.2} />
            </button>
          );
        })}
      </nav>,
      document.body
    );

  return (
    <>
      <aside
        data-admin-sidebar="desktop"
        className={cn(
          "z-50 hidden min-w-0 flex-col overflow-hidden bg-[#f6d77d] font-brand text-[#b98c49] transition-[width] duration-300 ease-out lg:flex",
          "lg:h-dvh lg:min-h-dvh lg:border-r-4 lg:border-[#b98c49]",
          isCollapsed ? "lg:w-[110px]" : "lg:w-[320px]"
        )}
      >
        <div
          className={cn(
            "hidden shrink-0 items-center gap-3 p-4 lg:flex lg:p-5",
            isCollapsed ? "lg:justify-center lg:px-4" : "justify-between"
          )}
        >
          {isCollapsed ? (
            <Link
              to="/"
              className="hidden h-12 w-12 place-items-center rounded-2xl border-2 border-[#FFFAFA] bg-[#FFFAFA] text-[#b98c49] shadow-[0_4px_0_#b98c49] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b98c49] active:translate-y-1 active:shadow-none lg:grid"
              title="Về website"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </Link>
          ) : (
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[#FFFAFA] bg-[#FFFAFA] px-4 py-2.5 text-[13px] font-black uppercase tracking-[0.08em] text-[#b98c49] shadow-[0_4px_0_#b98c49] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_#b98c49] active:translate-y-1 active:shadow-none"
            >
              <ArrowLeft
                size={16}
                strokeWidth={3}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Website
            </Link>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#FFFAFA]/70 bg-[#b98c49] text-[#FFFAFA] shadow-[0_4px_0_rgba(137,94,32,.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(137,94,32,.45)] active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
              title="Tải lại dữ liệu"
            >
              <RefreshCw
                size={18}
                strokeWidth={2.5}
                className={cn(
                  "transition-transform duration-500",
                  loading ? "animate-spin" : "group-hover:rotate-180"
                )}
              />
            </button>
          )}
        </div>

        <div
          className={cn(
            "hidden shrink-0 transition-all duration-300 lg:block",
            isCollapsed ? "px-4 py-2" : "px-5 py-4"
          )}
        >
          {isCollapsed ? (
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] border-2 border-[#FFFAFA] bg-[#FFFAFA] text-[#b98c49] shadow-[0_4px_0_#b98c49]">
              {shop?.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt={shop.name || "YEPO"}
                  className="h-10 w-10 object-contain drop-shadow-sm"
                />
              ) : (
                <Coffee size={28} strokeWidth={2.5} />
              )}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[32px] border-2 border-[#FFFAFA] bg-[#FFFAFA] p-5 shadow-[0_6px_0_#b98c49]">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-[20px] border-2 border-[#f6d77d] bg-[#f6d77d] shadow-sm">
                  {shop?.logoUrl ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name || "YEPO"}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Coffee
                      className="text-[#b98c49]"
                      size={30}
                      strokeWidth={2.5}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="font-sniglet text-2xl font-black leading-none tracking-wide text-[#b98c49]">
                    YEPO Admin
                  </h1>
                  <p className="mt-1 text-[13px] font-bold uppercase tracking-wider text-[#b98c49]/75">
                    Cửa hàng chính
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[13px] font-medium leading-relaxed text-[#8c672f]">
                Quản lý menu, topping, đặt bàn & khuyến mãi cực dễ thương~ ✨
              </p>

              {admin?.username && (
                <div className="mt-4 inline-flex items-center gap-2.5 rounded-xl bg-[#f6d77d] px-3.5 py-2 text-xs font-black tracking-wide text-[#8c672f] shadow-sm">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[#b98c49] text-[#FFFAFA]">
                    <UserRound size={13} strokeWidth={3} />
                  </span>
                  {admin.username}
                </div>
              )}
            </div>
          )}
        </div>

        <nav
          className={cn(
            "hide-scrollbar flex shrink-0 gap-2 overflow-x-auto p-2",
            "lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden",
            isCollapsed ? "lg:items-center lg:px-4" : "lg:gap-4 lg:px-5"
          )}
        >
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                title={tab.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative inline-flex shrink-0 items-center rounded-[24px] border-2 font-bold transition-all duration-200",
                  isCollapsed
                    ? "lg:h-14 lg:w-14 lg:justify-center lg:p-0"
                    : "lg:w-full lg:justify-start lg:gap-4 lg:px-5 lg:py-4 lg:text-[15px]",
                  active
                    ? "border-[#FFFAFA] bg-[#FFFAFA] text-[#b98c49] shadow-[0_4px_0_rgba(137,94,32,.28)]"
                    : "border-transparent bg-[#FFFAFA]/42 text-[#8c672f] hover:-translate-y-1 hover:bg-[#FFFAFA]/72 hover:shadow-[0_4px_0_rgba(137,94,32,.16)]"
                )}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.7 : 2.2}
                  className={cn(
                    "shrink-0 transition-all duration-300",
                    !active && "group-hover:scale-110",
                    active && "scale-110"
                  )}
                />

                <span className={cn(isCollapsed ? "lg:hidden" : "lg:inline")}>
                  {tab.label}
                </span>

                {isCollapsed && active && (
                  <span className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 animate-bounce rounded-full border-2 border-[#f6d77d] bg-[#b98c49] shadow-sm lg:block" />
                )}
              </button>
            );
          })}
        </nav>

        <div
          className={cn(
            "hidden shrink-0 space-y-3 border-t-[3px] border-[#b98c49]/35 p-4 lg:block",
            isCollapsed ? "px-4" : "px-5"
          )}
        >
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "inline-flex h-14 items-center rounded-2xl border-2 border-[#FFFAFA]/70 bg-[#b98c49] text-[15px] font-black text-[#FFFAFA] shadow-[0_4px_0_rgba(137,94,32,.45)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_0_rgba(137,94,32,.45)] active:translate-y-1 active:shadow-none",
              isCollapsed ? "w-14 justify-center" : "w-full justify-between px-5"
            )}
            title="Đăng xuất"
          >
            {!isCollapsed && <span>Đăng xuất</span>}
            <LogOut size={20} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={handleToggleSidebarDetail}
            className={cn(
              "inline-flex h-14 items-center rounded-2xl border-2 border-[#FFFAFA]/70 bg-[#FFFAFA]/35 text-[15px] font-bold text-[#8c672f] shadow-[0_4px_0_rgba(137,94,32,.12)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#FFFAFA]/60 hover:shadow-[0_6px_0_rgba(137,94,32,.16)] active:translate-y-1 active:shadow-none",
              isCollapsed ? "w-14 justify-center" : "w-full justify-between px-5"
            )}
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {!isCollapsed && <span>Thu gọn</span>}
            {isCollapsed ? (
              <ChevronRight size={22} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </aside>

      {mobileDock}
    </>
  );
}
