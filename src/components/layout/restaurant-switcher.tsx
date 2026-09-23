"use client";

import { MapPin } from "lucide-react";
import type { Restaurant } from "@/types";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { useServiceStatus } from "@/hooks/use-service-status";
import { NeonStatus } from "@/components/ui/bits";
import { cn } from "@/lib/utils/cn";

const CHEVRON =
  "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2214%22 height=%2214%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23050305%22 stroke-width=%223%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')";

type Props = {
  restaurants: Restaurant[];
  className?: string;
  /** Drawer layout: selector and status stacked. */
  stacked?: boolean;
  /** Phone strip: the selector takes the free width so long names are never cut. */
  grow?: boolean;
};

/** Which Kerux you order from, with its live OUVERT / FERMÉ neon. */
export function RestaurantSwitcher({ restaurants, className, stacked, grow }: Props) {
  const { selectedId, select, hydrated } = useRestaurantStore();
  const current = restaurants.find((r) => r.id === selectedId) ?? restaurants[0];
  const { isOpen } = useServiceStatus(hydrated ? current?.id ?? null : null);
  if (!current) return null;

  return (
    <div className={cn("flex items-center gap-2", stacked && "flex-col items-stretch gap-3", className)}>
      <label className={cn("relative flex min-w-0 items-center", grow && "max-w-sm flex-1")}>
        <span className="sr-only">Restaurant</span>
        <MapPin className="pointer-events-none absolute left-3 size-4 text-red" aria-hidden />
        <select
          value={current.id}
          onChange={(e) => select(Number(e.target.value))}
          className="h-10 w-full appearance-none truncate rounded-full border border-line-strong bg-white pl-9 pr-8 text-sm font-bold text-ink hover:bg-cream focus:border-blue focus:outline-none focus:ring-3 focus:ring-blue/25"
          style={{ backgroundImage: CHEVRON, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "14px" }}
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.shortName}
            </option>
          ))}
        </select>
      </label>
      <NeonStatus isOpen={hydrated ? isOpen : null} compact={!stacked} className={cn("shrink-0", stacked && "self-start")} />
    </div>
  );
}
