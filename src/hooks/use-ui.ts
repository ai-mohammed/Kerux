"use client";

import { create } from "zustand";

type UiState = {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Bumped on every add-to-cart so the header cart button can play its stamp animation. */
  stampTick: number;
  stamp: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  stampTick: 0,
  stamp: () => set((s) => ({ stampTick: s.stampTick + 1 })),
}));
