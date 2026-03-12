import { Link } from "react-router-dom";
import { Package, Tag, Layers, Edit } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, cn } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const priceRange =
    product.min_price_cents != null
      ? product.min_price_cents === product.max_price_cents
        ? formatPrice(product.min_price_cents)
        : `${formatPrice(product.min_price_cents)} – ${formatPrice(product.max_price_cents!)}`
      : "—";

  const lowStock = product.total_inventory > 0 && product.total_inventory <= 10;
  const outOfStock = product.total_inventory === 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex h-[340px] flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-card transition-all duration-200 hover:shadow-card-hover"
    >
      {/* Image placeholder area — mimics original's h-56 image zone */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
        <Package className="h-12 w-12 text-muted-foreground/40" />

        {/* Status badge over image */}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold",
            product.status === "active"
              ? "bg-emerald-100 text-emerald-800"
              : product.status === "draft"
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-200 text-gray-600"
          )}
        >
          {product.status}
        </span>

        {/* Variant count badge */}
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
          <Layers className="mr-1 inline h-3 w-3" />
          {product.variant_count} variant{product.variant_count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Item code */}
        {product.category_name && (
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span className="truncate">{product.category_name}</span>
          </div>
        )}

        {/* Name */}
        <h3 className="line-clamp-2 text-base font-bold leading-tight text-foreground">
          {product.name}
        </h3>

        {/* Price range */}
        <p className="mt-1 text-sm text-muted-foreground">{priceRange}</p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row: inventory + action */}
        <div className="mt-3 flex items-center justify-between">
          {outOfStock ? (
            <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
              Out of stock
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center rounded-full border border-amber-300/50 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Low stock ({product.total_inventory})
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {product.total_inventory} in stock
            </span>
          )}

          <span className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-foreground/30 group-hover:text-foreground">
            <Edit className="h-3 w-3" />
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
