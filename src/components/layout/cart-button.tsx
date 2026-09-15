"use client";

import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { cartCount, useCartStore } from "@/lib/cart/store";
import { useUiStore } from "@/hooks/use-ui";
import { cn } from "@/lib/utils/cn";

/** Header basket. Plays the "stamp" beat whenever a product lands in the cart. */
export function CartButton({ className }: { className?: string }) {
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const openCart = useUiStore((s) => s.openCart);
  const tick = useUiStore((s) => s.stampTick);
  const [stamping, setStamping] = useState(false);
  const first = useRef(true);
  const count = hydrated ? cartCount(lines) : 0;

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStamping(true);
    const t = setTimeout(() => setStamping(false), 260);
    return () => clearTimeout(t);
  }, [tick]);

  return (
    <button
      type="button"
      onClick={openCart}
      className={cn(
        "relative grid size-11 place-items-center rounded-full border-2 border-ink bg-white text-ink transition-colors hover:bg-cream",
        stamping && "animate-stamp",
        className,
      )}
      aria-label={count ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier vide"}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 ? (
        <span key={count} className="display-tight absolute -right-1.5 -top-1.5 grid min-w-6 place-items-center rounded-full bg-red px-1.5 py-0.5 text-sm text-white ring-2 ring-cream animate-tick num" aria-hidden>
          {count}
        </span>
      ) : null}
    </button>
  );
}
