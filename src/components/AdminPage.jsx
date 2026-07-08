import { AdminShell } from "../admin/components/AdminShell";
import { ProtectedAdmin } from "../admin/components/ProtectedAdmin";
import { RESOURCE_CONFIG } from "../admin/config/adminConfig";
import { DogManagerView } from "../admin/dogs/DogManagerView";
import { useAdminDashboard } from "../admin/hooks/useAdminDashboard";
import { useReservationWatcher } from "../admin/hooks/useReservationWatcher";
import { MenuManagerView } from "../admin/menu/MenuManagerView";
import { PostManagerView } from "../admin/posts/PostManagerView.jsx";
import { PromotionManagerView } from "../admin/promotions/PromotionManagerView.jsx";
import { ReservationManagerView } from "../admin/reservations/ReservationManagerView.jsx";
import { ToppingManagerView } from "../admin/toppings/ToppingManagerView.jsx";
import { DashboardView } from "../admin/views/DashboardView";
import { ResourceView } from "../admin/views/ResourceView";
import { ShopView } from "../admin/views/ShopView";

export default function AdminPage() {
  return (
    <ProtectedAdmin>
      {({ admin, logout }) => <AdminContent admin={admin} logout={logout} />}
    </ProtectedAdmin>
  );
}

function AdminContent({ admin, logout }) {
  const adminDashboard = useAdminDashboard();

  const isDashboardTab = adminDashboard.activeTab === "dashboard";
  const isShopTab = adminDashboard.activeTab === "shop";
  const isMenuTab = adminDashboard.activeTab === "products";
  const isToppingsTab = adminDashboard.activeTab === "toppings";
  const isPostsTab = adminDashboard.activeTab === "posts";
  const isReservationsTab = adminDashboard.activeTab === "reservations";
  const isDogsTab = adminDashboard.activeTab === "dogs";
  const isPromotionsTab = adminDashboard.activeTab === "promotions";

  const activeResourceConfig = RESOURCE_CONFIG[adminDashboard.activeTab];

  useReservationWatcher({
    enabled: Boolean(admin),
    intervalMs: 18000,
  });

  return (
    <AdminShell
      activeTab={adminDashboard.activeTab}
      setActiveTab={adminDashboard.setActiveTab}
      shop={adminDashboard.data.shop}
      loading={adminDashboard.loading}
      saving={adminDashboard.saving}
      notice={adminDashboard.notice}
      error={adminDashboard.error}
      onRefresh={adminDashboard.loadAdminData}
      admin={admin}
      onLogout={logout}
    >
      {isDashboardTab && (
        <DashboardView
          summary={adminDashboard.data.summary}
          latestReservations={adminDashboard.data.latestReservations}
          products={adminDashboard.data.products}
          promotions={adminDashboard.data.promotions}
        />
      )}

      {isShopTab && (
        <ShopView
          form={adminDashboard.shopForm}
          setForm={adminDashboard.setShopForm}
          saving={adminDashboard.saving}
          onSubmit={adminDashboard.saveShop}
          onUpload={adminDashboard.uploadShopImage}
        />
      )}

      {isMenuTab && <MenuManagerView />}

      {isToppingsTab && <ToppingManagerView />}

      {isPostsTab && <PostManagerView />}

      {isReservationsTab && <ReservationManagerView />}

      {isDogsTab && <DogManagerView />}

      {isPromotionsTab && <PromotionManagerView />}

      {activeResourceConfig &&
        !isMenuTab &&
        !isToppingsTab &&
        !isPostsTab &&
        !isReservationsTab &&
        !isDogsTab &&
        !isPromotionsTab && (
          <ResourceView
            resource={adminDashboard.activeTab}
            config={activeResourceConfig}
            form={adminDashboard.forms[adminDashboard.activeTab]}
            files={adminDashboard.files[adminDashboard.activeTab] || []}
            items={adminDashboard.visibleItems}
            query={adminDashboard.query}
            editingId={adminDashboard.editing[adminDashboard.activeTab]}
            saving={adminDashboard.saving}
            setQuery={adminDashboard.setQuery}
            setFiles={(nextFiles) =>
              adminDashboard.updateFiles(adminDashboard.activeTab, nextFiles)
            }
            updateForm={adminDashboard.updateForm}
            onSubmit={(event) =>
              adminDashboard.saveResource(adminDashboard.activeTab, event)
            }
            onCancel={() => adminDashboard.resetResource(adminDashboard.activeTab)}
            onEdit={(item) =>
              adminDashboard.editResource(adminDashboard.activeTab, item)
            }
            onDelete={(id) =>
              adminDashboard.deleteResource(adminDashboard.activeTab, id)
            }
            onReservationStatus={adminDashboard.updateReservationStatus}
          />
        )}
    </AdminShell>
  );
}
