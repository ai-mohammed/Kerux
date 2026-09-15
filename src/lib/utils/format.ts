const dinars = new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 });

/** `1400` → `1 400 DA` (narrow no-break spaces, never wraps). */
export function formatDA(amount: number): string {
  return `${dinars.format(Math.round(amount))} DA`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

/** Algerian mobile numbers as accepted by the backend: 05/06/07 + 8 digits. */
export const PHONE_PATTERN = /^(05|06|07)\d{8}$/;

export function normalizePhone(input: string): string {
  return input.replace(/[\s.-]/g, "").replace(/^\+213/, "0").replace(/^00213/, "0");
}

export function isValidPhone(input: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(input));
}

export function telHref(phone: string): string {
  const n = normalizePhone(phone);
  return `tel:+213${n.replace(/^0/, "")}`;
}
