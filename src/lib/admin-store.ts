import { create } from "zustand";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "./supabase-client";
import { adminLogin, adminSetPassword, saveStoreSettings } from "./admin-server";
import {
  products as seedProducts,
  categories,
  PAO_OPTIONS,
  SALSICHA_OPTIONS,
  MOLHOS_OPTIONS,
  ADICIONAIS_OPTIONS,
  TAMANHO_PIZZA_OPTIONS,
  BORDA_PIZZA_OPTIONS,
  SABOR_SUCO_OPTIONS,
  CATEGORY_CUSTOMIZATION,
  type Product,
  type CategorySlug,
} from "./data";

export { CATEGORY_CUSTOMIZATION };

export type Coupon = { code: string; discount: number; desc: string };
export type Adicional = { name: string; price: number };

export type DayHours = {
  day: number; // 0 = domingo ... 6 = sábado
  label: string;
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  closed: boolean;
};

export type Neighborhood = { id: string; name: string; fee: number };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const NEIGHBORHOOD_NAMES = [
  "Acácia",
  "Aparecida I",
  "Aparecida II",
  "Aparecida III",
  "Baía de Guanabara",
  "Baía dos Anjos",
  "Baixada Fluminense",
  "Bom Sucesso",
  "Cajueiro",
  "Campo Verde",
  "Caribe",
  "Castelo",
  "Central",
  "Centro",
  "Cidade Alta",
  "Copacabana I",
  "Copacabana II",
  "Copacabana III",
  "Explanada",
  "Granville",
  "Henrique de Brito",
  "Industrial I",
  "Industrial II",
  "Industrial III",
  "Ivanildo Rodrigues",
  "Jardim dos Eucaliptos",
  "Jardim Primavera",
  "Mangueira",
  "Morada dos Eucaliptos",
  "Portela",
  "Primavera",
  "Recanto do Lago",
  "Santa Amélia",
  "Trevo de Posto da Mata",
];

type AdminState = {
  productOverrides: Record<string, Partial<Product>>;
  extraProducts: Product[];
  hiddenIds: string[];
  promoOfDayId: string;
  deliveryFee: number;
  neighborhoods: Neighborhood[];
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  coupons: Coupon[];
  whatsapp: string;
  restaurantName: string;
  restaurantAddress: string;
  pixKey: string;
  openingHours: DayHours[];
  paoOptions: string[];
  salsichaOptions: string[];
  molhosOptions: string[];
  adicionaisOptions: Adicional[];
  tamanhoOptions: string[];
  bordaOptions: string[];
  saborOptions: string[];
  adminPassword: string;
  isAdmin: boolean;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  login: (pw: string) => Promise<boolean>;
  logout: () => void;
  setPassword: (pw: string) => void;
  upsertProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  toggleHidden: (id: string) => void;
  setPromoOfDay: (id: string) => void;
  setDeliveryFee: (n: number) => void;
  setNeighborhoods: (list: Neighborhood[]) => void;
  setFreeShipping: (enabled: boolean, threshold: number) => void;
  setCoupons: (c: Coupon[]) => void;
  setContact: (data: { whatsapp: string; name: string; address: string }) => void;
  setPixKey: (key: string) => void;
  setOpeningHours: (hours: DayHours[]) => void;
  setPaoOptions: (list: string[]) => void;
  setSalsichaOptions: (list: string[]) => void;
  setMolhosOptions: (list: string[]) => void;
  setAdicionaisOptions: (list: Adicional[]) => void;
  setTamanhoOptions: (list: string[]) => void;
  setBordaOptions: (list: string[]) => void;
  setSaborOptions: (list: string[]) => void;
  resetSeed: () => void;
};

const DEFAULT_OPENING_HOURS: DayHours[] = [
  { day: 0, label: "Domingo", open: "18:00", close: "23:00", closed: false },
  { day: 1, label: "Segunda", open: "18:00", close: "23:00", closed: true },
  { day: 2, label: "Terça", open: "18:00", close: "23:00", closed: false },
  { day: 3, label: "Quarta", open: "18:00", close: "23:00", closed: false },
  { day: 4, label: "Quinta", open: "18:00", close: "23:00", closed: false },
  { day: 5, label: "Sexta", open: "18:00", close: "23:30", closed: false },
  { day: 6, label: "Sábado", open: "18:00", close: "23:30", closed: false },
];

