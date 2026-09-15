import type { Category, Product, Restaurant } from "@/types";
import { absoluteUrl, SITE_NAME } from "./site";

/** Only facts the backend provides: names, addresses, phones, prices. No invented hours or ratings. */
export function restaurantsJsonLd(restaurants: Restaurant[]) {
  return {
    "@context": "https://schema.org",
    "@graph": restaurants.map((r) => ({
      "@type": "Restaurant",
      "@id": absoluteUrl(`/restaurants#${r.code.toLowerCase()}`),
      name: r.name,
      brand: { "@type": "Brand", name: SITE_NAME },
      servesCuisine: ["Poulet", "Fast food", "Burgers"],
      address: { "@type": "PostalAddress", streetAddress: r.address, addressLocality: "Oran", addressCountry: "DZ" },
      ...(r.phone ? { telephone: r.phone } : {}),
      url: absoluteUrl("/"),
      hasMenu: absoluteUrl("/menu"),
      priceRange: "DA",
      acceptsReservations: false,
    })),
  };
}

export function menuJsonLd(categories: Category[], products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Menu ${SITE_NAME}`,
    url: absoluteUrl("/menu"),
    inLanguage: "fr",
    hasMenuSection: categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      hasMenuItem: products
        .filter((p) => p.categoryId === c.id)
        .map((p) => ({
          "@type": "MenuItem",
          name: p.name,
          url: absoluteUrl(`/menu/${p.slug}`),
          ...(p.description ? { description: p.description } : {}),
          ...(p.imageUrl ? { image: absoluteUrl(p.imageUrl) } : {}),
          offers: { "@type": "Offer", price: p.price, priceCurrency: "DZD", availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
        })),
    })),
  };
}

export function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: p.name,
    url: absoluteUrl(`/menu/${p.slug}`),
    ...(p.description ? { description: p.description } : {}),
    ...(p.imageUrl ? { image: absoluteUrl(p.imageUrl) } : {}),
    offers: { "@type": "Offer", price: p.price, priceCurrency: "DZD", availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };
}
