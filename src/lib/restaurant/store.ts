"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_RESTAURANT_ID = 1;

type RestaurantState = {
  selectedId: number;
  hydrated: boolean;
  select: (id: number) => void;
  markHydrated: () => void;
};

/** The restaurant chosen in the header. Drives the live status, the delivery districts and the order's `restaurant_id`. */
export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set) => ({
      selectedId: DEFAULT_RESTAURANT_ID,
      hydrated: false,
      select: (id) => set({ selectedId: id }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "kerux-restaurant",
      partialize: (s) => ({ selectedId: s.selectedId }),
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    },
  ),
);
