"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/bits";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
      <h1 className="display text-5xl sm:text-6xl">Petit couac en cuisine</h1>
      <p className="max-w-md text-lg text-ink-600">Quelque chose s’est mal passé de notre côté. Réessayez ; si ça persiste, appelez directement le restaurant.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} size="lg">
          Réessayer
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Accueil
        </Button>
      </div>
    </Container>
  );
}
