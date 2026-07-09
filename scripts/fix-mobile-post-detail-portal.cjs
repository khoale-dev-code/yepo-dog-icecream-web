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

const postsFile = walk("src").find((file) => {
  const code = fs.readFileSync(file, "utf8");

  return (
    code.includes("export default function PostsPage") &&
    code.includes("function MobilePostDetail") &&
    code.includes("function MediaCarousel")
  );
});

if (!postsFile) {
  throw new Error("Không tìm thấy file PostsPage.jsx.");
}

let code = fs.readFileSync(postsFile, "utf8");

if (!code.includes('from "react-dom"') && !code.includes("from 'react-dom'")) {
  code = code.replace(
    'import { useEffect, useMemo, useRef, useState } from "react";',
    'import { useEffect, useMemo, useRef, useState } from "react";\nimport { createPortal } from "react-dom";'
  );
}

const newUseLockBodyScroll = String.raw`function useLockBodyScroll(enabled) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return undefined;

    const scrollY =
      window.scrollY || document.documentElement.scrollTop || 0;

    const body = document.body;
    const html = document.documentElement;

    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyTouchAction: body.style.touchAction,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = "-" + scrollY + "px";
    body.style.width = "100%";
    body.style.touchAction = "none";

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      body.style.touchAction = previous.bodyTouchAction;

      html.style.overflow = previous.htmlOverflow;
      html.style.overscrollBehavior = previous.htmlOverscrollBehavior;

      window.scrollTo(0, scrollY);
    };
  }, [enabled]);
}`;

const lockRegex =
  /function useLockBodyScroll\(enabled\) \{[\s\S]*?\n\}\n\nexport default function PostsPage/;

if (!lockRegex.test(code)) {
  throw new Error("Không tìm thấy function useLockBodyScroll để thay thế.");
}

code = code.replace(
  lockRegex,
  newUseLockBodyScroll + "\n\nexport default function PostsPage"
);

const newMobilePostDetail = String.raw`function MobilePostDetail({ post, shop, onClose }) {
  useLockBodyScroll(true);

  const media = normalizePostMedia(post.media);
  const hasMedia = media.length > 0;
  const shopHandle =
    shop?.username ||
    String(shop?.name || "YEPO").toLowerCase().replace(/\s+/g, "") ||
    "yepo";

  const modal = (
    <div
      data-mobile-post-detail="true"
      className="fixed inset-0 z-[99999] isolate flex h-[100dvh] min-h-[100dvh] w-screen max-w-[100vw] flex-col overflow-hidden bg-[#FFFAFA]"
      role="dialog"
      aria-modal="true"
    >
      <header className="relative z-30 flex shrink-0 items-center gap-3 border-b border-[#b98c49]/15 bg-white px-3 py-3 pt-[max(12px,env(safe-area-inset-top))] shadow-[0_8px_24px_rgba(87,61,28,0.06)]">
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

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain bg-[#FFFAFA] pb-[env(safe-area-inset-bottom)]">
        {hasMedia ? (
          <MediaCarousel media={media} mode="page" />
        ) : (
          <div className="grid min-h-[260px] place-items-center bg-white p-8 text-center">
            <p className="whitespace-pre-wrap text-base font-semibold leading-8 text-[#3b2a18]">
              {getPostContent(post)}
            </p>
          </div>
        )}

        <section className="relative z-10 -mt-1 rounded-t-[2rem] bg-[#FFFAFA] px-4 pb-8 pt-5 shadow-[0_-18px_40px_rgba(185,140,73,0.08)]">
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
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modal, document.body);
}`;

const mobileRegex =
  /function MobilePostDetail\(\{ post, shop, onClose \}\) \{[\s\S]*?\n\}\n\nfunction ShopAvatar/;

if (!mobileRegex.test(code)) {
  throw new Error("Không tìm thấy function MobilePostDetail để thay thế.");
}

code = code.replace(
  mobileRegex,
  newMobilePostDetail + "\n\nfunction ShopAvatar"
);

fs.writeFileSync(postsFile, code, "utf8");

console.log("✅ Đã sửa mobile post detail modal:", postsFile);
