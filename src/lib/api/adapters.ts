import type {
  Category,
  DeliveryDistrict,
  I18nText,
  Observation,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Restaurant,
  ServiceStatus,
  ServiceType,
  Supplement,
  User,
} from "@/types";
import type {
  RawCategory,
  RawDistrict,
  RawI18n,
  RawObservation,
  RawOrder,
  RawOrderDetail,
  RawProduct,
  RawRestaurant,
  RawServiceStatus,
  RawSupplement,
  RawUser,
} from "./raw";
import { productSlug, slugify } from "@/lib/utils/slug";
import { telHref } from "@/lib/utils/format";

/* ------------------------------------------------------------------ helpers */

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));

/** Backend photos are absolute URLs on the API origin; the site serves them through `/media/…` (same origin, cacheable, TLS handled server-side). */
export function toMediaPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/media\/(.+)$/i);
  if (m) return `/media/${m[1]}`;
  if (url.startsWith("/")) return url;
  return null;
}

function parseI18n(raw: RawI18n): I18nText | null {
  if (!raw) return null;
  if (typeof raw === "object") {
    const fr = str(raw.fr), en = str(raw.en), ar = str(raw.ar);
    if (!fr && !en && !ar) return null;
    return { fr: fr || en || ar, en: en || undefined, ar: ar || undefined };
  }
  const t = raw.trim();
  if (t.startsWith("{") && t.endsWith("}")) {
    try {
      return parseI18n(JSON.parse(t));
    } catch {
      /* plain text that happens to look like JSON */
    }
  }
  return t ? { fr: t } : null;
}

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

/* --------------------------------------------------------------- catalogue */

/** Human names for the two known restaurants; anything else falls back to the API name. */
const RESTAURANT_NAMES: Record<string, { name: string; short: string; mapsQuery: string }> = {
  AKID: { name: "Kerux Akid Lotfi", short: "Akid Lotfi", mapsQuery: "Kerux Foods, Akid Lotfi, Oran" },
  BDL: { name: "Kerux Boulevard des Lions", short: "Boulevard des Lions", mapsQuery: "PC4R+R98, Bir El Djir, Oran" },
};

export function toCategory(raw: RawCategory): Category {
  const name = str(raw.nom ?? raw.name).trim();
  return {
    id: raw.id,
    publicId: str(raw.public_id),
    restaurantId: num(raw.restaurant_id, 0),
    slug: slugify(name),
    name,
    imageUrl: toMediaPath(raw.photo_url ?? raw.img),
    productCount: num(raw.quantity ?? raw.produits_count, 0),
    active: raw.actif ?? raw.active ?? true,
  };
}

export function toProduct(raw: RawProduct): Product {
  const name = str(raw.nom ?? raw.name).trim();
  const publicId = str(raw.public_id) || String(raw.id);
  const description = parseI18n(raw.description);
  const ingredients = parseI18n(raw.ingredients);
  const createdAt = raw.created_at ? Date.parse(raw.created_at) : NaN;
  return {
    id: raw.id,
    publicId,
    slug: productSlug(name, publicId),
    restaurantId: num(raw.restaurant_id, 0),
    categoryId: num(raw.categorie_id ?? raw.categoryId ?? raw.categorie?.id, 0),
    categoryName: str(raw.categorie?.nom ?? raw.categorie?.name ?? raw.category).trim(),
    name,
    price: num(raw.prix_vente ?? raw.price),
    description: description?.fr ?? "",
    descriptionI18n: description,
    ingredients: ingredients?.fr ?? "",
    imageUrl: toMediaPath(raw.photo_url ?? raw.img ?? raw.photo),
    available: raw.actif ?? raw.active ?? true,
    onSale: num(raw.sold, 0) > 0,
    isNew: Number.isFinite(createdAt) && Date.now() - createdAt < THIRTY_DAYS,
  };
}

export function toSupplement(raw: RawSupplement): Supplement {
  return {
    id: raw.id,
    publicId: str(raw.public_id),
    name: raw.nom.trim(),
    price: num(raw.prix_vente),
    categoryIds: raw.categorie_ids ?? [],
  };
}

export function toObservation(raw: RawObservation): Observation {
  return {
    id: raw.id,
    publicId: str(raw.public_id),
    name: raw.nom.trim(),
    categoryIds: raw.categorie_ids ?? [],
  };
}

