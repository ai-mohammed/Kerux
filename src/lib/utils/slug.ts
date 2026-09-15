export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "produit";
}

/** Public product URL segment: `beng-f82f5935`. The suffix is the first 8 chars of `public_id`. */
export function productSlug(name: string, publicId: string): string {
  return `${slugify(name)}-${publicId.slice(0, 8)}`;
}

export function publicIdPrefixFromSlug(slug: string): string {
  const i = slug.lastIndexOf("-");
  return i >= 0 ? slug.slice(i + 1) : slug;
}
