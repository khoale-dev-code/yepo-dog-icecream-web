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

    if (/\.(jsx|js)$/.test(item.name)) files.push(full);
  }

  return files;
}

const postsFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");
  return (
    code.includes("export default function PostsPage") &&
    code.includes("function MediaCarousel") &&
    code.includes("MobilePostDetail")
  );
});

if (!postsFile) {
  throw new Error("Không tìm thấy file PostsPage có MediaCarousel.");
}

let code = fs.readFileSync(postsFile, "utf8");

const newMediaCarousel = String.raw`function MediaCarousel({ media = [], mode = "modal" }) {
  const [index, setIndex] = useState(0);
  const [imageRatio, setImageRatio] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const safeMedia = normalizePostMedia(media);
  const currentMedia = safeMedia[index];
  const canMove = safeMedia.length > 1;
  const isPageMode = mode === "page";

  useEffect(() => {
    setIndex(0);
  }, [media]);

  useEffect(() => {
    setImageRatio(null);
  }, [currentMedia?.url]);

  function goPrev(event) {
    event?.stopPropagation?.();
    if (!canMove) return;
    setIndex((current) => (current - 1 + safeMedia.length) % safeMedia.length);
  }

  function goNext(event) {
    event?.stopPropagation?.();
    if (!canMove) return;
    setIndex((current) => (current + 1) % safeMedia.length);
  }

  function handleTouchStart(event) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    if (!canMove) return;

    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      if (deltaX < 0) goNext(event);
      else goPrev(event);
    }
  }

  function handleImageLoad(event) {
    const image = event.currentTarget;

    if (image?.naturalWidth && image?.naturalHeight) {
      setImageRatio(image.naturalWidth / image.naturalHeight);
    }
  }

  if (!currentMedia) {
    return (
      <div className="grid min-h-[280px] place-items-center bg-[#111] text-sm text-white">
        Không có media
      </div>
    );
  }

  if (isPageMode) {
    return (
      <div
        data-post-mobile-media="true"
        className="relative isolate w-full max-w-full overflow-hidden bg-[#111] select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentMedia.type === "video" ? (
          <video
            key={currentMedia.url}
            src={currentMedia.url}
            controls
            playsInline
            className="block max-h-[82dvh] min-h-[260px] w-full max-w-full bg-[#111] object-contain"
          />
        ) : (
          <img
            key={currentMedia.url}
            src={currentMedia.url}
            alt={currentMedia.name || "Media " + (index + 1)}
            draggable={false}
            onLoad={handleImageLoad}
            style={{
              aspectRatio: imageRatio || "auto",
            }}
            className="block h-auto w-full max-w-full bg-[#111]"
          />
        )}

        {canMove && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white"
              aria-label="Media trước"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white"
              aria-label="Media sau"
            >
              <ChevronRight size={21} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
              {safeMedia.map((item, dotIndex) => (
                <button
                  key={item.url + "-" + dotIndex}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIndex(dotIndex);
                  }}
                  className={[
                    "h-1.5 rounded-full transition-all",
                    dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
                  ].join(" ")}
                  aria-label={"Media " + (dotIndex + 1)}
                />
              ))}
            </div>

            <span className="absolute bottom-4 right-4 z-20 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1}/{safeMedia.length}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative h-full min-h-[420px] w-full overflow-hidden bg-[#111] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.type === "video" ? (
        <video
          key={currentMedia.url}
          src={currentMedia.url}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 h-full w-full bg-[#111] object-contain"
        />
      ) : (
        <img
          key={currentMedia.url}
          src={currentMedia.url}
          alt={currentMedia.name || "Media " + (index + 1)}
          draggable={false}
          className="absolute inset-0 h-full w-full bg-[#111] object-contain"
        />
      )}

      {canMove && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white sm:h-10 sm:w-10"
            aria-label="Media trước"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#2D2D2D] shadow-lg transition hover:bg-white sm:h-10 sm:w-10"
            aria-label="Media sau"
          >
            <ChevronRight size={21} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-1.5">
            {safeMedia.map((item, dotIndex) => (
              <button
                key={item.url + "-" + dotIndex}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIndex(dotIndex);
                }}
                className={[
                  "h-1.5 rounded-full transition-all",
                  dotIndex === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
                ].join(" ")}
                aria-label={"Media " + (dotIndex + 1)}
              />
            ))}
          </div>

          <span className="absolute bottom-4 right-4 z-20 rounded-full bg-black/45 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {index + 1}/{safeMedia.length}
          </span>
        </>
      )}
    </div>
  );
}`;

const mediaRegex =
  /function MediaCarousel\(\{ media = \[\], mode = "modal" \}\) \{[\s\S]*?\n\}\n\nfunction DesktopPostModal/;

if (!mediaRegex.test(code)) {
  throw new Error("Không tìm thấy function MediaCarousel để thay thế.");
}

code = code.replace(mediaRegex, newMediaCarousel + "\n\nfunction DesktopPostModal");

code = code.replace(
  'className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"',
  'className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]"'
);

fs.writeFileSync(postsFile, code);

console.log("✅ Fixed mobile full post media:", postsFile);
