import {
  CheckCircle2,
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import { cn } from "../utils/adminUtils";
import {
  formatPrice,
  getId,
  getToppingImage,
  isToppingVisible,
} from "./toppingUtils";

export function ToppingList({
  toppings,
  filteredToppings,
  query,
  status,
  loading,
  onQueryChange,
  onStatusChange,
  onCreate,
  onEdit,
  onToggle,
  onDelete,
}) {
  const visibleCount = toppings.filter(isToppingVisible).length;
  const hiddenCount = toppings.length - visibleCount;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tổng topping" value={toppings.length} />
        <StatCard label="Đang hiển thị" value={visibleCount} />
        <StatCard label="Đang ẩn" value={hiddenCount} />
      </section>

      <section className="rounded-[34px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
              Danh sách
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#3b2a18]">
              Topping đã tạo
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px] lg:w-[560px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
              />

              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Tìm topping..."
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-11 pr-4 text-sm outline-none focus:border-[#b98c49]"
              />
            </div>

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="h-12 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm outline-none focus:border-[#b98c49]"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hiện</option>
              <option value="hidden">Đang ẩn</option>
            </select>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[26px] border border-[#ead7b6]">
          <div className="hidden grid-cols-[86px_minmax(0,1fr)_130px_120px_190px] bg-[#FFFAFA] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#8c672f] lg:grid">
            <span>Ảnh</span>
            <span>Tên topping</span>
            <span>Giá</span>
            <span>Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>

          {loading ? (
            <EmptyState text="Đang tải topping..." />
          ) : filteredToppings.length === 0 ? (
            <div className="p-10 text-center">
              <Tag size={42} className="mx-auto text-[#b98c49]" />

              <p className="mt-3 text-lg font-black text-[#3b2a18]">
                Chưa có topping phù hợp
              </p>

              <button
                type="button"
                onClick={onCreate}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-bold text-white"
              >
                <Plus size={16} />
                Thêm topping đầu tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#ead7b6]">
              {filteredToppings.map((topping) => (
                <ToppingRow
                  key={getId(topping)}
                  topping={topping}
                  onEdit={() => onEdit(topping)}
                  onToggle={() => onToggle(topping)}
                  onDelete={() => onDelete(topping)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[28px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_14px_40px_rgba(87,61,28,.06)]">
      <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-[#3b2a18]">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="p-8 text-center text-sm font-bold text-[#8c672f]">
      {text}
    </div>
  );
}

function ToppingRow({ topping, onEdit, onToggle, onDelete }) {
  const image = getToppingImage(topping);
  const isVisible = isToppingVisible(topping);

  return (
    <article className="grid gap-4 bg-white p-4 transition hover:bg-[#FFFAFA] lg:grid-cols-[86px_minmax(0,1fr)_130px_120px_190px] lg:items-center">
      <div className="flex items-start gap-4 lg:block">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#ead7b6] bg-[#FFFAFA]">
          {image ? (
            <img
              src={image}
              alt={topping.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#b98c49]">
              <Tag size={24} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 lg:hidden">
          <h3 className="text-lg font-black text-[#3b2a18]">
            {topping.name}
          </h3>

          <p className="mt-1 text-sm font-bold text-[#b98c49]">
            {formatPrice(topping.price)}
          </p>

          {topping.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756144]">
              {topping.description}
            </p>
          )}
        </div>
      </div>

      <div className="hidden min-w-0 lg:block">
        <h3 className="truncate text-base font-black text-[#3b2a18]">
          {topping.name}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-[#756144]">
          {topping.description || "Chưa có mô tả"}
        </p>

        <p className="mt-1 text-xs font-bold text-[#8c672f]">
          Thứ tự #{topping.sortOrder || 999}
        </p>
      </div>

      <p className="hidden text-sm font-black text-[#b98c49] lg:block">
        {formatPrice(topping.price)}
      </p>

      <span
        className={cn(
          "inline-flex h-9 w-fit items-center gap-1 rounded-full px-3 text-xs font-bold",
          isVisible
            ? "bg-emerald-50 text-emerald-700"
            : "bg-neutral-100 text-neutral-500"
        )}
      >
        <CheckCircle2 size={13} />
        {isVisible ? "Đang hiện" : "Đang ẩn"}
      </span>

      <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
        <ActionButton onClick={onEdit} label="Sửa" className="bg-[#b98c49] text-white">
          <Edit size={15} />
        </ActionButton>

        <ActionButton
          onClick={onToggle}
          label={isVisible ? "Ẩn" : "Hiện"}
          className={
            isVisible
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-neutral-600"
          }
        >
          {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
        </ActionButton>

        <ActionButton onClick={onDelete} label="Xóa" className="bg-red-50 text-red-500">
          <Trash2 size={15} />
        </ActionButton>
      </div>
    </article>
  );
}

function ActionButton({ children, label, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition hover:-translate-y-0.5",
        className
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}
