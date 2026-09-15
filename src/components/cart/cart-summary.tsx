import { formatDA } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type Totals = { subtotal: number; discount: number; deliveryFee: number; usedPoints: number; total: number };

export function CartSummary({ totals, deliveryLabel, className }: { totals: Totals; deliveryLabel?: string; className?: string }) {
  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: "Sous-total", value: formatDA(totals.subtotal) },
    ...(totals.discount ? [{ label: "Réduction", value: `− ${formatDA(totals.discount)}` }] : []),
    { label: deliveryLabel ?? "Frais de livraison", value: totals.deliveryFee ? formatDA(totals.deliveryFee) : "Offerts", muted: !totals.deliveryFee },
    ...(totals.usedPoints ? [{ label: "Points bonus utilisés", value: `− ${formatDA(totals.usedPoints)}` }] : []),
  ];
  return (
    <dl className={cn("flex flex-col gap-2 text-[15px]", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <dt className="text-ink-600">{r.label}</dt>
          <dd className={cn("font-bold num", r.muted && "text-green")}>{r.value}</dd>
        </div>
      ))}
      <div className="mt-2 flex items-end justify-between gap-4 border-t border-line pt-3">
        <dt className="display-tight text-xl">Total</dt>
        <dd className="display-tight text-3xl num">{formatDA(totals.total)}</dd>
      </div>
    </dl>
  );
}
