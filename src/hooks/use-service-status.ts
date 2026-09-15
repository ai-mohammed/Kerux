"use client";

import { useEffect, useState } from "react";
import type { ServiceStatus } from "@/types";
import { fetchJson } from "@/lib/utils/fetch-json";

const cache = new Map<number, { at: number; status: ServiceStatus }>();
const TTL = 45_000;

/** Live open/closed state of a restaurant, refreshed every 60 s while the tab is visible. */
export function useServiceStatus(restaurantId: number | null) {
  const [status, setStatus] = useState<ServiceStatus | null>(() => (restaurantId ? cache.get(restaurantId)?.status ?? null : null));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    const load = async (force = false) => {
      const hit = cache.get(restaurantId);
      if (!force && hit && Date.now() - hit.at < TTL) {
        setStatus(hit.status);
        return;
      }
      try {
        const { status } = await fetchJson<{ status: ServiceStatus }>(`/api/restaurants/${restaurantId}/status`);
        if (cancelled) return;
        cache.set(restaurantId, { at: Date.now(), status });
        setStatus(status);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    void load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [restaurantId]);

  return { status, isOpen: status?.isOpen ?? null, error };
}
