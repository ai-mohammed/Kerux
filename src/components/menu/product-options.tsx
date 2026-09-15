"use client";

import { useMemo, useState } from "react";
import type { Observation, Product, Supplement } from "@/types";
import { formatDA } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { QuantityStepper } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "@/hooks/use-add-to-cart";

type Props = {
  product: Product;
  supplements: Supplement[];
  observations: Observation[];
  onAdded?: () => void;
  /** Render the CTA inline (product page) instead of returning it to a sheet footer. */
  layout?: "page" | "sheet";
};

/**
 * The one configurator: paid supplements (checkboxes with price), free
 * observations (sauce / "sans …"), quantity, live total, add. Used by the
 * product page and by the bottom sheet opened from the menu grid.
 */
export function ProductOptions({ product, supplements, observations, onAdded, layout = "page" }: Props) {
  const [qty, setQty] = useState(1);
  const [sup, setSup] = useState<number[]>([]);
  const [obs, setObs] = useState<number[]>([]);
  const addToCart = useAddToCart();

  const chosenSup = useMemo(() => supplements.filter((s) => sup.includes(s.id)), [supplements, sup]);
  const chosenObs = useMemo(() => observations.filter((o) => obs.includes(o.id)), [observations, obs]);
  const unit = product.price + chosenSup.reduce((s, x) => s + x.price, 0);
  const total = unit * qty;

  const toggle = (list: number[], id: number, set: (v: number[]) => void) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const submit = () => {
    const ok = addToCart(product, {
      quantity: qty,
      supplements: chosenSup.map((s) => ({ id: s.id, name: s.name, price: s.price })),
      observations: chosenObs.map((o) => ({ id: o.id, name: o.name })),
    });
    if (ok) onAdded?.();
  };

  const cta = (
    <div className={cn("flex items-center gap-4", layout === "sheet" && "flex-col items-stretch sm:flex-row sm:items-center")}>
      <QuantityStepper value={qty} onChange={setQty} label="Quantité" />
      <Button size="lg" onClick={submit} disabled={!product.available} className="flex-1" data-autofocus={layout === "sheet" || undefined}>
        {product.available ? (
          <>
            Ajouter <span className="num">· {formatDA(total)}</span>
          </>
        ) : (
          "Épuisé pour le moment"
        )}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {supplements.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="display-tight mb-2 text-xl">Suppléments</legend>
          {supplements.map((s) => (
            <OptionRow key={s.id} checked={sup.includes(s.id)} onChange={() => toggle(sup, s.id, setSup)} label={s.name} trailing={`+ ${formatDA(s.price)}`} />
          ))}
        </fieldset>
      ) : null}
      {observations.length ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="display-tight mb-2 text-xl">Sauces & préférences</legend>
          <p className="-mt-1 mb-1 text-sm text-ink-500">Gratuit. « S » = sans.</p>
          {observations.map((o) => (
            <OptionRow key={o.id} checked={obs.includes(o.id)} onChange={() => toggle(obs, o.id, setObs)} label={o.name} />
          ))}
        </fieldset>
      ) : null}
      {layout === "page" ? cta : null}
      {layout === "sheet" ? <div className="sticky bottom-0 -mx-5 border-t border-line bg-white px-5 py-4 pb-safe">{cta}</div> : null}
    </div>
  );
}

function OptionRow({ checked, onChange, label, trailing }: { checked: boolean; onChange: () => void; label: string; trailing?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors", checked ? "border-blue bg-blue-100" : "border-line bg-white hover:bg-cream")}>
      <input type="checkbox" checked={checked} onChange={onChange} className="size-5 shrink-0 accent-blue" />
      <span className="flex-1 text-[15px] font-semibold">{label}</span>
      {trailing ? <span className="text-sm font-bold text-ink-600 num">{trailing}</span> : null}
    </label>
  );
}
