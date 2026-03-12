const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function fetchProducts(params?: {
  search?: string;
  category_id?: number;
}): Promise<Response> {
  const url = new URL(`${API_URL}/api/products`);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.category_id)
    url.searchParams.set("category_id", String(params.category_id));
  return fetch(url.toString());
}

export async function fetchProduct(id: number): Promise<Response> {
  return fetch(`${API_URL}/api/products/${id}`);
}

export async function createProduct(body: unknown): Promise<Response> {
  return fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateProduct(
  id: number,
  body: unknown
): Promise<Response> {
  return fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(id: number): Promise<Response> {
  return fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
}

export async function fetchCategories(): Promise<Response> {
  return fetch(`${API_URL}/api/categories`);
}

export async function updateVariant(
  id: number,
  body: unknown
): Promise<Response> {
  return fetch(`${API_URL}/api/variants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteVariant(id: number): Promise<Response> {
  return fetch(`${API_URL}/api/variants/${id}`, { method: "DELETE" });
}
