import type { CartLine, DeliveryDistrict, ServiceType } from "@/types";
import { isValidPhone } from "@/lib/utils/format";

/**
 * Pure business rules of the checkout, shared by the React flow, the route
 * handler and the executable spec (unspa/). No React, no fetch: every rule
 * here is what the Unspaghettit scenarios replay against.
 */

export type ContactInput = {
  serviceType: ServiceType | null;
  name: string;
  phone: string;
  districtId: string | number | null;
  address: string;
  /** Districts of the restaurant currently selected — a district of another restaurant is not valid. */
  districts: DeliveryDistrict[];
};

export type ContactErrors = Partial<Record<"name" | "phone" | "districtId" | "address", string>>;

export const MESSAGES = {
  emptyCart: "Votre panier est vide.",
  closed: "Le restaurant est fermé pour le moment.",
  noService: "Choisissez livraison, à emporter ou sur place.",
  name: "Indiquez votre nom pour la commande.",
  phone: "Numéro attendu : 05, 06 ou 07 suivi de 8 chiffres.",
  district: "Choisissez votre quartier pour la livraison.",
  address: "Indiquez une adresse précise (rue, immeuble, étage…).",
  alreadySubmitted: "Commande déjà envoyée : suivez-la avant d’en passer une autre.",
} as const;

/** The district chosen, but only if it belongs to the selected restaurant's list. */
export function resolveDistrict(input: Pick<ContactInput, "districtId" | "districts">): DeliveryDistrict | null {
  if (input.districtId === null || input.districtId === "" || input.districtId === 0) return null;
  return input.districts.find((d) => String(d.id) === String(input.districtId)) ?? null;
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  if (!input.name.trim()) errors.name = MESSAGES.name;
  if (!isValidPhone(input.phone)) errors.phone = MESSAGES.phone;
  if (input.serviceType === "livraison") {
    if (!resolveDistrict(input)) errors.districtId = MESSAGES.district;
    if (input.address.trim().length < 5) errors.address = MESSAGES.address;
  }
  return errors;
}

export type SubmitGateInput = ContactInput & {
  lines: CartLine[];
  /** Live `is_open`; `null` = unknown (the site does not block on an unknown status). */
  isOpen: boolean | null;
  /** True once an order was submitted with the current idempotency key. */
  alreadySubmitted: boolean;
};

/** First reason the order cannot be sent, or `null` when it can. Order matters: it mirrors the checkout UI. */
export function submitBlocker(input: SubmitGateInput): string | null {
  if (input.lines.length === 0) return MESSAGES.emptyCart;
  if (input.isOpen === false) return MESSAGES.closed;
  if (!input.serviceType) return MESSAGES.noService;
  const errors = validateContact(input);
  const first = (Object.keys(errors) as (keyof ContactErrors)[]).find((k) => errors[k]);
  if (first) return errors[first] ?? null;
  if (input.alreadySubmitted) return MESSAGES.alreadySubmitted;
  return null;
}

/** delivery_fee actually charged: the district's fee in delivery, 0 otherwise. */
export function deliveryFeeFor(serviceType: ServiceType | null, district: DeliveryDistrict | null): number {
  return serviceType === "livraison" ? district?.fee ?? 0 : 0;
}
