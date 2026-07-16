import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";
import { useAdmin } from "@/lib/admin-store";

export const Route = createFileRoute("/location")({
  component: Location,
});

function Location() {
  const restaurantName = useAdmin((s) => s.restaurantName);
  const restaurantAddress = useAdmin((s) => s.restaurantAddress);
  const whatsapp = useAdmin((s) => s.whatsapp);
  const mapsQuery = encodeURIComponent(`${restaurantName} - ${restaurantAddress}`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="font-display text-3xl font-bold">Nossa loja</h1>
      <p className="text-muted-foreground">Passe pra provar na chapa ou peça pelo delivery.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-muted card-shadow">
          <iframe
            title="Mapa da loja"
            src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl bg-white/95 p-3 backdrop-blur card-shadow">
            <div className="flex items-center gap-2 font-display font-bold">
              <MapPin className="h-4 w-4 text-brand-red" /> {restaurantName}
            </div>
            <div className="text-xs text-muted-foreground">{restaurantAddress}</div>
          </div>
        </div>

        <div className="space-y-3">
          <InfoCard icon={MapPin} title="Endereço">
            {restaurantAddress}
          </InfoCard>
          <InfoCard icon={Clock} title="Horário">
            Ter a Dom · 18h — 23h<br/>Fechado às segundas
          </InfoCard>
          <InfoCard icon={Phone} title="Contato">
            WhatsApp: {whatsapp}
          </InfoCard>
          <div className="flex gap-2">
            <a href={`https://www.google.com/maps?q=${mapsQuery}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-red px-4 py-3 font-bold text-white">
              <Navigation className="h-4 w-4" /> Como chegar
            </a>
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-brown px-4 py-3 font-bold text-white">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600" alt="Chapa" className="aspect-square w-full rounded-3xl object-cover card-shadow" />
        <img src="https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=600" alt="Ingredientes" className="aspect-square w-full rounded-3xl object-cover card-shadow" />
        <img src="https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=600" alt="Restaurante" className="aspect-square w-full rounded-3xl object-cover card-shadow" />
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-4 card-shadow">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-display font-bold">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
