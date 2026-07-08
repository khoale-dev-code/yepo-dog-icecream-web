import { Route, Routes } from "react-router-dom";
import { usePublicStore } from "./hooks/usePublicStore";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import MenuPage from "./pages/public/MenuPage";
import ProductDetailPage from "./pages/public/ProductDetailPage";
import PromotionsPage from "./pages/public/PromotionsPage.jsx";
import PostsPage from "./pages/public/PostsPage";
import DogsPage from "./pages/public/DogsPage";

export default function App() {
  const store = usePublicStore();

  return (
    <Routes>
      <Route
        path="/"
        element={<PublicLayout shop={store.shop} loading={store.loading} />}
      >
        <Route index element={<HomePage store={store} />} />
        <Route path="about" element={<AboutPage store={store} />} />
        <Route path="menu" element={<MenuPage store={store} />} />
        <Route
          path="menu/:productId"
          element={<ProductDetailPage store={store} />}
        />
        <Route path="promotions" element={<PromotionsPage store={store} />} />
        <Route path="posts" element={<PostsPage store={store} />} />
        <Route path="dogs" element={<DogsPage store={store} />} />
      </Route>
    </Routes>
  );
}
