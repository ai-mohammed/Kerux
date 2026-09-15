/**
 * Domain types used by the UI. They are produced by `src/lib/api/adapters.ts`
 * from the raw Laravel shapes and never expose internal backend fields.
 */

export type I18nText = { fr: string; en?: string; ar?: string };

export type Category = {
  id: number;
  publicId: string;
  restaurantId: number;
  slug: string;
  name: string;
  imageUrl: string | null;
  productCount: number;
  active: boolean;
};

export type Product = {
  id: number;
  publicId: string;
  slug: string;
  restaurantId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  description: string;
  descriptionI18n: I18nText | null;
  ingredients: string;
  imageUrl: string | null;
  available: boolean;
  onSale: boolean;
  isNew: boolean;
};

export type Supplement = {
  id: number;
  publicId: string;
  name: string;
  price: number;
  categoryIds: number[];
};

export type Observation = {
  id: number;
  publicId: string;
  name: string;
  categoryIds: number[];
};

export type Restaurant = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  phoneHref: string;
  hours: string | null;
  directionsUrl: string;
};

export type ServiceStatus = {
  restaurantId: number;
  isOpen: boolean;
};

export type DeliveryDistrict = {
  id: number;
  publicId: string;
  restaurantId: number;
  name: string;
  fee: number;
};

export type ServiceType = "livraison" | "emporter" | "sur_place";

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  livraison: "Livraison",
  emporter: "À emporter",
  sur_place: "Sur place",
};

/** Exact enum of the backend — never extend it on the frontend. */
export type OrderStatus = "en_attente_validation_caissier" | "en_cours" | "validee" | "annulee";

export type OrderLine = {
  id: string;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  supplements: { name: string; price: number }[];
  observations: string[];
  total: number;
};

export type Order = {
  id: number | null;
  publicId: string;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  finished: boolean;
  serviceType: ServiceType;
  restaurantId: number | null;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  districtName: string;
  comment: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  promoPercent: number;
  usedPoints: number;
  total: number;
};

export type User = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  points: number;
  profileComplete: boolean;
  kind: "client" | "user";
};

export type CartLine = {
  lineId: string;
  productId: number;
  productSlug: string;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  supplements: { id: number; name: string; price: number }[];
  observations: { id: number; name: string }[];
};

export type CreateOrderInput = {
  restaurantId: number;
  serviceType: ServiceType;
  customer: { name: string; phone: string };
  delivery?: { address: string; districtId: number; districtName: string; fee: number } | null;
  comment?: string;
  promoCode?: string | null;
  usePoints?: number;
  lines: CartLine[];
  idempotencyKey: string;
};

export type ApiFailure = {
  ok: false;
  status: number;
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
};
