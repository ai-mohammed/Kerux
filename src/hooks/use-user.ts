"use client";

import { create } from "zustand";
import { useEffect } from "react";
import type { User } from "@/types";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";

type UserState = {
  user: User | null;
  status: "idle" | "loading" | "ready";
  load: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

let inflight: Promise<void> | null = null;

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  status: "idle",
  load: () => {
    if (inflight) return inflight;
    set({ status: "loading" });
    inflight = fetchJson<{ user: User | null }>("/api/auth/me")
      .then(({ user }) => set({ user, status: "ready" }))
      .catch((err: unknown) => {
        if (!(err instanceof RequestFailed) || err.status !== 401) console.warn(err);
        set({ user: null, status: "ready" });
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },
  setUser: (user) => set({ user, status: "ready" }),
  logout: async () => {
    await fetchJson("/api/auth/logout", { method: "POST" });
    set({ user: null, status: "ready" });
  },
}));

/** Current customer (null when logged out). Loads once per page life, shared by every component. */
export function useUser() {
  const { user, status, load, setUser, logout } = useUserStore();
  useEffect(() => {
    if (status === "idle") void load();
  }, [status, load]);
  return { user, loading: status !== "ready", setUser, logout, reload: load };
}
