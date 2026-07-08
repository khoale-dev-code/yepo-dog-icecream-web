import { useEffect } from "react";

function getShopFromStore(payload) {
  return payload?.shop || payload?.data?.shop || {};
}

function addVersion(url, version) {
  if (!url) return "";

  const cleanVersion = String(version || Date.now()).replace(/[^a-zA-Z0-9_-]/g, "");

  if (!cleanVersion) return url;

  return url.includes("?")
    ? url + "&v=" + cleanVersion
    : url + "?v=" + cleanVersion;
}

function setMeta(name, content, attr = "name") {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attr}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setIcon(rel, href) {
  if (!href) return;

  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("type", "image/png");
  element.setAttribute("href", href);
}

export default function SiteMeta() {
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const response = await fetch("/api/public-store?t=" + Date.now(), {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = await response.json();
        const shop = getShopFromStore(payload);

        if (cancelled) return;

        const logoUrl = shop?.logoUrl || shop?.logo || shop?.imageUrl || "";
        const version = shop?.updatedAt || payload?.updatedAt || Date.now();
        const faviconUrl = addVersion(logoUrl, version);

        const title = shop?.name
          ? shop.name + " | Ice Cream & Coffee"
          : "YEPO Dog & Ice Cream";

        document.title = title;

        if (faviconUrl) {
          setIcon("icon", faviconUrl);
          setIcon("shortcut icon", faviconUrl);
          setIcon("apple-touch-icon", faviconUrl);

          setMeta("og:image", faviconUrl, "property");
          setMeta("twitter:image", faviconUrl);
        }

        setMeta("description", shop?.description || "YEPO Dog & Ice Cream");
        setMeta("og:title", title, "property");
        setMeta("twitter:title", title);
      } catch (error) {
        console.warn("[site-meta] Không thể cập nhật favicon từ logo cửa hàng.", error);
      }
    }

    loadMeta();

    window.addEventListener("focus", loadMeta);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", loadMeta);
    };
  }, []);

  return null;
}
