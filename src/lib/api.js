const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const method = options.method || "GET";
  const isFormData = options.body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      credentials: "include",
      cache: method === "GET" ? "no-store" : "default",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "Không kết nối được API. Hãy kiểm tra backend Express đã chạy ở http://localhost:4000 chưa."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Không thể kết nối API.");
  }

  return data;
}

function toQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  return query.toString();
}

function crud(path) {
  return {
    list(params = {}) {
      const query = toQuery(params);
      return request(`${path}${query ? `?${query}` : ""}`);
    },

    create(payload) {
      return request(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    update(id, payload) {
      return request(`${path}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },

    remove(id) {
      return request(`${path}/${id}`, {
        method: "DELETE",
      });
    },
  };
}

export const api = {
  loginAdmin(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logoutAdmin() {
    return request("/auth/logout", {
      method: "POST",
    });
  },

  getCurrentAdmin() {
    return request("/auth/me");
  },

  getPublicStore() {
    return request(`/public-store?t=${Date.now()}`);
  },

  getShop() {
    return request("/shop");
  },

  updateShop(payload) {
    return request("/shop", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getAdminSummary() {
    return request("/admin/summary");
  },

  getProducts(params = {}) {
    const query = toQuery(params);
    return request(`/products${query ? `?${query}` : ""}`);
  },

  createProduct(payload) {
    return request("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProduct(id, payload) {
    return request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  reorderProducts(ids) {
    return request("/products/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    });
  },

  deleteProduct(id) {
    return request(`/products/${id}`, {
      method: "DELETE",
    });
  },

  uploadMedia(files) {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    return request("/upload", {
      method: "POST",
      body: formData,
    });
  },

  categories: crud("/categories"),
  dogs: crud("/dogs"),
  toppings: crud("/toppings"),
  posts: crud("/posts"),
  promotions: crud("/promotions"),
  reservations: crud("/reservations"),
};

