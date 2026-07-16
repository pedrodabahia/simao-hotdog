import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { categories, type CategorySlug } from "@/lib/data";
import { useProductsByCategory } from "@/lib/admin-store";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  loader: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = categories.find((c) => c.slug === (slug as CategorySlug))!;
  const list = useProductsByCategory(slug as CategorySlug);


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* Category filter chips */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              c.slug === slug ? "bg-brand-red text-white" : "bg-card text-brand-brown card-shadow"
            }`}
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-card card-shadow">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">{list.length} produtos disponíveis</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl bg-card p-10 text-center card-shadow">
          <div className="text-5xl">🍽️</div>
          <p className="mt-3 font-display text-lg font-semibold">Em breve novidades por aqui</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
