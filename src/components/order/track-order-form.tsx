"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecentOrders } from "@/lib/orders/recent";
import { formatDA, formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { STATUS_LABEL } from "./order-timeline";

export function TrackOrderForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const recent = useRecentOrders() ?? [];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
      <form
        className="board flex flex-col gap-4 p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const id = value.trim();
          if (id) router.push(`/order/${encodeURIComponent(id)}`);
        }}
      >
        <Field label="Numéro de commande" htmlFor="order-id" required hint="Il figure sur la page de confirmation et dans « Mes commandes ».">
          <Input id="order-id" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex. : 0f3a9c…" autoComplete="off" inputMode="text" />
        </Field>
        <Button type="submit" size="lg" disabled={!value.trim()}>
          Voir le suivi
        </Button>
        <p className="text-sm text-ink-500">
          Connecté ? Retrouvez toutes vos commandes dans{" "}
          <Link href="/account/orders" className="font-bold text-blue underline underline-offset-4">
            Mon compte
          </Link>
          .
        </p>
      </form>

      {recent.length ? (
        <section className="board p-5 sm:p-6" aria-labelledby="recent">
          <h2 id="recent" className="display-tight mb-3 text-2xl">
            Sur cet appareil
          </h2>
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li key={o.publicId}>
                <Link href={`/order/${encodeURIComponent(o.publicId)}`} className="flex items-center justify-between gap-3 py-3 hover:text-red">
                  <span className="flex flex-col">
                    <span className="font-bold num">N° {o.reference}</span>
                    <span className="text-sm text-ink-500">
                      {formatDate(o.createdAt)} · {STATUS_LABEL[o.status]}
                    </span>
                  </span>
                  <span className="font-bold num">{formatDA(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
