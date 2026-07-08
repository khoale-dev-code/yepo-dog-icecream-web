const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");
let content = fs.readFileSync(filePath, "utf8");

// Thêm useState
if (!content.includes('import { useState } from "react";')) {
  content = content.replace(
    `import { Link } from "react-router-dom";`,
    `import { useState } from "react";
import { Link } from "react-router-dom";`
  );
}

// Thêm icon cần dùng cho form đặt bàn
if (!content.includes("CheckCircle2")) {
  content = content.replace(
    `  Heart,
} from "lucide-react";`,
    `  Heart,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  Phone,
  UserRound,
  Users,
} from "lucide-react";`
  );
}

// Thay section CTA đặt bàn bằng component mới
const startMarker = `      {/* 📞 RESERVATION CTA */}`;
const endMarker = `
    </div>
  );
}

`;

const start = content.indexOf(startMarker);
const end = content.indexOf(endMarker, start);

if (start === -1 || end === -1) {
  throw new Error("Không tìm thấy section Reservation CTA trong HomePage.jsx");
}

const newReservationCall = `      <ReservationSection shop={shop} />
`;

content = content.slice(0, start) + newReservationCall + content.slice(end);

// Thêm component ReservationSection trước sub-components
const subComponentMarker = `// --- SUB-COMPONENTS ---`;