export function toRestaurant(raw: RawRestaurant): Restaurant {
  const code = raw.nom.trim().toUpperCase();
  const known = RESTAURANT_NAMES[code];
  const phone = str(raw.telephone).trim();
  const mapsQuery = known?.mapsQuery ?? `Kerux Foods, ${raw.adresse}`;
  return {
    id: raw.id,
    code,
    name: known?.name ?? `Kerux ${raw.nom}`,
    shortName: known?.short ?? raw.nom,
    address: raw.adresse,
    phone,
    phoneHref: phone ? telHref(phone) : "",
    hours: raw.horaires?.trim() || null,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapsQuery)}`,
  };
}

export function toServiceStatus(raw: RawServiceStatus): ServiceStatus {
  return { restaurantId: raw.restaurant_id, isOpen: Boolean(raw.is_open) };
}

export function toDistrict(raw: RawDistrict): DeliveryDistrict {
  return {
    id: raw.id,
    publicId: str(raw.public_id),
    restaurantId: raw.restaurant_id,
    name: raw.district_name,
    fee: num(raw.delivery_price),
  };
}

/* ------------------------------------------------------------------ orders */

const STATUSES: OrderStatus[] = ["en_attente_validation_caissier", "en_cours", "validee", "annulee"];
const SERVICE_TYPES: ServiceType[] = ["livraison", "emporter", "sur_place"];

export function toOrderStatus(v: unknown): OrderStatus {
  return STATUSES.includes(v as OrderStatus) ? (v as OrderStatus) : "en_attente_validation_caissier";
}

export function toServiceType(v: unknown): ServiceType {
  return SERVICE_TYPES.includes(v as ServiceType) ? (v as ServiceType) : "sur_place";
}

function toOrderLines(details: RawOrderDetail[]): OrderLine[] {
  const children = (parentId: number) => details.filter((d) => d.parent_id === parentId);
  return details
    .filter((d) => !d.is_supplement && !d.is_observation)
    .map((d) => {
      const product = d.produit ? toProduct(d.produit) : null;
      const supplements = children(d.id)
        .filter((c) => c.is_supplement)
        .map((c) => ({ name: c.produit ? str(c.produit.nom ?? c.produit.name) : "Supplément", price: num(c.total_ligne) }));
      const observations = children(d.id)
        .filter((c) => c.is_observation)
        .map((c) => (c.produit ? str(c.produit.nom ?? c.produit.name) : "Option"));
      const quantity = num(d.quantite, 1);
      const unitPrice = num(d.prix_unitaire, product?.price ?? 0);
      const total = num(d.total_ligne, unitPrice * quantity) + supplements.reduce((s, x) => s + x.price, 0);
      return {
        id: String(d.id),
        productName: product?.name ?? "Produit",
        productImageUrl: product?.imageUrl ?? null,
        unitPrice,
        quantity,
        supplements,
        observations,
        total,
      };
    });
}

export function toOrder(raw: RawOrder): Order {
  const status = toOrderStatus(raw.statut);
  const lines = toOrderLines(Array.isArray(raw.details) ? raw.details : []);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const deliveryFee = num(raw.delivery_fee, 0);
  const total = num(raw.total_apres_remise ?? raw.total_ttc, subtotal + deliveryFee);
  const serviceType = toServiceType(raw.type_commande);
  return {
    id: raw.id ?? null,
    publicId: str(raw.public_id ?? raw.id),
    reference: str(raw.order_reference ?? raw.numero_commande ?? raw.ticket_no ?? raw.numero_ticket ?? raw.id),
    createdAt: str(raw.date_vente ?? raw.created_at) || new Date().toISOString(),
    status,
    finished: status === "validee" || status === "annulee",
    serviceType,
    restaurantId: raw.restaurant_id ?? null,
    customerName: str(raw.client?.nom ?? raw.client?.name ?? raw.customer_name),
    customerPhone: str(raw.customer_phone ?? raw.client?.telephone),
    customerAddress: str(raw.customer_address ?? raw.client?.adresse),
    districtName: serviceType === "livraison" ? str(raw.delivery_district_name ?? raw.client?.quartier) : "",
    comment: str(raw.customer_note ?? raw.comment),
    lines,
    subtotal,
    deliveryFee,
    promoPercent: num(raw.promo_code_pourcentage, 0),
    usedPoints: num(raw.use_score, 0),
    total,
  };
}

/* -------------------------------------------------------------------- users */

export function toUser(raw: RawUser, kind: "client" | "user" = "client"): User {
  const first = str(raw.name ?? raw.nom).trim();
  const last = str(raw.lastName).trim();
  return {
    id: raw.id ?? raw._id ?? "",
    name: [first, last].filter(Boolean).join(" "),
    email: str(raw.email),
    phone: str(raw.phone ?? raw.number ?? raw.telephone),
    address: str(raw.address ?? raw.adresse),
    district: str(raw.district ?? raw.quartier),
    points: num(raw.score ?? raw.points, 0),
    profileComplete: (raw.profileState ?? "complited") === "complited",
    kind,
  };
}
