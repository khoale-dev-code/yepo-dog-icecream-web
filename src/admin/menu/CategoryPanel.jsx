import {
  ArrowDown,
  ArrowUp,
  Edit3,
  Eye,
  EyeOff,
  FolderPlus,
  GripVertical,
  Loader2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getId(item) {
  return String(item?._id || item?.id || "");
}

function getSafeCategoryId(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  return String(value?._id || value?.id || "");
}

function getCategoryName(item) {
  return item?.name || item?.title || "Danh mục";
}

function getCategoryDescription(item) {
  return item?.description || item?.note || "";
}

function getCategoryStatus(item) {
  return item?.isActive !== false;
}

function getSortValue(item, index = 999) {
  return Number(item?.sortOrder || item?.order || index + 1 || 999);
}

function sortCategories(categories = []) {
  return [...categories].sort((a, b) => {
    const sortA = getSortValue(a, 999);
    const sortB = getSortValue(b, 999);

    if (sortA !== sortB) return sortA - sortB;

    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getProductCategoryId(product) {
  const categoryId = product?.categoryId;
  const category = product?.category;

  if (categoryId && typeof categoryId === "object") {
    return String(categoryId._id || categoryId.id || "");
  }

  if (category && typeof category === "object") {
    return String(category._id || category.id || "");
  }

  return String(categoryId || "");
}

function getProductCategoryName(product) {
  const category = product?.category;
  const categoryId = product?.categoryId;

  if (category && typeof category === "object") {
    return category.name || category.title || "";
  }

  if (categoryId && typeof categoryId === "object") {
    return categoryId.name || categoryId.title || "";
  }

  return product?.category || product?.categoryName || "";
}

function readCountFromSource(source, category) {
  if (!source) return null;

  const id = getId(category);
  const name = getCategoryName(category);
  const slug = slugify(name);

  const keys = [
    id,
    name,
    name.toLowerCase(),
    slug,
    String(category?.slug || ""),
  ].filter(Boolean);

  if (source instanceof Map) {
    for (const key of keys) {
      const value = source.get(key);
      if (value !== undefined) return Number(value || 0);
    }
  }

  if (typeof source === "object") {
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined) return Number(value || 0);
    }
  }

  return null;
}

function countProducts(category, products = [], itemCountByCategory) {
  const countFromSource = readCountFromSource(itemCountByCategory, category);

  if (countFromSource !== null && Number.isFinite(countFromSource)) {
    return countFromSource;
  }

  const categoryId = getId(category);
  const categoryName = String(getCategoryName(category)).trim().toLowerCase();

  return products.filter((product) => {
    const productCategoryId = getProductCategoryId(product);
    const productCategoryName = String(getProductCategoryName(product))
      .trim()
      .toLowerCase();

    return (
      Boolean(categoryId && productCategoryId && categoryId === productCategoryId) ||
      Boolean(categoryName && productCategoryName && categoryName === productCategoryName)
    );
  }).length;
}

async function readApiError(response, fallback) {
  const data = await response.json().catch(() => ({}));
  return data.message || data.error || fallback;
}

async function saveCategoryOrder(ids) {
  const response = await fetch("/api/categories/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không lưu được thứ tự danh mục."));
  }

  return response.json();
}

