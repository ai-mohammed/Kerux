import Image from "next/image";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Container, PriceTag } from "@/components/ui/bits";
import { ProductImage } from "@/components/ui/product-image";

/**
 * First viewport: sign-lettering headline, two actions, and the food on a
 * real sign board with a real product's stamped price. Nothing here is
 * invented — the product and its price come from the API; the live
 * open/closed status lives in the header on every viewport.
 */
export function Hero({ featured }: { featured: Product | null }) {
  return (
    <section className="relative overflow-hidden">
      <Container className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:py-20">
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-balance text-[56px] leading-[0.92] sm:text-7xl lg:text-[88px]">
            Le poulet <span className="text-red">comme vous l’aimez.</span>
          </h1>
          <p className="max-w-lg text-pretty text-lg text-ink-600 sm:text-xl">
            Burgers, tenders, wings, wraps et Pizza K — préparés à la commande, à Oran. Livraison, à emporter ou sur place.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button href="/menu" size="lg" className="w-full sm:w-auto">
              Commander
            </Button>
            <Button href="/menu" variant="secondary" size="lg" className="w-full sm:w-auto">
              Voir le menu
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <div className="board relative aspect-[4/3] overflow-hidden rounded-[28px] border-2 border-ink p-0 shadow-board-lg">
            {featured?.imageUrl ? (
              <ProductImage src={featured.imageUrl} alt={featured.name} sizes="(min-width: 1024px) 560px, 92vw" priority fit="cover" className="h-full w-full" />
            ) : (
              <Image src="/brand/hero-chicken.jpg" alt="Poulet croustillant Kerux" fill priority sizes="(min-width: 1024px) 560px, 92vw" className="object-cover" />
            )}
            <div className="awning absolute inset-x-0 top-0" aria-hidden />
          </div>
          {featured ? (
            <div className="absolute -bottom-4 left-4 flex items-end gap-2 sm:-bottom-5 sm:left-6">
              <div className="board rounded-2xl border-2 border-ink px-4 py-3">
                <span className="display-tight text-2xl">{featured.name}</span>
              </div>
              <PriceTag amount={featured.price} size="lg" className="-mb-1" />
            </div>
          ) : null}
          <Image src="/brand/mascotte.png" alt="" width={112} height={112} className="absolute -right-3 -top-6 size-20 rotate-6 drop-shadow-[0_8px_12px_rgb(5_3_5/0.25)] sm:-right-6 sm:size-28" aria-hidden />
        </div>
      </Container>
    </section>
  );
}
