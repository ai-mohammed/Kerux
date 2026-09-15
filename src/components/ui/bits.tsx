import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDA } from "@/lib/utils/format";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Yellow stamped price (rotated on hero/boards, straight on cards). */
export function PriceTag({ amount, className, straight, size = "md" }: { amount: number; className?: string; straight?: boolean; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cn("price-tag num", straight && "rotate-0! shadow-[1px_2px_0_var(--color-ink)]", size === "sm" && "text-base! rounded-lg! px-2! py-1!", size === "lg" && "text-3xl! sm:text-4xl!", className)}>
      {formatDA(amount).replace(" DA", "")}
      <small>DA</small>
    </span>
  );
}

export function Sticker({ children, tone = "yellow", className }: { children: ReactNode; tone?: "yellow" | "ink" | "red"; className?: string }) {
  return <span className={cn("sticker", `sticker-${tone}`, className)}>{children}</span>;
}

export function NeonStatus({ isOpen, className, compact }: { isOpen: boolean | null; className?: string; compact?: boolean }) {
  const label = isOpen === null ? "Statut…" : isOpen ? "Ouvert" : "Fermé";
  return (
    <span className={cn("neon", isOpen === null ? "neon-unknown" : isOpen ? "neon-open" : "neon-closed", compact && "px-2 py-1 text-[0.62rem]", className)} role="status" aria-live="polite">
      <span className="neon-dot" aria-hidden />
      {label}
    </span>
  );
}

/** The one course divider: red/cream stripes (on a red or dark band only the cream dashes read). */
export function Awning({ className }: { className?: string }) {
  return <div className={cn("awning", className)} aria-hidden />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-cream-200", className)} aria-hidden />;
}

export function QuantityStepper({ value, onChange, min = 1, max = 50, label, size = "md" }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; size?: "sm" | "md" }) {
  const btn = cn("grid place-items-center rounded-full border-2 border-ink bg-white text-ink transition-colors hover:bg-cream disabled:opacity-40", size === "sm" ? "size-8" : "size-10");
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={value <= 1 && min <= 0 ? "Retirer" : "Diminuer la quantité"}>
        <Minus className="size-4" aria-hidden />
      </button>
      <output className={cn("display-tight min-w-6 text-center num", size === "sm" ? "text-lg" : "text-2xl")} aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Augmenter la quantité">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function SectionTitle({ children, sub, className, as: Tag = "h2" }: { children: ReactNode; sub?: ReactNode; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Tag className="display text-balance text-4xl sm:text-5xl">{children}</Tag>
      {sub ? <p className="max-w-prose text-pretty text-base text-ink-600 sm:text-lg">{sub}</p> : null}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="board flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="display-tight text-3xl">{title}</p>
      {text ? <p className="max-w-md text-ink-600">{text}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
