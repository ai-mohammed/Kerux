"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { CartLine as Line } from "@/types";
import { lineTotal, useCartStore } from "@/lib/cart/store";
import { formatDA } from "@/lib/utils/format";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/bits";

export function CartLineRow({ line, compact }: { line: Line; compact?: boolean }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const options = [...line.supplements.map((s) => `+ ${s.name}`), ...line.observations.map((o) => o.name)];
  return (
    <li className="flex gap-3 py-4">
      <Link href={`/menu/${line.productSlug}`} className="block shrink-0" aria-label={line.productName}>
        <ProductImage src={line.productImageUrl} alt="" sizes="96px" fit="cover" className={compact ? "size-16 rounded-xl border border-line" : "size-20 rounded-xl border border-line sm:size-24"} />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/menu/${line.productSlug}`} className="display-tight truncate text-xl leading-tight hover:text-red">
            {line.productName}
          </Link>
          <span className="display-tight shrink-0 text-xl num">{formatDA(lineTotal(line))}</span>
        </div>
        {options.length ? <p className="line-clamp-2 text-sm text-ink-600">{options.join(" · ")}</p> : null}
        <div className="mt-1 flex items-center justify-between gap-3">
          <QuantityStepper value={line.quantity} onChange={(n) => setQuantity(line.lineId, n)} min={0} size="sm" label={`Quantité pour ${line.productName}`} />
          <button type="button" onClick={() => remove(line.lineId)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-ink-500 hover:bg-cream hover:text-alert" aria-label={`Retirer ${line.productName} du panier`}>
            <Trash2 className="size-4" aria-hidden />
            <span className="hidden sm:inline">Retirer</span>
          </button>
        </div>
      </div>
    </li>
  );
}
