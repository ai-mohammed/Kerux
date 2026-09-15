import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/types";
import { SERVICE_TYPE_LABEL } from "@/types";
import { ApiError } from "@/lib/api/client";
import { listOrders } from "@/lib/api/orders";
import { getSession } from "@/lib/auth/session";
import { formatDA, formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/bits";
import { STATUS_LABEL } from "@/components/order/order-timeline";

export const metadata: Metadata = { title: "Mes commandes", robots: { index: false } };
export const dynamic = "force-dynamic";

type Loaded = { kind: "ok"; orders: Order[]; lastPage: number } | { kind: "expired" } | { kind: "error" };

async function load(token: string, page: number): Promise<Loaded> {
  try {
    const { orders, lastPage } = await listOrders(token, page);
    return { kind: "ok", orders, lastPage };
  } catch (err) {
    return err instanceof ApiError && err.status === 401 ? { kind: "expired" } : { kind: "error" };
  }
}

const count = (o: Order) => o.lines.reduce((s, l) => s + l.quantity, 0);

export default async function AccountOrdersPage({ searchParams }: PageProps<"/account/orders">) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/orders");
  const { page } = await searchParams;
  const current = Math.max(1, Number(page) || 1);
  const result = await load(session.token, current);
  if (result.kind === "expired") redirect("/login?next=/account/orders");
  if (result.kind === "error") {
    return <EmptyState title="Commandes indisponibles" text="Impossible de charger vos commandes pour le moment. Réessayez dans un instant." />;
  }
  if (!result.orders.length) {
    return <EmptyState title="Aucune commande" text="Vos commandes apparaîtront ici dès la première." action={<Button href="/menu">Commander</Button>} />;
  }
  return (
    <div className="flex flex-col gap-4">
      <ul className="board divide-y divide-line">
        {result.orders.map((o) => (
          <li key={o.publicId}>
            <Link href={`/order/${encodeURIComponent(o.publicId)}`} className="flex items-center gap-4 px-5 py-4 hover:bg-cream">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="display-tight text-xl num">N° {o.reference}</span>
                <span className="text-sm text-ink-600">
                  {formatDate(o.createdAt)} · {SERVICE_TYPE_LABEL[o.serviceType]} · {count(o)} article{count(o) > 1 ? "s" : ""}
                </span>
              </span>
              <span className={cn("hidden rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider sm:inline", o.status === "validee" ? "bg-green-100 text-green" : o.status === "annulee" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-ink")}>
                {STATUS_LABEL[o.status]}
              </span>
              <span className="font-bold num">{formatDA(o.total)}</span>
              <ChevronRight className="size-5 shrink-0 text-ink-500" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      {result.lastPage > 1 ? (
        <nav aria-label="Pages" className="flex items-center justify-center gap-2">
          {Array.from({ length: result.lastPage }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/account/orders?page=${p}`} aria-current={p === current ? "page" : undefined} className={cn("grid size-10 place-items-center rounded-full border-2 text-sm font-bold num", p === current ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}>
              {p}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
