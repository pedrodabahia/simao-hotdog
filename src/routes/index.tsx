import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Clock, Truck, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { brl } from "@/lib/format";
import { useAdmin, useProducts, useFeatured, categories } from "@/lib/admin-store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const products = useProducts();
  const promoId = useAdmin((s) => s.promoOfDayId);
  const freeEnabled = useAdmin((s) => s.freeShippingEnabled);
  const freeThreshold = useAdmin((s) => s.freeShippingThreshold);
  const whatsapp = useAdmin((s) => s.whatsapp);
  const restaurantAddress = useAdmin((s) => s.restaurantAddress);

  const promoDoDia = products.find((p) => p.id === promoId) ?? products[0];
  const feats = useFeatured();
  const maisVendidos = products.filter((p) => p.tag === "mais-vendido");


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* Search */}
      <Link
        to="/search"
        className="flex h-12 items-center gap-3 rounded-full border border-brand-yellow/40 bg-white px-5 text-muted-foreground card-shadow"
      >
        <Search className="h-5 w-5 text-brand-red" />
        <span className="text-sm">Buscar por nome, ingrediente ou categoria...</span>
      </Link>

      {/* Hero banner */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="hero-gradient relative overflow-hidden rounded-3xl p-6 text-white md:p-10">
          <div className="relative z-10 max-w-md">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown">
              🔥 Promoção do dia
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
              {promoDoDia.name}
              {promoDoDia.oldPrice ? <><br/>com {Math.round((1 - promoDoDia.price / promoDoDia.oldPrice) * 100)}% OFF</> : null}
            </h1>
            <p className="mt-3 text-sm text-white/85 md:text-base">
              {promoDoDia.shortDescription} Só hoje!
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                to="/product/$id"
                params={{ id: promoDoDia.id }}
                className="rounded-full bg-brand-yellow px-6 py-3 font-display font-bold text-brand-brown shadow-lg transition hover:scale-105"
              >
                Pedir agora — {brl(promoDoDia.price)}
              </Link>
              <Link to="/promotions" className="text-sm font-semibold text-white/90 underline underline-offset-4">
                Ver todas
              </Link>
            </div>
          </div>
          <img
            src={promoDoDia.image}
            alt={promoDoDia.name}
            className="pointer-events-none absolute -right-8 -bottom-8 h-64 w-64 rounded-full object-cover opacity-95 shadow-2xl md:h-80 md:w-80"
          />
        </div>

        {/* Side info cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-yellow/30 text-brand-red">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display font-bold">25-40 min</div>
              <div className="text-xs text-muted-foreground">Entrega rápida na sua casa</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-brand-red p-5 text-white shadow-lg">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="font-display font-bold">Frete por bairro</div>
              <div className="text-xs text-white/80">
                {freeEnabled ? `Grátis em pedidos +${brl(freeThreshold)}` : "Valor calculado no checkout"}
              </div>
            </div>

          </div>
          <div className="flex items-center gap-4 rounded-3xl bg-card p-5 card-shadow sm:col-span-2 lg:col-span-1">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-brown/10 text-brand-brown">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <div className="font-display font-bold">4.9 · +2.3k avaliações</div>
              <div className="text-xs text-muted-foreground">O melhor hot dog da cidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Categorias</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-6 md:overflow-visible">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex min-w-[110px] shrink-0 flex-col items-center gap-2 rounded-3xl bg-card p-4 card-shadow transition hover:-translate-y-1"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-brand-cream text-3xl grid place-items-center">
                <span>{c.emoji}</span>
              </div>
              <span className="text-sm font-semibold text-brand-brown">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Destaques</h2>
          <Link to="/category/$slug" params={{ slug: "hot-dogs" }} className="text-sm font-semibold text-brand-red">Ver tudo →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {feats.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Mais vendidos row */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Mais vendidos</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {maisVendidos.map((p) => <ProductCard key={p.id} product={p} layout="row" />)}
        </div>
      </section>

      {/* Location teaser */}
      <section className="mt-10 overflow-hidden rounded-3xl bg-brand-brown text-white">
        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
          <div>
            <span className="inline-block rounded-full bg-brand-yellow px-3 py-1 text-xs font-bold text-brand-brown">Visite a loja</span>
            <h2 className="mt-3 font-display text-3xl font-bold">Passa lá pra provar na chapa</h2>
            <p className="mt-2 text-white/80">{restaurantAddress} · Aberto até 23h</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/location" className="rounded-full bg-brand-red px-5 py-2.5 font-semibold">Como chegar</Link>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-brown">WhatsApp</a>
            </div>

          </div>
          <Link to="/location" className="relative block min-h-40 overflow-hidden rounded-2xl">
            <iframe
              title="Mapa da loja"
              src={`https://www.google.com/maps?q=${encodeURIComponent(restaurantAddress)}&output=embed`}
              className="pointer-events-none h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
