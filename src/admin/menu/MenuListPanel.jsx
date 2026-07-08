import {
  Edit,
  Eye,
  EyeOff,
  ImagePlus,
  PackageOpen,
  Search,
  SlidersHorizontal,
  Star,
  Trash,
  Video,
} from "lucide-react";
import {
  cn,
  formatPrice,
  getCategoryId,
  getCategoryName,
  getDisplayOldPrice,
  getDisplayPrice,
  getId,
  getProductMedia,
} from "./menuUtils";

export function MenuListPanel({
  loading,
  products,
  categories,
  categoryMap,
  searchText,
  setSearchText,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  onEditProduct,
  onDeleteProduct,
  onToggleAvailable,
  onToggleFeatured,
}) {
  const visibleProducts = products.filter((product) => {
    const keyword = searchText.trim().toLowerCase();

    const matchesSearch =
      !keyword ||
      [product.name, product.description, product.category, product.tags?.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    const matchesCategory =
      categoryFilter === "all" || getCategoryId(product) === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && product.isAvailable !== false) ||
      (statusFilter === "unavailable" && product.isAvailable === false) ||
      (statusFilter === "featured" && product.isFeatured === true);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isFiltering =
    searchText.trim() || categoryFilter !== "all" || statusFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <div className="min-w-0 border-b border-[#d8b77e]/60 bg-gradient-to-br from-white to-[#f7efe3]/55 p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
              Danh sách điều phối thực đơn
            </p>

            <h2 className="font-sniglet mt-2 text-3xl sm:text-4xl leading-none text-[#3b2a18]">
              Danh sách món
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-[#756144]">
              Dễ dàng điều chỉnh thứ tự, bật/tắt bán, nổi bật hoặc sửa thông tin món.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center">
            <StatBox label="Hiển thị" value={`${visibleProducts.length}/${products.length}`} />
            <StatBox label="Danh mục" value={categories.length} />
          </div>
        </div>

        {/* Khu vực Filter - Responsive tốt hơn cho Mobile */}
        <div className="mt-5 rounded-[22px] border border-[#d8b77e]/70 bg-white/90 p-3 backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-nowrap lg:items-center">
            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1 lg:flex-1">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c672f]"
              />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm món trong danh sách..."
                className="h-11 w-full min-w-0 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-10 pr-3 text-sm font-normal text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full min-w-0 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-sm font-brand text-[#3b2a18] outline-none transition focus:border-[#b98c49] lg:w-[170px] lg:shrink-0"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={getId(category)} value={getId(category)}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 w-full min-w-0 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-3 text-sm font-brand text-[#3b2a18] outline-none transition focus:border-[#b98c49] lg:w-[150px] lg:shrink-0"
            >
              <option value="all">Tất cả món</option>
              <option value="available">Còn bán</option>
              <option value="unavailable">Tạm hết</option>
              <option value="featured">Nổi bật</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className={cn(
                "col-span-1 sm:col-span-2 lg:col-span-1 inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-brand transition lg:w-auto",
                isFiltering
                  ? "border-[#b98c49] bg-[#b98c49] text-white hover:bg-[#8c672f]"
                  : "border-[#d8b77e] bg-[#f7efe3] text-[#8c672f]"
              )}
            >
              <SlidersHorizontal size={16} />
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 bg-[#FFFAFA]/55 p-3 sm:p-5">
        {loading ? (
          <LoadingList />
        ) : visibleProducts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="min-w-0 space-y-3">
            {visibleProducts.map((product, index) => (
              <ProductRow
                key={getId(product)}
                product={product}
                index={index}
                categoryName={getCategoryName(product, categoryMap)}
                onEdit={() => onEditProduct(product)}
                onDelete={() => onDeleteProduct(getId(product))}
                onToggleAvailable={() => onToggleAvailable(product)}
                onToggleFeatured={() => onToggleFeatured(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white px-4 py-3 text-center ring-1 ring-[#d8b77e]/80 w-full sm:w-auto">
      <p className="truncate text-[11px] font-normal text-[#756144]">{label}</p>
      <p className="font-sniglet truncate text-2xl leading-none text-[#3b2a18]">
        {value}
      </p>
    </div>
  );
}

function ProductRow({
  product,
  index,
  categoryName,
  onEdit,
  onDelete,
  onToggleAvailable,
  onToggleFeatured,
}) {
  const media = getProductMedia(product);
  const firstMedia = media[0];
  const isAvailable = product.isAvailable !== false;
  const isFeatured = product.isFeatured === true;
  const price = getDisplayPrice(product);
  const oldPrice = getDisplayOldPrice(product);
  const hasSale = oldPrice > price && price > 0;
  const tags = Array.isArray(product.tags) ? product.tags.slice(0, 3) : [];
  const sortOrder = product.sortOrder || index + 1;

  return (
    <article className="min-w-0 rounded-[24px] border border-[#d8b77e]/75 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        
        {/* 1. Header (Mobile) & Order Info (Desktop) */}
        <div className="flex items-center justify-between lg:w-[70px] lg:shrink-0 lg:flex-col lg:justify-center">
          <div className="flex items-center gap-2 lg:flex-col">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f7efe3] text-xs font-brand text-[#8c672f]">
              {sortOrder}
            </div>
            <p className="hidden text-xs font-normal text-[#756144] lg:block lg:text-center">
              Thứ tự
            </p>
          </div>
          <div className="flex gap-2 lg:hidden">
            {isFeatured && <StatusBadge active={true} label="Nổi bật" customClass="bg-orange-50 text-orange-600" />}
            <StatusBadge active={isAvailable} label={isAvailable ? "Còn hàng" : "Tạm hết"} />
          </div>
        </div>

        {/* 2. Cột Hình Ảnh & Thông tin */}
        <div className="flex flex-1 min-w-0 gap-3 items-start lg:items-center">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#f7efe3] lg:h-16 lg:w-16">
            {firstMedia ? (
              firstMedia.resourceType === "video" ? (
                <video
                  src={firstMedia.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={firstMedia.url}
                  alt={firstMedia.originalName || product.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="grid h-full place-items-center text-[#b98c49]">
                <ImagePlus size={24} />
              </div>
            )}
            {firstMedia?.resourceType === "video" && (
              <span className="absolute bottom-1 right-1 rounded-full bg-black/65 p-1 text-white">
                <Video size={10} />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="line-clamp-1 min-w-0 text-sm font-brand text-[#3b2a18]">
                {product.name || "Chưa đặt tên"}
              </p>
              {isFeatured && (
                <span className="hidden lg:inline-flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-brand text-orange-600">
                  <Star size={11} fill="currentColor" />
                  Nổi bật
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-2 text-xs font-normal leading-5 text-[#756144]">
              {product.description || "Chưa có mô tả."}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-[#f7efe3] px-2.5 py-1 text-[10px] font-brand text-[#8c672f]">
                {categoryName}
              </span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-brand text-neutral-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Cột Giá & Hành động */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d8b77e]/30 pt-3 lg:w-[280px] lg:shrink-0 lg:border-none lg:pt-0">
          <div className="min-w-0 flex-1 lg:w-[120px] lg:flex-none">
            <p className="hidden text-[11px] font-normal uppercase tracking-[0.12em] text-[#756144] lg:block">
              Đơn giá
            </p>
            <div className="flex items-end gap-2 lg:flex-col lg:items-start lg:gap-0">
              <p className="mt-1 text-sm font-brand text-[#3b2a18]">
                {formatPrice(price)}
              </p>
              {hasSale && (
                <p className="text-xs font-normal text-neutral-400 line-through lg:mt-0.5">
                  {formatPrice(oldPrice)}
                </p>
              )}
            </div>
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <p className="mt-1 text-xs font-normal text-[#756144]">
                {product.sizes.length} size/lựa chọn
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto lg:w-[140px]">
            <div className="hidden lg:block">
              <StatusBadge active={isAvailable} label={isAvailable ? "Còn hàng" : "Tạm hết"} />
            </div>
            
            <div className="grid grid-cols-4 gap-1.5 w-full">
              <IconActionButton
                onClick={onEdit}
                title="Sửa món"
                className="bg-[#b98c49] text-white hover:bg-[#8c672f]"
              >
                <Edit size={14} />
              </IconActionButton>

              <IconActionButton
                onClick={onToggleFeatured}
                title="Nổi bật"
                className={
                  isFeatured
                    ? "bg-yellow-300 text-[#3b2a18] hover:bg-yellow-200"
                    : "bg-neutral-100 text-neutral-500 hover:text-yellow-600"
                }
              >
                <Star size={14} fill={isFeatured ? "currentColor" : "none"} />
              </IconActionButton>

              <IconActionButton
                onClick={onToggleAvailable}
                title={isAvailable ? "Tắt bán" : "Bật bán"}
                className={
                  isAvailable
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }
              >
                {isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
              </IconActionButton>

              <IconActionButton
                onClick={onDelete}
                title="Xóa món"
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                <Trash size={14} />
              </IconActionButton>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}

function IconActionButton({ children, onClick, title, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "inline-flex h-9 min-w-0 w-full items-center justify-center rounded-xl text-xs font-brand transition",
        className
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ active, label, customClass }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-brand uppercase tracking-[0.06em] whitespace-nowrap",
        customClass ? customClass : (active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500")
      )}
    >
      {label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d8b77e] bg-white px-5 py-14 text-center">
      <PackageOpen size={42} className="mx-auto text-[#b98c49]" />
      <p className="mt-4 text-lg font-brand text-[#3b2a18]">
        Không tìm thấy món
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm font-normal leading-6 text-[#756144]">
        Thử đổi từ khóa tìm kiếm, danh mục hoặc bộ lọc trạng thái.
      </p>
    </div>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-[#d8b77e]/75 bg-white p-3 sm:p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Header Skeleton (Mobile) & Order Info (Desktop) */}
            <div className="flex items-center justify-between lg:w-[70px] lg:shrink-0 lg:flex-col lg:justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-100" />
            </div>

            {/* Content Row Skeleton */}
            <div className="flex flex-1 gap-3">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-neutral-100 lg:h-16 lg:w-16" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>

            {/* Price & Actions Skeleton */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3 lg:w-[280px] lg:shrink-0 lg:border-none lg:pt-0">
              <div className="h-5 w-20 animate-pulse rounded bg-neutral-100 lg:w-[120px]" />
              <div className="grid w-full grid-cols-4 gap-1.5 sm:w-[140px]">
                <div className="h-9 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-9 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-9 animate-pulse rounded-xl bg-neutral-100" />
                <div className="h-9 animate-pulse rounded-xl bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}