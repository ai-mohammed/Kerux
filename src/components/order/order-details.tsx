import type { Order, Restaurant } from "@/types";
import { SERVICE_TYPE_LABEL } from "@/types";
import { formatDA, formatDate } from "@/lib/utils/format";
import { CartSummary } from "@/components/cart/cart-summary";
import { OrderTimeline, STATUS_LABEL } from "./order-timeline";


export function OrderDetails({ order, restaurant, live, children }: { order: Order; restaurant: Restaurant | null; live: boolean; children?: React.ReactNode }) {
  const discount = order.promoPercent ? Math.round((order.subtotal * order.promoPercent) / 100) : 0;
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <section className="board flex flex-col gap-5 p-5 sm:p-6" aria-labelledby="statut">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="statut" className="display text-3xl sm:text-4xl">
              {STATUS_LABEL[order.status]}
            </h2>
            <span className="rounded-full border border-line bg-cream px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink-600">{live ? "Suivi en direct" : "Dernier état connu"}</span>
          </div>
          <OrderTimeline status={order.status} />
          {children}
        </section>

        <section className="board p-5 sm:p-6" aria-labelledby="produits">
          <h2 id="produits" className="display-tight mb-3 text-2xl">
            Produits
          </h2>
          <ul className="divide-y divide-line">
            {order.lines.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 py-3 text-[15px]">
                <span>
                  <span className="font-bold num">{l.quantity} ×</span> {l.productName}
                  {l.supplements.length || l.observations.length ? <span className="block text-sm text-ink-500">{[...l.supplements.map((s) => `+ ${s.name}`), ...l.observations].join(" · ")}</span> : null}
                </span>
                <span className="font-bold num">{formatDA(l.total)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="board flex flex-col gap-4 p-5 lg:sticky lg:top-24" aria-label="Détails de la commande">
        <dl className="grid gap-3 text-[15px]">
          <Row label="Commande">
            <span className="display-tight text-2xl num">N° {order.reference}</span>
          </Row>
          <Row label="Passée le">{formatDate(order.createdAt) || "—"}</Row>
          <Row label="Mode">{SERVICE_TYPE_LABEL[order.serviceType]}</Row>
          {restaurant ? (
            <Row label="Restaurant">
              <span className="flex items-center gap-2">
                {restaurant.name}
                {restaurant.phone ? (
                  <a href={restaurant.phoneHref} className="text-blue underline underline-offset-4">
                    {restaurant.phone}
                  </a>
                ) : null}
              </span>
            </Row>
          ) : null}
          {order.serviceType === "livraison" ? (
            <Row label="Livraison">
              {order.districtName ? `${order.districtName} — ` : ""}
              {order.customerAddress || "—"}
            </Row>
          ) : null}
          <Row label="Contact">
            {order.customerName}
            {order.customerPhone ? ` · ${order.customerPhone}` : ""}
          </Row>
          {order.comment ? <Row label="Note">{order.comment}</Row> : null}
        </dl>
        <CartSummary totals={{ subtotal: order.subtotal, discount, deliveryFee: order.deliveryFee, usedPoints: order.usedPoints, total: order.total }} className="border-t border-line pt-4" />
        <p className="text-xs text-ink-500">Paiement à la réception.</p>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}
