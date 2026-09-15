import { NextResponse } from "next/server";
import type { CartLine, CreateOrderInput, ServiceType } from "@/types";
import { ApiError } from "@/lib/api/client";
import { errorResponse, optionalString, readJson, requireString } from "@/lib/api/http";
import { createOrder, listOrders } from "@/lib/api/orders";
import { getSession } from "@/lib/auth/session";
import { isValidPhone, normalizePhone } from "@/lib/utils/format";

const SERVICE_TYPES: ServiceType[] = ["livraison", "emporter", "sur_place"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fail = (message: string, field?: string) => new ApiError(422, message, "VALIDATION", field ? { [field]: [message] } : undefined);

function parseLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw) || raw.length === 0) throw fail("Votre panier est vide.", "lines");
  if (raw.length > 50) throw fail("Trop d’articles dans une seule commande.", "lines");
  return raw.map((l: Record<string, unknown>) => {
    const productId = Number(l.productId);
    const quantity = Number(l.quantity);
    if (!Number.isInteger(productId) || productId <= 0) throw fail("Un produit du panier est invalide.", "lines");
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 50) throw fail("Quantité invalide.", "lines");
    const ids = (arr: unknown) => (Array.isArray(arr) ? arr.map((x: { id?: unknown }) => Number(x?.id)).filter((n) => Number.isInteger(n) && n > 0) : []);
    return {
      lineId: String(l.lineId ?? productId),
      productId,
      productSlug: String(l.productSlug ?? ""),
      productName: String(l.productName ?? ""),
      productImageUrl: null,
      unitPrice: Number(l.unitPrice) || 0,
      quantity,
      supplements: ids(l.supplements).map((id) => ({ id, name: "", price: 0 })),
      observations: ids(l.observations).map((id) => ({ id, name: "" })),
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    const serviceType = String(body.serviceType) as ServiceType;
    if (!SERVICE_TYPES.includes(serviceType)) throw fail("Choisissez livraison, à emporter ou sur place.", "serviceType");
    const restaurantId = Number(body.restaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) throw fail("Choisissez un restaurant.", "restaurantId");
    const customer = (body.customer ?? {}) as Record<string, unknown>;
    const name = requireString(customer.name, "Nom", 80);
    const phone = normalizePhone(requireString(customer.phone, "Téléphone", 20));
    if (!isValidPhone(phone)) throw fail("Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres.", "phone");
    const idempotencyKey = String(body.idempotencyKey ?? "");
    if (!UUID.test(idempotencyKey)) throw fail("Clé de commande invalide.", "idempotencyKey");

    let delivery: CreateOrderInput["delivery"] = null;
    if (serviceType === "livraison") {
      const d = (body.delivery ?? {}) as Record<string, unknown>;
      const districtId = Number(d.districtId);
      if (!Number.isInteger(districtId) || districtId <= 0) throw fail("Choisissez votre quartier.", "district");
      delivery = {
        address: requireString(d.address, "Adresse", 200),
        districtId,
        districtName: requireString(d.districtName, "Quartier", 80),
        fee: Math.max(0, Number(d.fee) || 0),
      };
    }

    const input: CreateOrderInput = {
      restaurantId,
      serviceType,
      customer: { name, phone },
      delivery,
      comment: optionalString(body.comment, 500),
      promoCode: optionalString(body.promoCode, 40) || null,
      usePoints: Math.max(0, Math.floor(Number(body.usePoints) || 0)),
      lines: parseLines(body.lines),
      idempotencyKey,
    };

    const session = await getSession();
    const order = await createOrder(input, session?.token ?? null);
    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return NextResponse.json(
        { ok: false, status: 401, code: "AUTH_REQUIRED", message: "Connectez-vous pour valider votre commande. Votre panier est conservé." },
        { status: 401 },
      );
    }
    return errorResponse(err);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) throw new ApiError(401, "Connectez-vous pour voir vos commandes.", "UNAUTHENTICATED");
    const page = Math.max(1, Number(new URL(req.url).searchParams.get("page")) || 1);
    const result = await listOrders(session.token, page);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
