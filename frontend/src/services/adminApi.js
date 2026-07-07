import { useAuth } from "../context/AuthContext";

const BASE = "/api";

async function request(path, token, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function useAdminApi() {
  const { token, logout } = useAuth();

  const call = async (path, options) => {
    try {
      return await request(path, token, options);
    } catch (err) {
      if (err.message?.toLowerCase().includes("token")) logout();
      throw err;
    }
  };

  return {
    getCategories: () => call("/categories"),
    getProducts: () => call("/products"),
    createProduct: (payload) => call("/products", { method: "POST", body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => call(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteProduct: (id) => call(`/products/${id}`, { method: "DELETE" }),
    getImageUploadUrl:(contentType) => call("/uploads/image-url", { method: "POST", body: JSON.stringify({ contentType}),}), 
  };
}