"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Product } from "@/types";

export type CartPromo = { code: string; percent: number } | null;

type CartState = {
  lines: CartLine[];
  promo: CartPromo;
  /** False until the persisted cart is loaded, so counts render only after hydration (no SSR mismatch). */
  hydrated: boolean;
  add: (product: Product, opts?: { quantity?: number; supplements?: CartLine["supplements"]; observations?: CartLine["observations"] }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  setPromo: (promo: CartPromo) => void;
  markHydrated: () => void;
};

/** One line per product + option combination, so "Beng + cheddar" and "Beng" stay separate. */
export function lineIdFor(productId: number, supplements: { id: number }[], observations: { id: number }[]): string {
  const s = [...supplements].map((x) => x.id).sort((a, b) => a - b).join(".");
  const o = [...observations].map((x) => x.id).sort((a, b) => a - b).join(".");
  return `${productId}|${s}|${o}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promo: null,
      hydrated: false,
      add: (product, opts = {}) =>
        set((state) => {
          const supplements = opts.supplements ?? [];
          const observations = opts.observations ?? [];
          const quantity = Math.max(1, opts.quantity ?? 1);
          const lineId = lineIdFor(product.id, supplements, observations);
          const existing = state.lines.find((l) => l.lineId === lineId);
          if (existing) {
            return { lines: state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(50, l.quantity + quantity) } : l)) };
          }
          const line: CartLine = {
            lineId,
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            productImageUrl: product.imageUrl,
            unitPrice: product.price,
            quantity,
            supplements,
            observations,
          };
          return { lines: [...state.lines, line] };
        }),
      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.lineId !== lineId)
              : state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.min(50, quantity) } : l)),
        })),
      remove: (lineId) => set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),
      clear: () => set({ lines: [], promo: null }),
      setPromo: (promo) => set({ promo }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "kerux-cart",
      version: 1,
      partialize: (s) => ({ lines: s.lines, promo: s.promo }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);

export const lineTotal = (l: CartLine) => (l.unitPrice + l.supplements.reduce((s, x) => s + x.price, 0)) * l.quantity;
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + lineTotal(l), 0);
export const cartCount = (lines: CartLine[]) => lines.reduce((s, l) => s + l.quantity, 0);

export function cartTotals(lines: CartLine[], promo: CartPromo, deliveryFee = 0, usedPoints = 0) {
  const subtotal = cartSubtotal(lines);
  const discount = promo ? Math.round((subtotal * promo.percent) / 100) : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee - usedPoints);
  return { subtotal, discount, deliveryFee, usedPoints, total };
}
