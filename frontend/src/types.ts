export interface Product {
  id: number;
  name: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  status: "active" | "draft" | "archived";
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  variant_count: number;
  min_price_cents: number | null;
  max_price_cents: number | null;
  total_inventory: number;
}

export interface ProductDetail extends Omit<Product, "variant_count" | "min_price_cents" | "max_price_cents" | "total_inventory"> {
  variants: Variant[];
}

export interface Variant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  price_cents: number;
  inventory_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}
