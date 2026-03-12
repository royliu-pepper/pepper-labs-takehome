import { Link } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";

export default function CreateProductPage() {
  return (
    <div>
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Create New Product
      </h1>

      {/* ----------------------------------------------------------------
          TODO: Build the create-product form here.

          The form should collect:
            - Product name (required)
            - Description (optional)
            - Category (select from existing categories)
            - Status (active / draft)
            - At least one variant with:
                - SKU (required, must be unique)
                - Variant name (required)
                - Price (>= 0)
                - Inventory count (>= 0)

          On submit, POST to /api/products (see backend route for expected body shape).
          On success, redirect to the new product's detail page.
       ---------------------------------------------------------------- */}

      <div className="rounded-lg border border-dashed bg-card p-12 text-center shadow-card">
        <PackagePlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium text-muted-foreground">
          Product form not yet implemented
        </p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          This is one of your tasks — see the README for details.
        </p>
      </div>
    </div>
  );
}
