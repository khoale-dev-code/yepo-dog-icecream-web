import {
  ArrowLeft,
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  Coffee,
  Edit3,
  ImagePlus,
  Instagram,
  LayoutDashboard,
  Loader2,
  MapPin,
  Newspaper,
  RefreshCw,
  Save,
  Search,
  Settings,
  Sparkles,
  Store,
  Trash2,
  UploadCloud,
  Utensils,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { notifyDataChanged } from "../lib/dataSync";

const EMPTY_FORMS = {
  products: {
    name: "",
    category: "Ice Cream",
    description: "",
    price: "",
    oldPrice: "",
    tags: "",
    sortOrder: "999",
    isFeatured: true,
    isAvailable: true,
  },
  toppings: {
    name: "",
    category: "Topping",
    description: "",
    price: "",
    sortOrder: "999",
    isAvailable: true,
  },
  posts: {
    title: "",
    caption: "",
    instagramUrl: "",
    isPublished: true,
    isPinned: false,
  },
  promotions: {
    title: "",
    subtitle: "",
    description: "",
    code: "",
    discountText: "",
    startAt: "",
    endAt: "",
    sortOrder: "999",
    isActive: true,
  },
  reservations: {
    customerName: "",
    phone: "",
    date: "",
    time: "",
    guestCount: "2",
    note: "",
    status: "pending",
  },
};

const RESERVATION_STATUS = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã hủy" },
];

const TABS = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "shop", label: "Cửa hàng", icon: Store },
  { id: "products", label: "Menu", icon: Coffee },
  { id: "toppings", label: "Topping", icon: Utensils },
  { id: "posts", label: "Bài đăng", icon: Newspaper },
  { id: "promotions", label: "Khuyến mãi", icon: BadgePercent },
  { id: "reservations", label: "Đặt bàn", icon: CalendarClock },
];

const RESOURCE_CONFIG = {
  products: {
    title: "Quản lý menu",
    formTitle: "Thông tin món",
    emptyText: "Chưa có món nào.",
    icon: Coffee,
    supportMedia: true,
    fields: [
      { name: "name", label: "Tên món", required: true },
      { name: "category", label: "Danh mục", required: true },
      { name: "price", label: "Giá", inputMode: "numeric" },
      { name: "oldPrice", label: "Giá cũ", inputMode: "numeric" },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "tags", label: "Tags", placeholder: "best seller, kem, trà..." },
      { name: "sortOrder", label: "Thứ tự", inputMode: "numeric" },
      { name: "isFeatured", label: "Món nổi bật", type: "toggle" },
      { name: "isAvailable", label: "Còn bán", type: "toggle" },
    ],
  },
  toppings: {
    title: "Quản lý topping",
    formTitle: "Thông tin topping",
    emptyText: "Chưa có topping nào.",
    icon: Utensils,
    supportMedia: false,
    fields: [
      { name: "name", label: "Tên topping", required: true },
      { name: "category", label: "Nhóm", required: true },
      { name: "price", label: "Giá", inputMode: "numeric" },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "sortOrder", label: "Thứ tự", inputMode: "numeric" },
      { name: "isAvailable", label: "Còn bán", type: "toggle" },
    ],
  },
  posts: {
    title: "Quản lý bài đăng",
    formTitle: "Thông tin bài đăng",
    emptyText: "Chưa có bài đăng nào.",
    icon: Newspaper,
    supportMedia: true,
    fields: [
      { name: "title", label: "Tiêu đề", required: true },
      { name: "instagramUrl", label: "Link Instagram" },
      { name: "caption", label: "Nội dung", type: "textarea" },
      { name: "isPublished", label: "Public bài viết", type: "toggle" },
      { name: "isPinned", label: "Ghim bài viết", type: "toggle" },
    ],
  },
  promotions: {
    title: "Quản lý khuyến mãi",
    formTitle: "Thông tin khuyến mãi",
    emptyText: "Chưa có khuyến mãi nào.",
    icon: BadgePercent,
    supportMedia: true,
    fields: [
      { name: "title", label: "Tên khuyến mãi", required: true },
      { name: "subtitle", label: "Tiêu đề phụ" },
      { name: "discountText", label: "Nhãn ưu đãi", placeholder: "Mua 2 tặng 1" },
      { name: "code", label: "Mã khuyến mãi" },
      { name: "startAt", label: "Ngày bắt đầu", type: "date" },
      { name: "endAt", label: "Ngày kết thúc", type: "date" },
      { name: "description", label: "Mô tả", type: "textarea" },
      { name: "sortOrder", label: "Thứ tự", inputMode: "numeric" },
      { name: "isActive", label: "Đang hiển thị", type: "toggle" },
    ],
  },
  reservations: {
    title: "Quản lý đặt bàn",
    formTitle: "Thông tin đặt bàn",
    emptyText: "Chưa có lịch đặt bàn nào.",
    icon: CalendarClock,
    supportMedia: false,
    fields: [
      { name: "customerName", label: "Tên khách", required: true },
      { name: "phone", label: "Số điện thoại", required: true },
      { name: "date", label: "Ngày", type: "date", required: true },
      { name: "time", label: "Giờ", type: "time", required: true },
      { name: "guestCount", label: "Số khách", inputMode: "numeric" },
      {
        name: "status",
        label: "Trạng thái",
        type: "select",
        options: RESERVATION_STATUS,
      },
      { name: "note", label: "Ghi chú", type: "textarea" },
    ],
  },
};

