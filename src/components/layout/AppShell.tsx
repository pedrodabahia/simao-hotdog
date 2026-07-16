import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Search, MapPin, Heart } from "lucide-react";
import { useStore, cartCount } from "@/lib/store";
import { useAdmin, useCity, useStoreOpenStatus } from "@/lib/admin-store";

import { CartDrawer } from "./CartDrawer";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { items, openDrawer } = useStore();
  const count = cartCount(items);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const restaurantName = useAdmin((s) => s.restaurantName);
  const city = useCity();
  const isOpen = useStoreOpenStatus();

  const nav = [
    { to: "/", label: "Início", icon: Home },
    { to: "/search", label: "Buscar", icon: Search },
    { to: "/orders", label: "Pedidos", icon: ShoppingBag },
    { to: "/favorites", label: "Favoritos", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-yellow/30 bg-brand-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/logo.jpg" alt={restaurantName} className="h-10 w-10 shrink-0 rounded-2xl object-cover shadow-md" />
            <div className="min-w-0">
              <div className="truncate font-display text-2xl font-bold leading-none text-brand-brown sm:text-lg">{restaurantName}</div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground sm:text-[11px]">
                <span className="flex min-w-0 items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{city}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 font-semibold">
                  <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isOpen ? "bg-green-500" : "bg-red-500")} />
                  <span className={isOpen ? "text-green-700" : "text-red-700"}>
                    {isOpen ? "Aberto agora" : "Fechado"}
                  </span>
                </span>
              </div>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {[
              { to: "/", label: "Cardápio" },
              { to: "/promotions", label: "Promoções" },
              { to: "/location", label: "Localização" },
              { to: "/favorites", label: "Favoritos" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  pathname === l.to
                    ? "bg-brand-red text-white"
                    : "text-brand-brown hover:bg-brand-yellow/30"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link to="/favorites" className="hidden h-11 w-11 place-items-center rounded-full border border-brand-yellow/40 bg-white text-brand-brown transition hover:bg-brand-yellow/20 md:grid">
              <Heart className="h-5 w-5" />
            </Link>

            <button
              onClick={openDrawer}
              className="relative flex h-11 items-center gap-2 rounded-full bg-brand-red px-4 text-sm font-bold text-white shadow-lg transition hover:scale-105"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Carrinho</span>
              {count > 0 && (
                <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-yellow px-1.5 text-xs font-bold text-brand-brown">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-yellow/40 bg-white/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-semibold transition",
                  active ? "text-brand-red" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <CartDrawer />
    </div>
  );
}
