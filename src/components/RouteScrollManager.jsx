import { useEffect } from "react";

function forceScrollTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const scrollContainers = document.querySelectorAll(
    "[data-scroll-root], [data-page-scroll-root]"
  );

  scrollContainers.forEach((element) => {
    element.scrollTop = 0;
  });
}

function scheduleScrollTop() {
  requestAnimationFrame(() => {
    forceScrollTop();

    requestAnimationFrame(() => {
      forceScrollTop();
    });
  });

  setTimeout(forceScrollTop, 80);
  setTimeout(forceScrollTop, 240);
}

function scheduleScrollToHash(hash) {
  const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));

  if (!id) {
    scheduleScrollTop();
    return;
  }

  function run() {
    let element = document.getElementById(id);

    if (!element && typeof CSS !== "undefined" && CSS.escape) {
      element = document.querySelector(`[name="${CSS.escape(id)}"]`);
    }

    if (element) {
      element.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }

  requestAnimationFrame(run);
  setTimeout(run, 120);
}

export default function RouteScrollManager() {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let previousUrl =
      window.location.pathname + window.location.search + window.location.hash;

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    function notifyNavigation() {
      window.dispatchEvent(new Event("yepo:navigation"));
    }

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args);
      notifyNavigation();
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      notifyNavigation();
      return result;
    };

    function handleNavigation() {
      const currentUrl =
        window.location.pathname + window.location.search + window.location.hash;

      if (currentUrl === previousUrl) return;

      const previous = new URL(previousUrl, window.location.origin);
      const current = new URL(currentUrl, window.location.origin);

      previousUrl = currentUrl;

      if (current.hash) {
        scheduleScrollToHash(current.hash);
        return;
      }

      if (
        previous.pathname !== current.pathname ||
        previous.search !== current.search
      ) {
        scheduleScrollTop();
      }
    }

    window.addEventListener("yepo:navigation", handleNavigation);
    window.addEventListener("popstate", handleNavigation);
    window.addEventListener("hashchange", handleNavigation);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;

      window.removeEventListener("yepo:navigation", handleNavigation);
      window.removeEventListener("popstate", handleNavigation);
      window.removeEventListener("hashchange", handleNavigation);
    };
  }, []);

  return null;
}
