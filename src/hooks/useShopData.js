import { useEffect, useMemo, useState } from "react";
import { fallbackProducts, fallbackShop } from "../data/fallbackData";
import { api } from "../lib/api";

export function useShopData() {
  const [shop, setShop] = useState(fallbackShop);
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState("loading");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [shopResponse, productsResponse] = await Promise.all([api.getShop(), api.getProducts()]);
        if (!mounted) return;

        setShop(shopResponse.shop || fallbackShop);
        setProducts(productsResponse.products?.length ? productsResponse.products : fallbackProducts);
        setApiStatus("connected");
      } catch (error) {
        console.warn(error);
        if (!mounted) return;
        setApiStatus("fallback");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return ["Táº¥t cáº£", ...new Set(products.map((product) => product.category).filter(Boolean))];
  }, [products]);

  return { shop, products, categories, loading, apiStatus };
}


