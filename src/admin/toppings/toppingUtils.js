export const EMPTY_TOPPING_FORM = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  media: [],
  sortOrder: "",
  isAvailable: true,
  isActive: true,
};

const IMAGE_FIELDS = [
  "imageUrl",
  "image",
  "photoUrl",
  "thumbnailUrl",
  "coverUrl",
  "coverImageUrl",
  "url",
  "src",
];

export function getId(item) {
  return item?._id || item?.id || "";
}

export function formatPrice(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function getMediaUrl(media) {
  if (!media) return "";

  if (typeof media === "string") {
    return media;
  }

  return (
    media.url ||
    media.secureUrl ||
    media.secure_url ||
    media.src ||
    media.imageUrl ||
    ""
  );
}

export function isVideoMedia(media) {
  const resourceType = String(media?.resourceType || media?.type || "").toLowerCase();
  const url = String(getMediaUrl(media)).toLowerCase();

  return (
    resourceType === "video" ||
    url.includes(".mp4") ||
    url.includes(".webm") ||
    url.includes(".mov") ||
    url.includes(".m4v")
  );
}

export function normalizeToppingMedia(media = []) {
  if (!Array.isArray(media)) return [];

  return media
    .map((item) => {
      if (typeof item === "string") {
        return {
          url: item,
          resourceType: "image",
          publicId: "",
          originalName: "",
        };
      }

      const url = getMediaUrl(item);

      if (!url) return null;

      return {
        url,
        publicId: item.publicId || item.public_id || "",
        resourceType: item.resourceType || item.resource_type || item.type || "image",
        originalName: item.originalName || item.original_name || item.name || "",
      };
    })
    .filter(Boolean);
}

export function getToppingImage(topping) {
  if (!topping) return "";

  for (const field of IMAGE_FIELDS) {
    const value = topping[field];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const media = normalizeToppingMedia(topping.media);

  const firstImage = media.find((item) => !isVideoMedia(item));

  return firstImage?.url || "";
}

export function isToppingVisible(topping) {
  return topping?.isActive !== false && topping?.isAvailable !== false;
}

export function mapToppingToForm(topping) {
  const media = normalizeToppingMedia(topping.media);
  const imageUrl = getToppingImage({
    ...topping,
    media,
  });

  return {
    name: topping.name || "",
    description: topping.description || "",
    price: String(topping.price ?? ""),
    imageUrl,
    media,
    sortOrder: String(topping.sortOrder ?? ""),
    isAvailable: topping.isAvailable !== false,
    isActive: topping.isActive !== false,
  };
}

export function buildToppingPayload(form) {
  const media = normalizeToppingMedia(form.media);
  const imageUrl = String(form.imageUrl || getToppingImage({ ...form, media }) || "").trim();

  const nextMedia =
    imageUrl && media.length === 0
      ? [
          {
            url: imageUrl,
            publicId: "",
            resourceType: "image",
            originalName: "URL image",
          },
        ]
      : media;

  return {
    name: String(form.name || "").trim(),
    description: String(form.description || "").trim(),
    price: Number(form.price || 0),
    imageUrl,
    image: imageUrl,
    thumbnailUrl: imageUrl,
    media: nextMedia,
    sortOrder: Number(form.sortOrder || 999),
    isAvailable: form.isAvailable !== false,
    isActive: form.isActive !== false,
  };
}

async function readApiError(response, fallbackMessage) {
  const error = await response.json().catch(() => ({}));
  return error.message || fallbackMessage;
}

export async function requestToppings(api) {
  if (api.toppings?.list) {
    const result = await api.toppings.list();

    const toppings = Array.isArray(result)
      ? result
      : result.toppings || result.data || [];

    return toppings.map((item) => ({
      ...item,
      imageUrl: getToppingImage(item),
      media: normalizeToppingMedia(item.media),
    }));
  }

  const response = await fetch("/api/toppings", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tải được danh sách topping."));
  }

  const toppings = await response.json();

  return toppings.map((item) => ({
    ...item,
    imageUrl: getToppingImage(item),
    media: normalizeToppingMedia(item.media),
  }));
}

export async function createTopping(api, payload) {
  if (api.toppings?.create) return api.toppings.create(payload);

  const response = await fetch("/api/toppings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không tạo được topping."));
  }

  return response.json();
}

export async function updateTopping(api, id, payload) {
  if (api.toppings?.update) return api.toppings.update(id, payload);

  const response = await fetch(`/api/toppings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không cập nhật được topping."));
  }

  return response.json();
}

export async function deleteTopping(api, id) {
  if (api.toppings?.remove) return api.toppings.remove(id);
  if (api.toppings?.delete) return api.toppings.delete(id);

  const response = await fetch(`/api/toppings/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Không xóa được topping."));
  }

  return response.json();
}
