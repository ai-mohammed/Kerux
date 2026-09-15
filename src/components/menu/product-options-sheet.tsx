"use client";

import type { Observation, Product, Supplement } from "@/types";
import { Sheet } from "@/components/ui/sheet";
import { ProductImage } from "@/components/ui/product-image";
import { PriceTag } from "@/components/ui/bits";
import { ProductOptions } from "./product-options";

type Props = {
  product: Product | null;
  supplements: Supplement[];
  observations: Observation[];
  onClose: () => void;
};

/** Bottom sheet (phone) / drawer (desktop) that opens from the grid so the shopper never leaves the menu. */
export function ProductOptionsSheet({ product, supplements, observations, onClose }: Props) {
  return (
    <Sheet open={Boolean(product)} onClose={onClose} title={product?.name ?? ""} wide>
      {product ? (
        <div className="flex flex-col gap-5">
          <div className="flex gap-4">
            <ProductImage src={product.imageUrl} alt="" sizes="120px" fit="cover" className="size-28 shrink-0 rounded-2xl border border-line" />
            <div className="flex flex-col gap-2">
              {product.description ? <p className="text-sm text-ink-600">{product.description}</p> : null}
              <PriceTag amount={product.price} />
            </div>
          </div>
          <ProductOptions
            key={product.id}
            product={product}
            supplements={supplements.filter((s) => s.categoryIds.includes(product.categoryId))}
            observations={observations.filter((o) => o.categoryIds.includes(product.categoryId))}
            onAdded={onClose}
            layout="sheet"
          />
        </div>
      ) : null}
    </Sheet>
  );
}
