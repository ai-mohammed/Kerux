export const SITE_NAME = "Kerux Foods";
export const SITE_TAGLINE = "Saveur - Vitalité";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

/**
 * Phrase d'accroche : hero (H1), image OpenGraph, manifest et titres OG.
 * Un seul endroit à changer. Sans point final — chaque emplacement ajoute sa
 * propre ponctuation (le H1 un point, le manifest une virgule).
 */
export const SITE_HEADLINE_LEAD = "Le goût";
export const SITE_HEADLINE_HIGHLIGHT = "comme vous l’aimez";
export const SITE_HEADLINE = `${SITE_HEADLINE_LEAD} ${SITE_HEADLINE_HIGHLIGHT}`;

/** Ce que Kerux sert, en une ligne. Garde le mot-clé « poulet » que le H1 ne porte plus. */
export const SITE_SUBLINE =
  "Le poulet croustillant de Kerux — burgers, tenders, wings, wraps et Pizza K. Livraison, à emporter ou sur place à Oran.";

export const DEFAULT_DESCRIPTION = `Kerux Foods, le poulet croustillant à Oran : ${SITE_HEADLINE.toLowerCase()}. Burgers, tenders, wings, wraps et Pizza K, en livraison, à emporter ou sur place — Akid Lotfi et Boulevard des Lions.`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
