import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAdmin } from "./admin-store";


export type CartCustomization = {
  pao?: string;
  salsicha?: string;
  tamanho?: string;
  borda?: string;
  sabor?: string;
  molhos: string[];
  remover: string[];
  adicionais: { name: string; price: number }[];
  observacoes?: string;
};

export type CartItem = {
  id: string; // unique cart line id
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  customization: CartCustomization;
};

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  total: number;
  status: string;
  address: string;
  payment: string;
};

type State = {
  items: CartItem[];
  favorites: string[];
  orders: Order[];
  drawerOpen: boolean;
  coupon?: { code: string; discount: number };
  addItem: (i: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  toggleFav: (id: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyCoupon: (code: string) => boolean;
  placeOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
};

export const itemUnitPrice = (i: CartItem) =>
  i.basePrice + i.customization.adicionais.reduce((s, a) => s + a.price, 0);

export const itemTotal = (i: CartItem) => itemUnitPrice(i) * i.quantity;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],
      orders: [],
      drawerOpen: false,
      addItem: (i) =>
        set((s) => ({ items: [...s.items, i], drawerOpen: true })),
      updateQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((it) => (it.id === id ? { ...it, quantity: Math.max(1, qty) } : it))
            .filter((it) => it.quantity > 0),
        })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [], coupon: undefined }),
      toggleFav: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((x) => x !== id)
            : [...s.favorites, id],
        })),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      applyCoupon: (code) => {
        const c = code.trim().toUpperCase();
        const found = useAdmin.getState().coupons.find((x) => x.code === c);
        if (found) {
          set({ coupon: { code: c, discount: found.discount } });
          return true;
        }
        return false;
      },

      placeOrder: (o) => {
        const order: Order = {
          ...o,
          id: `SIM${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: Date.now(),
          status: "Em preparo",
        };
        set((s) => ({ orders: [order, ...s.orders], items: [], coupon: undefined, drawerOpen: false }));
        return order;
      },
    }),
    {
      name: "simao-cart",
      partialize: (s) => ({ items: s.items, favorites: s.favorites, orders: s.orders, coupon: s.coupon }),
    },
  ),
);

export const cartCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + itemTotal(i), 0);