const RESOURCE_API = {
  products: {
    list: api.getProducts,
    create: api.createProduct,
    update: api.updateProduct,
    remove: api.deleteProduct,
  },
  toppings: api.toppings,
  posts: api.posts,
  promotions: api.promotions,
  reservations: api.reservations,
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getId(item) {
  return item?._id || item?.id;
}

function toNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getThumb(item) {
  return item?.media?.[0]?.url || item?.imageUrl || "";
}

function createDefaultData() {
  return {
    shop: null,
    summary: {},
    latestReservations: [],
    products: [],
    toppings: [],
    posts: [],
    promotions: [],
    reservations: [],
  };
}

function cloneEmptyForms() {
  return structuredClone(EMPTY_FORMS);
}

function mapToForm(resource, item) {
  if (!item) return structuredClone(EMPTY_FORMS[resource]);

  if (resource === "products") {
    return {
      name: item.name || "",
      category: item.category || "Ice Cream",
      description: item.description || "",
      price: item.price || "",
      oldPrice: item.oldPrice || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      sortOrder: item.sortOrder ?? "999",
      isFeatured: item.isFeatured === true,
      isAvailable: item.isAvailable !== false,
    };
  }

  if (resource === "toppings") {
    return {
      name: item.name || "",
      category: item.category || "Topping",
      description: item.description || "",
      price: item.price || "",
      sortOrder: item.sortOrder ?? "999",
      isAvailable: item.isAvailable !== false,
    };
  }

  if (resource === "posts") {
    return {
      title: item.title || "",
      caption: item.caption || "",
      instagramUrl: item.instagramUrl || "",
      isPublished: item.isPublished !== false,
      isPinned: item.isPinned === true,
    };
  }

  if (resource === "promotions") {
    return {
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      code: item.code || "",
      discountText: item.discountText || "",
      startAt: toDateInput(item.startAt),
      endAt: toDateInput(item.endAt),
      sortOrder: item.sortOrder ?? "999",
      isActive: item.isActive !== false,
    };
  }

  return {
    customerName: item.customerName || "",
    phone: item.phone || "",
    date: item.date || "",
    time: item.time || "",
    guestCount: item.guestCount || "2",
    note: item.note || "",
    status: item.status || "pending",
  };
}

function buildPayload(resource, form, media) {
  if (resource === "products") {
    return {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: toNumber(form.price),
      oldPrice: toNumber(form.oldPrice),
      tags: String(form.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sortOrder: toNumber(form.sortOrder || 999),
      isFeatured: Boolean(form.isFeatured),
      isAvailable: Boolean(form.isAvailable),
      media,
    };
  }

  if (resource === "toppings") {
    return {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: toNumber(form.price),
      sortOrder: toNumber(form.sortOrder || 999),
      isAvailable: Boolean(form.isAvailable),
    };
  }

  if (resource === "posts") {
    return {
      title: form.title.trim(),
      caption: form.caption.trim(),
      instagramUrl: form.instagramUrl.trim(),
      isPublished: Boolean(form.isPublished),
      isPinned: Boolean(form.isPinned),
      media,
    };
  }

  if (resource === "promotions") {
    return {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      code: form.code.trim(),
      discountText: form.discountText.trim(),
      startAt: form.startAt || "",
      endAt: form.endAt || "",
      sortOrder: toNumber(form.sortOrder || 999),
      isActive: Boolean(form.isActive),
      media,
    };
  }

  return {
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    date: form.date,
    time: form.time,
    guestCount: toNumber(form.guestCount || 1),
    note: form.note.trim(),
    status: form.status,
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(createDefaultData);
  const [forms, setForms] = useState(cloneEmptyForms);
  const [files, setFiles] = useState({});
  const [editing, setEditing] = useState({});
  const [shopForm, setShopForm] = useState({});
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [
        shopRes,
        summaryRes,
        productsRes,
        toppingsRes,
        postsRes,
        promotionsRes,
        reservationsRes,
      ] = await Promise.all([
        api.getShop(),
        api.getAdminSummary(),
        api.getProducts(),
        api.toppings.list(),
        api.posts.list(),
        api.promotions.list(),
        api.reservations.list(),
      ]);

      const nextData = {
        shop: shopRes.shop || null,
        summary: summaryRes.summary || {},
        latestReservations: summaryRes.latestReservations || [],
        products: productsRes.products || [],
        toppings: toppingsRes.toppings || [],
        posts: postsRes.posts || [],
        promotions: promotionsRes.promotions || [],
        reservations: reservationsRes.reservations || [],
      };

      setData(nextData);
      setShopForm(nextData.shop || {});
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu admin.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function updateForm(resource, field, value) {
    setForms((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [field]: value,
      },
    }));
  }

  function resetResource(resource) {
    setForms((current) => ({
      ...current,
      [resource]: structuredClone(EMPTY_FORMS[resource]),
    }));
    setFiles((current) => ({ ...current, [resource]: [] }));
    setEditing((current) => ({ ...current, [resource]: "" }));
  }

  async function uploadMedia(resource) {
    const selectedFiles = files[resource] || [];
    if (!selectedFiles.length) return [];

    const result = await api.uploadMedia(selectedFiles);
    return result.media || [];
  }

  async function saveResource(resource, event) {
    event.preventDefault();

    const currentApi = RESOURCE_API[resource];
    const editingId = editing[resource];
    const existingItem = editingId
      ? data[resource].find((item) => getId(item) === editingId)
      : null;

    setSaving(true);
    setError("");

    try {
      const uploadedMedia = await uploadMedia(resource);
      const existingMedia = existingItem?.media || [];
      const nextMedia = uploadedMedia.length
        ? [...existingMedia, ...uploadedMedia]
        : existingMedia;

      const payload = buildPayload(resource, forms[resource], nextMedia);

      if (editingId) {
        await currentApi.update(editingId, payload);
        notifyDataChanged({ resource, action: "update" });
        flash("Đã cập nhật dữ liệu.");
      } else {
        await currentApi.create(payload);
        notifyDataChanged({ resource, action: "create" });
        flash("Đã thêm dữ liệu mới.");
      }

      resetResource(resource);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Không lưu được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(resource, id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa mục này?")) return;

    setSaving(true);
    setError("");

    try {
      await RESOURCE_API[resource].remove(id);
      notifyDataChanged({ resource, action: "delete" });
      flash("Đã xóa thành công.");
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Không xóa được dữ liệu.");
    } finally {
      setSaving(false);
    }
  }

  function editResource(resource, item) {
    setActiveTab(resource);
    setEditing((current) => ({ ...current, [resource]: getId(item) }));
    setForms((current) => ({ ...current, [resource]: mapToForm(resource, item) }));
    setFiles((current) => ({ ...current, [resource]: [] }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveShop(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...shopForm,
        stats: {
          dogs: toNumber(shopForm?.stats?.dogs),
          flavors: toNumber(shopForm?.stats?.flavors),
          dailyHours: toNumber(shopForm?.stats?.dailyHours),
        },
      };

      const result = await api.updateShop(payload);

      notifyDataChanged({ resource: "shop", action: "update" });
      setData((current) => ({ ...current, shop: result.shop }));
      setShopForm(result.shop || {});
      flash("Đã cập nhật cửa hàng.");
    } catch (err) {
      setError(err.message || "Không lưu được cửa hàng.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadShopImage(field, selectedFiles) {
    if (!selectedFiles?.length) return;

    setSaving(true);
    setError("");

    try {
      const result = await api.uploadMedia(selectedFiles);
      const url = result.media?.[0]?.url || "";

      setShopForm((current) => ({ ...current, [field]: url }));
      flash("Đã upload ảnh. Bấm lưu cửa hàng để áp dụng.");
    } catch (err) {
      setError(err.message || "Không upload được ảnh.");
    } finally {
      setSaving(false);
    }
  }

  const visibleItems = useMemo(() => {
    if (!RESOURCE_CONFIG[activeTab]) return [];

    const keyword = query.trim().toLowerCase();
    const items = data[activeTab] || [];

    if (!keyword) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(keyword)
    );
  }, [activeTab, data, query]);

  return (
    <main className="min-h-screen bg-[#FFFAFA] text-[#b98c49]">
      <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          shop={data.shop}
          loading={loading}
          onRefresh={loadAdminData}
        />

        <section className="min-w-0 px-3 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <AdminHeader activeTab={activeTab} saving={saving} />

            {notice && <Alert type="success" message={notice} />}
            {error && <Alert type="error" message={error} />}

            {loading ? (
              <LoadingState />
            ) : (
              <div className="mt-6">
                {activeTab === "dashboard" && (
                  <DashboardView
                    summary={data.summary}
                    latestReservations={data.latestReservations}
                    products={data.products}
                    promotions={data.promotions}
                  />
                )}

                {activeTab === "shop" && (
                  <ShopView
                    form={shopForm}
                    setForm={setShopForm}
                    saving={saving}
                    onSubmit={saveShop}
                    onUpload={uploadShopImage}
                  />
                )}

                {RESOURCE_CONFIG[activeTab] && (
                  <ResourceView
                    resource={activeTab}
                    config={RESOURCE_CONFIG[activeTab]}
                    form={forms[activeTab]}
                    files={files[activeTab] || []}
                    items={visibleItems}
                    query={query}
                    editingId={editing[activeTab]}
                    saving={saving}
                    setQuery={setQuery}
                    setFiles={(nextFiles) =>
                      setFiles((current) => ({
                        ...current,
                        [activeTab]: nextFiles,
                      }))
                    }
                    updateForm={updateForm}
                    onSubmit={(event) => saveResource(activeTab, event)}
                    onCancel={() => resetResource(activeTab)}
                    onEdit={(item) => editResource(activeTab, item)}
                    onDelete={(id) => deleteResource(activeTab, id)}
                    onReservationStatus={async (item, status) => {
                      setSaving(true);
                      await api.reservations.update(getId(item), { status });
                      notifyDataChanged({
                        resource: "reservations",
                        action: "update",
                      });
                      flash("Đã cập nhật trạng thái đặt bàn.");
                      await loadAdminData();
                      setSaving(false);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminSidebar({ activeTab, setActiveTab, shop, loading, onRefresh }) {
  return (
    <aside className="z-40 border-b border-[#b98c49] bg-[#3b2a18] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 p-4 lg:block lg:p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-brand uppercase tracking-[0.08em] text-white transition hover:bg-white/15"
        >
          <ArrowLeft size={15} />
          Website
        </Link>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full bg-[#FFFAFA] px-3 py-2 text-xs font-brand text-[#3b2a18]"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Tải lại
        </button>
      </div>

      <div className="hidden px-6 pb-5 lg:block">
        <div className="rounded-[30px] border border-white/10 bg-white/10 p-4">
          <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-3xl bg-white">
            {shop?.logoUrl ? (
              <img
                src={shop.logoUrl}
                alt={shop.name || "YEPO"}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <Coffee className="text-[#3b2a18]" size={30} />
            )}
          </div>

          <h1 className="font-sniglet mt-4 text-3xl tracking-tight">
            YEPO Admin
          </h1>

          <p className="mt-2 text-sm leading-6 text-white/65">
            Quản lý menu, logo, bài đăng, topping, đặt bàn và khuyến mãi.
          </p>
        </div>
      </div>

      <nav className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-2 lg:overflow-visible lg:px-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-brand transition lg:w-full",
                active
                  ? "bg-[#FFFAFA] text-[#b98c49]"
                  : "bg-white/5 text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function AdminHeader({ activeTab, saving }) {
  const current = TABS.find((tab) => tab.id === activeTab);
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

function DashboardView({ summary, latestReservations, products, promotions }) {
  const stats = [
    { label: "Tổng món", value: summary.products || products.length || 0, icon: Coffee },
    { label: "Còn bán", value: summary.availableProducts || 0, icon: Sparkles },
    { label: "Topping", value: summary.toppings || 0, icon: Utensils },
    { label: "Chờ đặt bàn", value: summary.pendingReservations || 0, icon: CalendarClock },
    { label: "Bài đăng", value: summary.posts || 0, icon: Newspaper },
    { label: "Khuyến mãi", value: summary.promotions || promotions.length || 0, icon: BadgePercent },
  ];

  return (
    <div className="space-y-5">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <Panel title="Đặt bàn mới nhất" icon={CalendarClock}>
        <div className="space-y-3">
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

function ShopView({ form, setForm, saving, onSubmit, onUpload }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateStats(field, value) {
    setForm((current) => ({
      ...current,
      stats: {
        ...(current.stats || {}),
        [field]: value,
      },
    }));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <Panel title="Thông tin cửa hàng" icon={Settings}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tên cửa hàng" value={form.name} onChange={(value) => update("name", value)} required />
          <Field label="Tagline" value={form.tagline} onChange={(value) => update("tagline", value)} />
          <Field label="Số điện thoại" value={form.phone} onChange={(value) => update("phone", value)} />
          <Field label="Instagram URL" value={form.instagramUrl} onChange={(value) => update("instagramUrl", value)} icon={Instagram} />
          <Field label="Địa chỉ" value={form.address} onChange={(value) => update("address", value)} icon={MapPin} className="sm:col-span-2" />
          <Field label="Google Maps URL" value={form.googleMapsUrl} onChange={(value) => update("googleMapsUrl", value)} className="sm:col-span-2" />
          <Field label="Google Maps Embed URL" value={form.googleMapsEmbedUrl} onChange={(value) => update("googleMapsEmbedUrl", value)} className="sm:col-span-2" />
          <Field label="Giờ mở cửa" value={form.openingHours} onChange={(value) => update("openingHours", value)} />
          <Field label="Giờ gặp cún" value={form.dogInteractionHours} onChange={(value) => update("dogInteractionHours", value)} />
          <TextArea label="Mô tả" value={form.description} onChange={(value) => update("description", value)} className="sm:col-span-2" />
          <TextArea label="Ghi chú" value={form.note} onChange={(value) => update("note", value)} className="sm:col-span-2" />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Số cún" value={form?.stats?.dogs} onChange={(value) => updateStats("dogs", value)} inputMode="numeric" />
          <Field label="Số vị kem" value={form?.stats?.flavors} onChange={(value) => updateStats("flavors", value)} inputMode="numeric" />
          <Field label="Giờ/ngày" value={form?.stats?.dailyHours} onChange={(value) => updateStats("dailyHours", value)} inputMode="numeric" />
        </div>

        <SubmitButton saving={saving} label="Lưu cửa hàng" />
      </Panel>

      <Panel title="Logo & hình ảnh" icon={ImagePlus}>
        <div className="grid gap-4">
          <ImageUploadCard label="Logo cửa hàng" src={form.logoUrl} onFiles={(files) => onUpload("logoUrl", files)} />
          <ImageUploadCard label="Ảnh bìa" src={form.coverUrl} onFiles={(files) => onUpload("coverUrl", files)} />
          <ImageUploadCard label="Ảnh hero" src={form.heroImageUrl} onFiles={(files) => onUpload("heroImageUrl", files)} />
        </div>
      </Panel>
    </form>
  );
}

function ResourceView({
  resource,
  config,
  form,
  files,
  items,
  query,
  editingId,
  saving,
  setQuery,
  setFiles,
  updateForm,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
  onReservationStatus,
}) {
  const Icon = config.icon;

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
      <Panel title={editingId ? "Cập nhật dữ liệu" : config.formTitle} icon={Icon}>
        <form onSubmit={onSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <FormField
              key={field.name}
              field={field}
              value={form[field.name]}
              onChange={(value) => updateForm(resource, field.name, value)}
            />
          ))}

          {config.supportMedia && <FilePicker files={files} setFiles={setFiles} />}

          <div className="flex gap-2">
            <SubmitButton saving={saving} label={editingId ? "Cập nhật" : "Thêm mới"} />

            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="mt-5 grid h-[52px] w-14 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#8c672f]"
                aria-label="Hủy sửa"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title={config.title} icon={LayoutDashboard}>
        <SearchBox value={query} onChange={setQuery} placeholder={`Tìm trong ${config.title.toLowerCase()}...`} />

        <div className="mt-4">
          {!items.length ? (
            <EmptyText text={config.emptyText} />
          ) : resource === "products" ? (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <ProductCard key={getId(item)} item={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(getId(item))} />
              ))}
            </div>
          ) : resource === "reservations" ? (
            <div className="space-y-3">
              {items.map((item) => (
                <ReservationCard
                  key={getId(item)}
                  item={item}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(getId(item))}
                  onStatus={(status) => onReservationStatus(item, status)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <GenericCard key={getId(item)} item={item} resource={resource} onEdit={() => onEdit(item)} onDelete={() => onDelete(getId(item))} />
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function FormField({ field, value, onChange }) {
  if (field.type === "toggle") {
    return <Toggle label={field.label} checked={Boolean(value)} onChange={onChange} />;
  }

  if (field.type === "textarea") {
    return <TextArea label={field.label} value={value} onChange={onChange} />;
  }

  if (field.type === "select") {
    return <Select label={field.label} value={value} onChange={onChange} options={field.options || []} />;
  }

  return (
    <Field
      label={field.label}
      value={value}
      onChange={onChange}
      placeholder={field.placeholder}
      required={field.required}
      inputMode={field.inputMode}
      type={field.type || "text"}
    />
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <article className="rounded-[28px] border border-[#d8b77e] bg-white p-5 shadow-[0_18px_60px_rgba(74,45,25,.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-brand text-[#6f5a3e]">{label}</p>
          <p className="font-sniglet mt-2 text-4xl tracking-tight">{value}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="mobile-safe-card min-w-0 rounded-[30px] border border-[#d8b77e] bg-white p-4 shadow-[0_18px_60px_rgba(74,45,25,.07)] sm:p-5">
      <div className="mb-4 flex items-center gap-3 border-b border-[#e5c99c] pb-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
          <Icon size={20} />
        </div>
        <h3 className="font-sniglet text-2xl tracking-tight">{title}</h3>
      </div>

      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, required, inputMode, type = "text", icon: Icon, className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-2 text-sm font-brand text-[#3b2a18]">
        {Icon && <Icon size={15} />}
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        inputMode={inputMode}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-medium text-[#3b2a18] outline-none transition placeholder:text-[#b59b74] focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, className = "" }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">{label}</span>

      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm font-semibold leading-7 text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-brand text-[#3b2a18]">{label}</span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-medium text-[#3b2a18] outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] p-4 text-sm font-brand text-[#3b2a18]">
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#b98c49]"
      />
    </label>
  );
}

function FilePicker({ files, setFiles }) {
  return (
    <label className="block cursor-pointer rounded-3xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-4 text-center transition hover:bg-[#f7efe3]">
      <UploadCloud className="mx-auto text-[#b98c49]" size={30} />

      <p className="mt-2 text-sm font-brand">Upload ảnh / video lên Cloudinary</p>

      <p className="mt-1 text-xs font-medium text-[#6f5a3e]">
        {files.length ? `${files.length} file đã chọn` : "Có thể chọn nhiều file"}
      </p>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(event) => setFiles(Array.from(event.target.files || []))}
      />
    </label>
  );
}

function ImageUploadCard({ label, src, onFiles }) {
  return (
    <div className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4">
      <p className="text-sm font-brand">{label}</p>

      <div className="mt-3 grid aspect-video place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#d8b77e]">
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-contain p-3" />
        ) : (
          <ImagePlus size={34} className="text-[#b98c49]" />
        )}
      </div>

      <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3b2a18] px-4 py-3 text-sm font-brand text-white">
        <UploadCloud size={16} />
        Upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onFiles(Array.from(event.target.files || []))}
        />
      </label>
    </div>
  );
}

function SubmitButton({ saving, label }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#3b2a18] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white transition hover:bg-[#8c672f] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
      {label}
    </button>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8c672f]" />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-11 pr-4 text-sm font-medium text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </div>
  );
}

function ProductCard({ item, onEdit, onDelete }) {
  const thumb = getThumb(item);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] shadow-sm">
      <div className="aspect-square bg-white">
        {thumb ? (
          <img src={thumb} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-[#b98c49]">
            <ImagePlus size={34} />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="line-clamp-2 text-base font-brand">{item.name}</p>
        <p className="mt-1 text-xs font-brand uppercase tracking-[0.08em] text-[#8c672f]">{item.category}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-lg font-brand">{formatMoney(item.price)}</p>
          {Number(item.oldPrice || 0) > Number(item.price || 0) && (
            <p className="text-sm font-medium text-neutral-400 line-through">{formatMoney(item.oldPrice)}</p>
          )}
        </div>

        <CardActions onEdit={onEdit} onDelete={onDelete} />
      </div>
    </article>
  );
}

function GenericCard({ item, resource, onEdit, onDelete }) {
  const thumb = getThumb(item);
  const title = item.name || item.title || item.customerName || "Không tên";

  return (
    <article className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {thumb && (
          <div className="h-24 w-full overflow-hidden rounded-2xl bg-white sm:w-28">
            <img src={thumb} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-lg font-brand">{title}</p>

          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-[#6f5a3e]">
            {getGenericMeta(item, resource)}
          </p>

          <CardActions onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </article>
  );
}

function ReservationCard({ item, onEdit, onDelete, onStatus }) {
  return (
    <article className="rounded-3xl border border-[#d8b77e] bg-[#FFFAFA] p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-brand">{item.customerName}</p>
          <p className="mt-1 text-sm font-medium text-[#6f5a3e]">
            {item.phone} · {item.date} {item.time} · {item.guestCount} khách
          </p>
          {item.note && (
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f5a3e]">{item.note}</p>
          )}
        </div>

        <Badge text={getReservationLabel(item.status)} muted={item.status === "cancelled"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {RESERVATION_STATUS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatus(option.value)}
            className="rounded-xl bg-[#f7efe3] px-3 py-2 text-xs font-brand text-[#8c672f] transition hover:bg-[#FFFAFA]"
          >
            {option.label}
          </button>
        ))}

        <IconButton icon={Edit3} label="Sửa" onClick={onEdit} />
        <IconButton icon={Trash2} label="Xóa" onClick={onDelete} danger />
      </div>
    </article>
  );
}

function ReservationMiniCard({ item }) {
  return (
    <div className="rounded-2xl bg-[#FFFAFA] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-brand">{item.customerName}</p>
          <p className="mt-1 text-sm font-medium text-[#6f5a3e]">
            {item.date} · {item.time} · {item.guestCount} khách
          </p>
        </div>

        <Badge text={getReservationLabel(item.status)} muted={item.status === "cancelled"} />
      </div>
    </div>
  );
}

function CardActions({ onEdit, onDelete }) {
  return (
    <div className="mt-4 flex gap-2">
      <IconButton icon={Edit3} label="Sửa" onClick={onEdit} />
      <IconButton icon={Trash2} label="Xóa" onClick={onDelete} danger />
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-brand transition",
        danger
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-white text-[#b98c49] ring-1 ring-[#d8b77e] hover:bg-[#f7efe3]"
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function Badge({ text, muted = false }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-brand", muted ? "bg-neutral-100 text-neutral-500" : "bg-[#f7efe3] text-[#8c672f]")}>
      {text}
    </span>
  );
}

function getReservationLabel(status) {
  return RESERVATION_STATUS.find((item) => item.value === status)?.label || status || "Không rõ";
}

function getGenericMeta(item, resource) {
  if (resource === "toppings") {
    return `${item.category || "Topping"} · ${formatMoney(item.price)} · ${item.isAvailable === false ? "Tạm hết" : "Còn bán"}`;
  }

  if (resource === "posts") {
    return item.caption || item.instagramUrl || "Bài viết chưa có mô tả.";
  }

  if (resource === "promotions") {
    return [item.subtitle, item.discountText, item.code].filter(Boolean).join(" · ") || "Khuyến mãi";
  }

  return item.description || "Chưa có mô tả.";
}

function EmptyText({ text }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-3xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-8 text-center">
      <div>
        <ImagePlus className="mx-auto text-[#b98c49]" size={38} />
        <p className="mt-3 text-sm font-brand text-[#6f5a3e]">{text}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mt-6 grid min-h-[48vh] place-items-center rounded-[32px] border border-[#d8b77e] bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-[#b98c49]" size={36} />
        <p className="mt-3 text-sm font-brand text-[#6f5a3e]">Đang tải dashboard...</p>
      </div>
    </div>
  );
}

function Alert({ type, message }) {
  const isError = type === "error";

  return (
    <div className={cn("mt-4 rounded-2xl border px-4 py-3 text-sm font-brand", isError ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
      {message}
    </div>
  );
}




