const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

const file = walk("src").find((target) => {
  const code = fs.readFileSync(target, "utf8");
  return code.includes("function ReservationSection") && code.includes("Thông tin đặt bàn");
});

if (!file) {
  throw new Error("Không tìm thấy file HomePage có ReservationSection");
}

let code = fs.readFileSync(file, "utf8");

const newReservationSection = String.raw`function ReservationSection({ shop, scrollY }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const [sectionRef, sectionVisible] = useReveal(0.05);

  const quickTimes = ["09:00", "10:30", "14:00", "16:30", "19:00"];

  const inputClass =
    "block h-[58px] w-full min-w-0 max-w-full rounded-[22px] border-2 border-[#EAE2D8] bg-white px-4 text-base font-semibold leading-none text-[#2D2D2D] shadow-sm outline-none transition-all placeholder:text-[#B8B0A8] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10 sm:h-14 sm:px-5 sm:text-[15px]";

  useEffect(() => {
    function openFromHash() {
      if (window.location.hash === "#reservation") {
        setIsFormOpen(true);
      }
    }

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

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
    return String(value || "").replace(/\s+/g, "").trim();
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
      setMessage({
        type: "error",
        text: "Vui lòng nhập họ tên để YEPO xác nhận lịch.",
      });
      return;
    }

    if (!phone || phone.length < 8) {
      setMessage({
        type: "error",
        text: "Vui lòng nhập số điện thoại hợp lệ.",
      });
      return;
    }

    if (!Number.isFinite(guestCount) || guestCount < 1) {
      setMessage({
        type: "error",
        text: "Số khách phải lớn hơn 0.",
      });
      return;
    }

    if (!reservationDate || !reservationTime) {
      setMessage({
        type: "error",
        text: "Vui lòng chọn đầy đủ ngày và giờ ghé quán.",
      });
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
        throw new Error(
          result.message || result.error || "Không thể gửi yêu cầu đặt bàn."
        );
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
        text:
          error.message ||
          "Không thể gửi yêu cầu đặt bàn. Bạn thử lại giúp YEPO nhé.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-3 sm:mx-8 lg:mx-12">
      <section
        id="reservation"
        ref={sectionRef}
        className={[
          "relative overflow-hidden rounded-[2rem] border border-[#b98c49]/20 bg-white px-3 py-5 shadow-[0_8px_40px_rgba(185,140,73,0.08)] transition-all duration-700 ease-out sm:rounded-[2.5rem] sm:p-7 lg:p-8 motion-reduce:transition-none",
          sectionVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
        ].join(" ")}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f6d77d]/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#b98c49]/10 blur-3xl" />
        <FloatingPaws scrollY={scrollY} speed={0.04} className="opacity-30" />

        <div className="relative z-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/20 bg-[#FFFAFA] px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                <CalendarDays size={15} />
                Reservation
              </span>

              <h2 className="mt-5 max-w-3xl font-['Quicksand'] text-2xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
                Đặt bàn trước để YEPO chuẩn bị chỗ thật thoải mái.
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[#666666] sm:text-base">
                Gửi yêu cầu đặt bàn nhanh. YEPO sẽ liên hệ lại để xác nhận giờ trống, khu vực ngồi và lưu ý khi chơi cùng các bé cún.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={() => setIsFormOpen((current) => !current)}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[#b98c49] px-7 text-sm font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition-all hover:bg-[#a1783a]"
              >
                <CalendarDays size={18} />
                {isFormOpen ? "Thu gọn form" : "Đặt bàn"}
              </button>

              {shop?.phone && (
                <a
                  href={"tel:" + shop.phone}
                  className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-[#b98c49]/20 bg-white px-7 text-sm font-['Quicksand'] font-bold text-[#b98c49] shadow-sm transition hover:bg-[#FFFAFA]"
                >
                  <Phone size={17} />
                  Gọi nhanh
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <ReservationNote
              icon={Clock3}
              title="Nên đặt trước"
              text="Phù hợp cuối tuần hoặc khung giờ chiều tối."
            />
            <ReservationNote
              icon={PawPrint}
              title="Pet-friendly"
              text="Có thể sắp xếp khu vực gần các bé cún."
            />
            <ReservationNote
              icon={Phone}
              title="Xác nhận lại"
              text={
                shop?.phone
                  ? "Hotline: " + shop.phone
                  : "YEPO sẽ gọi hoặc nhắn lại."
              }
            />
          </div>

          {isFormOpen && (
            <form
              data-reservation-form="true"
              onSubmit={handleSubmit}
              className="mx-auto mt-7 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-[#b98c49]/10 bg-[#FFFAFA] p-4 shadow-inner sm:p-7"
            >
              <div className="mb-6">
                <p className="text-[12px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                  Request a table
                </p>
                <h3 className="mt-2 text-[28px] font-['Quicksand'] font-bold leading-tight text-[#2D2D2D] sm:text-3xl">
                  Thông tin đặt bàn
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#756144]">
                  Điền thông tin bên dưới, YEPO sẽ liên hệ lại để xác nhận lịch.
                </p>
              </div>

              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <ReservationField label="Họ tên" icon={UserRound}>
                  <input
                    value={form.customerName}
                    onChange={(event) => update("customerName", event.target.value)}
                    placeholder="Tên của bạn"
                    autoComplete="name"
                    className={inputClass}
                  />
                </ReservationField>

                <ReservationField label="Số điện thoại" icon={Phone}>
                  <input
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="090..."
                    className={inputClass}
                  />
                </ReservationField>

                <ReservationField label="Số khách" icon={Users}>
                  <select
                    value={form.guestCount}
                    onChange={(event) => update("guestCount", event.target.value)}
                    className={inputClass + " appearance-none"}
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
                    className={inputClass + " appearance-none"}
                    style={{ minWidth: 0 }}
                  />
                </ReservationField>

                <ReservationField label="Giờ dự kiến" icon={Clock3}>
                  <input
                    type="time"
                    value={form.reservationTime}
                    onChange={(event) => update("reservationTime", event.target.value)}
                    className={inputClass + " appearance-none"}
                    style={{ minWidth: 0 }}
                  />
                </ReservationField>

                <div className="min-w-0 sm:self-end">
                  <p className="mb-3 text-[13px] font-bold text-[#8c672f]">
                    Chọn nhanh giờ ghé
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {quickTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => update("reservationTime", time)}
                        className={[
                          "h-11 rounded-2xl border-2 text-sm font-['Fredoka'] font-semibold transition-all duration-200 active:scale-[0.98]",
                          form.reservationTime === time
                            ? "border-[#b98c49] bg-[#b98c49] text-white shadow-md shadow-[#b98c49]/30"
                            : "border-[#EAE2D8] bg-white text-[#666666] hover:border-[#b98c49] hover:text-[#b98c49]",
                        ].join(" ")}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 min-w-0">
                <ReservationField label="Ghi chú thêm" icon={MessageSquare}>
                  <textarea
                    value={form.note}
                    onChange={(event) => update("note", event.target.value)}
                    rows={3}
                    placeholder="Ví dụ: muốn ngồi gần khu vực cún, đi cùng trẻ nhỏ, cần bàn yên tĩnh..."
                    className="block min-h-[118px] w-full min-w-0 max-w-full resize-none rounded-[22px] border-2 border-[#EAE2D8] bg-white p-4 text-base font-medium leading-7 text-[#2D2D2D] shadow-sm outline-none transition-all placeholder:text-[#B8B0A8] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>
              </div>

              {message.text && (
                <div
                  className={[
                    "mt-5 rounded-[22px] px-4 py-4 text-[15px] font-semibold leading-relaxed",
                    message.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-600",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    {message.type === "success" && (
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    )}
                    <span>{message.text}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-[66px] w-full items-center justify-center gap-2 rounded-[24px] bg-[#b98c49] px-6 text-[17px] font-['Quicksand'] font-black text-white shadow-[0_14px_30px_rgba(185,140,73,.28)] transition-all hover:bg-[#a1783a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:px-9"
                >
                  {submitting ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <CalendarDays size={22} />
                  )}
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt bàn"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-[58px] items-center justify-center rounded-[22px] border border-[#b98c49]/20 bg-white px-8 text-base font-['Quicksand'] font-bold text-[#b98c49] transition hover:bg-[#FFFAFA] sm:h-16"
                >
                  Thu gọn
                </button>
              </div>

              <p className="mt-4 text-center text-[12px] leading-relaxed text-[#999999] sm:text-left">
                Khi gửi form, bạn đồng ý để YEPO liên hệ lại qua số điện thoại đã cung cấp nhằm xác nhận lịch đặt bàn.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}`;

const newReservationField = String.raw`function ReservationField({ label, icon: Icon, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2.5 flex items-center gap-2 text-[16px] font-['Quicksand'] font-bold text-[#2D2D2D]">
        <Icon size={18} className="shrink-0 text-[#b98c49]" />
        <span className="min-w-0">{label}</span>
      </span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}`;

const sectionRegex =
  /function ReservationSection\(\{ shop, scrollY \}\) \{[\s\S]*?\n\}\n\nfunction ReservationField/;

if (!sectionRegex.test(code)) {
  throw new Error("Không replace được ReservationSection");
}

code = code.replace(sectionRegex, newReservationSection + "\n\nfunction ReservationField");

const fieldRegex =
  /function ReservationField\(\{ label, icon: Icon, children \}\) \{[\s\S]*?\n\}\n\nfunction ReservationNote/;

if (!fieldRegex.test(code)) {
  throw new Error("Không replace được ReservationField");
}

code = code.replace(fieldRegex, newReservationField + "\n\nfunction ReservationNote");

fs.writeFileSync(file, code);
console.log("✅ Fixed reservation mobile form:", file);
