const fs = require("fs");

const file = "src/components/public/toppings/ToppingSection.jsx";

if (!fs.existsSync(file)) {
  throw new Error("Không tìm thấy file: " + file);
}

let code = fs.readFileSync(file, "utf8");

if (!code.includes("function isRealTap")) {
  code = code.replace(
    "function getDescription(topping) {",
    `function isRealTap(start, end) {
  if (!start || !end) return false;

  const deltaX = Math.abs(end.x - start.x);
  const deltaY = Math.abs(end.y - start.y);
  const deltaTime = end.time - start.time;

  return deltaX < 26 && deltaY < 26 && deltaTime < 900;
}

function getDescription(topping) {`
  );
}

if (!code.includes("data-topping-scroller")) {
  code = code.replace(
    '<div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">',
    `<div
        data-topping-scroller="true"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-4"
      >`
  );
}

const newToppingCard = String.raw`function ToppingCard({ topping, onClick }) {
  const tapRef = useRef(null);

  const image = getFirstImage(topping);
  const description = getDescription(topping);
  const imageCount = getToppingMedia(topping).length;

  function openDetail() {
    onClick();
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];

    if (!touch) return;

    tapRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }

  function handleTouchEndCapture(event) {
    const touch = event.changedTouches?.[0];

    if (!touch || !tapRef.current) return;

    const end = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    if (!isRealTap(tapRef.current, end)) return;

    event.preventDefault();
    event.stopPropagation();

    openDetail();
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    openDetail();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetail();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      data-topping-card="true"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEndCapture={handleTouchEndCapture}
      className="group flex min-h-[330px] w-[72vw] max-w-[280px] shrink-0 snap-start cursor-pointer select-none flex-col overflow-hidden rounded-[1.75rem] border border-[#b98c49]/15 bg-[#FFFAFA] p-3 text-left shadow-[0_10px_28px_rgba(185,140,73,.08)] outline-none transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_44px_rgba(185,140,73,.13)] focus:ring-4 focus:ring-[#b98c49]/15 sm:w-auto sm:max-w-none"
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.45rem] bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(246,215,125,.24),transparent_52%)]" />

        {image ? (
          <img
            src={image}
            alt={topping.name}
            className="pointer-events-none relative z-10 h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="pointer-events-none relative z-10 grid h-full place-items-center text-[#b98c49]">
            <Sparkles size={30} />
          </div>
        )}

        {topping.isFeatured === true && (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-[#b98c49] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Hot
          </span>
        )}

        {imageCount > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {imageCount} ảnh
          </span>
        )}
      </div>

      <div className="pointer-events-none flex flex-1 flex-col p-2 pt-4">
        <p className="line-clamp-2 text-lg font-bold leading-tight text-[#2D2D2D]">
          {topping.name}
        </p>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#666666]">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-[#b98c49]">
            {formatPrice(topping.price)}
          </p>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#b98c49] ring-1 ring-[#b98c49]/15 transition group-hover:bg-[#b98c49] group-hover:text-white">
            <ArrowRight size={16} />
          </span>
        </div>

        <p className="mt-3 text-center text-xs font-bold text-[#8c672f]">
          Chạm để xem chi tiết
        </p>
      </div>
    </article>
  );
}`;

const cardRegex =
  /function ToppingCard\(\{ topping, onClick \}\) \{[\s\S]*?\n\}\n\nfunction ToppingDetailModal/;

if (!cardRegex.test(code)) {
  throw new Error("Không tìm thấy function ToppingCard để thay thế.");
}

code = code.replace(cardRegex, newToppingCard + "\n\nfunction ToppingDetailModal");

fs.writeFileSync(file, code);

console.log("✅ Fixed Chrome mobile tap for topping cards");
