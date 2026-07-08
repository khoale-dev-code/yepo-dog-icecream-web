import { Coffee, FolderPlus, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { api } from "../../lib/api";
import { notifyDataChanged } from "../../lib/dataSync";
import { CategoryPanel } from "./CategoryPanel";
import { MenuListPanel } from "./MenuListPanel";
import { ProductEditorPanel } from "./ProductEditorPanel";
import {
  buildProductPayload,
  createEmptyProductForm,
  getCategoryId,
  getId,
  getProductMedia,
  mapProductToForm,
} from "./menuUtils";

function CollapsibleMenuBlock({
  open,
  onToggle,
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#d8b77e]/80 bg-white shadow-[0_18px_60px_rgba(87,61,28,.07)]">
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-4 bg-gradient-to-br from-white to-[#f7efe3]/70 p-5 text-left transition hover:from-[#FFFAFA] hover:to-[#f7efe3]"
      >
        <div className="min-w-0">
          <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
            {eyebrow}
          </p>

          <h2 className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm font-normal leading-6 text-[#756144]">
              {description}
            </p>
          )}
        </div>

        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/70 transition group-hover:scale-105">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t border-[#d8b77e]/60 p-4 sm:p-5">
          {children}
        </div>
      )}
    </section>
  );
}

export function MenuManagerView() {
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const toast = useSnackbar();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [productForm, setProductForm] = useState(() =>
    createEmptyProductForm(1)
  );
  const [files, setFiles] = useState([]);
  const [editingProductId, setEditingProductId] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categoryMap = useMemo(() => {
    return categories.reduce((map, category) => {
      map[getId(category)] = category;
      return map;
    }, {});
  }, [categories]);

  const itemCountByCategory = useMemo(() => {
    return products.reduce((map, product) => {
      const categoryId = getCategoryId(product);
      if (!categoryId) return map;

      map[categoryId] = (map[categoryId] || 0) + 1;
      return map;
    }, {});
  }, [products]);

  const availableCount = products.filter((item) => item.isAvailable !== false).length;
  const featuredCount = products.filter((item) => item.isFeatured === true).length;

  const editingProduct = useMemo(() => {
    if (!editingProductId) return null;
    return products.find((product) => getId(product) === editingProductId) || null;
  }, [editingProductId, products]);

  const existingMedia = editingProduct ? getProductMedia(editingProduct) : [];

  async function loadData({ resetOrder = false } = {}) {
    setLoading(true);

    try {
      const [categoryRes, productRes] = await Promise.all([
        api.categories.list(),
        api.getProducts(),
      ]);

      const nextCategories = categoryRes.categories || [];
      const nextProducts = productRes.products || [];

      setCategories(nextCategories);
      setProducts(nextProducts);

      if (resetOrder && !editingProductId) {
        setProductForm((current) => ({
          ...current,
          sortOrder: String(nextProducts.length + 1),
        }));
      }
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu menu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData({ resetOrder: true });
  }, []);

  function resetProductForm(nextCount = products.length) {
    setProductForm(createEmptyProductForm(nextCount + 1));
    setFiles([]);
    setEditingProductId("");
  }

  async function handleCreateCategory(event) {
    event.preventDefault();

    const name = newCategoryName.trim();

    if (!name) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    setCategorySubmitting(true);

    try {
      await api.categories.create({
        name,
        sortOrder: categories.length + 1,
        isActive: true,
      });

      setNewCategoryName("");
      toast.success("Đã tạo danh mục mới.");
      await loadData();
      notifyDataChanged({ resource: "categories", action: "create" });
    } catch (error) {
      toast.error(error.message || "Không tạo được danh mục.");
    } finally {
      setCategorySubmitting(false);
    }
  }

  function handleStartEditCategory(category) {
    setEditingCategoryId(getId(category));
    setEditingCategoryName(category.name || "");
  }

  function handleCancelEditCategory() {
    setEditingCategoryId("");
    setEditingCategoryName("");
  }

  async function handleUpdateCategory(categoryId) {
    const name = editingCategoryName.trim();

    if (!name) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    setCategorySubmitting(true);

    try {
      await api.categories.update(categoryId, { name });
      handleCancelEditCategory();
      toast.success("Đã cập nhật danh mục.");
      await loadData();
      notifyDataChanged({ resource: "categories", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được danh mục.");
    } finally {
      setCategorySubmitting(false);
    }
  }

  async function handleToggleCategory(category) {
    try {
      await api.categories.update(getId(category), {
        isActive: category.isActive === false,
      });

      toast.success("Đã cập nhật trạng thái danh mục.");
      await loadData();
      notifyDataChanged({ resource: "categories", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được danh mục.");
    }
  }

  async function handleDeleteCategory(categoryId) {
    if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;

    try {
      await api.categories.remove(categoryId);
      toast.success("Đã xóa danh mục.");
      await loadData();
      notifyDataChanged({ resource: "categories", action: "delete" });
    } catch (error) {
      toast.error(error.message || "Không xóa được danh mục.");
    }
  }

  async function uploadMediaIfNeeded(currentMedia = []) {
    if (!files.length) return currentMedia;

    const result = await api.uploadMedia(files);

    return [...currentMedia, ...(result.media || [])];
  }

  async function handleSubmitProduct(event) {
    event.preventDefault();

    if (!productForm.name.trim()) {
      toast.error("Vui lòng nhập tên món.");
      return;
    }

    if (!productForm.categoryId) {
      toast.error("Vui lòng chọn danh mục.");
      return;
    }

    setProductSubmitting(true);

    try {
      const media = await uploadMediaIfNeeded(existingMedia);
      const payload = buildProductPayload(productForm, media);

      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        toast.success("Đã cập nhật món.");
        notifyDataChanged({ resource: "products", action: "update" });
      } else {
        await api.createProduct(payload);
        toast.success("Đã tạo món mới.");
        notifyDataChanged({ resource: "products", action: "create" });
      }

      const nextCount = editingProductId ? products.length : products.length + 1;
      resetProductForm(nextCount);
      setIsEditorOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.message || "Không lưu được món.");
    } finally {
      setProductSubmitting(false);
    }
  }

  function handleEditProduct(product) {
    setEditingProductId(getId(product));
    setProductForm(mapProductToForm(product));
    setFiles([]);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteProduct(productId) {
    if (!window.confirm("Bạn chắc chắn muốn xóa món này?")) return;

    try {
      await api.deleteProduct(productId);
      toast.success("Đã xóa món.");
      await loadData({ resetOrder: true });
      notifyDataChanged({ resource: "products", action: "delete" });
    } catch (error) {
      toast.error(error.message || "Không xóa được món.");
    }
  }

  async function handleToggleAvailable(product) {
    try {
      await api.updateProduct(getId(product), {
        isAvailable: product.isAvailable === false,
      });

      toast.success("Đã cập nhật trạng thái bán.");
      await loadData();
      notifyDataChanged({ resource: "products", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được trạng thái.");
    }
  }

  async function handleToggleFeatured(product) {
    try {
      await api.updateProduct(getId(product), {
        isFeatured: product.isFeatured !== true,
      });

      toast.success("Đã cập nhật món nổi bật.");
      await loadData();
      notifyDataChanged({ resource: "products", action: "update" });
    } catch (error) {
      toast.error(error.message || "Không cập nhật được món nổi bật.");
    }
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <section className="relative overflow-hidden rounded-[32px] border border-[#d8b77e]/80 bg-[#FFFAFA] p-4 shadow-[0_24px_80px_rgba(87,61,28,.08)] sm:p-5 xl:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#b98c49]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f] ring-1 ring-[#d8b77e]/70">
              <Sparkles size={15} />
              Hệ thống admin
            </p>

            <h1 className="font-sniglet mt-4 text-4xl leading-tight text-[#3b2a18] sm:text-5xl">
              Điều phối thực đơn
            </h1>

            <p className="mt-3 max-w-2xl text-sm font-normal leading-7 text-[#756144]">
              Tạo món, cập nhật ảnh, điều chỉnh giá và trạng thái hiển thị. Thứ tự hiển thị được tự động gợi ý theo số món hiện có.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[560px]">
            <SummaryCard icon={Coffee} label="Thực đơn" value={products.length} />
            <SummaryCard icon={FolderPlus} label="Danh mục" value={categories.length} />
            <SummaryCard icon={Sparkles} label="Còn bán" value={availableCount} />
            <SummaryCard icon={Star} label="Nổi bật" value={featuredCount} />
          </div>
        </div>
      </section>

      <div className="space-y-5 min-w-0 gap-5 2xl:-cols-[380px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-5">
          <CollapsibleMenuBlock
          open={categoryPanelOpen}
          onToggle={() => setCategoryPanelOpen((value) => !value)}
          eyebrow="Danh mục sản phẩm"
          title="Quản lý danh mục"
          description="Bấm mở khi cần thêm, sửa hoặc sắp xếp danh mục. Mặc định thu gọn để trang gọn hơn."
        >
          <CategoryPanel
            categories={categories}
            itemCountByCategory={itemCountByCategory}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            categorySubmitting={categorySubmitting}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            setEditingCategoryName={setEditingCategoryName}
            onCreateCategory={handleCreateCategory}
            onStartEdit={handleStartEditCategory}
            onCancelEdit={handleCancelEditCategory}
            onUpdateCategory={handleUpdateCategory}
            onToggleCategory={handleToggleCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </CollapsibleMenuBlock>


          <ProductEditorPanel
            form={productForm}
            setForm={setProductForm}
            files={files}
            setFiles={setFiles}
            existingMedia={existingMedia}
            isOpen={isEditorOpen}
            onToggleOpen={() => setIsEditorOpen((current) => !current)}
            categories={categories}
            editingId={editingProductId}
            submitting={productSubmitting}
            productCount={products.length}
            onSubmit={handleSubmitProduct}
            onCancel={() => {
              resetProductForm(products.length);
              setIsEditorOpen(false);
            }}
          />
        </aside>

        <MenuListPanel
          loading={loading}
          products={products}
          categories={categories}
          categoryMap={categoryMap}
          searchText={searchText}
          setSearchText={setSearchText}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleAvailable={handleToggleAvailable}
          onToggleFeatured={handleToggleFeatured}
        />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-[#d8b77e]/70 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f7efe3] text-[#b98c49]">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-xs font-normal text-[#756144]">{label}</p>
      <p className="font-sniglet mt-1 text-3xl leading-none text-[#3b2a18]">
        {value}
      </p>
    </div>
  );
}
