import "server-only";
import { cache } from "react";
import type { DeliveryDistrict, Restaurant, ServiceStatus } from "@/types";
import type { RawDistrict, RawRestaurant, RawServiceStatus } from "./raw";
import { apiGet } from "./client";
import { toDistrict, toRestaurant, toServiceStatus } from "./adapters";

export const getRestaurants = cache(async (): Promise<Restaurant[]> => {
  const raw = await apiGet<{ data: RawRestaurant[] }>(
    "/api/restaurants",
    () => import("./fixtures/restaurants.json").then((m) => m.default as { data: RawRestaurant[] }),
    { next: { revalidate: 300, tags: ["restaurants"] } },
  );
  return (raw.data ?? []).map(toRestaurant).sort((a, b) => a.id - b.id);
});

export const getDeliveryDistricts = cache(async (): Promise<DeliveryDistrict[]> => {
  const raw = await apiGet<RawDistrict[]>(
    "/api/districtDelivery",
    () => import("./fixtures/districts.json").then((m) => m.default as RawDistrict[]),
    { next: { revalidate: 300, tags: ["restaurants"] } },
  );
  return raw.map(toDistrict).sort((a, b) => a.name.localeCompare(b.name, "fr"));
});

/** Live open/closed flag — never cached. Falls back to the snapshot only when the API is down. */
export async function getServiceStatus(restaurantId: number): Promise<ServiceStatus> {
  const raw = await apiGet<RawServiceStatus>(
    `/api/restaurants/${restaurantId}/service-status`,
    () =>
      import("./fixtures/service-status.json").then(
        (m) => (m.default as Record<string, RawServiceStatus>)[String(restaurantId)] ?? { restaurant_id: restaurantId, is_open: false },
      ),
    { cache: "no-store", timeoutMs: 6_000 },
  );
  return toServiceStatus(raw);
}
