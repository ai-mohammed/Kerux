import type { Metadata } from "next";
import { getCategories, getObservations, getProducts, getSupplements } from "@/lib/api/catalog";
import { getRestaurants } from "@/lib/api/restaurants";
import { restaurantsJsonLd } from "@/lib/seo/jsonld";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Awning, Container, SectionTitle } from "@/components/ui/bits";
import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoryRail } from "@/components/menu/category-rail";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";
import { SOCIAL_LINKS } from "@/components/layout/nav-links";
import { SOCIAL_ICONS } from "@/components/layout/social-icons";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE} · Commander à Oran` },
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: `${SITE_NAME} — Le poulet comme vous l’aimez`, description: DEFAULT_DESCRIPTION, url: "/", images: ["/opengraph-image"] },
};

export const revalidate = 60;

/** The painted service board: three lines of sign lettering, one truth each. */
const SERVICES = [
  { title: "Livraison", text: "Dans les quartiers desservis d’Oran, chez vous." },
  { title: "À emporter", text: "Commandez en ligne, passez récupérer sans attendre." },
  { title: "Sur place", text: "Akid Lotfi ou Boulevard des Lions." },
];

export default async function HomePage() {
  const [categories, products, supplements, observations, restaurants] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getSupplements().catch(() => []),
    getObservations().catch(() => []),
    getRestaurants().catch(() => []),
  ]);

  const available = products.filter((p) => p.available && p.imageUrl);
  // The hero shows the house burger when it exists, otherwise the first product with a photo.
  const featured = available.find((p) => p.name.toLowerCase() === "kerux") ?? available[0] ?? null;
  // "Incontournables" = the first products of the first categories, in the API's order; nothing is ranked by invented popularity.
  const incontournables = products.filter((p) => p.available).slice(0, 8);

  return (
    <>
      <JsonLd data={restaurantsJsonLd(restaurants)} />
      <Hero featured={featured} />

      {categories.length ? (
        <Container className="pb-4 pt-6">
          <CategoryRail categories={categories} active={null} linkBase="/menu" />
        </Container>
      ) : null}

      <Awning className="my-6" />

      <Container className="flex flex-col gap-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle sub="À vous de choisir.">Nos incontournables</SectionTitle>
          <Button href="/menu" variant="secondary">
            Tout le menu
          </Button>
        </div>
        {incontournables.length ? (
          <FeaturedProducts products={incontournables} supplements={supplements} observations={observations} />
        ) : (
          <p className="board p-6 text-ink-600">Le menu est momentanément indisponible. Réessayez dans un instant.</p>
        )}
      </Container>

      <section className="mt-10 bg-red text-white" aria-labelledby="services">
        <Awning />
        <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:py-16">
          <div className="flex flex-col gap-4">
            <h2 id="services" className="display text-balance text-5xl sm:text-6xl">
              Votre Kerux, <span className="text-yellow">où vous voulez.</span>
            </h2>
            <p className="max-w-md text-lg text-white/85">Paiement à la réception : à la livraison ou au comptoir.</p>
            <Button href="/menu" variant="yellow" size="lg" className="mt-2 self-start">
              Commandez. Savourez.
            </Button>
          </div>
          <dl className="divide-y divide-white/25 border-y border-white/25">
            {SERVICES.map(({ title, text }) => (
              <div key={title} className="grid gap-1 py-4 sm:grid-cols-[300px_1fr] sm:items-baseline sm:gap-6">
                <dt className="display whitespace-nowrap text-4xl text-yellow sm:text-5xl">{title}</dt>
                <dd className="text-base text-white/90 sm:text-lg">{text}</dd>
              </div>
            ))}
          </dl>
        </Container>
        <Awning />
      </section>

      <Container className="flex flex-col gap-6 py-14">
        <SectionTitle sub="Deux adresses à Oran. Choisissez la vôtre, on s’occupe du reste.">Nos restaurants</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-5 pb-6">
        <SectionTitle sub="Nouveautés, coulisses et envies du jour.">Suivez Kerux</SectionTitle>
        <ul className="flex flex-wrap gap-x-8 gap-y-4 border-y border-line py-5">
          {SOCIAL_LINKS.map((s) => {
            const Icon = SOCIAL_ICONS[s.label];
            return (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-ink hover:text-red">
                  <Icon className="size-7 shrink-0" strokeWidth={2} aria-hidden />
                  <span className="flex flex-col leading-tight">
                    <span className="display-tight text-2xl">{s.label}</span>
                    <span className="text-sm font-semibold text-ink-500 group-hover:text-red-600">{s.handle}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
