import { Link, Outlet, useLocation } from "react-router-dom";
import { Package, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: LayoutGrid },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Green sticky header — matches original CatalogHeader style */}
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/80">
        <div className="mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:py-4">
          {/* Left: title + subtitle */}
          <div>
            <Link
              to="/"
              className="text-2xl font-bold text-black md:text-3xl"
            >
              Catalog Manager
            </Link>
            <p className="text-sm text-slate-800 md:text-base">
              Food service supply catalog
            </p>
          </div>

          {/* Right: nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active =
                location.pathname === to ||
                (to === "/products" && location.pathname === "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-black/20 bg-black/10 text-black"
                      : "border-primary-foreground/30 bg-transparent text-secondary-foreground hover:bg-primary-foreground/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
