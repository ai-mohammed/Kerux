/**
 * In-store menu screens ("Studio noir"). Prices and availability always come
 * from the back-office catalogue: change a price there and every screen picks
 * it up on its next refresh. This file only holds what the back-office does
 * not know: which categories go on which screen, the order, short on-screen
 * lines ("Sauce Kerux, tenders…") and the studio photos used on the screens.
 *
 * A product added to one of these categories in the back-office appears on its
 * screen automatically (after the configured ones); one switched to inactive
 * shows "Épuisé" in place, so the layout never gets a hole.
 */
import type { Product } from "@/types";

export type ScreenItem = {
  id: number;
  name: string;
  detail: string;
  price: number;
  available: boolean;
  imageUrl: string | null;
  /** Short yellow badge on the photo ("20 pièces"), so the boxes read at a glance. */
  badge?: string;
};

/** Each screen has its own layout so the three TVs do not look identical. */
export type ScreenLayout = "vitrine" | "trio" | "grille" | "mosaique" | "etagere";

export type ScreenBoard = {
  slug: string;
  layout: ScreenLayout;
  title: string;
  subtitle: string;
  items: ScreenItem[];
  /** Add-on formula shown in the bottom bar of every screen ("Frites + canette +250 DA"), when it exists and is active. */
  formula: { label: string; price: number; imageUrl: string | null } | null;
  /** Show the menu price (product + formula) under each product. */
  menuPrice: boolean;
  /** Sections of the screen, in order (Tenders & Box); products not listed go to the last one. */
  groups: { label: string; size: "lg" | "md" | "sm"; itemIds: number[] }[] | null;
  /** ISO time the data was built, shown nowhere but useful when debugging a screen. */
  builtAt: string;
};

type ItemOverride = { name?: string; detail?: string; image?: string; badge?: string };

type BoardConfig = {
  slug: string;
  title: string;
  subtitle: string;
  /** Back-office category names (case-insensitive) whose products fill the screen. */
  categories: string[];
  /** Display order by product id; products not listed follow, cheapest first. */
  order: number[];
  /** Products never shown on this screen. */
  exclude?: number[];
  menuPrice: boolean;
  groups?: { label: string; size: "lg" | "md" | "sm"; ids: number[] }[];
  layout: ScreenLayout;
};

const PHOTO = (file: string) => `/ecrans/photos/${file}.jpg`;

/** Keyed by back-office product id. Lines come from the former menu videos. */
const OVERRIDES: Record<number, ItemOverride> = {
  97: { detail: "Sauce Kerux, tenders, crudités, cornichon, fromage", image: PHOTO("chicken") },
  150: { detail: "Sauce chilli, tenders, crudités, oignon caramélisé, fromage", image: PHOTO("smap") },
  82: { detail: "Sauce maison, tenders, crudités, slice cheddar", image: PHOTO("beng") },
  119: { detail: "Sauce Kerux, tenders, dinde, galette de pomme de terre, cheddar", image: PHOTO("kerux") },
  158: { detail: "Sauce maison, tenders, slice, crudités", image: PHOTO("wrap") },
  151: { detail: "Sauce piquante, tenders, frites, oignon caramélisé, fromage", image: PHOTO("spicy") },
  87: { detail: "Sauce gruyère, tenders, frites, crudités, slice, fromage", image: PHOTO("boxy") },
  156: { name: "3 Wings", detail: "", image: PHOTO("wings3") },
  157: { name: "5 Wings", detail: "", image: PHOTO("wings5") },
  152: { name: "3 Tenders", detail: "", image: PHOTO("tenders3") },
  153: { name: "5 Tenders", detail: "", image: PHOTO("tenders5") },
  131: { detail: "3 tenders + 5 wings", image: PHOTO("minibox"), badge: "8 pièces" },
  86: { detail: "20 tenders", image: PHOTO("boxfamily"), badge: "20 pièces" },
  98: { detail: "Tenders et wings", image: PHOTO("chickenmix"), badge: "25 pièces" },
  105: { detail: "30 wings", image: PHOTO("grandwings"), badge: "30 pièces" },
  88: { name: "Enfant burger", detail: "Frites, jus, surprise", image: PHOTO("enfantburger") },
  154: { name: "Enfant tenders", detail: "2 tenders, frites, jus, surprise", image: PHOTO("enfanttenders") },
  93: { name: "Canette", detail: "33 cl au choix", image: PHOTO("canette") },
  84: { name: "Boisson 1 L", detail: "Bouteille", image: PHOTO("boisson") },
  83: { detail: "Tenders, frites, maïs, olives, sauce fromagère, hot dog", image: PHOTO("bogota") },
  147: { detail: "Tenders, pâtes, poulet fumé, sauce fromagère", image: PHOTO("poni") },
  149: { detail: "Salade verte, tomate, olive, maïs, cornichon, tenders, fromage", image: PHOTO("cesar") },
  126: { detail: "Poulet, sauce chili, poivron", image: PHOTO("mexicain") },
  95: { detail: "Poulet, sauce gruyère, cheddar", image: PHOTO("chessy") },
  101: { detail: "Tenders, crudités, fromage, sauce fromagère", image: PHOTO("crunsh") },
  96: { detail: "Poulet, sauce gruyère, cheddar, fromage gratiné", image: PHOTO("chessygratine") },
  148: { detail: "Tenders, poulet fumé, sauce fromagère, cheddar", image: PHOTO("ruxy") },
  125: { image: PHOTO("menufrites") },
};