if (!content.includes("function ReservationSection")) {
  const reservationComponent = `
function getTodayValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function ReservationSection({ shop }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    guestCount: "2",
    reservationDate: getTodayValue(),
    reservationTime: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const quickTimes = ["09:00", "10:30", "14:00", "16:30", "19:00"];

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  }

  function normalizePhone(value) {
    return String(value || "").replace(/\\s+/g, "").trim();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const customerName = form.customerName.trim();
    const phone = normalizePhone(form.phone);
    const guestCount = Number(form.guestCount || 1);
    const reservationDate = form.reservationDate;
    const reservationTime = form.reservationTime;
    const note = form.note.trim();

    if (!customerName) {
      setMessage({ type: "error", text: "Vui lòng nhập họ tên để YEPO xác nhận lịch." });
      return;
    }

    if (!phone || phone.length < 8) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại hợp lệ." });
      return;
    }

    if (!Number.isFinite(guestCount) || guestCount < 1) {
      setMessage({ type: "error", text: "Số khách phải lớn hơn 0." });
      return;
    }

    if (!reservationDate || !reservationTime) {
      setMessage({ type: "error", text: "Vui lòng chọn đầy đủ ngày và giờ ghé quán." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          customerName,
          name: customerName,
          phone,
          guestCount,
          guests: guestCount,
          partySize: guestCount,
          reservationDate,
          date: reservationDate,
          reservationTime,
          time: reservationTime,
          note,
          source: "home-page",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || result.error || "Không thể gửi yêu cầu đặt bàn.");
      }

      setMessage({
        type: "success",
        text: "YEPO đã nhận yêu cầu đặt bàn. Tụi mình sẽ liên hệ lại để xác nhận lịch nha.",
      });

      setForm({
        customerName: "",
        phone: "",
        guestCount: "2",
        reservationDate: getTodayValue(),
        reservationTime: "",
        note: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Không thể gửi yêu cầu đặt bàn. Bạn thử lại giúp YEPO nhé.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-4 sm:mx-8 lg:mx-12">
      <section
        id="reservation"
        className="relative overflow-hidden rounded-[2.5rem] bg-[#2C1E16] p-4 shadow-xl sm:p-6 lg:p-8"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-white sm:p-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#D8CCC0]">
                <CalendarDays size={15} />
                Reservation
              </span>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Đặt bàn trước để YEPO chuẩn bị chỗ thật thoải mái.
              </h2>

              <p className="mt-5 text-base font-light leading-relaxed text-[#C9BEB6]">
                Form này là yêu cầu đặt bàn, chưa phải xác nhận tự động. YEPO sẽ gọi hoặc nhắn lại để xác nhận giờ trống, khu vực ngồi và lưu ý khi chơi cùng các bé cún.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              <ReservationNote
                icon={Clock3}
                title="Nên đặt trước"
                text="Đặc biệt vào cuối tuần hoặc khung giờ chiều tối."
              />
              <ReservationNote
                icon={PawPrint}
                title="Không gian pet-friendly"
                text="Tụi mình sẽ sắp xếp khu vực phù hợp nếu bạn muốn gặp các bé cún."
              />
              <ReservationNote
                icon={Phone}
                title="Cần gấp?"
                text={shop?.phone ? \`Gọi nhanh: \${shop.phone}\` : "Hotline sẽ được cập nhật trong phần quản trị."}
              />
            </div>

            {shop?.phone && (
              <a
                href={\`tel:\${shop.phone}\`}
                className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#2C1E16] transition hover:bg-[#F4EFEA]"
              >
                <Phone size={16} />
                Gọi đặt bàn nhanh
              </a>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] bg-[#FCF9F4] p-5 shadow-[0_20px_50px_rgb(0,0,0,0.16)] sm:p-6 lg:p-8"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#A48671]">
                  Request a table
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[#2C1E16]">
                  Gửi yêu cầu đặt bàn
                </h3>
              </div>

              <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#6B5A4E] sm:block">
                YEPO sẽ xác nhận lại
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ReservationField label="Họ tên" icon={UserRound}>
                <input
                  value={form.customerName}
                  onChange={(event) => update("customerName", event.target.value)}
                  placeholder="Tên của bạn"
                  className="reservation-input"
                />
              </ReservationField>

              <ReservationField label="Số điện thoại" icon={Phone}>
                <input
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  inputMode="tel"
                  placeholder="090..."
                  className="reservation-input"
                />
              </ReservationField>

              <ReservationField label="Số khách" icon={Users}>
                <select
                  value={form.guestCount}
                  onChange={(event) => update("guestCount", event.target.value)}
                  className="reservation-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                    <option key={count} value={count}>
                      {count} khách
                    </option>
                  ))}
                  <option value="9">9+ khách</option>
                </select>
              </ReservationField>

              <ReservationField label="Ngày ghé" icon={CalendarDays}>
                <input
                  type="date"
                  min={getTodayValue()}
                  value={form.reservationDate}
                  onChange={(event) => update("reservationDate", event.target.value)}
                  className="reservation-input"
                />
              </ReservationField>
            </div>

            <div className="mt-4">
              <ReservationField label="Giờ dự kiến" icon={Clock3}>
                <input
                  type="time"
                  value={form.reservationTime}
                  onChange={(event) => update("reservationTime", event.target.value)}
                  className="reservation-input"
                />
              </ReservationField>

              <div className="mt-3 flex flex-wrap gap-2">
                {quickTimes.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => update("reservationTime", time)}
                    className={[
                      "rounded-full border px-4 py-2 text-xs font-semibold transition",
                      form.reservationTime === time
                        ? "border-[#2C1E16] bg-[#2C1E16] text-white"
                        : "border-[#EAE2D8] bg-white text-[#6B5A4E] hover:border-[#CDBEAE]",
                    ].join(" ")}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <ReservationField label="Ghi chú thêm" icon={MessageSquare}>
                <textarea
                  value={form.note}
                  onChange={(event) => update("note", event.target.value)}
                  rows={4}
                  placeholder="Ví dụ: muốn ngồi gần khu vực cún, đi cùng trẻ nhỏ, cần bàn yên tĩnh..."
                  className="reservation-input min-h-[112px] resize-none py-3 leading-6"
                />
              </ReservationField>
            </div>

            {message.text && (
              <div
                className={[
                  "mt-5 rounded-2xl px-4 py-3 text-sm font-medium leading-6",
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600",
                ].join(" ")}
              >
                <div className="flex items-start gap-2">
                  {message.type === "success" && <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#2C1E16] px-8 text-sm font-semibold text-white transition hover:bg-[#4A3B32] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CalendarDays size={18} />}
                {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt bàn"}
              </button>

              <Link
                to="/menu"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#EAE2D8] bg-white px-8 text-sm font-semibold text-[#2C1E16] transition hover:bg-[#F9F6F0]"
              >
                Xem menu trước
                <ArrowRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-xs leading-6 text-[#8D7B6D]">
              Khi gửi form, bạn đồng ý để YEPO liên hệ lại qua số điện thoại đã cung cấp nhằm xác nhận lịch đặt bàn.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}

function ReservationField({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2C1E16]">
        <Icon size={15} className="text-[#8D7B6D]" />
        {label}
      </span>
      {children}
    </label>
  );
}

function ReservationNote({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-[#D8CCC0]">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#AFA39B]">{text}</p>
      </div>
    </div>
  );
}

${subComponentMarker}`;

  content = content.replace(subComponentMarker, reservationComponent);
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Updated HomePage reservation section.");
