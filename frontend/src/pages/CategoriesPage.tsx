import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/api";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        Categories
      </h1>

      <div className="overflow-hidden rounded-lg border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b bg-muted/50 transition-colors">
                <th className="h-12 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="h-12 px-4 text-right align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Products
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">{c.name}</td>
                  <td className="p-4 align-middle text-muted-foreground">
                    {c.description || "—"}
                  </td>
                  <td className="p-4 text-right align-middle tabular-nums">
                    {c.product_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
