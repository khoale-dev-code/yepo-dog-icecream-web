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
    code.includes("function MobilePostDetail") &&
    code.includes("function MediaCarousel")
  );
});

if (!postsFile) {
  throw new Error("Không tìm thấy PostsPage.jsx.");
}

let code = fs.readFileSync(postsFile, "utf8");

// Không dùng portal nữa cho mobile detail
code = code.replace(/\nimport \{ createPortal \} from ["']react-dom["'];?/g, "");

// Body lock chỉ dùng cho desktop modal, tránh fixed body làm lệch Chrome mobile
const newUseLockBodyScroll = String.raw`function useLockBodyScroll(enabled) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [enabled]);
}`;

const lockRegex =
  /function useLockBodyScroll\(enabled\) \{[\s\S]*?\n\}\n\nexport default function PostsPage/;

if (!lockRegex.test(code)) {
  throw new Error("Không tìm thấy useLockBodyScroll để thay thế.");
}

code = code.replace(
  lockRegex,
  newUseLockBodyScroll + "\n\nexport default function PostsPage"
);

// Thêm scroll ref để mở detail mobile luôn ở đầu trang, đóng thì quay lại vị trí cũ
if (!code.includes("const listScrollRef = useRef(0);")) {
  code = code.replace(
    "  const [activePost, setActivePost] = useState(null);\n  const isMobile = useIsMobile();",
    "  const [activePost, setActivePost] = useState(null);\n  const listScrollRef = useRef(0);\n  const isMobile = useIsMobile();"
  );
}

// Đổi hành động click bài viết
code = code.replace(
  /onClick=\{\(\) => setActivePost\(post\)\}/g,
  "onClick={() => openPost(post)}"
);

// Thêm open/close và return riêng cho mobile detail
const insertAfterPostsMemo =
  /  \}, \[store\]\);\n\n  return \(/;

if (!insertAfterPostsMemo.test(code)) {
  throw new Error("Không tìm thấy vị trí sau posts useMemo để chèn mobile detail page.");
}

if (!code.includes("function openPost(post)")) {
  code = code.replace(
    insertAfterPostsMemo,
    String.raw`  }, [store]);

  function openPost(post) {
    if (typeof window !== "undefined") {
      listScrollRef.current =
        window.scrollY || document.documentElement.scrollTop || 0;
    }

    setActivePost(post);

    if (isMobile && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      });
    }
  }

  function closePost() {
    setActivePost(null);

    if (isMobile && typeof window !== "undefined") {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: listScrollRef.current || 0,
          left: 0,
          behavior: "auto",
        });
      });
    }
  }

  if (activePost && isMobile) {
    return (
      <MobilePostDetail
        post={activePost}
        shop={shop}
        onClose={closePost}
      />
    );
  }

  return (`
  );
}

// Xóa block mobile overlay cũ trong return chính
code = code.replace(
  /\n\s*\{activePost && isMobile && \(\s*<MobilePostDetail[\s\S]*?\/>\s*\)\}\n/g,
  "\n"
);

// Desktop modal dùng closePost
code = code.replace(
  /onClose=\{\(\) => setActivePost\(null\)\}/g,
  "onClose={closePost}"
);

// Thay MobilePostDetail thành màn hình riêng, không fixed, không portal
const newMobilePostDetail = String.raw`function MobilePostDetail({ post, shop, onClose }) {
  const media = normalizePostMedia(post.media);
  const hasMedia = media.length > 0;
  const shopHandle =
    shop?.username ||
    String(shop?.name || "YEPO").toLowerCase().replace(/\s+/g, "") ||
    "yepo";

  return (
    <main className="min-h-[100svh] bg-[#FFFAFA] font-['Quicksand'] text-[#2D2D2D]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[#b98c49]/15 bg-white px-3 py-3 pt-[max(12px,env(safe-area-inset-top))] shadow-[0_8px_24px_rgba(87,61,28,0.06)]">
        <button
          type="button"
          onClick={onClose}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FFFAFA] text-[#3b2a18] ring-1 ring-[#b98c49]/10"
          aria-label="Quay lại"
        >
          <ArrowLeft size={22} />
        </button>

        <ShopAvatar shop={shop} small />

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight text-[#2D2D2D]">
            {shopHandle}
          </p>

          <p className="mt-0.5 text-sm text-[#999999]">
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </header>

      <section className="bg-[#111]">
        {hasMedia ? (
          <MediaCarousel media={media} mode="page" />
        ) : (
          <div className="grid min-h-[260px] place-items-center bg-white p-8 text-center">
            <p className="whitespace-pre-wrap text-base font-semibold leading-8 text-[#3b2a18]">
              {getPostContent(post)}
            </p>
          </div>
        )}
      </section>

      <section className="relative z-10 -mt-1 rounded-t-[2rem] bg-[#FFFAFA] px-4 pb-[max(32px,env(safe-area-inset-bottom))] pt-5 shadow-[0_-18px_40px_rgba(185,140,73,0.08)]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#b98c49]/20" />

        <div className="rounded-[1.5rem] border border-[#b98c49]/12 bg-white p-5 shadow-sm">
          <h2 className="font-['Quicksand'] text-xl font-semibold leading-snug text-[#2D2D2D]">
            {getPostTitle(post)}
          </h2>

          {getPostContent(post) && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#3b2a18]">
              <span className="mr-1 font-bold">{shopHandle}</span>
              {renderCaption(getPostContent(post))}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}`;

const mobileRegex =
  /function MobilePostDetail\(\{ post, shop, onClose \}\) \{[\s\S]*?\n\}\n\nfunction ShopAvatar/;

if (!mobileRegex.test(code)) {
  throw new Error("Không tìm thấy MobilePostDetail để thay thế.");
}

code = code.replace(
  mobileRegex,
  newMobilePostDetail + "\n\nfunction ShopAvatar"
);

fs.writeFileSync(postsFile, code, "utf8");

console.log("✅ Đã đổi mobile post detail sang page riêng:", postsFile);
