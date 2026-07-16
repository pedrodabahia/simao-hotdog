import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Lock, LogOut, Package, Tag, Truck, Settings as SettingsIcon,
  Plus, Trash2, Eye, EyeOff, Star, Save, ArrowLeft, ImageIcon, Clock, Sandwich,
} from "lucide-react";
import { useAdmin, useProducts, type Coupon, type DayHours, type Adicional, type Neighborhood } from "@/lib/admin-store";
import { categories, CATEGORY_CUSTOMIZATION, type Product, type CategorySlug, type Tag as ProductTag } from "@/lib/data";
import { brl } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel-gestor-84h2")({
  component: AdminPage,
});

function AdminPage() {
  const isAdmin = useAdmin((s) => s.isAdmin);
  return isAdmin ? <Dashboard /> : <LoginGate />;
}

const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

function LoginGate() {
  const login = useAdmin((s) => s.login);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const locked = lockedUntil !== null && now < lockedUntil;
  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-3xl bg-card p-8 card-shadow">
        <img src="/logo.jpg" alt="Hotdog do Simão" className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-md" />
        <h1 className="mt-4 text-center font-display text-2xl font-bold">Painel do Administrador</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Acesso restrito. Digite sua senha.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (locked) return;
            if (await login(pw)) {
              toast.success("Bem-vindo, Simão!");
              setAttempts(0);
            } else {
              setErr(true);
              const next = attempts + 1;
              setAttempts(next);
              if (next >= MAX_ATTEMPTS) {
                setLockedUntil(Date.now() + LOCK_MS);
                setAttempts(0);
                toast.error(`Muitas tentativas. Aguarde ${LOCK_MS / 1000}s.`);
              } else {
                toast.error("Senha incorreta");
              }
            }
          }}
          className="mt-6 space-y-3"
        >
          <Input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(false); }}
            placeholder="Senha"
            className={cn("h-12 rounded-xl text-base", err && "border-brand-red")}
            autoFocus
            disabled={locked}
          />
          <button
            disabled={locked}
            className="h-12 w-full rounded-xl bg-brand-red font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locked ? `Aguarde ${secondsLeft}s` : "Entrar"}
          </button>
        </form>
        <Link to="/" className="mt-4 flex items-center justify-center gap-1 text-xs text-brand-red">
          <ArrowLeft className="h-3 w-3" /> voltar para o site
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const logout = useAdmin((s) => s.logout);
  const products = useProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Painel do Admin</h1>
          <p className="text-sm text-muted-foreground">Gerencie produtos, promoções e configurações da loja.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="rounded-full bg-card px-4 py-2 text-sm font-semibold card-shadow">Ver site</Link>
          <button onClick={logout} className="flex items-center gap-1 rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Kpi label="Produtos ativos" value={String(products.length)} icon={Package} />
        <Kpi label="Em promoção" value={String(products.filter((p) => p.tag === "promocao" || p.oldPrice).length)} icon={Tag} />
        <Kpi label="Cupons ativos" value={String(useAdmin.getState().coupons.length)} icon={Star} />
        <Kpi label="Taxa de entrega" value={brl(useAdmin.getState().deliveryFee)} icon={Truck} />
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4 flex flex-wrap gap-1">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="promos">Promoções</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
          <TabsTrigger value="shipping">Entrega</TabsTrigger>
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="promos"><PromosTab /></TabsContent>
        <TabsContent value="coupons"><CouponsTab /></TabsContent>
        <TabsContent value="shipping"><ShippingTab /></TabsContent>
        <TabsContent value="personalizacao"><PersonalizationTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 card-shadow">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-yellow/30 text-brand-red">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

/* ============================ Produtos ============================ */

const emptyProduct = (): Product => ({
  id: `novo-${Date.now()}`,
  name: "",
  price: 0,
  category: "hot-dogs",
  shortDescription: "",
  description: "",
  image: "",
  ingredients: [],
  nutrition: { kcal: 0, carbs: 0, protein: 0, fat: 0 },
  time: "20-30 min",
});

