const fs = require("fs");
const path = require("path");

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!["node_modules", "dist", ".git", ".vercel"].includes(item.name)) {
        walk(full, files);
      }
      continue;
    }

    if (/\.(jsx|js)$/.test(item.name)) {
      files.push(full);
    }
  }

  return files;
}

const dogCardFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");
  return (
    code.includes("export default function DogProfileCard") &&
    code.includes("function DogDetailModal") &&
    code.includes("getDogCardStyle")
  );
});

if (!dogCardFile) {
  throw new Error("Không tìm thấy DogProfileCard.jsx.");
}

let code = fs.readFileSync(dogCardFile, "utf8");

// Cho card full hơn trên mobile, vẫn giới hạn width ở tablet/desktop
code = code.replace(
  "className=\"group relative mx-auto flex w-full max-w-[340px] cursor-pointer flex-col overflow-hidden rounded-[32px] border-2 p-3 shadow-[0_8px_24px_rgba(217,124,148,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#b98c49]/25\"",
  "className=\"group relative mx-auto flex w-full max-w-none cursor-pointer flex-col overflow-hidden rounded-[30px] border-2 p-3 shadow-[0_8px_24px_rgba(217,124,148,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#b98c49]/25 sm:max-w-[340px] sm:rounded-[32px]\""
);

const start = code.indexOf("function DogDetailModal(");
const end = code.indexOf("function DetailBox", start);

if (start === -1 || end === -1) {
  throw new Error("Không tìm thấy vùng DogDetailModal để thay thế.");
}