const DEFAULT_COUPONS: Coupon[] = [
  { code: "SIMAO10", discount: 10, desc: "10% OFF em qualquer pedido" },
  { code: "PRIMEIRA", discount: 15, desc: "15% OFF no primeiro pedido" },
  { code: "HOTDOG20", discount: 20, desc: "20% OFF acima de R$ 60" },
];

const DEFAULT_NEIGHBORHOODS: Neighborhood[] = NEIGHBORHOOD_NAMES.map((name) => ({
  id: slugify(name),
  name,
  fee: 6.9,
}));

// Everything that lives in the shared `store_settings` row in Supabase.
// isAdmin / adminPassword / hydrated are session-only client state and never
// sent as-is (adminPassword is only ever used to authorize a write, checked
// server-side against the separate, non-public admin_credentials table).
type SettingsSnapshot = {
  productOverrides: Record<string, Partial<Product>>;
  extraProducts: Product[];
  hiddenIds: string[];
  promoOfDayId: string;
  deliveryFee: number;
  neighborhoods: Neighborhood[];
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  coupons: Coupon[];
  whatsapp: string;
  restaurantName: string;
  restaurantAddress: string;
  pixKey: string;
  openingHours: DayHours[];
  paoOptions: string[];
  salsichaOptions: string[];
  molhosOptions: string[];
  adicionaisOptions: Adicional[];
  tamanhoOptions: string[];
  bordaOptions: string[];
  saborOptions: string[];
};

function snapshotOf(s: AdminState): SettingsSnapshot {
  return {
    productOverrides: s.productOverrides,
    extraProducts: s.extraProducts,
    hiddenIds: s.hiddenIds,
    promoOfDayId: s.promoOfDayId,
    deliveryFee: s.deliveryFee,
    neighborhoods: s.neighborhoods,
    freeShippingEnabled: s.freeShippingEnabled,
    freeShippingThreshold: s.freeShippingThreshold,
    coupons: s.coupons,
    whatsapp: s.whatsapp,
    restaurantName: s.restaurantName,
    restaurantAddress: s.restaurantAddress,
    pixKey: s.pixKey,
    openingHours: s.openingHours,
    paoOptions: s.paoOptions,
    salsichaOptions: s.salsichaOptions,
    molhosOptions: s.molhosOptions,
    adicionaisOptions: s.adicionaisOptions,
    tamanhoOptions: s.tamanhoOptions,
    bordaOptions: s.bordaOptions,
    saborOptions: s.saborOptions,
  };
}

// Fire-and-forget push of the full settings snapshot to the server, which
// re-checks the password against admin_credentials before writing.
function pushSettings(get: () => AdminState) {
  const s = get();
  saveStoreSettings({ data: { password: s.adminPassword, settings: snapshotOf(s) } })
    .then((res) => {
      if (!res.ok) toast.error("Sessão expirada — faça login novamente para salvar.");
    })
    .catch(() => toast.error("Falha ao salvar no servidor. Verifique sua conexão."));
}

