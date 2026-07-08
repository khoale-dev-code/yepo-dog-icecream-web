import {
  BadgePercent,
  CalendarClock,
  Coffee,
  Newspaper,
  PawPrint,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Badge, EmptyText, Panel } from "../components/ui/AdminPrimitives";
import { getId, getReservationLabel } from "../utils/adminUtils";

export function DashboardView({
  summary,
  latestReservations,
  products,
  promotions,
}) {
  const stats = [
    {
      label: "Tổng món",
      value: summary.products || products.length || 0,
      icon: Coffee,
    },
    {
      label: "Còn bán",
      value: summary.availableProducts || 0,
      icon: Sparkles,
    },
    {
      label: "Topping",
      value: summary.toppings || 0,
      icon: Utensils,
    },
    {
      label: "Hồ sơ cún",
      value: summary.dogs || 0,
      icon: PawPrint,
    },
    {
      label: "Chờ đặt bàn",
      value: summary.pendingReservations || 0,
      icon: CalendarClock,
    },
    {
      label: "Bài đăng",
      value: summary.posts || 0,
      icon: Newspaper,
    },
    {
      label: "Khuyến mãi",
      value: summary.promotions || promotions.length || 0,
      icon: BadgePercent,
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <Panel title="Đặt bàn mới nhất" icon={CalendarClock}>
        <div className="space-y-2.5">
          {latestReservations?.length ? (
            latestReservations.map((item) => (
              <ReservationMiniCard key={getId(item)} item={item} />
            ))
          ) : (
            <EmptyText text="Chưa có lịch đặt bàn." />
          )}
        </div>
      </Panel>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="group rounded-[28px] border border-[#d8b77e] bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(87,61,28,.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-brand text-[#756144]">
            {label}
          </p>
          <p className="font-sniglet mt-2 text-4xl tracking-tight">{value}</p>
        </div>

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49] transition-colors duration-200 group-hover:bg-[#b98c49] group-hover:text-white">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function ReservationMiniCard({ item }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#FFFAFA] p-4 transition-colors duration-200 hover:bg-[#f7efe3]">
      <div className="min-w-0">
        <p className="truncate font-brand">{item.customerName}</p>
        <p className="mt-1 text-sm font-normal text-[#756144]">
          {item.date} · {item.time} · {item.guestCount} khách
        </p>
      </div>

      <Badge
        text={getReservationLabel(item.status)}
        muted={item.status === "cancelled"}
      />
    </div>
  );
}