import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/public/PublicNavbar";
import PublicFooter from "./PublicFooter";
import RouteScrollTop from "../components/RouteScrollTop.jsx";

export default function PublicLayout({ shop, loading }) {
  return (
    <div className="min-h-screen bg-[#fffafa] text-[#3a2a1b]">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-[radial-gradient(circle_at_top,rgba(185,140,73,0.22),transparent_60%)]" />
        <PublicNavbar shop={shop} loading={loading} />
        <main className="relative">
          <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <RouteScrollTop />
        <Outlet />
          </div>
        </main>
        <PublicFooter shop={shop} />
      </div>
    </div>
  );
}