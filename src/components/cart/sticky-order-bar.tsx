"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { cartCount, cartSubtotal, useCartStore } from "@/lib/cart/store";
import { formatDA } from "@/lib/utils/format";

const HIDDEN_ON = ["/cart", "/checkout", "/order", "/login", "/register", "/forgot-password", "/reset-password", "/account"];

/**
 * Phone-only bottom bar — the contracted primary action on mobile. With items
 * it shows the live total and goes to checkout; empty, it is a plain
 * Commander that opens the menu (except on the menu itself, where every card
 * already carries its add button).
 */
export function StickyOrderBar() {
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  if (!hydrated || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  if (!lines.length) {
    if (pathname.startsWith("/menu")) return null;
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-safe lg:hidden">
        <Link href="/menu" className="display-tight flex h-14 items-center justify-center rounded-2xl border-2 border-ink bg-red text-2xl text-white shadow-board-lg animate-rise">
          Commander
        </Link>
      </div>
    );
  }

  const count = cartCount(lines);
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-safe lg:hidden">
      <Link
        href="/checkout"
        className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-ink px-4 py-3 text-white shadow-board-lg animate-rise"
        aria-label={`Commander ${count} article${count > 1 ? "s" : ""} pour ${formatDA(cartSubtotal(lines))}`}
      >
        <span className="grid size-9 place-items-center rounded-full bg-yellow text-ink">
          <ShoppingBag className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-bold text-white/70">
            {count} article{count > 1 ? "s" : ""}
          </span>
          <span className="display-tight text-xl text-yellow num">{formatDA(cartSubtotal(lines))}</span>
        </span>
        <span className="display-tight ml-auto rounded-xl bg-red px-4 py-2.5 text-lg text-white">Commander</span>
      </Link>
    </div>
  );
}
