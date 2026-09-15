import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getObservations, getProducts, getSupplements } from "@/lib/api/catalog";
import { menuJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { Container, SectionTitle } from "@/components/ui/bits";
import { MenuExplorer } from "@/components/menu/menu-explorer";

export const revalidate = 60;

export async function generateMetadata({ searchParams }: PageProps<"/menu">): Promise<Metadata> {
  const { c } = await searchParams;
  const slug = typeof c === "string" ? c : null;
  const categories = await getCategories().catch(() => []);
  const cat = slug ? categories.find((x) => x.slug === slug) : null;
  const title = cat ? `Menu — ${cat.name}` : "Menu";
  const description = cat
    ? `${cat.name} Kerux Foods à Oran : ${cat.productCount} produit${cat.productCount > 1 ? "s" : ""} avec prix en dinars. Commandez en livraison, à emporter ou sur place.`
    : "Tout le menu Kerux Foods à Oran, avec les prix en dinars : burgers, tenders, wings, formules, Pizza K, boissons. Commandez en ligne.";
  return {
    title,
    description,
    alternates: { canonical: cat ? `/menu?c=${cat.slug}` : "/menu" },
    openGraph: { title: `${title} · Kerux Foods`, description, url: cat ? `/menu?c=${cat.slug}` : "/menu" },
  };
}

export default async function MenuPage({ searchParams }: PageProps<"/menu">) {
  const { c } = await searchParams;
  const [categories, products, supplements, observations] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getSupplements().catch(() => []),
    getObservations().catch(() => []),
  ]);
  const initialCategory = typeof c === "string" && categories.some((x) => x.slug === c) ? c : null;

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      <JsonLd data={menuJsonLd(categories, products)} />
      <SectionTitle as="h1" sub="Une envie de Kerux ? Choisissez, ajoutez, commandez.">
        Le menu
      </SectionTitle>
      {products.length ? (
        <Suspense fallback={null}>
          <MenuExplorer categories={categories} products={products} supplements={supplements} observations={observations} initialCategory={initialCategory} />
        </Suspense>
      ) : (
        <div className="board p-8 text-center">
          <p className="display text-3xl">Le menu arrive</p>
          <p className="mt-2 text-ink-600">Impossible de charger les produits pour le moment. Réessayez dans un instant.</p>
        </div>
      )}
    </Container>
  );
}
