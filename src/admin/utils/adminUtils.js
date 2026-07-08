import { DOG_GENDER_OPTIONS, EMPTY_FORMS, RESERVATION_STATUS } from "../config/adminConfig";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function getId(item) {
  return item?._id || item?.id;
}

export function toNumber(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export function getThumb(item) {
  return item?.media?.[0]?.url || item?.imageUrl || "";
}

export function cloneEmptyForms() {
  return structuredClone(EMPTY_FORMS);
}

export function createDefaultAdminData() {
  return {
    shop: null,
    summary: {},
    latestReservations: [],
    products: [],
    toppings: [],
    dogs: [],
    posts: [],
    promotions: [],
    reservations: [],
  };
}

export function getReservationLabel(status) {
  return (
    RESERVATION_STATUS.find((item) => item.value === status)?.label ||
    status ||
    "Không rõ"
  );
}

export function getDogGenderLabel(gender) {
  return (
    DOG_GENDER_OPTIONS.find((item) => item.value === gender)?.label ||
    "Chưa rõ"
  );
}

export function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function mapItemToForm(resource, item) {
  if (!item) return structuredClone(EMPTY_FORMS[resource]);

  if (resource === "products") {
    return {
      name: item.name || "",
      category: item.category || "Ice Cream",
      description: item.description || "",
      price: item.price || "",
      oldPrice: item.oldPrice || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
      sortOrder: item.sortOrder ?? "999",
      isFeatured: item.isFeatured === true,
      isAvailable: item.isAvailable !== false,
    };
  }

  if (resource === "toppings") {
    return {
      name: item.name || "",
      category: item.category || "Topping",
      description: item.description || "",
      price: item.price || "",
      sortOrder: item.sortOrder ?? "999",
      isAvailable: item.isAvailable !== false,
    };
  }

  if (resource === "dogs") {
    return {
      name: item.name || "",
      nickname: item.nickname || "",
      age: item.age || "",
      breed: item.breed || "",
      coatColor: item.coatColor || "",
      gender: item.gender || "unknown",
      personality: item.personality || "",
      favoriteTreat: item.favoriteTreat || "",
      interactionNote: item.interactionNote || "",
      birthday: item.birthday || "",
      weight: item.weight || "",
      sortOrder: item.sortOrder ?? "999",
      isFeatured: item.isFeatured === true,
      isActive: item.isActive !== false,
    };
  }

  if (resource === "posts") {
    return {
      title: item.title || "",
      caption: item.caption || "",
      instagramUrl: item.instagramUrl || "",
      isPublished: item.isPublished !== false,
      isPinned: item.isPinned === true,
    };
  }

  if (resource === "promotions") {
    return {
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      code: item.code || "",
      discountText: item.discountText || "",
      startAt: toDateInput(item.startAt),
      endAt: toDateInput(item.endAt),
      sortOrder: item.sortOrder ?? "999",
      isActive: item.isActive !== false,
    };
  }

  return {
    customerName: item.customerName || "",
    phone: item.phone || "",
    date: item.date || "",
    time: item.time || "",
    guestCount: item.guestCount || "2",
    note: item.note || "",
    status: item.status || "pending",
  };
}

export function buildPayload(resource, form, media = []) {
  if (resource === "products") {
    return {
      name: form.name.trim(),
      category: form.category.trim(),
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
      media,
    };
  }

  if (resource === "toppings") {
    return {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: toNumber(form.price),
      sortOrder: toNumber(form.sortOrder || 999),
      isAvailable: Boolean(form.isAvailable),
    };
  }

  if (resource === "dogs") {
    return {
      name: form.name.trim(),
      nickname: form.nickname.trim(),
      age: form.age.trim(),
      breed: form.breed.trim(),
      coatColor: form.coatColor.trim(),
      gender: form.gender || "unknown",
      personality: form.personality.trim(),
      favoriteTreat: form.favoriteTreat.trim(),
      interactionNote: form.interactionNote.trim(),
      birthday: form.birthday.trim(),
      weight: form.weight.trim(),
      sortOrder: toNumber(form.sortOrder || 999),
      isFeatured: Boolean(form.isFeatured),
      isActive: Boolean(form.isActive),
      media,
    };
  }

  if (resource === "posts") {
    return {
      title: form.title.trim(),
      caption: form.caption.trim(),
      instagramUrl: form.instagramUrl.trim(),
      isPublished: Boolean(form.isPublished),
      isPinned: Boolean(form.isPinned),
      media,
    };
  }

  if (resource === "promotions") {
    return {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      code: form.code.trim(),
      discountText: form.discountText.trim(),
      startAt: form.startAt || "",
      endAt: form.endAt || "",
      sortOrder: toNumber(form.sortOrder || 999),
      isActive: Boolean(form.isActive),
      media,
    };
  }

  return {
    customerName: form.customerName.trim(),
    phone: form.phone.trim(),
    date: form.date,
    time: form.time,
    guestCount: toNumber(form.guestCount || 1),
    note: form.note.trim(),
    status: form.status,
  };
}

export function getGenericMeta(item, resource) {
  if (resource === "toppings") {
    return `${item.category || "Topping"} · ${formatMoney(item.price)} · ${
      item.isAvailable === false ? "Tạm hết" : "Còn bán"
    }`;
  }

  if (resource === "dogs") {
    return [
      item.breed,
      item.age,
      getDogGenderLabel(item.gender),
      item.coatColor,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (resource === "posts") {
    return item.caption || item.instagramUrl || "Bài viết chưa có mô tả.";
  }

  if (resource === "promotions") {
    return (
      [item.subtitle, item.discountText, item.code].filter(Boolean).join(" · ") ||
      "Khuyến mãi"
    );
  }

  return item.description || "Chưa có mô tả.";
}
