"use client";

import Link from "next/link";
import type { Restaurant } from "@/types";
import { useRecentOrder } from "@/lib/orders/recent";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/bits";
import { OrderDetails } from "./order-details";

/**
 * Guests cannot read an order back from the API, so we show the confirmation
 * kept on this device and point to the restaurant's phone for live news.
 */
export function GuestOrderView({ publicId, restaurants, reason }: { publicId: string; restaurants: Restaurant[]; reason: "guest" | "expired" | "notfound" }) {
  const order = useRecentOrder(publicId);

  if (order === undefined) return <Skeleton className="h-72" aria-busy="true" />;

  if (!order) {
    return (
      <EmptyState
        title="Commande introuvable"
        text={
          reason === "notfound"
            ? "Aucune commande ne correspond à ce numéro sur ce compte. Vérifiez le numéro ou appelez le restaurant."
            : "Cette commande n’est pas enregistrée sur cet appareil. Connectez-vous avec le compte utilisé pour la passer, ou appelez le restaurant."
        }
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button href={`/login?next=/order/${encodeURIComponent(publicId)}`}>Se connecter</Button>
            <Button href="/track-order" variant="secondary">
              Autre numéro
            </Button>
          </div>
        }
      />
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurantId) ?? null;
  return (
    <OrderDetails order={order} restaurant={restaurant} live={false}>
      <p className="rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink-600">
        Suivi en direct réservé aux comptes Kerux.{" "}
        <Link href={`/login?next=/order/${encodeURIComponent(publicId)}`} className="font-bold text-blue underline underline-offset-4">
          Connectez-vous
        </Link>
        {restaurant?.phone ? (
          <>
            {" "}
            ou appelez {restaurant.shortName} au{" "}
            <a href={restaurant.phoneHref} className="font-bold text-blue underline underline-offset-4">
              {restaurant.phone}
            </a>
          </>
        ) : null}
        .
      </p>
    </OrderDetails>
  );
}