export const useAdmin = create<AdminState>()((set, get) => ({
  productOverrides: {},
  extraProducts: [],
  hiddenIds: [],
  promoOfDayId: "simao-bacon-lover",
  deliveryFee: 6.9,
  neighborhoods: DEFAULT_NEIGHBORHOODS,
  freeShippingEnabled: true,
  freeShippingThreshold: 80,
  coupons: DEFAULT_COUPONS,
  whatsapp: "557399831608",
  restaurantName: "Hotdog do Simão",
  restaurantAddress: "Rua das Salsichas, 123 · Centro, São Paulo - SP",
  pixKey: "",
  openingHours: DEFAULT_OPENING_HOURS,
  paoOptions: [...PAO_OPTIONS],
  salsichaOptions: [...SALSICHA_OPTIONS],
  molhosOptions: [...MOLHOS_OPTIONS],
  adicionaisOptions: [...ADICIONAIS_OPTIONS],
  tamanhoOptions: [...TAMANHO_PIZZA_OPTIONS],
  bordaOptions: [...BORDA_PIZZA_OPTIONS],
  saborOptions: [...SABOR_SUCO_OPTIONS],
  adminPassword: "",
  isAdmin: false,
  hydrated: false,

  hydrate: async () => {
    if (!supabase) {
      set({ hydrated: true });
      return;
    }
    const { data, error } = await supabase
      .from("store_settings")
      .select("data")
      .eq("id", 1)
      .single();
    if (error || !data?.data) {
      set({ hydrated: true });
      return;
    }
    const remote = data.data as Partial<SettingsSnapshot>;
    set((s) => ({
      hydrated: true,
      productOverrides: remote.productOverrides ?? s.productOverrides,
      extraProducts: remote.extraProducts ?? s.extraProducts,
      hiddenIds: remote.hiddenIds ?? s.hiddenIds,
      promoOfDayId: remote.promoOfDayId ?? s.promoOfDayId,
      deliveryFee: remote.deliveryFee ?? s.deliveryFee,
      neighborhoods: remote.neighborhoods ?? s.neighborhoods,
      freeShippingEnabled: remote.freeShippingEnabled ?? s.freeShippingEnabled,
      freeShippingThreshold: remote.freeShippingThreshold ?? s.freeShippingThreshold,
      coupons: remote.coupons ?? s.coupons,
      whatsapp: remote.whatsapp ?? s.whatsapp,
      restaurantName: remote.restaurantName ?? s.restaurantName,
      restaurantAddress: remote.restaurantAddress ?? s.restaurantAddress,
      pixKey: remote.pixKey ?? s.pixKey,
      openingHours: remote.openingHours ?? s.openingHours,
      paoOptions: remote.paoOptions ?? s.paoOptions,
      salsichaOptions: remote.salsichaOptions ?? s.salsichaOptions,
      molhosOptions: remote.molhosOptions ?? s.molhosOptions,
      adicionaisOptions: remote.adicionaisOptions ?? s.adicionaisOptions,
      tamanhoOptions: remote.tamanhoOptions ?? s.tamanhoOptions,
      bordaOptions: remote.bordaOptions ?? s.bordaOptions,
      saborOptions: remote.saborOptions ?? s.saborOptions,
    }));
  },

  login: async (pw) => {
    const res = await adminLogin({ data: { password: pw } });
    if (res.ok) set({ isAdmin: true, adminPassword: pw });
    return res.ok;
  },
  logout: () => set({ isAdmin: false, adminPassword: "" }),
  setPassword: (pw) => {
    const current = get().adminPassword;
    set({ adminPassword: pw });
    adminSetPassword({ data: { currentPassword: current, newPassword: pw } })
      .then((res) => {
        if (!res.ok) {
          set({ adminPassword: current });
          toast.error("Não foi possível atualizar a senha.");
        }
      })
      .catch(() => {
        set({ adminPassword: current });
        toast.error("Falha ao salvar no servidor. Verifique sua conexão.");
      });
  },
  upsertProduct: (p) => {
    const isSeed = seedProducts.some((s) => s.id === p.id);
    if (isSeed) {
      set((s) => ({
        productOverrides: { ...s.productOverrides, [p.id]: p },
        hiddenIds: s.hiddenIds.filter((x) => x !== p.id),
      }));
    } else {
      set((s) => {
        const exists = s.extraProducts.some((x) => x.id === p.id);
        return {
          extraProducts: exists
            ? s.extraProducts.map((x) => (x.id === p.id ? p : x))
            : [...s.extraProducts, p],
        };
      });
    }
    pushSettings(get);
  },
  deleteProduct: (id) => {
    const isSeed = seedProducts.some((s) => s.id === id);
    if (isSeed) {
      set((s) => ({ hiddenIds: [...new Set([...s.hiddenIds, id])] }));
    } else {
      set((s) => ({ extraProducts: s.extraProducts.filter((x) => x.id !== id) }));
    }
    pushSettings(get);
  },
  toggleHidden: (id) => {
    set((s) => ({
      hiddenIds: s.hiddenIds.includes(id)
        ? s.hiddenIds.filter((x) => x !== id)
        : [...s.hiddenIds, id],
    }));
    pushSettings(get);
  },
  setPromoOfDay: (id) => {
    set({ promoOfDayId: id });
    pushSettings(get);
  },
  setDeliveryFee: (n) => {
    set({ deliveryFee: n });
    pushSettings(get);
  },
  setNeighborhoods: (list) => {
    set({ neighborhoods: list });
    pushSettings(get);
  },
  setFreeShipping: (enabled, threshold) => {
    set({ freeShippingEnabled: enabled, freeShippingThreshold: threshold });
    pushSettings(get);
  },
  setCoupons: (c) => {
    set({ coupons: c });
    pushSettings(get);
  },
  setContact: ({ whatsapp, name, address }) => {
    set({ whatsapp, restaurantName: name, restaurantAddress: address });
    pushSettings(get);
  },
  setPixKey: (key) => {
    set({ pixKey: key });
    pushSettings(get);
  },
  setOpeningHours: (hours) => {
    set({ openingHours: hours });
    pushSettings(get);
  },
  setPaoOptions: (list) => {
    set({ paoOptions: list });
    pushSettings(get);
  },
  setSalsichaOptions: (list) => {
    set({ salsichaOptions: list });
    pushSettings(get);
  },
  setMolhosOptions: (list) => {
    set({ molhosOptions: list });
    pushSettings(get);
  },
  setAdicionaisOptions: (list) => {
    set({ adicionaisOptions: list });
    pushSettings(get);
  },
  setTamanhoOptions: (list) => {
    set({ tamanhoOptions: list });
    pushSettings(get);
  },
  setBordaOptions: (list) => {
    set({ bordaOptions: list });
    pushSettings(get);
  },
  setSaborOptions: (list) => {
    set({ saborOptions: list });
    pushSettings(get);
  },
  resetSeed: () => {
    set({
      productOverrides: {},
      extraProducts: [],
      hiddenIds: [],
      promoOfDayId: "simao-bacon-lover",
      deliveryFee: 6.9,
      neighborhoods: DEFAULT_NEIGHBORHOODS,
      freeShippingEnabled: true,
      freeShippingThreshold: 80,
      coupons: DEFAULT_COUPONS,
    });
    pushSettings(get);
  },
}));

