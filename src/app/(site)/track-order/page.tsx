import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui/bits";
import { TrackOrderForm } from "@/components/order/track-order-form";

export const metadata: Metadata = {
  title: "Suivre ma commande",
  description: "Suivez l’avancement de votre commande Kerux Foods avec son numéro.",
  alternates: { canonical: "/track-order" },
};

export default function TrackOrderPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      <SectionTitle as="h1" sub="Entrez le numéro reçu à la confirmation.">
        Suivre ma commande
      </SectionTitle>
      <TrackOrderForm />
    </Container>
  );
}
