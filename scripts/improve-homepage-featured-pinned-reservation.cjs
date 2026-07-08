const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/pages/public/HomePage.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/pages/public/HomePage.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf("function " + functionName);
  if (start === -1) {
    throw new Error("Không tìm thấy function " + functionName);
  }

  const braceStart = source.indexOf("{", start);
  if (braceStart === -1) {
    throw new Error("Không tìm thấy dấu { của function " + functionName);
  }

  let depth = 0;

  for (let i = braceStart; i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}") depth -= 1;

    if (depth === 0) {
      return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }

  throw new Error("Không tìm thấy điểm kết thúc function " + functionName);
}

/* 1) Signature Menu: chỉ lấy món nổi bật */
content = content.replace(
  /const products = getList\(store, "products"\)[\s\S]*?\.slice\(0, 4\);/,
  `const products = getList(store, "products")
    .filter((item) => item.isAvailable !== false && item.isFeatured === true)
    .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
    .slice(0, 4);`
);

/* 2) Góc chuyện trò: chỉ lấy bài ghim, tối đa 2 bài */
content = content.replace(
  /const posts = getList\(store, "posts"\)[\s\S]*?\.slice\(0, 2\);/,
  `const posts = getList(store, "posts")
    .filter(
      (item) =>
        item.isActive !== false &&
        item.isPublished !== false &&
        item.isPinned === true
    )
    .sort((a, b) => {
      const orderA = Number(a.sortOrder || a.order || 999);
      const orderB = Number(b.sortOrder || b.order || 999);

      if (orderA !== orderB) return orderA - orderB;

      return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
    })
    .slice(0, 2);`
);

/* 3) ReservationSection: thu gọn, chỉ xổ form khi bấm Đặt bàn */
const newReservationSection = `function ReservationSection({ shop, scrollY }) {
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
        ref={sectionRef}
        className={\`relative overflow-hidden rounded-[2.5rem] border border-[#b98c49]/20 bg-white p-5 shadow-[0_8px_40px_rgba(185,140,73,0.08)] transition-all duration-700 ease-out sm:p-7 lg:p-8 motion-reduce:transition-none \${
          sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }\`}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f6d77d]/25 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#b98c49]/10 blur-3xl" />
        <FloatingPaws scrollY={scrollY} speed={0.04} className="opacity-40" />

        <div className="relative z-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#b98c49]/20 bg-[#FFFAFA] px-4 py-2 text-xs font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                <CalendarDays size={15} />
                Reservation
              </span>

              <h2 className="mt-5 max-w-3xl font-['Quicksand'] text-3xl font-bold tracking-tight text-[#2D2D2D] sm:text-4xl">
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
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-7 text-sm font-['Quicksand'] font-bold text-white shadow-lg shadow-[#b98c49]/20 transition-all hover:bg-[#a1783a]"
              >
                <CalendarDays size={18} />
                {isFormOpen ? "Thu gọn form" : "Đặt bàn"}
              </button>

              {shop?.phone && (
                <a
                  href={\`tel:\${shop.phone}\`}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[#b98c49]/20 bg-white px-7 text-sm font-['Quicksand'] font-bold text-[#b98c49] shadow-sm transition hover:bg-[#FFFAFA]"
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
              text={shop?.phone ? \`Hotline: \${shop.phone}\` : "YEPO sẽ gọi hoặc nhắn lại."}
            />
          </div>

          {isFormOpen && (
            <form
              onSubmit={handleSubmit}
              className="mt-7 rounded-[2rem] border border-[#b98c49]/10 bg-[#FFFAFA] p-5 shadow-inner sm:p-7"
            >
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[12px] font-['Fredoka'] font-semibold uppercase tracking-widest text-[#b98c49]">
                    Request a table
                  </p>
                  <h3 className="mt-2 text-2xl font-['Quicksand'] font-bold text-[#2D2D2D]">
                    Thông tin đặt bàn
                  </h3>
                </div>

                <div className="hidden rounded-full bg-white px-5 py-2.5 text-xs font-['Quicksand'] font-bold text-[#b98c49] shadow-sm ring-1 ring-[#b98c49]/20 sm:block">
                  YEPO sẽ xác nhận lại
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ReservationField label="Họ tên" icon={UserRound}>
                  <input
                    value={form.customerName}
                    onChange={(event) => update("customerName", event.target.value)}
                    placeholder="Tên của bạn"
                    className="w-full h-13 rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 py-4 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <ReservationField label="Số điện thoại" icon={Phone}>
                  <input
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    inputMode="tel"
                    placeholder="090..."
                    className="w-full h-13 rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 py-4 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <ReservationField label="Số khách" icon={Users}>
                  <select
                    value={form.guestCount}
                    onChange={(event) => update("guestCount", event.target.value)}
                    className="w-full h-13 rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 py-4 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
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
                    className="w-full h-13 rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 py-4 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>
              </div>

              <div className="mt-5">
                <ReservationField label="Giờ dự kiến" icon={Clock3}>
                  <input
                    type="time"
                    value={form.reservationTime}
                    onChange={(event) => update("reservationTime", event.target.value)}
                    className="w-full h-13 rounded-2xl border-2 border-[#EAE2D8] bg-white px-5 py-4 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {quickTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => update("reservationTime", time)}
                      className={[
                        "rounded-full border-2 px-4 py-2 text-[13px] font-['Fredoka'] font-semibold transition-all duration-200",
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

              <div className="mt-5">
                <ReservationField label="Ghi chú thêm" icon={MessageSquare}>
                  <textarea
                    value={form.note}
                    onChange={(event) => update("note", event.target.value)}
                    rows={3}
                    placeholder="Ví dụ: muốn ngồi gần khu vực cún, đi cùng trẻ nhỏ, cần bàn yên tĩnh..."
                    className="w-full min-h-[110px] rounded-2xl border-2 border-[#EAE2D8] bg-white p-5 text-[15px] font-medium text-[#2D2D2D] outline-none transition-all placeholder:text-[#AAAAAA] resize-none hover:border-[#b98c49]/50 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
                  />
                </ReservationField>
              </div>

              {message.text && (
                <div
                  className={[
                    "mt-5 rounded-2xl px-5 py-4 text-[15px] font-medium leading-relaxed",
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200",
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

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#b98c49] px-8 text-base font-['Quicksand'] font-bold text-white transition-all hover:bg-[#a1783a] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-[#b98c49]/20"
                >
                  {submitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CalendarDays size={20} />
                  )}
                  {submitting ? "Đang gửi..." : "Gửi yêu cầu đặt bàn"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-[#b98c49]/20 bg-white px-8 text-base font-['Quicksand'] font-bold text-[#b98c49] transition hover:bg-[#FFFAFA]"
                >
                  Thu gọn
                </button>
              </div>

              <p className="mt-4 text-center text-[13px] leading-relaxed text-[#999999] sm:text-left">
                Khi gửi form, bạn đồng ý để YEPO liên hệ lại qua số điện thoại đã cung cấp nhằm xác nhận lịch đặt bàn.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}`;

content = replaceFunction(content, "ReservationSection", newReservationSection);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cập nhật HomePage:");
console.log("- Signature Menu chỉ hiển thị món isFeatured === true");
console.log("- Góc chuyện trò chỉ hiển thị bài isPinned === true, tối đa 2 bài");
console.log("- Reservation thu gọn, chỉ xổ form khi bấm Đặt bàn");
