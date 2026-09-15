"use client";

import { cartCount, cartTotals, useCartStore } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/bits";
import { CartLineRow } from "./cart-line";
import { CartSummary } from "./cart-summary";
import { PromoCodeField } from "./promo-code-field";

export function CartView() {
  const { lines, promo, hydrated, clear } = useCartStore();
  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]" aria-busy="true">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!lines.length) {
    return <EmptyState title="Une envie de Kerux ?" text="Votre panier est vide. Le menu n’attend que vous." action={<Button href="/menu">Voir le menu</Button>} />;
  }
  const totals = cartTotals(lines, promo);
  const count = cartCount(lines);
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <section className="board px-5" aria-label="Articles du panier">
        <div className="flex items-center justify-between border-b border-line py-4">
          <h2 className="display-tight text-2xl">
            {count} article{count > 1 ? "s" : ""}
          </h2>
          <button type="button" onClick={clear} className="text-sm font-bold text-ink-500 underline underline-offset-4 hover:text-alert">
            Vider le panier
          </button>
        </div>
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <CartLineRow key={l.lineId} line={l} />
          ))}
        </ul>
      </section>
      <aside className="board flex flex-col gap-5 p-5 lg:sticky lg:top-24" aria-label="Récapitulatif">
        <PromoCodeField />
        <CartSummary totals={totals} deliveryLabel="Livraison" />
        <p className="text-xs text-ink-500">Les frais de livraison dépendent du quartier choisi à l’étape suivante.</p>
        <Button href="/checkout" size="lg" className="w-full">
          Continuer
        </Button>
        <Button href="/menu" variant="ghost" className="w-full">
          Ajouter d’autres produits
        </Button>
      </aside>
    </div>
  );
}
