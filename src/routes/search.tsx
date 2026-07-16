import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, X } from "lucide-react";
import { useMemo, useState } from "react";
import { categories } from "@/lib/data";
import { useProducts } from "@/lib/admin-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return products.filter((p) =>

      p.name.toLowerCase().includes(s) ||
      p.shortDescription.toLowerCase().includes(s) ||
      p.ingredients.some((i) => i.toLowerCase().includes(s)) ||
      p.category.includes(s)
    );
  }, [q, products]);

  const sugestoes = ["bacon", "cheddar", "combo", "refri", "picante"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold">Buscar</h1>
      <p className="text-muted-foreground">Pesquise por nome, ingrediente ou categoria.</p>

      <div className="relative mt-6">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex: bacon, combo, cheddar..."
          className="h-14 w-full rounded-full border border-brand-yellow/40 bg-card pl-12 pr-12 font-semibold outline-none ring-brand-red/40 transition focus:ring-2"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!q && (
        <>
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-bold text-muted-foreground">Sugestões</h3>
            <div className="flex flex-wrap gap-2">
              {sugestoes.map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full bg-card px-4 py-2 text-sm font-semibold card-shadow">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-bold text-muted-foreground">Categorias</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {categories.map((c) => (
                <button key={c.slug} onClick={() => setQ(c.name.toLowerCase())} className="rounded-2xl bg-card p-4 text-center card-shadow">
                  <div className="text-3xl">{c.emoji}</div>
                  <div className="mt-1 text-xs font-semibold">{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {q && (
        <div className="mt-6">
          <p className="mb-4 text-sm text-muted-foreground">{results.length} resultados para "{q}"</p>
          {results.length === 0 ? (
            <div className="rounded-3xl bg-card p-10 text-center card-shadow">
              <div className="text-5xl">😕</div>
              <p className="mt-3 font-display text-lg font-semibold">Nada encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
