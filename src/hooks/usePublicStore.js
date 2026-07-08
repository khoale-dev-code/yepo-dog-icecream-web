import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { subscribeDataChanged } from "../lib/dataSync";

const initialStore = {
  shop: null,
  categories: [],
  products: [],
  toppings: [],
  dogs: [],
  posts: [],
  promotions: [],
  updatedAt: "",
};

export function usePublicStore() {
  const [store, setStore] = useState(initialStore);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  const loadStore = useCallback(async ({ silent = false } = {}) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await api.getPublicStore();

      if (requestIdRef.current !== requestId) return;

      setStore({
        shop: data.shop || null,
        categories: Array.isArray(data.categories) ? data.categories : [],
        products: Array.isArray(data.products) ? data.products : [],
        toppings: Array.isArray(data.toppings) ? data.toppings : [],
        dogs: Array.isArray(data.dogs) ? data.dogs : [],
        posts: Array.isArray(data.posts) ? data.posts : [],
        promotions: Array.isArray(data.promotions) ? data.promotions : [],
        updatedAt: data.updatedAt || new Date().toISOString(),
      });
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(err.message || "Không tải được dữ liệu menu.");
    } finally {
      if (requestIdRef.current !== requestId) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  useEffect(() => {
    return subscribeDataChanged(() => {
      loadStore({ silent: true });
    });
  }, [loadStore]);

  useEffect(() => {
    function handleFocus() {
      loadStore({ silent: true });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadStore({ silent: true });
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadStore]);

  return {
    ...store,
    loading,
    refreshing,
    error,
    reload: loadStore,
  };
}
