import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, Clock, Flame, Minus, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { CATEGORY_CUSTOMIZATION } from "@/lib/data";
import { useAdmin, useProduct } from "@/lib/admin-store";

import { brl } from "@/lib/format";
import { useStore } from "@/lib/store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

const OBS_PLACEHOLDER: Partial<Record<string, string>> = {
  bebidas: 'Ex: "Bem gelada, por favor"',
  "mini-pizzas": 'Ex: "Cortar em pedaços menores"',
  sucos: 'Ex: "Sem açúcar, por favor"',
  combos: 'Ex: "Trocar o refrigerante por água"',
  adicionais: 'Ex: "Bem crocante, por favor"',
  molhos: 'Ex: "Um pote a mais, por favor"',
};

function ProductPage() {
  const { id } = Route.useParams();
  const p = useProduct(id);
  const navigate = useNavigate();
  const { addItem, favorites, toggleFav } = useStore();
  const PAO_OPTIONS = useAdmin((s) => s.paoOptions);
  const SALSICHA_OPTIONS = useAdmin((s) => s.salsichaOptions);
  const MOLHOS_OPTIONS = useAdmin((s) => s.molhosOptions);
  const ADICIONAIS_OPTIONS = useAdmin((s) => s.adicionaisOptions);
  const TAMANHO_OPTIONS = useAdmin((s) => s.tamanhoOptions);
  const BORDA_OPTIONS = useAdmin((s) => s.bordaOptions);
  const SABOR_OPTIONS = useAdmin((s) => s.saborOptions);

  const [pao, setPao] = useState<string>(PAO_OPTIONS[1]);
  const [salsicha, setSalsicha] = useState<string>(SALSICHA_OPTIONS[1]);
  const [tamanho, setTamanho] = useState<string>(TAMANHO_OPTIONS[1]);
  const [borda, setBorda] = useState<string>(BORDA_OPTIONS[0]);
  const [sabor, setSabor] = useState<string>(SABOR_OPTIONS[0]);
  const [molhos, setMolhos] = useState<string[]>(["Ketchup", "Maionese"]);
  const [remover, setRemover] = useState<string[]>([]);
  const [adicionais, setAdicionais] = useState<{ name: string; price: number }[]>([]);
  const [qty, setQty] = useState(1);
  const [obs, setObs] = useState("");

  const total = useMemo(() => {
    const add = adicionais.reduce((s, a) => s + a.price, 0);
    return ((p?.price ?? 0) + add) * qty;
  }, [p?.price, adicionais, qty]);

  if (!p) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-6xl">🤔</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Produto não encontrado</h1>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-brand-red px-6 py-3 font-bold text-white">Voltar ao cardápio</Link>
      </div>
    );
  }

  const fav = favorites.includes(p.id);
  const config = CATEGORY_CUSTOMIZATION[p.category];
  // Pão e salsicha já têm seletor próprio acima — não fazem sentido como item "removível".
  const REMOVER_OPTIONS = p.ingredients.filter((i) => {
    const lower = i.toLowerCase();
    return !((config.pao && lower.includes("pão")) || (config.salsicha && lower.includes("salsicha")));
  });

  const toggleArr = <T extends string | { name: string; price: number }>(
    arr: T[],
    v: T,
    key?: (x: T) => string,
  ): T[] => {
    const k = key ?? ((x: T) => String(x));
    return arr.some((x) => k(x) === k(v)) ? arr.filter((x) => k(x) !== k(v)) : [...arr, v];
  };

  const addToCart = () => {
    addItem({
      id: `${p.id}-${Date.now()}`,
      productId: p.id,
      name: p.name,
      image: p.image,
      basePrice: p.price,
      quantity: qty,
      customization: {
        pao: config.pao ? pao : undefined,
        salsicha: config.salsicha ? salsicha : undefined,
        tamanho: config.tamanho ? tamanho : undefined,
        borda: config.borda ? borda : undefined,
        sabor: config.sabor ? sabor : undefined,
        molhos: config.molhos ? molhos : [],
        remover: config.remover ? remover : [],
        adicionais: config.adicionais ? adicionais : [],
        observacoes: obs,
      },
    });
    toast.success(`${p.name} adicionado ao carrinho!`);
  };

  return (
    <div className="pb-32">
      {/* Hero image */}
      <div className="relative pb-10">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-[21/9]">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
        <Link to="/" className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur shadow-md">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <button
          onClick={() => toggleFav(p.id)}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur shadow-md"
        >
          <Heart className={cn("h-5 w-5", fav ? "fill-brand-red text-brand-red" : "text-brand-brown")} />
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-8">
        {/* Header info */}
        <div className="-mt-10 rounded-3xl bg-card p-6 card-shadow md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">{p.name}</h1>
              <p className="mt-2 text-muted-foreground">{p.description}</p>
            </div>
            <div className="text-right">
              {p.oldPrice && <div className="text-sm text-muted-foreground line-through">{brl(p.oldPrice)}</div>}
              <div className="font-display text-3xl font-bold text-brand-red">{brl(p.price)}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-brown">
              <Clock className="h-3 w-3" /> {p.time}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-brown">
              <Flame className="h-3 w-3" /> {p.nutrition.kcal} kcal
            </span>
          </div>

          {/* Ingredientes + Nutricional */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-brand-cream p-4">
              <h3 className="font-display font-bold">Ingredientes</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.ingredients.map((i) => (
                  <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-brown">{i}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-brand-cream p-4">
              <h3 className="font-display font-bold">Informação nutricional</h3>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                {[
                  { k: "Kcal", v: p.nutrition.kcal },
                  { k: "Carbo", v: `${p.nutrition.carbs}g` },
                  { k: "Prot", v: `${p.nutrition.protein}g` },
                  { k: "Gord", v: `${p.nutrition.fat}g` },
                ].map((n) => (
                  <div key={n.k} className="rounded-xl bg-white p-2">
                    <div className="font-display text-sm font-bold text-brand-red">{n.v}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">{n.k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="mt-6 space-y-4">
          {config.pao && (
            <Section title="Escolha o pão" required>
              <RadioGroup value={pao} onValueChange={setPao} className="grid gap-2 sm:grid-cols-2">
                {PAO_OPTIONS.map((opt) => (
                  <label key={opt} className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                    pao === opt ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                  )}>
                    <span className="font-semibold">{opt}</span>
                    <RadioGroupItem value={opt} />
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}

          {config.salsicha && (
            <Section title="Escolha a salsicha" required>
              <RadioGroup value={salsicha} onValueChange={setSalsicha} className="grid gap-2 sm:grid-cols-2">
                {SALSICHA_OPTIONS.map((opt) => (
                  <label key={opt} className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                    salsicha === opt ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                  )}>
                    <span className="font-semibold">{opt}</span>
                    <RadioGroupItem value={opt} />
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}

          {config.tamanho && (
            <Section title="Tamanho" required>
              <RadioGroup value={tamanho} onValueChange={setTamanho} className="grid gap-2 sm:grid-cols-2">
                {TAMANHO_OPTIONS.map((opt) => (
                  <label key={opt} className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                    tamanho === opt ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                  )}>
                    <span className="font-semibold">{opt}</span>
                    <RadioGroupItem value={opt} />
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}

          {config.borda && (
            <Section title="Borda" subtitle="Escolha o recheio da borda">
              <RadioGroup value={borda} onValueChange={setBorda} className="grid gap-2 sm:grid-cols-2">
                {BORDA_OPTIONS.map((opt) => (
                  <label key={opt} className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                    borda === opt ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                  )}>
                    <span className="font-semibold">{opt}</span>
                    <RadioGroupItem value={opt} />
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}

          {config.sabor && (
            <Section title="Sabor" required>
              <RadioGroup value={sabor} onValueChange={setSabor} className="grid gap-2 sm:grid-cols-2">
                {SABOR_OPTIONS.map((opt) => (
                  <label key={opt} className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                    sabor === opt ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                  )}>
                    <span className="font-semibold">{opt}</span>
                    <RadioGroupItem value={opt} />
                  </label>
                ))}
              </RadioGroup>
            </Section>
          )}

          {config.molhos && (
            <Section title="Molhos" subtitle="Escolha à vontade">
              <div className="grid gap-2 sm:grid-cols-2">
                {MOLHOS_OPTIONS.map((m) => {
                  const checked = molhos.includes(m);
                  return (
                    <label key={m} className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                      checked ? "border-brand-yellow bg-brand-yellow/10" : "border-border bg-card"
                    )}>
                      <span className="font-semibold">{m}</span>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setMolhos(toggleArr(molhos, m))}
                      />
                    </label>
                  );
                })}
              </div>
            </Section>
          )}

          {config.remover && REMOVER_OPTIONS.length > 0 && (
            <Section title="Remover ingredientes">
              <div className="grid gap-2 sm:grid-cols-2">
                {REMOVER_OPTIONS.map((r) => {
                  const checked = remover.includes(r);
                  return (
                    <label key={r} className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                      checked ? "border-brand-brown bg-brand-brown/5" : "border-border bg-card"
                    )}>
                      <span className="font-semibold">{r}</span>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setRemover(toggleArr(remover, r))}
                      />
                    </label>
                  );
                })}
              </div>
            </Section>
          )}

          {config.adicionais && (
            <Section title="Adicionar ingredientes" subtitle="Turbine seu pedido">
              <div className="grid gap-2 sm:grid-cols-2">
                {ADICIONAIS_OPTIONS.map((a) => {
                  const checked = adicionais.some((x) => x.name === a.name);
                  return (
                    <label key={a.name} className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition",
                      checked ? "border-brand-red bg-brand-red/5" : "border-border bg-card"
                    )}>
                      <div>
                        <div className="font-semibold">+ {a.name}</div>
                        <div className="text-xs font-bold text-brand-red">{brl(a.price)}</div>
                      </div>
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => setAdicionais(toggleArr(adicionais, a, (x) => x.name))}
                      />
                    </label>
                  );
                })}
              </div>
            </Section>
          )}

          <Section title="Quantidade">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border-2 border-border bg-card p-1.5">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-display text-lg font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-brand-red text-white hover:bg-brand-red/90">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">Máx. 10 por pedido</span>
            </div>
          </Section>

          <Section title="Observações" subtitle="Alguma preferência? Conta pra gente.">
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder={OBS_PLACEHOLDER[p.category] ?? 'Ex: "Tirar a cebola", "Caprichar no molho"'}
              className="min-h-24 resize-none rounded-2xl bg-card"
            />
          </Section>
        </div>
      </div>

      {/* Sticky bottom add-to-cart */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-brand-yellow/40 bg-white/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-8">
          <button
            onClick={addToCart}
            className="flex h-14 flex-1 items-center justify-between rounded-full bg-brand-red px-6 font-display font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Adicionar ao Carrinho</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm">{brl(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, required, children }: { title: string; subtitle?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-5 card-shadow md:p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-bold">
          {title} {required && <span className="ml-1 rounded-md bg-brand-red px-1.5 py-0.5 text-[10px] text-white">Obrigatório</span>}
        </h2>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
