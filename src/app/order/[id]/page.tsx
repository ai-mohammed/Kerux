import type { Metadata } from "next";
import { PartyPopper } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { getOrder } from "@/lib/api/orders";
import { getRestaurants } from "@/lib/api/restaurants";
import { getSession } from "@/lib/auth/session";
import { Container, SectionTitle } from "@/components/ui/bits";
import { OrderDetails } from "@/components/order/order-details";
import { OrderLive } from "@/components/order/order-live";
import { GuestOrderView } from "@/components/order/guest-order-view";

export const metadata: Metadata = { title: "Suivi de commande", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const [{ id }, { new: isNew }] = await Promise.all([params, searchParams]);
  const publicId = decodeURIComponent(id);
  const [session, restaurants] = await Promise.all([getSession(), getRestaurants().catch(() => [])]);

  let reason: "guest" | "expired" | "notfound" = "guest";
  let order = null;
  if (session) {
    try {
      order = await getOrder(publicId, session.token);
    } catch (err) {
      reason = err instanceof ApiError && err.status === 404 ? "notfound" : err instanceof ApiError && err.status === 401 ? "expired" : "guest";
    }
  }

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      {isNew ? (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-green bg-green-100 px-5 py-4" role="status">
          <PartyPopper className="size-7 shrink-0 text-green" aria-hidden />
          <div>
            <p className="display-tight text-2xl">Commande envoyée !</p>
            <p className="text-sm text-ink-600">Le restaurant la confirme et vous appelle si besoin. Gardez cette page pour suivre l’avancement.</p>
          </div>
        </div>
      ) : null}
      <SectionTitle as="h1">Suivi de commande</SectionTitle>
      {order ? (
        <OrderDetails order={order} restaurant={restaurants.find((r) => r.id === order.restaurantId) ?? null} live>
          <OrderLive finished={order.finished} />
        </OrderDetails>
      ) : (
        <GuestOrderView publicId={publicId} restaurants={restaurants} reason={reason} />
      )}
    </Container>
  );
}
