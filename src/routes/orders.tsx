import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, itemUnitPrice } from "@/lib/store";
import { brl } from "@/lib/format";
import { Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: Orders,
});

function Orders() {
  const { orders, addItem } = useStore();

  const repeat = (items: typeof orders[number]["items"]) => {
    items.forEach((it) => addItem({ ...it, id: `${it.productId}-${Date.now()}-${Math.random()}` }));
    toast.success("Itens adicionados novamente ao carrinho!");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold">Meus pedidos</h1>
      <p className="text-muted-foreground">Histórico e status.</p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-card p-10 text-center card-shadow">
          <div className="text-6xl">📦</div>
          <p className="mt-3 font-display text-lg font-semibold">Você ainda não fez pedidos</p>
          <Link to="/" className="mt-4 inline-flex rounded-full bg-brand-red px-6 py-3 font-bold text-white">Fazer meu primeiro pedido</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-3xl bg-card p-5 card-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold">Pedido #{o.id}</span>
                    <span className="rounded-full bg-brand-yellow/30 px-2 py-0.5 text-xs font-bold text-brand-brown">{o.status}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {new Date(o.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-brand-red">{brl(o.total)}</div>
                  <div className="text-xs text-muted-foreground">{o.payment}</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                {o.items.map((it) => (
                  <div key={it.id} className="flex min-w-52 shrink-0 items-center gap-2 rounded-2xl bg-brand-cream p-2">
                    <img src={it.image} className="h-12 w-12 rounded-xl object-cover" alt="" />
                    <div className="min-w-0 text-xs">
                      <div className="truncate font-semibold">{it.quantity}x {it.name}</div>
                      <div className="text-muted-foreground">{brl(itemUnitPrice(it) * it.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => repeat(o.items)} className="rounded-full bg-brand-red px-5 py-2 text-sm font-bold text-white">Repetir pedido</button>
                <span className="rounded-full border px-5 py-2 text-sm text-muted-foreground">Entrega: {o.address}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
