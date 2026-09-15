"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart/store";
import { useUiStore } from "@/hooks/use-ui";
import { formatDA } from "@/lib/utils/format";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartLineRow } from "./cart-line";

export function CartDrawer() {
  const { cartOpen, closeCart } = useUiStore();
  const lines = useCartStore((s) => s.lines);
  const router = useRouter();
  const pathname = usePathname();

  // Navigating anywhere closes the drawer.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);

  return (
    <Sheet
      open={cartOpen}
      onClose={closeCart}
      title={count ? `Panier · ${count} article${count > 1 ? "s" : ""}` : "Panier"}
      side="right"
      footer={
        lines.length ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-ink-600">Sous-total</span>
              <span className="display-tight text-2xl num">{formatDA(subtotal)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => { closeCart(); router.push("/checkout"); }} data-autofocus>
              Commander
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { closeCart(); router.push("/cart"); }}>
              Voir le panier
            </Button>
          </div>
        ) : null
      }
    >
      {lines.length ? (
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <CartLineRow key={l.lineId} line={l} compact />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="display text-3xl">Une envie de Kerux ?</p>
          <p className="text-ink-600">Votre panier est vide pour le moment.</p>
          <Button onClick={() => { closeCart(); router.push("/menu"); }} data-autofocus>
            Voir le menu
          </Button>
        </div>
      )}
    </Sheet>
  );
}