/* Selectors / helper hooks */

export function useProducts(): Product[] {
  const overrides = useAdmin((s) => s.productOverrides);
  const extras = useAdmin((s) => s.extraProducts);
  const hidden = useAdmin((s) => s.hiddenIds);
  return useMemo(() => {
    const merged = seedProducts.map((p) => ({ ...p, ...(overrides[p.id] || {}) }));
    return [...merged, ...extras].filter((p) => !hidden.includes(p.id));
  }, [overrides, extras, hidden]);
}

export function useProduct(id: string): Product | undefined {
  const list = useProducts();
  return list.find((p) => p.id === id);
}

export function useProductsByCategory(slug: CategorySlug): Product[] {
  const list = useProducts();
  return useMemo(() => {
    if (slug === "promocoes")
      return list.filter((p) => p.tag === "promocao" || p.category === "promocoes");
    return list.filter((p) => p.category === slug);
  }, [list, slug]);
}

export function useFeatured(): Product[] {
  const list = useProducts();
  return useMemo(() => list.filter((p) => p.tag), [list]);
}

export function deliveryFeeForNeighborhood(
  neighborhoodId: string,
  neighborhoods: Neighborhood[],
  fallback: number,
): number {
  return neighborhoods.find((n) => n.id === neighborhoodId)?.fee ?? fallback;
}

// Cidade = último trecho separado por vírgula no endereço (ex: "..., São Paulo - SP")
export function cityFromAddress(address: string): string {
  const parts = address.split(",");
  const last = parts[parts.length - 1]?.trim();
  return last || address.trim();
}

export function useCity(): string {
  const address = useAdmin((s) => s.restaurantAddress);
  return useMemo(() => cityFromAddress(address), [address]);
}

/* Horário de funcionamento */

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function isStoreOpenNow(hours: DayHours[], now = new Date()): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay();
  const prevDay = (day + 6) % 7;

  const today = hours.find((h) => h.day === day);
  if (today && !today.closed) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (close > open) {
      if (nowMinutes >= open && nowMinutes < close) return true;
    } else if (nowMinutes >= open) {
      // horário cruza a meia-noite
      return true;
    }
  }

  const yesterday = hours.find((h) => h.day === prevDay);
  if (yesterday && !yesterday.closed) {
    const open = toMinutes(yesterday.open);
    const close = toMinutes(yesterday.close);
    if (close <= open && nowMinutes < close) {
      // ainda dentro do horário que cruzou a meia-noite ontem
      return true;
    }
  }

  return false;
}

export function useStoreOpenStatus(): boolean {
  const hours = useAdmin((s) => s.openingHours);
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return isStoreOpenNow(hours);
}

export { categories };