const newDogDetailModal = String.raw`function DogDetailModal({ dog, cardTheme, genderTheme, onClose }) {
  const media = useMemo(() => getDogMedia(dog), [dog]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeMedia = media[activeIndex];

  const modalCardStyle = getDogCardStyle(dog);
  const modalFrameStyle = getDogMediaFrameStyle(dog);
  const modalImageStyle = getDogImageRingStyle(dog);

  const personalityText =
    dog?.personality ||
    formatList(dog?.personalityTags, "Chưa cập nhật tính cách");

  const favoriteTreatText = formatList(
    dog?.favoriteTreats,
    dog?.favoriteTreat || "Chưa cập nhật"
  );

  const coatColors = Array.isArray(dog?.coatColors) ? dog.coatColors : [];

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousOverscroll = document.documentElement.style.overscrollBehavior;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overscrollBehavior = previousOverscroll;
    };
  }, [onClose, media.length]);

  function goPrevious() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current - 1 + media.length) % media.length);
  }

  function goNext() {
    if (media.length <= 1) return;

    setActiveIndex((current) => (current + 1) % media.length);
  }

  return (
    <div
      className="fixed left-0 top-0 z-[99999] flex h-[100svh] min-h-[100svh] w-screen max-w-[100vw] overflow-hidden bg-[#2d2015]/75 p-0 backdrop-blur-sm sm:inset-0 sm:h-auto sm:min-h-0 sm:items-center sm:justify-center sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <section
        style={modalCardStyle}
        className="relative flex h-[100svh] max-h-[100svh] w-screen max-w-[100vw] flex-col overflow-hidden rounded-none border-0 shadow-[0_28px_90px_rgba(0,0,0,.28)] sm:h-auto sm:max-h-[92svh] sm:max-w-6xl sm:rounded-[34px] sm:border-[6px] sm:border-white"
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className={cn(
            "z-30 flex shrink-0 items-center justify-between gap-3 px-4 py-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5 sm:pt-3",
            cardTheme.ribbon
          )}
        >
          <div className="min-w-0 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-80 sm:text-[11px]">
              YEPO dog detail card
            </p>

            <h2 className="font-brand truncate text-2xl font-black uppercase tracking-[0.12em] sm:text-3xl">
              {dog?.name || "Vô danh"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-sm transition hover:bg-white"
            aria-label="Đóng chi tiết"
          >
            <X size={22} />
          </button>
        </header>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 pb-[max(18px,env(safe-area-inset-bottom))] sm:p-5",
            cardTheme.modalBg
          )}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:gap-5">
            <div className="min-w-0">
              <div
                style={modalFrameStyle}
                className="relative overflow-hidden rounded-[26px] border-[5px] border-white p-2 shadow-inner sm:rounded-[30px] sm:border-[6px] sm:p-3"
              >
                <div className="overflow-hidden rounded-[20px] bg-white/45 sm:rounded-[22px]">
                  {activeMedia ? (
                    isVideoMedia(activeMedia) ? (
                      <video
                        key={activeMedia.url}
                        src={activeMedia.url}
                        controls
                        playsInline
                        className="block max-h-[70svh] min-h-[260px] w-full bg-[#2d2015] object-contain sm:max-h-[72vh]"
                      />
                    ) : (
                      <img
                        key={activeMedia.url}
                        style={modalImageStyle}
                        src={activeMedia.url}
                        alt={activeMedia.originalName || dog?.name || "Dog media"}
                        draggable={false}
                        className="block h-auto max-h-none w-full object-contain"
                      />
                    )
                  ) : (
                    <div className="grid min-h-[300px] w-full place-items-center text-white">
                      <PawPrint size={64} />
                    </div>
                  )}
                </div>

                {media.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md transition hover:bg-white sm:left-5 sm:h-11 sm:w-11"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[#8c672f] shadow-md transition hover:bg-white sm:right-5 sm:h-11 sm:w-11"
                      aria-label="Ảnh tiếp theo"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {media.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {media.map((item, index) => {
                    const isActive = index === activeIndex;
                    const isVideo = isVideoMedia(item);

                    return (
                      <button
                        key={(item.url || "media") + "-" + index}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={cn(
                          "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 bg-white transition",
                          isActive
                            ? "border-[#b98c49]"
                            : "border-white opacity-70 hover:opacity-100"
                        )}
                        aria-label={"Xem media " + (index + 1)}
                      >
                        {isVideo ? (
                          <div className="grid h-full w-full place-items-center bg-[#2d2015] text-white">
                            <Video size={24} />
                          </div>
                        ) : (
                          <img
                            style={modalImageStyle}
                            src={item.url}
                            alt={item.originalName || "Media " + (index + 1)}
                            className="h-full w-full object-cover"
                          />
                        )}

                        {isVideo && (
                          <span className="absolute bottom-1 right-1 rounded-full bg-white/90 p-1 text-[#8c672f]">
                            <Video size={12} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={cn(
                "rounded-[28px] p-4 shadow-inner sm:rounded-[30px] sm:p-5",
                cardTheme.detailsBg
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.18em]",
                      cardTheme.accentText
                    )}
                  >
                    Full profile
                  </p>

                  <h3 className="mt-2 break-words text-4xl font-black uppercase leading-none text-[#5f4522]">
                    {dog?.name || "Vô danh"}
                  </h3>

                  {dog?.nickname && (
                    <p className="mt-2 break-words text-base font-medium leading-7 text-[#b58b7f]">
                      “{dog.nickname}”
                    </p>
                  )}
                </div>

                {dog?.isFeatured && (
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ffda75] text-[#d49911] shadow">
                    <Star size={20} fill="currentColor" />
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailBox
                  label="Giống / chủng loại"
                  value={dog?.breed || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Giới tính"
                  value={getGenderLabel(dog?.gender)}
                />

                <DetailBox
                  label="Tuổi"
                  value={dog?.age || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Sinh nhật"
                  value={dog?.birthday || "Chưa cập nhật"}
                />

                <DetailBox
                  label="Cân nặng"
                  value={dog?.weightKg ? String(dog.weightKg) + " kg" : "Chưa cập nhật"}
                  icon={<Weight size={15} />}
                />

                <DetailBox
                  label="Độ dễ thương"
                  value={String(dog?.cutenessLevel || 70) + "/100"}
                />

                <DetailBox
                  label="Kiểu lông"
                  value={getPatternLabel(dog?.coatPattern)}
                />

                <DetailBox
                  label="Trạng thái"
                  value={dog?.isActive === false ? "Đang ẩn" : "Đang hiển thị"}
                />
              </div>

              {coatColors.length > 0 && (
                <div className="mt-4 rounded-[22px] bg-white/75 p-4">
                  <p
                    className={cn(
                      "text-xs font-black uppercase tracking-[0.14em]",
                      cardTheme.accentText
                    )}
                  >
                    Màu lông
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {coatColors.map((color, index) => (
                      <span
                        key={(color.hex || color.name || "color") + "-" + index}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#8c672f]"
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full shadow-inner",
                            isWhiteLikeColor(color.hex)
                              ? "border-2 border-[#cfc5b8]"
                              : "border border-white"
                          )}
                          style={{ backgroundColor: color.hex || "#b98c49" }}
                        />
                        {color.name || color.hex}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <LongDetail label="Tính cách" value={personalityText} />
              <LongDetail label="Món yêu thích" value={favoriteTreatText} />

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className={cn(genderTheme.bg, genderTheme.text)}>
                  {getGenderLabel(dog?.gender)}
                </Badge>

                <Badge className="bg-[#e8f1f5] text-[#628296]">
                  {dog?.weightKg ? String(dog.weightKg) + "kg" : "N/A"}
                </Badge>

                <Badge className="bg-[#fff1c7] text-[#a38638]">
                  {getPatternLabel(dog?.coatPattern)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

`;

code = code.slice(0, start) + newDogDetailModal + code.slice(end);

fs.writeFileSync(dogCardFile, code, "utf8");

console.log("✅ Đã sửa DogProfileCard mobile-safe:", dogCardFile);
