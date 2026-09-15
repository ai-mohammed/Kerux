"use client";

import { useSyncExternalStore } from "react";
import type { Order } from "@/types";

/**
 * Guests cannot fetch an order back from the API (the detail endpoint needs a
 * token), so the confirmation returned at checkout is kept on the device.
 * Logged-in customers always get the live version instead.
 */
const KEY = "kerux-recent-orders";
const MAX = 10;
const EMPTY: Order[] = [];

let cachedRaw: string | null = null;
let cachedList: Order[] = EMPTY;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function readRecentOrders(): Order[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const list = raw ? (JSON.parse(raw) as Order[]) : [];
    cachedList = Array.isArray(list) ? list : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

export function rememberOrder(order: Order) {
  try {
    const list = readRecentOrders().filter((o) => o.publicId !== order.publicId);
    list.unshift(order);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    notify();
  } catch {
    /* storage unavailable (private mode) — nothing to do */
  }
}

export function readRecentOrder(publicId: string): Order | null {
  return readRecentOrders().find((o) => o.publicId === publicId || o.reference === publicId) ?? null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Orders remembered on this device; `undefined` during server render / hydration. */
export function useRecentOrders(): Order[] | undefined {
  return useSyncExternalStore(subscribe, readRecentOrders, () => undefined);
}

export function useRecentOrder(publicId: string): Order | null | undefined {
  const list = useRecentOrders();
  if (list === undefined) return undefined;
  return list.find((o) => o.publicId === publicId || o.reference === publicId) ?? null;
}
