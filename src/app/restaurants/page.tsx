import type { Metadata } from "next";
import { getRestaurants } from "@/lib/api/restaurants";
import { restaurantsJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import { Container, SectionTitle } from "@/components/ui/bits";
import { RestaurantCard } from "@/components/restaurant/restaurant-card";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos restaurants à Oran",
  description: "Kerux Foods à Oran : Akid Lotfi et Boulevard des Lions (Bir El Djir). Adresses, téléphones, itinéraires et statut d’ouverture en direct.",
  alternates: { canonical: "/restaurants" },
  openGraph: { title: "Nos restaurants · Kerux Foods", url: "/restaurants" },
};

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants().catch(() => []);
  return (
    <Container className="flex flex-col gap-8 py-8 sm:py-10">
      <JsonLd data={restaurantsJsonLd(restaurants)} />
      <SectionTitle as="h1" sub="Deux adresses à Oran. Le statut Ouvert / Fermé est mis à jour en direct.">
        Nos restaurants
      </SectionTitle>
      {restaurants.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <p className="board p-6 text-ink-600">Impossible de charger les restaurants pour le moment.</p>
      )}
      <p className="max-w-prose text-sm text-ink-500">Livraison dans les quartiers desservis par chaque restaurant (liste proposée lors de la commande). Paiement à la réception.</p>
    </Container>
  );
}
