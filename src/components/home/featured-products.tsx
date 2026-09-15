"use client";

import { useMemo, useState } from "react";
import type { Observation, Product, Supplement } from "@/types";
import { ProductCard } from "@/components/menu/product-card";
import { ProductOptionsSheet } from "@/components/menu/product-options-sheet";

/** The home grid: same card, same rules as the menu; options open in the sheet. */
export function FeaturedProducts({ products, supplements, observations }: { products: Product[]; supplements: Supplement[]; observations: Observation[] }) {
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const optionCategoryIds = useMemo(() => new Set([...supplements, ...observations].flatMap((o) => o.categoryIds)), [supplements, observations]);
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} hasOptions={optionCategoryIds.has(p.categoryId)} onConfigure={setConfiguring} priority={i < 2} />
          </li>
        ))}
      </ul>
      <ProductOptionsSheet product={configuring} supplements={supplements} observations={observations} onClose={() => setConfiguring(null)} />
    </>
  );
}
