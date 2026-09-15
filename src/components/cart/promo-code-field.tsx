"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useCartStore } from "@/lib/cart/store";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

/** Verifies a code against the backend (`/api/promos/vrf`) and keeps the percentage in the cart. */
export function PromoCodeField() {
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async () => {
    const value = code.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    try {
      const { promo } = await fetchJson<{ promo: { code: string; percent: number } }>(`/api/promos/verify?code=${encodeURIComponent(value)}`);
      setPromo(promo);
      setCode("");
    } catch (err) {
      setError(err instanceof RequestFailed ? err.message : "Impossible de vérifier ce code.");
    } finally {
      setBusy(false);
    }
  };

  if (promo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-green bg-green-100 px-4 py-3 text-sm">
        <span className="inline-flex items-center gap-2 font-bold">
          <Check className="size-4 text-green" aria-hidden />
          Code {promo.code} appliqué : −{promo.percent}%
        </span>
        <button type="button" onClick={() => setPromo(null)} className="inline-flex items-center gap-1 font-bold text-ink-600 hover:text-alert" aria-label="Retirer le code promo">
          <X className="size-4" aria-hidden /> Retirer
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void apply();
      }}
    >
      <label htmlFor="promo" className="text-sm font-bold">
        Code de réduction
      </label>
      <div className="flex gap-2">
        <Input id="promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Votre code" autoComplete="off" invalid={Boolean(error)} aria-describedby={error ? "promo-error" : undefined} />
        <Button type="submit" variant="secondary" loading={busy} disabled={!code.trim()}>
          Appliquer
        </Button>
      </div>
      {error ? (
        <p id="promo-error" role="alert" className="text-sm font-semibold text-alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
