"use client";

import { useCallback } from "react";
import type { CartLine, Product } from "@/types";
import { useCartStore } from "@/lib/cart/store";
import { useUiStore } from "@/hooks/use-ui";
import { toast } from "@/hooks/use-toast";

/** Adds to the cart, plays the header stamp and confirms with a toast — the one add path for every screen. */
export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  const stamp = useUiStore((s) => s.stamp);
  return useCallback(
    (product: Product, opts?: { quantity?: number; supplements?: CartLine["supplements"]; observations?: CartLine["observations"] }) => {
      if (!product.available) {
        toast(`${product.name} est épuisé pour le moment.`, "error");
        return false;
      }
      add(product, opts);
      stamp();
      const q = opts?.quantity ?? 1;
      toast(`${q > 1 ? `${q} × ` : ""}${product.name} ajouté au panier`, "success", { label: "Commander", href: "/checkout" });
      return true;
    },
    [add, stamp],
  );
}
