import "server-only";
import { cache } from "react";
import type { Category, Observation, Product, Supplement } from "@/types";
import type { RawCategory, RawObservation, RawPaginated, RawProduct, RawSupplement } from "./raw";
import { apiGet } from "./client";
import { toCategory, toObservation, toProduct, toSupplement } from "./adapters";
import { publicIdPrefixFromSlug } from "@/lib/utils/slug";

const CATALOG = { revalidate: 60, tags: ["catalog"] };

/** Display order of categories on the menu: food first, sides and drinks last. */
const CATEGORY_ORDER = ["burgers", "formules", "plats", "tortillas", "pizza", "salade", "menu enfant", "pain maison", "frite", "dessert", "boissons"];

function categoryRank(name: string): number {
  const i = CATEGORY_ORDER.indexOf(name.toLowerCase());
  return i === -1 ? CATEGORY_ORDER.length : i;
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const raw = await apiGet<RawCategory[]>("/api/categories", () => import("./fixtures/categories.json").then((m) => m.default as RawCategory[]), { next: CATALOG });
  return raw
    .map(toCategory)
    .filter((c) => c.active && c.productCount > 0)
    .sort((a, b) => categoryRank(a.name) - categoryRank(b.name) || a.name.localeCompare(b.name, "fr"));
});

/** The whole catalogue (40-ish products) in one call; small enough to render server-side and filter client-side. */
export const getProducts = cache(async (): Promise<Product[]> => {
  const raw = await apiGet<RawPaginated<RawProduct>>(
    "/api/products?page=1&per_page=200",
    () => import("./fixtures/products.json").then((m) => m.default as unknown as RawPaginated<RawProduct>),
    { next: CATALOG },
  );
  const categories = await getCategories();
  const rank = new Map(categories.map((c, i) => [c.id, i]));
  return (raw.data ?? [])
    .map(toProduct)
    .filter((p) => p.name)
    .sort((a, b) => (rank.get(a.categoryId) ?? 99) - (rank.get(b.categoryId) ?? 99) || a.name.localeCompare(b.name, "fr"));
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const prefix = publicIdPrefixFromSlug(slug);
  const products = await getProducts();
  return products.find((p) => p.publicId.startsWith(prefix)) ?? products.find((p) => String(p.id) === prefix) ?? null;
});

export const getSupplements = cache(async (): Promise<Supplement[]> => {
  const raw = await apiGet<RawSupplement[]>("/api/supplements", () => import("./fixtures/supplements.json").then((m) => m.default as RawSupplement[]), { next: CATALOG });
  return raw.filter((s) => s.actif !== false).map(toSupplement);
});

export const getObservations = cache(async (): Promise<Observation[]> => {
  const raw = await apiGet<RawObservation[]>("/api/observations", () => import("./fixtures/observations.json").then((m) => m.default as RawObservation[]), { next: CATALOG });
  return raw.filter((o) => o.actif !== false).map(toObservation);
});

/** Options that apply to a product = supplements/observations whose `categoryIds` include the product's category. */
export function optionsFor(product: Product, supplements: Supplement[], observations: Observation[]) {
  return {
    supplements: supplements.filter((s) => s.categoryIds.includes(product.categoryId)),
    observations: observations.filter((o) => o.categoryIds.includes(product.categoryId)),
  };
}
