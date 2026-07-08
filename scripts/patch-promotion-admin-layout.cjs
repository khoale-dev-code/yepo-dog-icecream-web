const fs = require("fs");
const path = require("path");

const filePath = path.resolve(process.cwd(), "src/admin/promotions/PromotionManagerView.jsx");

if (!fs.existsSync(filePath)) {
  throw new Error("Không tìm thấy src/admin/promotions/PromotionManagerView.jsx");
}

let content = fs.readFileSync(filePath, "utf8");

// 1. Thêm icon đóng/mở
content = content.replace(
  `  CalendarDays,
  Edit,`,
  `  CalendarDays,
  ChevronDown,
  ChevronUp,
  Edit,`
);

// 2. Thêm state đóng/mở form
content = content.replace(
  `  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    sortOrder: "1",
  }));`,
  `  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    sortOrder: "1",
  }));
  const [formOpen, setFormOpen] = useState(false);`
);

// 3. Khi sửa khuyến mãi thì mở form
content = content.replace(
  `    setForm(mapToForm(promotion));
    window.scrollTo({ top: 0, behavior: "smooth" });`,
  `    setForm(mapToForm(promotion));
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });`
);

// 4. Sau khi lưu xong thì đóng form
content = content.replace(
  `      resetForm();
      await loadPromotions();`,
  `      resetForm();
      setFormOpen(false);
      await loadPromotions();`
);

// 5. Đổi layout 2 cột thành layout dọc
content = content.replace(
  `      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">`,
  `      <div className="space-y-5">`
);

// 6. Đổi form thành block đóng/mở nằm trên
const oldFormStart = `        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]"
        >
          <div className="border-b border-[#d8b77e]/60 bg-[#FFFAFA] p-5">
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#b98c49]">
              {editingId ? "Chỉnh sửa" : "Tạo mới"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#3b2a18]">
              {editingId ? "Cập nhật khuyến mãi" : "Thêm khuyến mãi"}
            </h2>
          </div>

          <div className="space-y-4 p-5">`;

const newFormStart = `        <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
          <button
            type="button"
            onClick={() => setFormOpen((value) => !value)}
            className="group flex w-full items-center justify-between gap-4 bg-gradient-to-br from-white to-[#FFFAFA] p-5 text-left transition hover:from-[#FFFAFA] hover:to-[#f6d77d]/20"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white shadow-sm">
                <Gift size={24} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
                  {editingId ? "Đang chỉnh sửa khuyến mãi" : "Thêm khuyến mãi"}
                </p>

                <h2 className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
                  {editingId ? "Cập nhật khuyến mãi" : "Tạo chương trình mới"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#756144]">
                  {formOpen
                    ? "Điền thông tin chương trình, ảnh, mã ưu đãi và trạng thái hiển thị."
                    : "Bấm để mở form. Đóng lại giúp trang gọn hơn khi chỉ cần kéo thả danh sách."}
                </p>
              </div>
            </div>

            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105">
              {formOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </span>
          </button>

          {formOpen && (
            <form onSubmit={handleSubmit} className="border-t border-[#d8b77e]/60">
              <div className="space-y-4 p-5">`;

if (!content.includes(oldFormStart)) {
  throw new Error("Không tìm thấy đoạn form cũ để thay. Có thể file đã khác cấu trúc.");
}

content = content.replace(oldFormStart, newFormStart);

// 7. Đóng form conditional
const oldFormEnd = `          </div>
        </form>

        <section className="rounded-[28px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">`;

const newFormEnd = `              </div>
            </form>
          )}
        </section>

        <section className="rounded-[28px] border border-[#d8b77e]/80 bg-white p-5 shadow-[0_18px_60px_rgba(87,61,28,.07)]">`;

if (!content.includes(oldFormEnd)) {
  throw new Error("Không tìm thấy đoạn đóng form cũ để thay.");
}

content = content.replace(oldFormEnd, newFormEnd);

// 8. Nút Thêm mới trong danh sách sẽ mở form ở trên
content = content.replace(
  `              onClick={resetForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f6d77d]/45 px-4 text-sm font-bold text-[#8c672f]"`,
  `              onClick={() => {
                resetForm();
                setFormOpen(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f6d77d]/45 px-4 text-sm font-bold text-[#8c672f]"`
);

// 9. Nút hủy chỉnh sửa đóng form nếu muốn gọn lại
content = content.replace(
  `              <button
                type="button"
                onClick={resetForm}`,
  `              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}`
);

fs.writeFileSync(filePath, content, "utf8");

console.log("Đã cập nhật layout admin Khuyến mãi: form trên, danh sách dưới, form có đóng/mở.");
