import { useState } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { Alert, LoadingState } from "./ui/AdminPrimitives";

export function AdminShell({
  activeTab,
  setActiveTab,
  shop,
  loading,
  saving,
  notice,
  error,
  onRefresh,
  admin,
  onLogout,
  children,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FFFAFA] text-[#3b2a18] lg:h-dvh lg:overflow-hidden">
      <div
        className={[
          "min-h-screen w-full lg:grid lg:h-dvh lg:min-h-dvh lg:overflow-hidden lg:transition-[grid-template-columns] lg:duration-300",
          sidebarCollapsed
            ? "lg:grid-cols-[96px_minmax(0,1fr)]"
            : "lg:grid-cols-[320px_minmax(0,1fr)]",
        ].join(" ")}
      >
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          shop={shop}
          loading={loading}
          onRefresh={onRefresh}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
          admin={admin}
          onLogout={onLogout}
        />

        <section className="min-w-0 overflow-x-hidden px-3 py-4 sm:px-5 lg:h-dvh lg:overflow-y-auto lg:px-7 lg:py-6 xl:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            <AdminHeader activeTab={activeTab} saving={saving} />

            {(notice || error) && (
              <div className="mt-4 space-y-2.5">
                {notice && <Alert type="success" message={notice} />}
                {error && <Alert type="error" message={error} />}
              </div>
            )}

            {loading ? (
              <div className="mt-5">
                <LoadingState />
              </div>
            ) : (
              <div className="mt-5 min-w-0 pb-10">{children}</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}