/** The "Menu : Frites + Canette" add-on (id 125 in the back-office). */
const FORMULA_ID = 125;
const FORMULA_NAME = /frites?\s*\+\s*canette/i;

export const BOARDS: BoardConfig[] = [
  { slug: "burgers", title: "Burgers", subtitle: "Pain brioché, tenders croustillants", categories: ["burgers"], order: [97, 150, 82, 119], menuPrice: true, layout: "vitrine" },
  { slug: "tortillas", title: "Tortillas", subtitle: "Roulées minute, servies chaudes", categories: ["tortillas"], order: [158, 151, 87], menuPrice: true, layout: "trio" },
  {
    slug: "tenders",
    title: "Tenders & Box",
    subtitle: "À la pièce, en box ou à partager",
    categories: ["formules", "menu enfant", "boissons"],
    order: [131, 86, 98, 105, 156, 157, 152, 153, 88, 154, 93, 84],
    exclude: [85],
    menuPrice: false,
    groups: [
      { label: "Box à partager", size: "lg", ids: [131, 86, 98, 105] },
      { label: "À la pièce", size: "md", ids: [156, 157, 152, 153] },
      { label: "Enfants & boissons", size: "sm", ids: [88, 154, 93, 84] },
    ],
    layout: "grille",
  },
  { slug: "plats", title: "Plats & salade", subtitle: "Gourmands, à la fourchette", categories: ["plats", "salade"], order: [83, 147, 149], menuPrice: false, layout: "mosaique" },
  {
    slug: "pain-maison",
    title: "Pain maison",
    subtitle: "Pain cuit sur place, garni minute",
    categories: ["pain maison"],
    order: [126, 95, 101, 96, 148],
    menuPrice: true,
    layout: "etagere",
  },
];

export function getBoardConfig(slug: string): BoardConfig | undefined {
  return BOARDS.find((b) => b.slug === slug);
}

/** "Tenders - 3" → { name: "Tenders", detail: "3 pièces" } when nothing better is configured. */
function fallbackNameAndDetail(p: Product): { name: string; detail: string } {
  const m = p.name.match(/^(.*?)\s*-\s*0*(\d+)\s*$/);
  if (m) return { name: m[1], detail: `${m[2]} pièce${m[2] === "1" ? "" : "s"}` };
  return { name: p.name, detail: p.ingredients };
}

export function toScreenItem(p: Product): ScreenItem {
  const o = OVERRIDES[p.id] ?? {};
  const fb = fallbackNameAndDetail(p);
  return {
    id: p.id,
    name: o.name ?? fb.name,
    detail: o.detail ?? fb.detail,
    price: p.price,
    available: p.available,
    imageUrl: o.image ?? p.imageUrl,
    ...(o.badge ? { badge: o.badge } : {}),
  };
}

export function buildBoard(slug: string, products: Product[], now = new Date()): ScreenBoard | null {
  const cfg = getBoardConfig(slug);
  if (!cfg) return null;
  const cats = new Set(cfg.categories.map((c) => c.toLowerCase()));
  const excluded = new Set([...(cfg.exclude ?? []), FORMULA_ID]);
  const rank = (id: number) => {
    const i = cfg.order.indexOf(id);
    return i === -1 ? cfg.order.length : i;
  };
  const items = products
    .filter((p) => cats.has(p.categoryName.toLowerCase()) && !excluded.has(p.id) && !FORMULA_NAME.test(p.name))
    .sort((a, b) => rank(a.id) - rank(b.id) || a.price - b.price)
    .map(toScreenItem);

  const f = products.find((p) => p.id === FORMULA_ID) ?? products.find((p) => FORMULA_NAME.test(p.name));
  const formula: ScreenBoard["formula"] = f && f.available ? { label: "Frites + canette", price: f.price, imageUrl: OVERRIDES[f.id]?.image ?? f.imageUrl } : null;

  let groups: ScreenBoard["groups"] = null;
  if (cfg.groups?.length) {
    const placed = new Set(cfg.groups.flatMap((g) => g.ids));
    groups = cfg.groups.map((g, gi) => ({
      label: g.label,
      size: g.size,
      itemIds: items.filter((i) => g.ids.includes(i.id) || (gi === cfg.groups!.length - 1 && !placed.has(i.id))).map((i) => i.id),
    }));
  }

  return {
    slug: cfg.slug,
    layout: cfg.layout,
    title: cfg.title,
    subtitle: cfg.subtitle,
    items,
    formula,
    menuPrice: cfg.menuPrice && formula !== null,
    groups,
    builtAt: now.toISOString(),
  };
}

/** Products carry a category id; the name is only filled when the API embeds the category, so resolve it from the categories list. */
export function withCategoryNames(products: Product[], categories: { id: number; name: string }[]): Product[] {
  const names = new Map(categories.map((c) => [c.id, c.name]));
  return products.map((p) => (p.categoryName ? p : { ...p, categoryName: names.get(p.categoryId) ?? "" }));
}
