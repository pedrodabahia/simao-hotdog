import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, MapPin, CreditCard, Wallet, QrCode, Home, MessageCircle } from "lucide-react";
import { useStore, cartSubtotal, itemUnitPrice } from "@/lib/store";
import { useAdmin, deliveryFeeForNeighborhood } from "@/lib/admin-store";
import { brl } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

const steps = ["Resumo", "Entrega", "Pagamento", "WhatsApp"] as const;

const CIDADE_ENTREGA = "Posto da Mata - Nova Viçosa, BA";

function Checkout() {
  const navigate = useNavigate();
  const { items, coupon, placeOrder } = useStore();
  const whatsapp = useAdmin((s) => s.whatsapp);
  const restaurantName = useAdmin((s) => s.restaurantName);
  const deliveryFee = useAdmin((s) => s.deliveryFee);
  const neighborhoods = useAdmin((s) => s.neighborhoods);
  const freeEnabled = useAdmin((s) => s.freeShippingEnabled);
  const freeThreshold = useAdmin((s) => s.freeShippingThreshold);

  const [step, setStep] = useState(0);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairroId, setBairroId] = useState<string>(
    () => neighborhoods.find((n) => n.name === "Centro")?.id ?? neighborhoods[0]?.id ?? "outro",
  );
  const [bairroOutro, setBairroOutro] = useState("");
  const [pagamento, setPagamento] = useState<"pix" | "cartao" | "dinheiro">("pix");
  const [troco, setTroco] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const freteGratis = freeEnabled && subtotal >= freeThreshold;
  const bairroFee = deliveryFeeForNeighborhood(bairroId, neighborhoods, deliveryFee);
  const delivery = subtotal > 0 && !freteGratis ? bairroFee : 0;
  const discount = coupon ? (subtotal * coupon.discount) / 100 : 0;
  const total = subtotal + delivery - discount;

  const bairroFinal = bairroId === "outro" ? bairroOutro.trim() : (neighborhoods.find((n) => n.id === bairroId)?.name ?? "");
  const address = `${rua}, ${numero} — ${complemento} · ${bairroFinal} · ${CIDADE_ENTREGA}`;
  const telefoneValido = telefone.replace(/\D/g, "").length >= 10;

  if (items.length === 0 && !orderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-6xl">🛒</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Carrinho vazio</h1>
        <p className="mt-2 text-muted-foreground">Adicione produtos antes de finalizar.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-brand-red px-6 py-3 font-bold text-white">Voltar ao cardápio</Link>
      </div>
    );
  }

  const buildWhatsappMessage = (pedidoId: string, paymentLabel: string) => {
    const linhas: string[] = [];
    linhas.push(`🌭 *${restaurantName}* — Novo Pedido`);
    linhas.push(`Pedido *#${pedidoId}*`);
    linhas.push(`Data: ${new Date().toLocaleString("pt-BR")}`);
    linhas.push("");
    linhas.push("👤 *Cliente*");
    linhas.push(`Nome: ${nome || "—"}`);
    linhas.push(`Telefone: ${telefone || "—"}`);
    linhas.push("");
    linhas.push("📍 *Endereço de entrega*");
    linhas.push(address);
    linhas.push("");
    linhas.push("🧾 *Itens do pedido*");
    items.forEach((it) => {
      const unit = itemUnitPrice(it);
      linhas.push(`• ${it.quantity}x ${it.name} — ${brl(unit * it.quantity)}`);
      if (it.customization.pao) linhas.push(`   Pão: ${it.customization.pao}`);
      if (it.customization.salsicha) linhas.push(`   Salsicha: ${it.customization.salsicha}`);
      if (it.customization.tamanho) linhas.push(`   Tamanho: ${it.customization.tamanho}`);
      if (it.customization.borda) linhas.push(`   Borda: ${it.customization.borda}`);
      if (it.customization.sabor) linhas.push(`   Sabor: ${it.customization.sabor}`);
      if (it.customization.molhos.length) linhas.push(`   Molhos: ${it.customization.molhos.join(", ")}`);
      if (it.customization.remover.length) linhas.push(`   Remover: ${it.customization.remover.join(", ")}`);
      if (it.customization.adicionais.length) linhas.push(`   Adicionais: ${it.customization.adicionais.map((a) => a.name).join(", ")}`);
      if (it.customization.observacoes) linhas.push(`   Obs: ${it.customization.observacoes}`);
    });
    linhas.push("");
    linhas.push("💰 *Resumo*");
    linhas.push(`Subtotal: ${brl(subtotal)}`);
    linhas.push(`Entrega: ${delivery === 0 ? "Grátis" : brl(delivery)}`);
    if (discount > 0) linhas.push(`Desconto (${coupon?.code}): -${brl(discount)}`);
    linhas.push(`*Total: ${brl(total)}*`);
    linhas.push("");
    linhas.push(`💳 *Pagamento:* ${paymentLabel}`);
    linhas.push("");
    linhas.push("Aguardo confirmação. Obrigado! 🙌");
    return linhas.join("\n");
  };

  const finish = () => {
    if (!nome.trim() || !telefoneValido || !rua.trim() || !numero.trim()) {
      setStep(1);
      return;
    }
    const paymentLabel = pagamento === "pix" ? "Pix" : pagamento === "cartao" ? "Cartão na entrega" : `Dinheiro${troco ? ` (troco p/ ${brl(Number(troco) || 0)})` : ""}`;
    const order = placeOrder({ items, total, address, payment: paymentLabel });
    const msg = buildWhatsappMessage(order.id, paymentLabel);
    const link = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    setOrderId(order.id);
    setWaLink(link);
    setStep(3);
    // Abre o WhatsApp automaticamente
    window.open(link, "_blank", "noopener");
  };


  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => (step > 0 && step < 3 ? setStep(step - 1) : navigate({ to: "/" }))} className="grid h-10 w-10 place-items-center rounded-full bg-card card-shadow">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-2xl font-bold">Finalizar pedido</h1>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold text-sm transition",
              i < step ? "bg-brand-red text-white" : i === step ? "bg-brand-yellow text-brand-brown" : "bg-muted text-muted-foreground"
            )}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("hidden text-xs font-semibold sm:inline", i === step ? "text-brand-brown" : "text-muted-foreground")}>{s}</span>
            {i < steps.length - 1 && <div className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-brand-red" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {/* Step 0: Resumo */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-brand-red p-5 text-white shadow-lg">
            <h2 className="mb-3 font-display text-lg font-bold">Itens do pedido</h2>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3">
                  <img src={it.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between font-semibold">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="text-brand-yellow">{brl(itemUnitPrice(it) * it.quantity)}</span>
                    </div>
                    {it.customization.adicionais.length > 0 && (
                      <p className="text-xs text-white/75">+ {it.customization.adicionais.map((a) => a.name).join(", ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Totals subtotal={subtotal} delivery={delivery} discount={discount} total={total} />
          <StepButton onClick={() => setStep(1)}>Ir para entrega</StepButton>
        </div>
      )}

      {/* Step 1: Entrega */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-brand-red p-5 text-white shadow-lg">
            <h2 className="mb-4 font-display text-lg font-bold">Seus dados</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-xs text-white/80">Nome completo *</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: João Silva" className="rounded-xl border-0 bg-white text-foreground" />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-white/80">Telefone / WhatsApp *</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(73) 99999-9999" className={cn("rounded-xl border-0 bg-white text-foreground", telefone.trim() && !telefoneValido && "ring-2 ring-brand-yellow")} />
                {telefone.trim() && !telefoneValido && (
                  <p className="mt-1 text-[11px] font-semibold text-brand-yellow">Digite um telefone válido com DDD</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-brand-red p-5 text-white shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><MapPin className="h-5 w-5 text-brand-yellow" /> Endereço de entrega</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-xs text-white/80">Cidade</Label>
                <Input value={CIDADE_ENTREGA} disabled className="rounded-xl border-0 bg-white/70 text-foreground" />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-white/80">Bairro</Label>
                <Select value={bairroId} onValueChange={setBairroId}>
                  <SelectTrigger className="w-full rounded-xl border-0 bg-white text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                    ))}
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {bairroId === "outro" && (
                <div className="sm:col-span-2">
                  <Label className="mb-1 block text-xs text-white/80">Qual bairro?</Label>
                  <Input value={bairroOutro} onChange={(e) => setBairroOutro(e.target.value)} placeholder="Nome do bairro" className="rounded-xl border-0 bg-white text-foreground" />
                </div>
              )}
              <div className="sm:col-span-2">
                <Label className="mb-1 block text-xs text-white/80">Rua / Avenida</Label>
                <Input value={rua} onChange={(e) => setRua(e.target.value)} className="rounded-xl border-0 bg-white text-foreground" />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-white/80">Número</Label>
                <Input value={numero} onChange={(e) => setNumero(e.target.value)} className="rounded-xl border-0 bg-white text-foreground" />
              </div>
              <div>
                <Label className="mb-1 block text-xs text-white/80">Complemento</Label>
                <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} className="rounded-xl border-0 bg-white text-foreground" />
              </div>
            </div>
          </div>
          <Totals subtotal={subtotal} delivery={delivery} discount={discount} total={total} />
          <StepButton
            onClick={() => setStep(2)}
            disabled={!nome.trim() || !telefoneValido || !rua.trim() || !numero.trim() || (bairroId === "outro" && !bairroOutro.trim())}
          >
            Ir para pagamento
          </StepButton>
        </div>
      )}


      {/* Step 2: Pagamento */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-brand-red p-5 text-white shadow-lg">
            <h2 className="mb-4 font-display text-lg font-bold">Forma de pagamento</h2>
            <RadioGroup value={pagamento} onValueChange={(v) => setPagamento(v as typeof pagamento)} className="space-y-2">
              {[
                { v: "pix", label: "Pix", desc: "Aprovação na hora", icon: QrCode },
                { v: "cartao", label: "Cartão na entrega", desc: "Crédito ou débito", icon: CreditCard },
                { v: "dinheiro", label: "Dinheiro", desc: "Precisa de troco?", icon: Wallet },
              ].map((o) => {
                const Icon = o.icon;
                const active = pagamento === o.v;
                return (
                  <label key={o.v} className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition",
                    active ? "border-white bg-white text-brand-brown" : "border-white/30 bg-white/10"
                  )}>
                    <div className={cn("grid h-11 w-11 place-items-center rounded-xl", active ? "bg-brand-red text-white" : "bg-white/15 text-white")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{o.label}</div>
                      <div className={cn("text-xs", active ? "text-muted-foreground" : "text-white/70")}>{o.desc}</div>
                    </div>
                    <RadioGroupItem value={o.v} className={active ? "" : "border-white text-white"} />
                  </label>
                );
              })}
            </RadioGroup>
            {pagamento === "dinheiro" && (
              <div className="mt-3">
                <Label className="mb-1 block text-xs text-white/80">Troco para</Label>
                <Input value={troco} onChange={(e) => setTroco(e.target.value)} placeholder="Ex: 100" className="rounded-xl border-0 bg-white text-foreground" />
              </div>
            )}
          </div>
          <Totals subtotal={subtotal} delivery={delivery} discount={discount} total={total} />
          <StepButton onClick={finish}>
            <MessageCircle className="mr-2 h-5 w-5" /> Enviar pedido pelo WhatsApp — {brl(total)}
          </StepButton>
          <p className="text-center text-xs text-muted-foreground">
            O pagamento é combinado direto com o restaurante no WhatsApp.
          </p>
        </div>
      )}

      {/* Step 3: Confirmação */}
      {step === 3 && orderId && (
        <div className="rounded-3xl bg-brand-red p-8 text-center text-white shadow-lg">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#25D366]/15">
            <MessageCircle className="h-10 w-10 text-[#25D366]" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold">Pedido enviado!</h2>
          <p className="mt-2 text-white/80">Abrimos o WhatsApp do {restaurantName} com o resumo do seu pedido. Finalize o pagamento por lá 🙌</p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white p-5 text-left text-foreground">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Número do pedido</span><span className="font-bold">#{orderId}</span></div>
            <div className="mt-1 flex justify-between text-sm"><span className="text-muted-foreground">Tempo estimado</span><span className="font-bold">30-45 min</span></div>
            <div className="mt-1 flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold text-brand-red">{brl(total)}</span></div>
          </div>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg">
              <MessageCircle className="h-5 w-5" /> Abrir WhatsApp novamente
            </a>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-full bg-white px-6 py-3 font-bold text-brand-red"><Home className="mr-2 inline h-4 w-4" />Voltar para Home</Link>
            <Link to="/orders" className="rounded-full border-2 border-white px-6 py-3 font-bold text-white">Ver meus pedidos</Link>
          </div>
        </div>
      )}

    </div>
  );
}

function Totals({ subtotal, delivery, discount, total }: { subtotal: number; delivery: number; discount: number; total: number }) {
  return (
    <div className="rounded-3xl bg-brand-red p-5 text-white shadow-lg">
      <div className="space-y-1 text-sm">
        <Row label="Subtotal" value={brl(subtotal)} />
        <Row label="Taxa de entrega" value={brl(delivery)} />
        {discount > 0 && <Row label="Desconto" value={`-${brl(discount)}`} highlight />}
        <div className="mt-2 flex justify-between border-t border-white/20 pt-2 font-display text-lg font-bold">
          <span>Total</span><span className="text-brand-yellow">{brl(total)}</span>
        </div>
      </div>
    </div>
  );
}
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex justify-between", highlight ? "font-semibold text-brand-yellow" : "")}>
      <span className={highlight ? "" : "text-white/75"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
function StepButton({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-full items-center justify-center rounded-full bg-brand-red font-display text-base font-bold text-white shadow-lg transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
    >
      {children}
    </button>
  );
}