export function CategoryPanel(props) {
  const categories = props.categories || props.items || [];
  const products = props.products || props.menuItems || props.itemsProducts || [];
  const itemCountByCategory = props.itemCountByCategory;

  const legacyMode =
    props.newCategoryName !== undefined ||
    props.editingCategoryName !== undefined ||
    Boolean(props.onCreateCategory) ||
    Boolean(props.onStartEdit);

  const form = props.form || props.categoryForm || props.draft || {};
  const setForm =
    props.setForm ||
    props.setCategoryForm ||
    props.setDraft ||
    (() => {});

  const editingId =
    props.editingId ||
    props.editingCategoryId ||
    props.editingCategory ||
    "";

  const submitting =
    props.submitting ||
    props.saving ||
    props.loading ||
    props.categorySubmitting ||
    false;

  const [orderedCategories, setOrderedCategories] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  const categorySignature = useMemo(() => {
    return categories
      .map((item, index) => {
        return [
          getId(item),
          getCategoryName(item),
          getSortValue(item, index),
          getCategoryStatus(item),
        ].join(":");
      })
      .join("|");
  }, [categories]);

  useEffect(() => {
    setOrderedCategories(sortCategories(categories));
  }, [categorySignature, categories]);

  function update(field, value) {
    if (legacyMode) {
      if (field === "name") {
        if (editingId && props.setEditingCategoryName) {
          props.setEditingCategoryName(value);
          return;
        }

        if (!editingId && props.setNewCategoryName) {
          props.setNewCategoryName(value);
          return;
        }
      }

      return;
    }

    if (props.updateForm) {
      props.updateForm(field, value);
      return;
    }

    if (props.onUpdate) {
      props.onUpdate(field, value);
      return;
    }

    if (props.updateCategoryForm) {
      props.updateCategoryForm(field, value);
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getDraftName() {
    if (legacyMode) {
      return editingId ? props.editingCategoryName || "" : props.newCategoryName || "";
    }

    return form.name || "";
  }

  function getDraftDescription() {
    if (legacyMode) return "";
    return form.description || "";
  }

  function getDraftSortOrder() {
    if (legacyMode) return "";
    return form.sortOrder || form.order || "";
  }

  function getDraftActive() {
    if (legacyMode) return true;
    return form.isActive !== false;
  }

  function handleSubmit(event) {
    if (legacyMode) {
      event.preventDefault();

      if (editingId && props.onUpdateCategory) {
        const categoryId = getSafeCategoryId(editingId);

        if (!categoryId) {
          setNotice({
            type: "error",
            text: "Không tìm thấy ID danh mục để cập nhật.",
          });
          return;
        }

        props.onUpdateCategory(categoryId);
        return;
      }

      if (!editingId && props.onCreateCategory) {
        props.onCreateCategory(event);
        return;
      }
    }

    if (props.onSubmit) {
      props.onSubmit(event);
      return;
    }

    if (props.onCategorySubmit) {
      props.onCategorySubmit(event);
      return;
    }

    event.preventDefault();
  }

  function handleCancel() {
    if (legacyMode && props.onCancelEdit) {
      props.onCancelEdit();
      return;
    }

    if (props.onCancel) {
      props.onCancel();
      return;
    }

    if (props.cancelEdit) {
      props.cancelEdit();
    }
  }

  function handleEdit(category) {
    if (legacyMode && props.onStartEdit) {
      props.onStartEdit(category);
      return;
    }

    if (props.onEdit) {
      props.onEdit(category);
      return;
    }

    if (props.onEditCategory) {
      props.onEditCategory(category);
    }
  }

  function handleDelete(category) {
    const id = getId(category);

    if (legacyMode && props.onDeleteCategory) {
      props.onDeleteCategory(id);
      return;
    }

    if (props.onDelete) {
      props.onDelete(id);
      return;
    }

    if (props.deleteCategory) {
      props.deleteCategory(id);
    }
  }

  function handleToggle(category) {
    const id = getSafeCategoryId(category);

    if (!id) {
      setNotice({
        type: "error",
        text: "Không tìm thấy ID danh mục để cập nhật.",
      });
      return;
    }

    if (legacyMode && props.onToggleCategory) {
      props.onToggleCategory(category);
      return;
    }

    if (props.onToggle) {
      props.onToggle(id, category);
      return;
    }

    if (props.onToggleCategory) {
      props.onToggleCategory(id);
    }
  }

  async function persistOrder(nextItems) {
    const ids = nextItems.map(getId).filter(Boolean);

    if (ids.length === 0) return;

    try {
      setReordering(true);
      setNotice({ type: "", text: "" });

      const result = await saveCategoryOrder(ids);

      if (Array.isArray(result)) {
        setOrderedCategories(sortCategories(result));
      }

      window.dispatchEvent(new Event("yepo:data-changed"));

      if (props.onReorder) props.onReorder(result);
      if (props.onRefresh) props.onRefresh();
      if (props.loadData) props.loadData();

      setNotice({
        type: "success",
        text: "Đã lưu thứ tự danh mục.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Không lưu được thứ tự danh mục.",
      });
    } finally {
      setReordering(false);
    }
  }

  function moveCategory(fromIndex, toIndex) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= orderedCategories.length ||
      toIndex >= orderedCategories.length
    ) {
      return;
    }

    const nextItems = [...orderedCategories];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);

    const withOrder = nextItems.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
      order: index + 1,
    }));

    setOrderedCategories(withOrder);
    persistOrder(withOrder);
  }

  function handleDragStart(index) {
    setDragIndex(index);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(index) {
    if (dragIndex === null) return;

    moveCategory(dragIndex, index);
    setDragIndex(null);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-[24px] border border-[#d8b77e]/70 bg-[#FFFAFA] p-4"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#b98c49] text-white">
            <FolderPlus size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-black text-[#3b2a18]">
              {editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#756144]">
              Tạo nhóm món như Coffee, Matcha, Kem cún. Có thể kéo thả thứ tự danh mục ở danh sách bên dưới.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
          <label className="block">
            <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
              Tên danh mục
            </span>

            <input
              value={getDraftName()}
              onChange={(event) => update("name", event.target.value)}
              required
              placeholder="Ví dụ: Coffee, Matcha, Kem cún..."
              className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
            />
          </label>

          {!legacyMode && (
            <label className="block">
              <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                Thứ tự
              </span>

              <input
                value={getDraftSortOrder()}
                onChange={(event) =>
                  update("sortOrder", event.target.value.replace(/[^\\d]/g, ""))
                }
                inputMode="numeric"
                placeholder="Tự động"
                className="h-12 w-full rounded-2xl border border-[#d8b77e] bg-white px-4 text-sm text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />
            </label>
          )}

          {!legacyMode && (
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-brand text-[#3b2a18]">
                Mô tả ngắn
              </span>

              <textarea
                value={getDraftDescription()}
                onChange={(event) => update("description", event.target.value)}
                rows={3}
                placeholder="Mô tả ngắn cho danh mục nếu cần..."
                className="w-full resize-none rounded-2xl border border-[#d8b77e] bg-white px-4 py-3 text-sm leading-6 text-[#3b2a18] outline-none transition placeholder:text-neutral-400 focus:border-[#b98c49] focus:ring-4 focus:ring-[#b98c49]/10"
              />
            </label>
          )}

          {!legacyMode && (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#d8b77e] bg-white p-4 text-sm font-brand text-[#3b2a18] transition hover:bg-[#f7efe3] sm:col-span-2">
              Hiển thị danh mục

              <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-neutral-200 transition has-[:checked]:bg-[#b98c49]">
                <input
                  type="checkbox"
                  checked={getDraftActive()}
                  onChange={(event) => update("isActive", event.target.checked)}
                  className="peer sr-only"
                />

                <span className="ml-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </span>
            </label>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-brand text-[#756144] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3]"
            >
              <X size={16} />
              Hủy sửa
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#b98c49] px-5 text-sm font-brand uppercase tracking-[0.08em] text-white transition hover:bg-[#8c672f] disabled:opacity-60"
          >
            {submitting ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            {editingId ? "Cập nhật" : "Thêm danh mục"}
          </button>
        </div>
      </form>

      <section className="rounded-[24px] border border-[#d8b77e]/70 bg-white p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-brand uppercase tracking-[0.14em] text-[#8c672f]">
              Kéo thả thứ tự
            </p>

            <h3 className="mt-1 text-xl font-black text-[#3b2a18]">
              Danh sách danh mục
            </h3>
          </div>

          <span className="rounded-full bg-[#f7efe3] px-3 py-1.5 text-xs font-bold text-[#8c672f]">
            {orderedCategories.length} danh mục
          </span>
        </div>

        {notice.text && (
          <div
            className={cn(
              "mb-3 rounded-2xl border px-4 py-3 text-sm font-bold",
              notice.type === "error"
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            )}
          >
            {notice.text}
          </div>
        )}

        {orderedCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8b77e] bg-[#FFFAFA] p-6 text-center text-sm text-[#756144]">
            Chưa có danh mục nào.
          </div>
        ) : (
          <div className="space-y-2">
            {orderedCategories.map((category, index) => {
              const active = getCategoryStatus(category);
              const productCount = countProducts(category, products, itemCountByCategory);

              return (
                <article
                  key={getId(category) || index}
                  draggable={!reordering}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "grid gap-3 rounded-2xl border bg-[#FFFAFA] p-3 transition sm:grid-cols-[44px_minmax(0,1fr)_auto]",
                    dragIndex === index
                      ? "border-[#b98c49] opacity-70 ring-4 ring-[#b98c49]/10"
                      : "border-[#d8b77e]/80 hover:border-[#b98c49]/60 hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-2 sm:justify-center">
                    <button
                      type="button"
                      className="grid h-10 w-10 cursor-grab place-items-center rounded-2xl bg-white text-[#b98c49] ring-1 ring-[#d8b77e]/80 active:cursor-grabbing"
                      title="Kéo để đổi thứ tự"
                    >
                      <GripVertical size={18} />
                    </button>

                    <span className="text-sm font-black text-[#8c672f] sm:hidden">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="truncate text-base font-black text-[#3b2a18]">
                        {getCategoryName(category)}
                      </h4>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#8c672f] ring-1 ring-[#d8b77e]/70">
                        #{index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggle(category)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition",
                          active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        )}
                      >
                        {active ? <Eye size={12} /> : <EyeOff size={12} />}
                        {active ? "Đang hiện" : "Đang ẩn"}
                      </button>

                      <span className="rounded-full bg-[#f7efe3] px-2.5 py-1 text-[11px] font-bold text-[#8c672f]">
                        {productCount} món
                      </span>
                    </div>

                    {getCategoryDescription(category) && (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#756144]">
                        {getCategoryDescription(category)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => moveCategory(index, index - 1)}
                      disabled={index === 0 || reordering}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-40"
                      title="Đưa lên"
                    >
                      <ArrowUp size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveCategory(index, index + 1)}
                      disabled={index === orderedCategories.length - 1 || reordering}
                      className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3] disabled:cursor-not-allowed disabled:opacity-40"
                      title="Đưa xuống"
                    >
                      <ArrowDown size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEdit(category)}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-3 text-sm font-bold text-[#8c672f] ring-1 ring-[#d8b77e] transition hover:bg-[#f7efe3]"
                    >
                      <Edit3 size={15} />
                      Sửa
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl bg-red-50 px-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default CategoryPanel;
