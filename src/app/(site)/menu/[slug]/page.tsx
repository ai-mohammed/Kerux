import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getObservations, getProductBySlug, getProducts, getSupplements, optionsFor } from "@/lib/api/catalog";
import { productJsonLd } from "@/lib/seo/jsonld";
import { formatDA } from "@/lib/utils/format";
import { slugify } from "@/lib/utils/slug";
import { JsonLd } from "@/components/seo/json-ld";
import { Container, PriceTag, Sticker } from "@/components/ui/bits";
import { ProductImage } from "@/components/ui/product-image";
import { ProductOptions } from "@/components/menu/product-options";
import { RelatedProducts } from "@/components/menu/related-products";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) return { title: "Produit introuvable" };
  const description = product.description ? `${product.description} — ${formatDA(product.price)}.` : `${product.name} chez Kerux Foods à Oran — ${formatDA(product.price)}.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/menu/${product.slug}` },
    openGraph: { title: `${product.name} · Kerux Foods`, description, url: `/menu/${product.slug}`, images: product.imageUrl ? [product.imageUrl] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps<"/menu/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();
  // Old numeric URLs (/menu/82) and renamed products land on the canonical slug.
  if (product.slug !== slug) permanentRedirect(`/menu/${product.slug}`);

  const [supplements, observations, all] = await Promise.all([getSupplements().catch(() => []), getObservations().catch(() => []), getProducts().catch(() => [])]);
  const options = optionsFor(product, supplements, observations);
  const related = all.filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.available).slice(0, 4);

  return (
    <Container className="flex flex-col gap-10 py-6 sm:py-10">
      <JsonLd data={productJsonLd(product)} />
      <nav aria-label="Fil d’Ariane" className="text-sm font-semibold text-ink-500">
        <Link href="/menu" className="inline-flex items-center gap-1 hover:text-red">
          <ChevronLeft className="size-4" aria-hidden /> Menu
        </Link>
        <span className="mx-2" aria-hidden>/</span>
        <Link href={`/menu?c=${slugify(product.categoryName)}`} className="capitalize hover:text-red">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="relative">
          <ProductImage src={product.imageUrl} alt={product.name} sizes="(min-width: 1024px) 640px, 100vw" priority fit="cover" className="board aspect-square w-full overflow-hidden rounded-[28px] border-2 border-ink sm:aspect-[5/4]" />
          <div className="absolute left-4 top-4 flex flex-col gap-1.5">
            {!product.available ? <Sticker tone="yellow">Épuisé</Sticker> : null}
            {product.available && product.isNew ? <Sticker tone="red">Nouveau</Sticker> : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="display text-balance text-5xl sm:text-6xl">{product.name}</h1>
            <PriceTag amount={product.price} size="lg" className="self-start" />
            {product.description ? <p className="max-w-prose text-pretty text-lg text-ink-600">{product.description}</p> : null}
            {product.ingredients ? (
              <p className="text-sm text-ink-600">
                <span className="font-bold text-ink">Ingrédients : </span>
                {product.ingredients}
              </p>
            ) : null}
          </div>
          <ProductOptions product={product} supplements={options.supplements} observations={options.observations} />
          <p className="text-sm text-ink-500">Paiement à la réception. Allergènes : renseignez-vous auprès du restaurant.</p>
        </div>
      </div>

      {related.length ? <RelatedProducts products={related} supplements={supplements} observations={observations} category={product.categoryName} /> : null}
    </Container>
  );
}

