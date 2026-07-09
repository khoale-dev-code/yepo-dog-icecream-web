import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const RESET_DELAYS = [0, 16, 80, 180, 360, 700];

function getScrollRoots() {
  return [
    document.documentElement,
    document.body,
    ...document.querySelectorAll(
      "main, [data-scroll-root], [data-page-scroll-root]"
    ),
  ].filter(Boolean);
}

function resetScrollTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  getScrollRoots().forEach((element) => {
    try {
      element.scrollTop = 0;
    } catch {
      // ignore
    }
  });
}

function scheduleResetTop() {
  RESET_DELAYS.forEach((delay) => {
    if (delay === 0) {
      requestAnimationFrame(resetScrollTop);
      return;
    }

    setTimeout(resetScrollTop, delay);
  });
}

function scrollToHash(hash) {
  const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));

  if (!id) {
    scheduleResetTop();
    return;
  }

  function run() {
    const selector =
      typeof CSS !== "undefined" && CSS.escape
        ? `[id="${CSS.escape(id)}"], [name="${CSS.escape(id)}"]`
        : `[id="${id}"], [name="${id}"]`;

    const element = document.querySelector(selector);

    if (!element) return;

    element.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }

  requestAnimationFrame(run);
  setTimeout(run, 80);
  setTimeout(run, 220);
  setTimeout(run, 500);
}

export default function RouteScrollTop() {
  const location = useLocation();
  const previousUrlRef = useRef("");

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    const currentUrl =
      location.pathname + location.search + location.hash;

    if (previousUrlRef.current === currentUrl) return;

    previousUrlRef.current = currentUrl;

    if (location.hash) {
      scrollToHash(location.hash);
      return;
    }

    scheduleResetTop();
  }, [location.pathname, location.search, location.hash]);

  return null;
}
