import type { Metadata } from "next";
import { getDeliveryDistricts, getRestaurants } from "@/lib/api/restaurants";
import { Container, SectionTitle } from "@/components/ui/bits";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = { title: "Commander", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [restaurants, districts] = await Promise.all([getRestaurants().catch(() => []), getDeliveryDistricts().catch(() => [])]);
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      <SectionTitle as="h1" sub="Quelques infos et c’est parti.">
        Commander
      </SectionTitle>
      <CheckoutFlow restaurants={restaurants} districts={districts} />
    </Container>
  );
}