function ProductsTab() {
  const products = useProducts();
  const upsert = useAdmin((s) => s.upsertProduct);
  const del = useAdmin((s) => s.deleteProduct);
  const toggleHidden = useAdmin((s) => s.toggleHidden);
  const hiddenIds = useAdmin((s) => s.hiddenIds);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filter, setFilter] = useState<CategorySlug | "all">("all");

  const list = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setEditing(emptyProduct())}
          className="flex items-center gap-1 rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Novo produto
        </button>
        <div className="ml-auto flex flex-wrap gap-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>Todos</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
              {c.emoji} {c.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-card card-shadow">
        <div className="grid grid-cols-[64px_1fr_100px_100px_140px] gap-3 border-b p-4 text-xs font-bold uppercase text-muted-foreground">
          <span>Foto</span><span>Nome</span><span>Preço</span><span>Categoria</span><span className="text-right">Ações</span>
        </div>
        {list.map((p) => {
          const oculto = hiddenIds.includes(p.id);
          return (
            <div key={p.id} className={cn("grid grid-cols-[64px_1fr_100px_100px_140px] items-center gap-3 border-b p-4 last:border-0", oculto && "opacity-40")}>
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>}
              </div>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{p.shortDescription}</div>
              </div>
              <div>
                <div className="font-bold text-brand-red">{brl(p.price)}</div>
                {p.oldPrice && <div className="text-xs text-muted-foreground line-through">{brl(p.oldPrice)}</div>}
              </div>
              <div className="text-xs font-semibold text-brand-brown">{categories.find((c) => c.slug === p.category)?.name}</div>
              <div className="flex justify-end gap-1">
                <button onClick={() => toggleHidden(p.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-muted" title={oculto ? "Mostrar" : "Ocultar"}>
                  {oculto ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button onClick={() => setEditing(p)} className="rounded-lg bg-brand-yellow px-3 py-2 text-xs font-bold text-brand-brown">Editar</button>
                <button
                  onClick={() => { if (confirm(`Excluir "${p.name}"?`)) { del(p.id); toast.success("Produto removido"); } }}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-brand-red text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="p-10 text-center text-muted-foreground">Nenhum produto nesta categoria.</div>}
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => { upsert(p); setEditing(null); toast.success("Produto salvo!"); }}
        />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-full px-3 py-1.5 text-xs font-semibold", active ? "bg-brand-red text-white" : "bg-muted text-brand-brown")}>
      {children}
    </button>
  );
}

function ProductEditor({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [p, setP] = useState<Product>(product);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((s) => ({ ...s, [k]: v }));

  const handleImageFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 800;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        set("image", canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur" onClick={onCancel}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-display text-xl font-bold">{product.name ? `Editar: ${product.name}` : "Novo produto"}</h3>
          <button onClick={onCancel} className="text-2xl leading-none text-muted-foreground">×</button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <div>
              <Label className="mb-1 block text-xs">Imagem</Label>
              <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                {p.image ? <img src={p.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><ImageIcon className="h-8 w-8" /></div>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0])} className="mt-2 w-full text-xs" />
              <Input value={p.image} onChange={(e) => set("image", e.target.value)} placeholder="ou cole a URL" className="mt-2 rounded-lg text-xs" />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-xs">Nome *</Label>
                <Input value={p.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-xs">Preço *</Label>
                  <Input type="number" step="0.10" value={p.price} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Preço antigo (promo)</Label>
                  <Input type="number" step="0.10" value={p.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value === "" ? undefined : Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-xs">Categoria</Label>
                  <select value={p.category} onChange={(e) => set("category", e.target.value as CategorySlug)} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block text-xs">Etiqueta</Label>
                  <select
                    value={p.tag ?? ""}
                    onChange={(e) => set("tag", (e.target.value || undefined) as ProductTag | undefined)}
                    className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                  >
                    <option value="">Nenhuma</option>
                    <option value="mais-vendido">Mais vendido</option>
                    <option value="promocao">Promoção</option>
                    <option value="novo">Novo</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Tempo de preparo</Label>
                <Input value={p.time} onChange={(e) => set("time", e.target.value)} />
              </div>
            </div>
          </div>
          <CategoryCustomizationHint category={p.category} />
          <div>
            <Label className="mb-1 block text-xs">Descrição curta</Label>
            <Input value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Descrição completa</Label>
            <Textarea value={p.description} onChange={(e) => set("description", e.target.value)} className="min-h-20 rounded-lg" />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Ingredientes (separe por vírgula)</Label>
            <Input
              value={p.ingredients.join(", ")}
              onChange={(e) => set("ingredients", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(["kcal","carbs","protein","fat"] as const).map((k) => (
              <div key={k}>
                <Label className="mb-1 block text-xs uppercase">{k}</Label>
                <Input type="number" value={p.nutrition[k]} onChange={(e) => set("nutrition", { ...p.nutrition, [k]: Number(e.target.value) })} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <button onClick={onCancel} className="rounded-full bg-muted px-5 py-2.5 text-sm font-semibold">Cancelar</button>
          <button
            onClick={() => {
              if (!p.name.trim() || !p.price) { toast.error("Nome e preço são obrigatórios"); return; }
              onSave(p);
            }}
            className="flex items-center gap-1 rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white"
          >
            <Save className="h-4 w-4" /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

const CUSTOMIZATION_LABELS: { key: keyof (typeof CATEGORY_CUSTOMIZATION)["hot-dogs"]; label: string }[] = [
  { key: "pao", label: "Pão" },
  { key: "salsicha", label: "Salsicha" },
  { key: "tamanho", label: "Tamanho" },
  { key: "borda", label: "Borda" },
  { key: "sabor", label: "Sabor" },
  { key: "molhos", label: "Molhos" },
  { key: "remover", label: "Remover ingredientes" },
  { key: "adicionais", label: "Adicionar ingredientes" },
];

function CategoryCustomizationHint({ category }: { category: CategorySlug }) {
  const config = CATEGORY_CUSTOMIZATION[category];
  const active = CUSTOMIZATION_LABELS.filter((c) => config[c.key]);

  return (
    <div className="rounded-2xl bg-brand-cream p-3 text-xs text-brand-brown">
      <span className="font-semibold">Na página do produto, essa categoria mostra:</span>{" "}
      {active.length > 0 ? active.map((c) => c.label).join(", ") : "só quantidade e observações (sem opções de personalização)."}
    </div>
  );
}

/* ============================ Promoções ============================ */

function PromosTab() {
  const products = useProducts();
  const promoOfDayId = useAdmin((s) => s.promoOfDayId);
  const setPromoOfDay = useAdmin((s) => s.setPromoOfDay);
  const upsert = useAdmin((s) => s.upsertProduct);

  const emPromocao = products.filter((p) => p.tag === "promocao" || p.oldPrice);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-1 font-display text-lg font-bold">🔥 Promoção do dia (Hero)</h2>
        <p className="mb-4 text-sm text-muted-foreground">Este produto aparece em destaque na home.</p>
        <select
          value={promoOfDayId}
          onChange={(e) => { setPromoOfDay(e.target.value); toast.success("Promoção do dia atualizada"); }}
          className="h-12 w-full rounded-xl border bg-background px-3 font-semibold"
        >
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {brl(p.price)}</option>)}
        </select>
      </div>

      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-3 font-display text-lg font-bold">Produtos em promoção</h2>
        <p className="mb-4 text-sm text-muted-foreground">Ajuste rápido de preço e preço antigo. Marque como "promocao" para aparecer com etiqueta vermelha.</p>
        <div className="space-y-2">
          {products.map((p) => {
            const isPromo = p.tag === "promocao" || !!p.oldPrice;
            return (
              <div key={p.id} className={cn("grid grid-cols-[48px_1fr_100px_100px_120px] items-center gap-3 rounded-2xl border p-3", isPromo && "border-brand-red bg-brand-red/5")}>
                <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{categories.find((c) => c.slug === p.category)?.name}</div>
                </div>
                <div>
                  <Label className="mb-0.5 block text-[10px]">Preço</Label>
                  <Input type="number" step="0.10" value={p.price} onChange={(e) => upsert({ ...p, price: Number(e.target.value) })} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="mb-0.5 block text-[10px]">De</Label>
                  <Input type="number" step="0.10" value={p.oldPrice ?? ""} onChange={(e) => upsert({ ...p, oldPrice: e.target.value === "" ? undefined : Number(e.target.value) })} className="h-8 text-xs" />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                  <span>Promoção</span>
                  <Switch
                    checked={p.tag === "promocao"}
                    onCheckedChange={(v) => upsert({ ...p, tag: v ? "promocao" : (p.tag === "promocao" ? undefined : p.tag) })}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Total em promoção: {emPromocao.length}</p>
      </div>
    </div>
  );
}

/* ============================ Cupons ============================ */

function CouponsTab() {
  const coupons = useAdmin((s) => s.coupons);
  const setCoupons = useAdmin((s) => s.setCoupons);
  const [novo, setNovo] = useState<Coupon>({ code: "", discount: 10, desc: "" });

  const update = (i: number, c: Coupon) => setCoupons(coupons.map((x, j) => j === i ? c : x));
  const remove = (i: number) => setCoupons(coupons.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-4 font-display text-lg font-bold">Cupons ativos</h2>
        <div className="space-y-2">
          {coupons.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_2fr_40px] items-end gap-2 rounded-2xl border p-3">
              <div>
                <Label className="mb-0.5 block text-[10px]">Código</Label>
                <Input value={c.code} onChange={(e) => update(i, { ...c, code: e.target.value.toUpperCase() })} className="h-9 font-mono font-bold" />
              </div>
              <div>
                <Label className="mb-0.5 block text-[10px]">% OFF</Label>
                <Input type="number" value={c.discount} onChange={(e) => update(i, { ...c, discount: Number(e.target.value) })} className="h-9" />
              </div>
              <div>
                <Label className="mb-0.5 block text-[10px]">Descrição</Label>
                <Input value={c.desc} onChange={(e) => update(i, { ...c, desc: e.target.value })} className="h-9" />
              </div>
              <button onClick={() => remove(i)} className="grid h-9 w-9 place-items-center rounded-lg bg-brand-red text-white">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h3 className="mb-3 font-display font-bold">Adicionar cupom</h3>
        <div className="grid gap-2 sm:grid-cols-[1fr_100px_2fr_auto]">
          <Input placeholder="CÓDIGO" value={novo.code} onChange={(e) => setNovo({ ...novo, code: e.target.value.toUpperCase() })} />
          <Input type="number" placeholder="%" value={novo.discount} onChange={(e) => setNovo({ ...novo, discount: Number(e.target.value) })} />
          <Input placeholder="Descrição" value={novo.desc} onChange={(e) => setNovo({ ...novo, desc: e.target.value })} />
          <button
            onClick={() => {
              if (!novo.code || !novo.discount) { toast.error("Preencha código e desconto"); return; }
              setCoupons([...coupons, novo]);
              setNovo({ code: "", discount: 10, desc: "" });
              toast.success("Cupom adicionado");
            }}
            className="flex items-center gap-1 rounded-lg bg-brand-red px-4 font-bold text-white"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ Entrega ============================ */

function ShippingTab() {
  const deliveryFee = useAdmin((s) => s.deliveryFee);
  const freeEnabled = useAdmin((s) => s.freeShippingEnabled);
  const freeThreshold = useAdmin((s) => s.freeShippingThreshold);
  const setDeliveryFee = useAdmin((s) => s.setDeliveryFee);
  const setFreeShipping = useAdmin((s) => s.setFreeShipping);

  const [fee, setFee] = useState(deliveryFee);
  const [thr, setThr] = useState(freeThreshold);
  const [enabled, setEnabled] = useState(freeEnabled);

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-4 font-display text-lg font-bold">Configurações de entrega</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1 block text-xs">Taxa padrão (R$)</Label>
            <Input type="number" step="0.10" value={fee} onChange={(e) => setFee(Number(e.target.value))} className="h-11" />
            <p className="mt-1 text-[11px] text-muted-foreground">Usada para "Outro" bairro ou quando o bairro não tem valor próprio.</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
            <div>
              <div className="font-semibold">Frete grátis</div>
              <div className="text-xs text-muted-foreground">Isenta a taxa acima de um valor mínimo</div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          {enabled && (
            <div>
              <Label className="mb-1 block text-xs">Valor mínimo para frete grátis (R$)</Label>
              <Input type="number" step="1" value={thr} onChange={(e) => setThr(Number(e.target.value))} className="h-11" />
            </div>
          )}
          <button
            onClick={() => { setDeliveryFee(fee); setFreeShipping(enabled, thr); toast.success("Entrega atualizada"); }}
            className="flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
          >
            <Save className="h-4 w-4" /> Salvar
          </button>
        </div>
      </div>

      <NeighborhoodFeesCard />
    </div>
  );
}

function NeighborhoodFeesCard() {
  const neighborhoods = useAdmin((s) => s.neighborhoods);
  const setNeighborhoods = useAdmin((s) => s.setNeighborhoods);
  const [list, setList] = useState<Neighborhood[]>(neighborhoods);
  const [filter, setFilter] = useState("");
  const [novoNome, setNovoNome] = useState("");

  const update = (id: string, patch: Partial<Neighborhood>) =>
    setList((l) => l.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  const remove = (id: string) => setList((l) => l.filter((n) => n.id !== id));
  const add = () => {
    if (!novoNome.trim()) return;
    setList((l) => [...l, { id: `bairro-${Date.now()}`, name: novoNome.trim(), fee: 6.9 }]);
    setNovoNome("");
  };

  const filtered = list.filter((n) => n.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="rounded-3xl bg-card p-5 card-shadow">
      <h2 className="mb-1 font-display text-lg font-bold">Frete por bairro</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Edite o nome e o valor do frete de cada bairro, ou adicione/remova bairros. O cliente vê o nome e o valor certo assim que escolhe o bairro no checkout.
      </p>
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Buscar bairro..."
        className="mb-3 h-10 rounded-xl"
      />
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {filtered.map((n) => (
          <div key={n.id} className="flex items-center gap-2 rounded-xl border p-2.5">
            <Input value={n.name} onChange={(e) => update(n.id, { name: e.target.value })} className="h-9 flex-1" />
            <Input
              type="number"
              step="0.10"
              value={n.fee}
              onChange={(e) => update(n.id, { fee: Number(e.target.value) })}
              className="h-9 w-24 shrink-0"
            />
            <button onClick={() => remove(n.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-red text-white">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nenhum bairro encontrado.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Novo bairro..."
          className="h-10"
        />
        <button onClick={add} className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-yellow px-4 text-sm font-bold text-brand-brown">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <button
        onClick={() => { setNeighborhoods(list); toast.success("Bairros atualizados"); }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
      >
        <Save className="h-4 w-4" /> Salvar bairros
      </button>
    </div>
  );
}

/* ============================ Personalização ============================ */

function PersonalizationTab() {
  return (
    <div className="max-w-xl space-y-4">
      <StringListCard
        title="Pão"
        subtitle="Opções de pão que o cliente pode escolher no produto (Hot Dogs e Promoções)."
        icon={Sandwich}
        items={useAdmin((s) => s.paoOptions)}
        onSave={useAdmin((s) => s.setPaoOptions)}
        newPlaceholder="Ex: Australiano"
      />
      <StringListCard
        title="Tamanho da mini pizza"
        subtitle="Tamanhos disponíveis para as Mini Pizzas."
        icon={Sandwich}
        items={useAdmin((s) => s.tamanhoOptions)}
        onSave={useAdmin((s) => s.setTamanhoOptions)}
        newPlaceholder="Ex: Família (12 fatias)"
      />
      <StringListCard
        title="Sabor do suco"
        subtitle="Sabores disponíveis para a categoria Sucos."
        icon={Sandwich}
        items={useAdmin((s) => s.saborOptions)}
        onSave={useAdmin((s) => s.setSaborOptions)}
        newPlaceholder="Ex: Acerola"
      />
      <StringListCard
        title="Borda da mini pizza"
        subtitle="Opções de borda recheada para as Mini Pizzas."
        icon={Sandwich}
        items={useAdmin((s) => s.bordaOptions)}
        onSave={useAdmin((s) => s.setBordaOptions)}
        newPlaceholder="Ex: Cream cheese"
      />
      <StringListCard
        title="Molhos"
        subtitle="Molhos disponíveis para o cliente adicionar (Hot Dogs e Promoções)."
        icon={Sandwich}
        items={useAdmin((s) => s.molhosOptions)}
        onSave={useAdmin((s) => s.setMolhosOptions)}
        newPlaceholder="Ex: Molho rosé"
      />
      <StringListCard
        title="Remover ingredientes"
        subtitle="Itens que o cliente pode pedir para tirar (Hot Dogs, Mini Pizzas e Promoções)."
        icon={Sandwich}
        items={useAdmin((s) => s.removerOptions)}
        onSave={useAdmin((s) => s.setRemoverOptions)}
        newPlaceholder="Ex: Sem picles"
      />
      <AdicionaisCard />
    </div>
  );
}

function StringListCard({
  title,
  subtitle,
  icon: Icon,
  items,
  onSave,
  newPlaceholder,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  onSave: (list: string[]) => void;
  newPlaceholder: string;
}) {
  const [list, setList] = useState<string[]>(items);
  const [novo, setNovo] = useState("");

  const update = (i: number, value: string) => setList((l) => l.map((x, j) => (j === i ? value : x)));
  const remove = (i: number) => setList((l) => l.filter((_, j) => j !== i));
  const add = () => {
    if (!novo.trim()) return;
    setList((l) => [...l, novo.trim()]);
    setNovo("");
  };

  return (
    <div className="rounded-3xl bg-card p-5 card-shadow">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
        <Icon className="h-5 w-5 text-brand-red" /> {title}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{subtitle}</p>
      <div className="space-y-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={item} onChange={(e) => update(i, e.target.value)} className="h-10" />
            <button onClick={() => remove(i)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-red text-white">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma opção cadastrada.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={newPlaceholder}
          className="h-10"
        />
        <button onClick={add} className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-yellow px-4 text-sm font-bold text-brand-brown">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <button
        onClick={() => { onSave(list); toast.success(`${title} atualizado`); }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
      >
        <Save className="h-4 w-4" /> Salvar {title.toLowerCase()}
      </button>
    </div>
  );
}

function AdicionaisCard() {
  const adicionaisOptions = useAdmin((s) => s.adicionaisOptions);
  const setAdicionaisOptions = useAdmin((s) => s.setAdicionaisOptions);
  const [list, setList] = useState<Adicional[]>(adicionaisOptions);
  const [novo, setNovo] = useState<Adicional>({ name: "", price: 0 });

  const update = (i: number, a: Adicional) => setList((l) => l.map((x, j) => (j === i ? a : x)));
  const remove = (i: number) => setList((l) => l.filter((_, j) => j !== i));
  const add = () => {
    if (!novo.name.trim()) return;
    setList((l) => [...l, { name: novo.name.trim(), price: novo.price }]);
    setNovo({ name: "", price: 0 });
  };

  return (
    <div className="rounded-3xl bg-card p-5 card-shadow">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
        <Sandwich className="h-5 w-5 text-brand-red" /> Adicionar ingredientes
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">Ingredientes extras que o cliente pode adicionar, com preço (Hot Dogs, Mini Pizzas e Promoções).</p>
      <div className="space-y-2">
        {list.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={a.name} onChange={(e) => update(i, { ...a, name: e.target.value })} className="h-10" />
            <Input
              type="number"
              step="0.10"
              value={a.price}
              onChange={(e) => update(i, { ...a, price: Number(e.target.value) })}
              className="h-10 w-24 shrink-0"
            />
            <button onClick={() => remove(i)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-red text-white">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {list.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Nenhum adicional cadastrado.</p>}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={novo.name} onChange={(e) => setNovo({ ...novo, name: e.target.value })} placeholder="Ex: Bacon extra" className="h-10" />
        <Input
          type="number"
          step="0.10"
          value={novo.price}
          onChange={(e) => setNovo({ ...novo, price: Number(e.target.value) })}
          className="h-10 w-24 shrink-0"
        />
        <button onClick={add} className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-yellow px-4 text-sm font-bold text-brand-brown">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      <button
        onClick={() => { setAdicionaisOptions(list); toast.success("Adicionar ingredientes atualizado"); }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
      >
        <Save className="h-4 w-4" /> Salvar adicionar ingredientes
      </button>
    </div>
  );
}

/* ============================ Configurações ============================ */

function SettingsTab() {
  const whatsapp = useAdmin((s) => s.whatsapp);
  const restaurantName = useAdmin((s) => s.restaurantName);
  const restaurantAddress = useAdmin((s) => s.restaurantAddress);
  const adminPassword = useAdmin((s) => s.adminPassword);
  const setContact = useAdmin((s) => s.setContact);
  const setPassword = useAdmin((s) => s.setPassword);
  const resetSeed = useAdmin((s) => s.resetSeed);

  const [wa, setWa] = useState(whatsapp);
  const [name, setName] = useState(restaurantName);
  const [addr, setAddr] = useState(restaurantAddress);
  const [pw, setPw] = useState(adminPassword);

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <SettingsIcon className="h-5 w-5 text-brand-red" /> Dados do restaurante
        </h2>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">WhatsApp (com DDI+DDD, só números)</Label>
            <Input value={wa} onChange={(e) => setWa(e.target.value.replace(/\D/g, ""))} placeholder="5511999999999" />
            <p className="mt-1 text-[11px] text-muted-foreground">Todos os pedidos são enviados para este número.</p>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Endereço</Label>
            <Input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Rua X, 123 - Centro, São Paulo - SP" />
            <p className="mt-1 text-[11px] text-muted-foreground">A cidade exibida no cabeçalho do site é o último trecho após a vírgula.</p>
          </div>
          <button
            onClick={() => { setContact({ whatsapp: wa, name, address: addr }); toast.success("Dados salvos"); }}
            className="flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
          >
            <Save className="h-4 w-4" /> Salvar dados
          </button>
        </div>
      </div>

      <OpeningHoursCard />

      <div className="rounded-3xl bg-card p-5 card-shadow">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Lock className="h-5 w-5 text-brand-red" /> Senha do admin</h2>
        <Input type="text" value={pw} onChange={(e) => setPw(e.target.value)} className="font-mono" />
        <button
          onClick={() => { if (!pw.trim()) return toast.error("Senha vazia"); setPassword(pw); toast.success("Senha atualizada"); }}
          className="mt-3 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-brown font-bold text-white"
        >
          <Save className="h-4 w-4" /> Atualizar senha
        </button>
      </div>

      <div className="rounded-3xl border-2 border-dashed border-brand-red/40 bg-card p-5">
        <h3 className="font-display font-bold text-brand-red">Restaurar padrões</h3>
        <p className="mt-1 text-sm text-muted-foreground">Volta produtos, preços, promoções, cupons e entrega ao original. Não afeta senha e dados de contato.</p>
        <button
          onClick={() => { if (confirm("Restaurar padrões?")) { resetSeed(); toast.success("Restaurado!"); } }}
          className="mt-3 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white"
        >
          Restaurar tudo
        </button>
      </div>
    </div>
  );
}

function OpeningHoursCard() {
  const openingHours = useAdmin((s) => s.openingHours);
  const setOpeningHours = useAdmin((s) => s.setOpeningHours);
  const [hours, setHours] = useState<DayHours[]>(openingHours);

  const update = (day: number, patch: Partial<DayHours>) =>
    setHours((hs) => hs.map((h) => (h.day === day ? { ...h, ...patch } : h)));

  return (
    <div className="rounded-3xl bg-card p-5 card-shadow">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold">
        <Clock className="h-5 w-5 text-brand-red" /> Horário de funcionamento
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">Define quando o site mostra "Aberto" ou "Fechado" no cabeçalho.</p>
      <div className="space-y-2">
        {hours.map((h) => (
          <div key={h.day} className="grid grid-cols-[90px_1fr_1fr_auto] items-center gap-2 rounded-2xl border p-3">
            <span className="text-sm font-semibold">{h.label}</span>
            <div>
              <Label className="mb-0.5 block text-[10px]">Abre</Label>
              <Input
                type="time"
                value={h.open}
                disabled={h.closed}
                onChange={(e) => update(h.day, { open: e.target.value })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="mb-0.5 block text-[10px]">Fecha</Label>
              <Input
                type="time"
                value={h.close}
                disabled={h.closed}
                onChange={(e) => update(h.day, { close: e.target.value })}
                className="h-9"
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Label className="text-[10px]">Fechado</Label>
              <Switch checked={h.closed} onCheckedChange={(v) => update(h.day, { closed: v })} />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => { setOpeningHours(hours); toast.success("Horário atualizado"); }}
        className="mt-4 flex h-11 w-full items-center justify-center gap-1 rounded-xl bg-brand-red font-bold text-white"
      >
        <Save className="h-4 w-4" /> Salvar horário
      </button>
    </div>
  );
}
