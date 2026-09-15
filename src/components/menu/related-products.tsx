"use client";

import { useMemo, useState } from "react";
import type { Observation, Product, Supplement } from "@/types";
import { ProductCard } from "./product-card";
import { ProductOptionsSheet } from "./product-options-sheet";

export function RelatedProducts({ products, supplements, observations, category }: { products: Product[]; supplements: Supplement[]; observations: Observation[]; category: string }) {
  const [configuring, setConfiguring] = useState<Product | null>(null);
  const optionCategoryIds = useMemo(() => new Set([...supplements, ...observations].flatMap((o) => o.categoryIds)), [supplements, observations]);
  return (
    <section aria-labelledby="related" className="flex flex-col gap-4">
      <h2 id="related" className="display text-3xl sm:text-4xl">
        Aussi en {category}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} hasOptions={optionCategoryIds.has(p.categoryId)} onConfigure={setConfiguring} />
          </li>
        ))}
      </ul>
      <ProductOptionsSheet product={configuring} supplements={supplements} observations={observations} onClose={() => setConfiguring(null)} />
    </section>
  );
}
