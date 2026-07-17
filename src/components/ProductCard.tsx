import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/lib/data";
import { brl } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const tagStyles: Record<string, string> = {
  "mais-vendido": "bg-brand-yellow text-brand-brown",
  "promocao": "bg-brand-red text-white",
  "novo": "bg-brand-brown text-white",
};
const tagLabels: Record<string, string> = {
  "mais-vendido": "Mais vendido",
  "promocao": "Promoção",
  "novo": "Novo",
};

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "row" }) {
  const { favorites, toggleFav } = useStore();
  const fav = favorites.includes(product.id);

  if (layout === "row") {
    return (
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="group flex min-w-0 gap-3 rounded-2xl bg-card p-3 card-shadow transition hover:-translate-y-0.5"
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 truncate font-display text-base font-semibold">{product.name}</h3>
            {product.tag && (
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", tagStyles[product.tag])}>
                {tagLabels[product.tag]}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription}</p>
          <div className="mt-2 flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-brand-red">{brl(product.price)}</span>
              {product.oldPrice && (
                <span className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(product.id); }}
              className="grid h-8 w-8 place-items-center rounded-full bg-muted"
              aria-label="Favoritar"
            >
              <Heart className={cn("h-4 w-4", fav ? "fill-brand-red text-brand-red" : "text-muted-foreground")} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card card-shadow transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        {product.tag && (
          <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow", tagStyles[product.tag])}>
            {tagLabels[product.tag]}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(product.id); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
          aria-label="Favoritar"
        >
          <Heart className={cn("h-4 w-4", fav ? "fill-brand-red text-brand-red" : "text-brand-brown")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{brl(product.oldPrice)}</span>
            )}
            <span className="font-display text-xl font-bold text-brand-red">{brl(product.price)}</span>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-red text-white shadow-md transition group-hover:scale-110">
            <Plus className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
