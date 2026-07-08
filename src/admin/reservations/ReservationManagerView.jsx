import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  guests: "2",
  note: "",
  status: "pending",
};

const STATUS_OPTIONS = [
  {
    value: "pending",
    label: "Chờ xác nhận",
    badgeClass: "bg-[#f6d77d]/45 text-[#8c672f]",
  },
  {
    value: "confirmed",
    label: "Đã xác nhận",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  {
    value: "completed",
    label: "Hoàn tất",
    badgeClass: "bg-blue-50 text-blue-700",
  },
  {
    value: "cancelled",
    label: "Đã hủy",
    badgeClass: "bg-red-50 text-red-600",
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getId(item) {
  return item?._id || item?.id || "";
}

function getStatusMeta(status = "pending") {
  return STATUS_OPTIONS.find((item) => item.value === status) || STATUS_OPTIONS[0];
}

function getCustomerName(item) {
  return item?.name || item?.customerName || item?.fullName || "Khách hàng";
}

function getPhone(item) {
  return item?.phone || item?.phoneNumber || "";
}

function getEmail(item) {
  return item?.email || "";
}

function getReservationDate(item) {
  return item?.date || item?.reservationDate || item?.bookingDate || "";
}

function getReservationTime(item) {
  return item?.time || item?.reservationTime || item?.bookingTime || "";
}

function getGuests(item) {
  return Number(item?.guests || item?.partySize || item?.people || item?.numberOfGuests || 1);
}

function getNote(item) {
  return item?.note || item?.message || item?.specialRequest || "";
}

function getStatus(item) {
  return item?.status || "pending";
}

function toDateInput(value) {
  if (!value) return "";

  try {
    if (String(value).length >= 10) return String(value).slice(0, 10);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) return "Chưa chọn ngày";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isUpcoming(value) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date >= today;
}

function getReservationDateTime(item) {
  const date = getReservationDate(item);
  const time = getReservationTime(item);

  const raw = `${date || "9999-12-31"}T${time || "23:59"}`;
  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? new Date("9999-12-31").getTime() : parsed.getTime();
}

function sortReservations(items = []) {
  const rank = {
    pending: 0,
    confirmed: 1,
    completed: 2,
    cancelled: 3,
  };

  return [...items].sort((a, b) => {
    const statusA = rank[getStatus(a)] ?? 9;
    const statusB = rank[getStatus(b)] ?? 9;

    if (statusA !== statusB) return statusA - statusB;

    const dateA = getReservationDateTime(a);
    const dateB = getReservationDateTime(b);

    if (dateA !== dateB) return dateA - dateB;

    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

function mapToForm(item) {
  return {
    name: getCustomerName(item),
    phone: getPhone(item),
    email: getEmail(item),
    date: toDateInput(getReservationDate(item)),
    time: getReservationTime(item),
    guests: String(getGuests(item)),
    note: getNote(item),
    status: getStatus(item),
  };
}

function buildPayload(form) {
  const guests = Number(form.guests || 1);

  return {
    name: String(form.name || "").trim(),
    customerName: String(form.name || "").trim(),
    fullName: String(form.name || "").trim(),

    phone: String(form.phone || "").trim(),
    phoneNumber: String(form.phone || "").trim(),

    email: String(form.email || "").trim(),

    date: form.date || "",
    reservationDate: form.date || "",
    bookingDate: form.date || "",

    time: form.time || "",
    reservationTime: form.time || "",
    bookingTime: form.time || "",

    guests,
    partySize: guests,
    people: guests,
    numberOfGuests: guests,

    note: String(form.note || "").trim(),
    message: String(form.note || "").trim(),
    specialRequest: String(form.note || "").trim(),

    status: form.status || "pending",
    source: "admin",
  };
}

async function readApiError(response, fallbackMessage) {
  const error = await response.json().catch(() => ({}));
  return error.message || fallbackMessage;
}

async function requestReservations() {
  if (api.reservations?.list) {
    const result = await api.reservations.list();
    return Array.isArray(result) ? result : result.reservations || result.data || [];
  }

  const response = await fetch("/api/reservations", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tải được danh sách đặt bàn."));
  }

  return response.json();
}

async function createReservation(payload) {
  if (api.reservations?.create) return api.reservations.create(payload);

  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tạo được đặt bàn."));
  }

  return response.json();
}

async function updateReservation(id, payload) {
  if (api.reservations?.update) return api.reservations.update(id, payload);

  const response = await fetch(`/api/reservations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không cập nhật được đặt bàn."));
  }

  return response.json();
}

async function deleteReservation(id) {
  if (api.reservations?.remove) return api.reservations.remove(id);
  if (api.reservations?.delete) return api.reservations.delete(id);

  const response = await fetch(`/api/reservations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không xóa được đặt bàn."));
  }

  return response.json();
}

export function ReservationManagerView() {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const sortedReservations = useMemo(
    () => sortReservations(reservations),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return sortedReservations.filter((item) => {
      const date = getReservationDate(item);
      const text = [
        getCustomerName(item),
        getPhone(item),
        getEmail(item),
        getNote(item),
        date,
        getReservationTime(item),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchQuery = !keyword || text.includes(keyword);

      const itemStatus = getStatus(item);
      const matchStatus = statusFilter === "all" || itemStatus === statusFilter;

      const matchDate =
        dateFilter === "all" ||
        (dateFilter === "today" && isToday(date)) ||
        (dateFilter === "upcoming" && isUpcoming(date)) ||
        (dateFilter === "past" && date && !isUpcoming(date));

      return matchQuery && matchStatus && matchDate;
    });
  }, [sortedReservations, query, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      pending: reservations.filter((item) => getStatus(item) === "pending").length,
      confirmed: reservations.filter((item) => getStatus(item) === "confirmed").length,
      today: reservations.filter((item) => isToday(getReservationDate(item))).length,
    };
  }, [reservations]);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations({ silent = false } = {}) {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const data = await requestReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không tải được danh sách đặt bàn.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(EMPTY_FORM);
  }

  function openCreateForm() {
    resetForm();
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(item) {
    setEditingId(getId(item));
    setForm(mapToForm(item));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.time) {
      alert("Vui lòng nhập tên, số điện thoại, ngày và giờ đặt bàn.");
      return;
    }

    try {
      setSaving(true);
      setNotice({ type: "", text: "" });

      const payload = buildPayload(form);

      if (editingId) {
        await updateReservation(editingId, payload);
        setNotice({ type: "success", text: "Đã cập nhật đặt bàn." });
      } else {
        await createReservation(payload);
        setNotice({ type: "success", text: "Đã tạo đặt bàn thủ công." });
      }

      resetForm();
      setFormOpen(false);
      await loadReservations({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không lưu được đặt bàn.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(item, nextStatus) {
    try {
      const payload = buildPayload({
        ...mapToForm(item),
        status: nextStatus,
      });

      await updateReservation(getId(item), payload);
      await loadReservations({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không cập nhật được trạng thái.",
      });
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Bạn có chắc muốn xóa đặt bàn của "${getCustomerName(item)}" không?`)) {
      return;
    }

    try {
      await deleteReservation(getId(item));
      setNotice({ type: "success", text: "Đã xóa đặt bàn." });

      if (editingId === getId(item)) {
        resetForm();
        setFormOpen(false);
      }

      await loadReservations({ silent: true });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không xóa được đặt bàn.",
      });
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-[#d8b77e] bg-white px-5 py-4 text-sm font-bold text-[#8c672f]">
          <Loader2 size={20} className="animate-spin" />
          Đang tải đặt bàn...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <section className="overflow-hidden rounded-[34px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-5 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
              <CalendarDays size={15} />
              Đặt bàn
            </p>

            <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
              Quản lý đặt bàn
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756144]">
              Theo dõi yêu cầu đặt bàn từ khách, xác nhận lịch hẹn và tạo đặt bàn thủ công khi khách gọi điện hoặc nhắn tin trực tiếp.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReservations({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white transition hover:bg-[#8c672f] disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </section>

      {notice.text && (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-bold",
            notice.type === "error"
              ? "border-red-100 bg-red-50 text-red-600"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          )}
        >
          {notice.text}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-4">
        <MiniStat label="Tổng đặt bàn" value={stats.total} />
        <MiniStat label="Chờ xác nhận" value={stats.pending} />
        <MiniStat label="Đã xác nhận" value={stats.confirmed} />
        <MiniStat label="Hôm nay" value={stats.today} />
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
        <button
          type="button"
          onClick={() => setFormOpen((value) => !value)}
          className="group flex w-full items-center justify-between gap-4 bg-gradient-to-br from-white to-[#FFFAFA] p-5 text-left transition hover:from-[#FFFAFA] hover:to-[#f6d77d]/20"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white shadow-sm">
              <Plus size={24} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                {editingId ? "Đang chỉnh sửa đặt bàn" : "Tạo đặt bàn thủ công"}
              </p>

              <h2 className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
                {editingId ? "Cập nhật lịch đặt bàn" : "Thêm lịch đặt bàn"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#756144]">
                {formOpen
                  ? "Điền thông tin khách, ngày giờ, số người và trạng thái xử lý."
                  : "Bấm để mở form. Đóng lại giúp trang gọn hơn khi chỉ cần xử lý danh sách."}
              </p>
            </div>
          </div>

          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105">
            {formOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </span>
        </button>

        {formOpen && (
          <form onSubmit={handleSubmit} className="border-t border-[#d8b77e]/60">
            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <Field
                icon={UserRound}
                label="Tên khách"
                value={form.name}
                required
                placeholder="Ví dụ: Minh Anh"
                onChange={(value) => updateForm("name", value)}
              />

              <Field
                icon={Phone}
                label="Số điện thoại"
                value={form.phone}
                required
                placeholder="090..."
                onChange={(value) => updateForm("phone", value)}
              />

              <Field
                icon={Mail}
                label="Email"
                value={form.email}
                type="email"
                placeholder="email@example.com"
                onChange={(value) => updateForm("email", value)}
              />

              <Field
                icon={Users}
                label="Số khách"
                value={form.guests}
                inputMode="numeric"
                placeholder="2"
                onChange={(value) =>
                  updateForm("guests", value.replace(/[^\d]/g, ""))
                }
              />

              <Field
                icon={CalendarDays}
                label="Ngày đặt bàn"
                value={form.date}
                required
                type="date"
                onChange={(value) => updateForm("date", value)}
              />

              <Field
                icon={Clock}
                label="Giờ đặt bàn"
                value={form.time}
                required
                type="time"
                onChange={(value) => updateForm("time", value)}
              />

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                  Trạng thái
                </span>

                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-bold text-[#3b2a18] outline-none transition focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-2 flex items-center gap-2 text-sm font-brand text-[#3b2a18]">
                  <MessageSquare size={16} className="text-[#b98c49]" />
                  Ghi chú
                </span>

                <textarea
                  value={form.note}
                  rows={4}
                  placeholder="Ghi chú yêu cầu của khách..."
                  onChange={(event) => updateForm("note", event.target.value)}
                  className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 py-3 text-sm leading-7 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-[#d8b77e]/60 bg-white p-5 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#FFFAFA] px-5 text-sm font-bold text-[#756144] ring-1 ring-[#d8b77e]"
                >
                  <X size={17} />
                  Hủy chỉnh sửa
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white transition hover:bg-[#8c672f] disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editingId ? "Lưu thay đổi" : "Tạo đặt bàn"}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-[28px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
              Danh sách
            </p>

            <h2 className="mt-1 text-2xl font-black text-[#3b2a18]">
              Lịch đặt bàn
            </h2>

            <p className="mt-1 text-xs text-[#756144]">
              Xem đầy đủ thông tin khách và cập nhật trạng thái xử lý ngay tại đây.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f6d77d]/45 px-4 text-sm font-bold text-[#8c672f]"
          >
            <Plus size={16} />
            Tạo đặt bàn
          </button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px]">
          <label className="relative block">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b98c49]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, số điện thoại, email, ghi chú..."
              className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] pl-11 pr-4 text-sm outline-none focus:border-[#b98c49]"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-12 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-bold text-[#3b2a18] outline-none focus:border-[#b98c49]"
          >
            <option value="all">Tất cả trạng thái</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="h-12 rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm font-bold text-[#3b2a18] outline-none focus:border-[#b98c49]"
          >
            <option value="all">Tất cả ngày</option>
            <option value="today">Hôm nay</option>
            <option value="upcoming">Sắp tới</option>
            <option value="past">Đã qua</option>
          </select>
        </div>

        <div className="mt-5 space-y-3">
          {filteredReservations.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-8 text-center">
              <CalendarDays size={38} className="mx-auto text-[#b98c49]" />
              <p className="mt-3 font-bold text-[#3b2a18]">
                Chưa có đặt bàn phù hợp.
              </p>
            </div>
          ) : (
            filteredReservations.map((item) => (
              <ReservationRow
                key={getId(item)}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
                onStatusChange={(nextStatus) => handleStatusChange(item, nextStatus)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[#d8b77e]/80 bg-white p-4 shadow-[0_12px_32px_rgba(87,61,28,.05)]">
      <p className="text-xs font-brand uppercase tracking-[0.12em] text-[#b98c49]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-[#3b2a18]">{value}</p>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  required,
  placeholder,
  inputMode,
  type = "text",
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-brand text-[#3b2a18]">
        {Icon && <Icon size={16} className="text-[#b98c49]" />}
        {label} {required && <span className="text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value ?? ""}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-[#FFFAFA] px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
      />
    </label>
  );
}

function ReservationRow({ item, onEdit, onDelete, onStatusChange }) {
  const status = getStatus(item);
  const meta = getStatusMeta(status);
  const name = getCustomerName(item);
  const phone = getPhone(item);
  const email = getEmail(item);
  const date = getReservationDate(item);
  const time = getReservationTime(item);
  const guests = getGuests(item);
  const note = getNote(item);

  return (
    <article className="rounded-[24px] border border-[#d8b77e] bg-[#FFFAFA] p-4 transition hover:bg-white hover:shadow-[0_14px_34px_rgba(87,61,28,.08)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-[#3b2a18]">
              {name}
            </h3>

            <span className={cn("rounded-full px-3 py-1 text-xs font-black", meta.badgeClass)}>
              {meta.label}
            </span>

            {isToday(date) && (
              <span className="rounded-full bg-[#f6d77d]/45 px-3 py-1 text-xs font-black text-[#8c672f]">
                Hôm nay
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-2 text-sm text-[#756144] sm:grid-cols-2 lg:grid-cols-4">
            <InfoLine icon={Phone}>{phone || "Chưa có SĐT"}</InfoLine>
            <InfoLine icon={Users}>{guests} khách</InfoLine>
            <InfoLine icon={CalendarDays}>{formatDate(date)}</InfoLine>
            <InfoLine icon={Clock}>{time || "Chưa chọn giờ"}</InfoLine>
          </div>

          {email && (
            <div className="mt-2">
              <InfoLine icon={Mail}>{email}</InfoLine>
            </div>
          )}

          {note && (
            <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-[#756144] ring-1 ring-[#d8b77e]/70">
              <span className="font-bold text-[#3b2a18]">Ghi chú: </span>
              {note}
            </div>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[390px]">
          <ActionButton
            disabled={status === "confirmed"}
            onClick={() => onStatusChange("confirmed")}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            Xác nhận
          </ActionButton>

          <ActionButton
            disabled={status === "completed"}
            onClick={() => onStatusChange("completed")}
            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            Hoàn tất
          </ActionButton>

          <ActionButton
            disabled={status === "cancelled"}
            onClick={() => onStatusChange("cancelled")}
            className="bg-red-50 text-red-600 hover:bg-red-100"
          >
            Hủy lịch
          </ActionButton>

          <ActionButton
            onClick={onEdit}
            className="bg-white text-[#8c672f] ring-1 ring-[#d8b77e] hover:bg-[#f6d77d]/25"
          >
            <Edit3 size={15} />
            Sửa
          </ActionButton>

          <ActionButton
            onClick={onDelete}
            className="bg-red-50 text-red-600 hover:bg-red-100 sm:col-span-2"
          >
            <Trash2 size={15} />
            Xóa đặt bàn
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

function InfoLine({ icon: Icon, children }) {
  return (
    <p className="flex min-w-0 items-center gap-2">
      <Icon size={15} className="shrink-0 text-[#b98c49]" />
      <span className="truncate">{children}</span>
    </p>
  );
}

function ActionButton({ children, onClick, disabled, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      {children}
    </button>
  );
}

export default ReservationManagerView;
