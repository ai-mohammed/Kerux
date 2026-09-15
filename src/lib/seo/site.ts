export const SITE_NAME = "Kerux Foods";
export const SITE_TAGLINE = "Saveur - Vitalité";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
export const DEFAULT_DESCRIPTION =
  "Kerux Foods, le poulet comme vous l’aimez à Oran : burgers, tenders, wings, wraps et Pizza K. Commandez en livraison, à emporter ou sur place — Akid Lotfi et Boulevard des Lions.";

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
