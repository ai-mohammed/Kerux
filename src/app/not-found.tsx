import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/bits";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
      <Image src="/brand/mascotte.png" alt="" width={120} height={120} className="rounded-full" />
      <h1 className="display text-5xl sm:text-7xl">Page introuvable</h1>
      <p className="max-w-md text-lg text-ink-600">Cette page n’existe pas ou a changé d’adresse. Le menu, lui, est toujours là.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/menu" size="lg">
          Voir le menu
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Accueil
        </Button>
      </div>
    </Container>
  );
}
