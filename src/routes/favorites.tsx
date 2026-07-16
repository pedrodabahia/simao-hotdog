import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useProducts } from "@/lib/admin-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
});

function Favorites() {
  const { favorites } = useStore();
  const products = useProducts();
  const list = products.filter((p) => favorites.includes(p.id));


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold">Meus favoritos</h1>
      <p className="text-muted-foreground">Os lanches que você mais ama.</p>

      {list.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-card p-10 text-center card-shadow">
          <div className="text-6xl">❤️</div>
          <p className="mt-3 font-display text-lg font-semibold">Sem favoritos ainda</p>
          <p className="text-sm text-muted-foreground">Toque no coração dos produtos para salvar aqui.</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-brand-red px-6 py-3 font-bold text-white">Ver cardápio</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
