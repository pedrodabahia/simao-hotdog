import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAdmin, useProducts } from "@/lib/admin-store";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/promotions")({
  component: Promotions,
});

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  const diff = Math.max(0, end.getTime() - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return (
    <div className="flex gap-2 font-display font-bold text-white">
      {[h, m, s].map((v, i) => (
        <span key={i} className="grid min-w-14 place-items-center rounded-xl bg-white/20 px-3 py-2 backdrop-blur">
          <span className="text-2xl">{v}</span>
          <span className="text-[10px] uppercase opacity-80">{["horas","min","seg"][i]}</span>
        </span>
      ))}
    </div>
  );
}

function Promotions() {
  const products = useProducts();
  const cuponsData = useAdmin((s) => s.coupons);
  const promos = products.filter((p) => p.tag === "promocao" || p.oldPrice);
  const miniPizzas = products.filter((p) => p.category === "mini-pizzas");

  const cores = ["bg-brand-yellow text-brand-brown", "bg-brand-brown", "bg-brand-red"];
  const cupons = cuponsData.map((c, i) => ({ ...c, color: cores[i % cores.length] }));


  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-red p-6 text-white md:p-10">
        <div className="relative z-10 max-w-lg">
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">🔥 Só hoje</span>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Promoções do dia</h1>
          <p className="mt-2 text-white/85">Termina em:</p>
          <div className="mt-3"><Countdown /></div>
        </div>
        <img src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600" alt="" className="pointer-events-none absolute -right-8 -bottom-8 h-64 w-64 rounded-full object-cover opacity-90 shadow-2xl" />
      </section>

      {/* Cupons */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-2xl font-bold">Cupons disponíveis</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {cupons.map((c) => (
            <button
              key={c.code}
              onClick={() => { navigator.clipboard?.writeText(c.code); toast.success(`Cupom ${c.code} copiado!`); }}
              className={`group flex items-center justify-between rounded-2xl ${c.color} p-5 text-left text-white card-shadow transition hover:scale-[1.02]`}
            >
              <div>
                <div className="font-display text-2xl font-bold">{c.code}</div>
                <div className="text-sm opacity-90">{c.desc}</div>
              </div>
              <Copy className="h-5 w-5 opacity-80 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </section>

      {/* Promos */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold">Ofertas ativas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {promos.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold">Mini Pizzas que valem a pena</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {miniPizzas.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
