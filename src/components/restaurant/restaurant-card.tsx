"use client";

import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import type { Restaurant } from "@/types";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { useServiceStatus } from "@/hooks/use-service-status";
import { Button } from "@/components/ui/button";
import { NeonStatus } from "@/components/ui/bits";
import { cn } from "@/lib/utils/cn";

export function RestaurantCard({ restaurant, compact }: { restaurant: Restaurant; compact?: boolean }) {
  const { isOpen } = useServiceStatus(restaurant.id);
  const select = useRestaurantStore((s) => s.select);
  const selectedId = useRestaurantStore((s) => s.selectedId);
  const hydrated = useRestaurantStore((s) => s.hydrated);
  const selected = hydrated && selectedId === restaurant.id;

  return (
    <article id={restaurant.code.toLowerCase()} className={cn("board flex flex-col gap-4 p-5 sm:p-6", selected && "border-blue ring-2 ring-blue/20")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-3xl sm:text-4xl">{restaurant.shortName}</h3>
          <p className="mt-1 text-sm font-bold text-ink-500">Kerux Foods · Oran</p>
        </div>
        <NeonStatus isOpen={isOpen} />
      </div>
      <ul className="flex flex-col gap-2.5 text-[15px]">
        <li className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-red" aria-hidden />
          <span>{restaurant.address}</span>
        </li>
        {restaurant.phone ? (
          <li className="flex items-start gap-2.5">
            <Phone className="mt-0.5 size-4 shrink-0 text-red" aria-hidden />
            <a href={restaurant.phoneHref} className="font-bold underline underline-offset-4 hover:text-red">
              {restaurant.phone}
            </a>
          </li>
        ) : null}
        <li className="flex items-start gap-2.5">
          <Clock className="mt-0.5 size-4 shrink-0 text-red" aria-hidden />
          <span className={restaurant.hours ? "" : "text-ink-500"}>{restaurant.hours ?? "Horaires : à confirmer — appelez-nous ou vérifiez le statut ci-dessus."}</span>
        </li>
      </ul>
      {!compact ? (
        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          <Button href="/menu" onClick={() => select(restaurant.id)} className="flex-1">
            Commander ici
          </Button>
          <Button variant="secondary" href={restaurant.directionsUrl} target="_blank" className="flex-1" aria-label={`Itinéraire vers ${restaurant.name} (nouvel onglet)`}>
            <Navigation className="size-4" aria-hidden /> Itinéraire
          </Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" href="/menu" onClick={() => select(restaurant.id)} className="self-start">
          Commander ici
        </Button>
      )}
    </article>
  );
}
