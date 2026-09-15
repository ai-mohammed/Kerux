import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui/bits";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Panier", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      <SectionTitle as="h1">Votre panier</SectionTitle>
      <CartView />
    </Container>
  );
}
