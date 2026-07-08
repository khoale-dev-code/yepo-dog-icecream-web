import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { notifyDataChanged } from "../../lib/dataSync";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { EMPTY_FORMS } from "../config/adminConfig";
import {
  buildPayload,
  cloneEmptyForms,
  createDefaultAdminData,
  getId,
  mapItemToForm,
  toNumber,
} from "../utils/adminUtils";

const RESOURCE_API = {
  products: {
    create: api.createProduct,
    update: api.updateProduct,
    remove: api.deleteProduct,
  },
  toppings: api.toppings,
  dogs: api.dogs,
  posts: api.posts,
  promotions: api.promotions,
  reservations: api.reservations,
};

const RESOURCE_LABEL = {
  products: "menu",
  toppings: "topping",
  dogs: "hồ sơ cún",
  posts: "bài đăng",
  promotions: "khuyến mãi",
  reservations: "đặt bàn",
};

export function useAdminDashboard() {
  const toast = useSnackbar();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(createDefaultAdminData);
  const [forms, setForms] = useState(cloneEmptyForms);
  const [files, setFiles] = useState({});
  const [editing, setEditing] = useState({});
  const [shopForm, setShopForm] = useState({});
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function loadAdminData({ silent = false } = {}) {
    if (!silent) {
      setLoading(true);
    }

    setError("");

    try {
      const [
        shopRes,
        summaryRes,
        productsRes,
        toppingsRes,
        dogsRes,
        postsRes,
        promotionsRes,
        reservationsRes,
      ] = await Promise.all([
        api.getShop(),
        api.getAdminSummary(),
        api.getProducts(),
        api.toppings.list(),
        api.dogs.list(),
        api.posts.list(),
        api.promotions.list(),
        api.reservations.list(),
      ]);

      const nextData = {
        shop: shopRes.shop || null,
        summary: summaryRes.summary || {},
        latestReservations: summaryRes.latestReservations || [],
        products: productsRes.products || [],
        toppings: toppingsRes.toppings || [],
        dogs: dogsRes.dogs || [],
        posts: postsRes.posts || [],
        promotions: promotionsRes.promotions || [],
        reservations: reservationsRes.reservations || [],
      };

      setData(nextData);
      setShopForm(nextData.shop || {});
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu admin.");
      toast.error(err.message || "Không tải được dữ liệu admin.");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function updateForm(resource, field, value) {
    setForms((current) => ({
      ...current,
      [resource]: {
        ...current[resource],
        [field]: value,
      },
    }));
  }

  function updateFiles(resource, nextFiles) {
    setFiles((current) => ({
      ...current,
      [resource]: nextFiles,
    }));
  }

  function resetResource(resource) {
    setForms((current) => ({
      ...current,
      [resource]: structuredClone(EMPTY_FORMS[resource]),
    }));

    setFiles((current) => ({
      ...current,
      [resource]: [],
    }));

    setEditing((current) => ({
      ...current,
      [resource]: "",
    }));
  }

  async function uploadResourceMedia(resource) {
    const selectedFiles = files[resource] || [];

    if (!selectedFiles.length) return [];

    const result = await api.uploadMedia(selectedFiles);

    return result.media || [];
  }

  async function saveResource(resource, event) {
    event.preventDefault();

    const currentApi = RESOURCE_API[resource];
    const editingId = editing[resource];

    const existingItem = editingId
      ? data[resource].find((item) => getId(item) === editingId)
      : null;

    const label = RESOURCE_LABEL[resource] || "dữ liệu";

    setSaving(true);
    setError("");

    try {
      const uploadedMedia = await uploadResourceMedia(resource);
      const existingMedia = existingItem?.media || [];

      const media = uploadedMedia.length
        ? [...existingMedia, ...uploadedMedia]
        : existingMedia;

      const payload = buildPayload(resource, forms[resource], media);

      if (editingId) {
        await currentApi.update(editingId, payload);
        notifyDataChanged({ resource, action: "update" });
        flash("Đã cập nhật dữ liệu.");
        toast.success(`Đã cập nhật ${label}.`);
      } else {
        await currentApi.create(payload);
        notifyDataChanged({ resource, action: "create" });
        flash("Đã thêm dữ liệu mới.");
        toast.success(`Đã tạo ${label} mới.`);
      }

      resetResource(resource);
      await loadAdminData({ silent: true });
    } catch (err) {
      const message = err.message || "Không lưu được dữ liệu.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(resource, id) {
    if (!window.confirm("Bạn chắc chắn muốn xóa mục này?")) return;

    const label = RESOURCE_LABEL[resource] || "dữ liệu";

    setSaving(true);
    setError("");

    try {
      await RESOURCE_API[resource].remove(id);
      notifyDataChanged({ resource, action: "delete" });
      flash("Đã xóa thành công.");
      toast.success(`Đã xóa ${label}.`);
      await loadAdminData({ silent: true });
    } catch (err) {
      const message = err.message || "Không xóa được dữ liệu.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function editResource(resource, item) {
    setActiveTab(resource);

    setEditing((current) => ({
      ...current,
      [resource]: getId(item),
    }));

    setForms((current) => ({
      ...current,
      [resource]: mapItemToForm(resource, item),
    }));

    setFiles((current) => ({
      ...current,
      [resource]: [],
    }));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveShop(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...shopForm,
        stats: {
          dogs: toNumber(shopForm?.stats?.dogs),
          flavors: toNumber(shopForm?.stats?.flavors),
          dailyHours: toNumber(shopForm?.stats?.dailyHours),
        },
      };

      const result = await api.updateShop(payload);

      notifyDataChanged({ resource: "shop", action: "update" });

      setData((current) => ({
        ...current,
        shop: result.shop,
      }));

      setShopForm(result.shop || {});
      flash("Đã cập nhật cửa hàng.");
      toast.success("Đã cập nhật thông tin cửa hàng.");
    } catch (err) {
      const message = err.message || "Không lưu được cửa hàng.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadShopImage(field, selectedFiles) {
    if (!selectedFiles?.length) return;

    setSaving(true);
    setError("");

    try {
      const result = await api.uploadMedia(selectedFiles);
      const url = result.media?.[0]?.url || "";

      setShopForm((current) => ({
        ...current,
        [field]: url,
      }));

      flash("Đã upload ảnh. Bấm lưu cửa hàng để áp dụng.");
      toast.success("Upload ảnh thành công. Bấm lưu để áp dụng.");
    } catch (err) {
      const message = err.message || "Không upload được ảnh.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function updateReservationStatus(item, status) {
    setSaving(true);
    setError("");

    try {
      await api.reservations.update(getId(item), { status });

      notifyDataChanged({
        resource: "reservations",
        action: "update",
      });

      flash("Đã cập nhật trạng thái đặt bàn.");
      toast.success("Đã cập nhật trạng thái đặt bàn.");
      await loadAdminData({ silent: true });
    } catch (err) {
      const message = err.message || "Không cập nhật được trạng thái.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const visibleItems = useMemo(() => {
    const items = data[activeTab] || [];
    const keyword = query.trim().toLowerCase();

    if (!keyword) return items;

    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(keyword)
    );
  }, [activeTab, data, query]);

  return {
    activeTab,
    setActiveTab,

    data,
    forms,
    files,
    editing,
    shopForm,
    setShopForm,
    query,
    setQuery,

    loading,
    saving,
    notice,
    error,

    visibleItems,

    loadAdminData,
    updateForm,
    updateFiles,
    saveResource,
    deleteResource,
    editResource,
    resetResource,
    saveShop,
    uploadShopImage,
    updateReservationStatus,
  };
}
