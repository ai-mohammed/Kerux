import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories().catch(() => []), getProducts().catch(() => [])]);
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/menu"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/restaurants"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/track-order"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/droits"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((c) => ({ url: absoluteUrl(`/menu?c=${c.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...products.map((p) => ({ url: absoluteUrl(`/menu/${p.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
