import "server-only";
import type { CreateOrderInput, Order } from "@/types";
import type { RawCreateOrderResponse, RawOrder, RawPaginated, RawPromo } from "./raw";
import { apiFetch } from "./client";
import { toOrder } from "./adapters";

/**
 * Payload of `POST /api/ventes/pending`, exactly as the legacy website sends it
 * (observed in the old bundle). Do not add fields the backend does not know.
 */
export function toCreateOrderPayload(input: CreateOrderInput) {
  const delivery = input.serviceType === "livraison" ? input.delivery : null;
  const comment = [input.comment?.trim(), delivery ? `Quartier: ${delivery.districtName}` : null].filter(Boolean).join(" | ");
  return {
    restaurant_id: input.restaurantId,
    source: "website",
    type_commande: input.serviceType,
    customer_name: input.customer.name,
    customer_phone: input.customer.phone,
    customer_address: delivery ? delivery.address : null,
    delivery_district_id: delivery ? delivery.districtId : null,
    delivery_district_name: delivery ? delivery.districtName : null,
    delivery_fee: delivery ? delivery.fee : 0,
    comment: comment || null,
    use_score: input.usePoints ?? 0,
    promo_code: input.promoCode ?? null,
    details: input.lines.map((l) => ({
      produit_id: l.productId,
      quantite: l.quantity,
      supplement_ids: l.supplements.map((s) => s.id),
      observation_ids: l.observations.map((o) => o.id),
    })),
  };
}

export async function createOrder(input: CreateOrderInput, token: string | null): Promise<Order> {
  const { data } = await apiFetch<RawCreateOrderResponse>("/api/ventes/pending", {
    method: "POST",
    body: toCreateOrderPayload(input),
    token,
    restaurantId: input.restaurantId,
    headers: { "Idempotency-Key": input.idempotencyKey },
    timeoutMs: 20_000,
  });
  const raw: RawOrder = data.order ?? data.data ?? (data as RawOrder);
  return toOrder(raw);
}

export async function getOrder(publicId: string, token: string): Promise<Order> {
  const { data } = await apiFetch<{ data?: RawOrder } | RawOrder>(`/api/client-auth/orders/${encodeURIComponent(publicId)}`, { token });
  const raw = ("data" in data && data.data ? data.data : data) as RawOrder;
  return toOrder(raw);
}

export async function listOrders(token: string, page = 1): Promise<{ orders: Order[]; lastPage: number }> {
  const { data } = await apiFetch<RawPaginated<RawOrder> | { data: RawOrder[] }>(`/api/client-auth/orders?page=${page}&per_page=20`, { token });
  const items = Array.isArray(data.data) ? data.data : [];
  return { orders: items.map(toOrder), lastPage: "last_page" in data ? data.last_page : 1 };
}

export async function verifyPromo(code: string, token: string | null): Promise<{ code: string; percent: number }> {
  const { data } = await apiFetch<{ data?: RawPromo } | RawPromo>(`/api/promos/vrf?promo_code=${encodeURIComponent(code)}`, { token });
  const raw = ("data" in data && data.data ? data.data : data) as RawPromo;
  return { code: raw.promo_code ?? code, percent: Number(raw.pourcentage) || 0 };
}
