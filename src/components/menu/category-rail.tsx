"use client";

import Link from "next/link";
import type { Category } from "@/types";
import { cn } from "@/lib/utils/cn";

type Props = {
  categories: Category[];
  active: string | null;
  /** When set, pills are links to `{linkBase}?c=slug` (home page); otherwise they call `onSelect` (menu page). */
  linkBase?: string;
  onSelect?: (slug: string | null) => void;
  className?: string;
};

/** Horizontal pill rail of categories straight from the API (never hard-coded). */
export function CategoryRail({ categories, active, linkBase, onSelect, className }: Props) {
  const items: { slug: string | null; label: string }[] = [{ slug: null, label: "Tous" }, ...categories.map((c) => ({ slug: c.slug, label: c.name }))];
  return (
    <div className={cn("rail -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0", className)} role={onSelect ? "tablist" : undefined} aria-label="Catégories">
      {items.map((it) => {
        const isActive = active === it.slug;
        const cls = cn(
          "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-extrabold capitalize transition-colors",
          isActive ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink",
        );
        if (linkBase !== undefined) {
          return (
            <Link key={it.label} href={it.slug ? `${linkBase}?c=${it.slug}` : linkBase} className={cls} aria-current={isActive ? "page" : undefined}>
              {it.label}
            </Link>
          );
        }
        return (
          <button key={it.label} type="button" role="tab" aria-selected={isActive} onClick={() => onSelect?.(it.slug)} className={cls}>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
