export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getId(item) {
  return item?._id || item?.id || "";
}

export function getCategoryId(product) {
  if (!product?.categoryId) return "";

  if (typeof product.categoryId === "object") {
    return product.categoryId._id || product.categoryId.id || "";
  }

  return product.categoryId;
}

export function getCategoryName(product, categoryMap = {}) {
  const categoryId = getCategoryId(product);

  return (
    categoryMap[categoryId]?.name ||
    product.categoryId?.name ||
    product.category ||
    "Chưa có danh mục"
  );
}

export function toNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

export function formatPrice(value) {
  return Number(value || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export function formatVndInput(value) {
  const number = toNumber(value);

  if (!number) return "";

  return number.toLocaleString("vi-VN");
}

export function getProductMedia(product) {
  const media = Array.isArray(product?.media) ? product.media : [];

  if (media.length) return media;

  if (product?.imageUrl) {
    return [
      {
        url: product.imageUrl,
        resourceType: "image",
        originalName: product.name || "Món",
      },
    ];
  }

  return [];
}

export function getDisplayPrice(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const sizePrices = sizes
    .map((size) => Number(size.price || 0))
    .filter((price) => price > 0);

  if (sizePrices.length) return Math.min(...sizePrices);

  return Number(product?.price || 0);
}

export function getDisplayOldPrice(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const sizeOldPrices = sizes
    .map((size) => Number(size.oldPrice || 0))
    .filter((price) => price > 0);

  if (sizeOldPrices.length) return Math.min(...sizeOldPrices);

  return Number(product?.oldPrice || 0);
}

export function createEmptyProductForm(sortOrder = 1) {
  return {
    name: "",
    categoryId: "",
    description: "",
    price: "",
    oldPrice: "",
    tags: "",
    sortOrder: String(sortOrder),
    isFeatured: false,
    isAvailable: true,
    sizes: [],
  };
}

export function mapProductToForm(product) {
  return {
    name: product.name || "",
    categoryId: getCategoryId(product),
    description: product.description || "",
    price: formatVndInput(product.price),
    oldPrice: formatVndInput(product.oldPrice),
    tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
    sortOrder: product.sortOrder ?? "999",
    isFeatured: product.isFeatured === true,
    isAvailable: product.isAvailable !== false,
    sizes: Array.isArray(product.sizes)
      ? product.sizes.map((size) => ({
          name: size.name || "",
          price: formatVndInput(size.price),
          oldPrice: formatVndInput(size.oldPrice),
          isDefault: size.isDefault === true,
        }))
      : [],
  };
}

export function buildProductPayload(form, media) {
  return {
    name: form.name.trim(),
    categoryId: form.categoryId || null,
    description: form.description.trim(),
    price: toNumber(form.price),
    oldPrice: toNumber(form.oldPrice),
    tags: String(form.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    sortOrder: toNumber(form.sortOrder || 999),
    isFeatured: Boolean(form.isFeatured),
    isAvailable: Boolean(form.isAvailable),
    sizes: form.sizes
      .map((size) => ({
        name: String(size.name || "").trim(),
        price: toNumber(size.price),
        oldPrice: toNumber(size.oldPrice),
        isDefault: Boolean(size.isDefault),
      }))
      .filter((size) => size.name),
    media,
  };
}
