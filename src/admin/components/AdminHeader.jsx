import { CheckCircle2, LayoutDashboard, Loader2 } from "lucide-react";
import { ADMIN_TABS } from "../config/adminConfig";

export function AdminHeader({ activeTab, saving }) {
  const current = ADMIN_TABS.find((tab) => tab.id === activeTab);
  const Icon = current?.icon || LayoutDashboard;

  return (
    <header className="rounded-[32px] border border-[#d8b77e] bg-white p-4 shadow-[0_18px_60px_rgba(74,45,25,.07)] sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
            <Icon size={22} />
          </div>

          <div>
            <p className="text-xs font-brand uppercase tracking-[0.16em] text-[#8c672f]">
              Admin dashboard
            </p>

            <h2 className="font-sniglet mt-1 text-3xl tracking-tight sm:text-4xl">
              {current?.label || "Tổng quan"}
            </h2>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#f7efe3] px-4 py-2 text-xs font-brand uppercase tracking-[0.08em] text-[#8c672f]">
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Đang lưu
            </>
          ) : (
            <>
              <CheckCircle2 size={15} />
              Sẵn sàng
            </>
          )}
        </div>
      </div>
    </header>
  );
}



