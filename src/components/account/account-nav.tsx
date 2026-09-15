"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ReceiptText, Trash2, UserRound } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/account", label: "Profil", icon: UserRound, exact: true },
  { href: "/account/orders", label: "Mes commandes", icon: ReceiptText },
  { href: "/account/delete", label: "Supprimer le compte", icon: Trash2 },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();
  return (
    <nav aria-label="Mon compte" className="board flex flex-row gap-1 overflow-x-auto p-2 lg:flex-col lg:p-3">
      {ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold", active ? "bg-ink text-white" : "text-ink hover:bg-cream")}>
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await logout();
          toast("Vous êtes déconnecté.", "info");
          router.push("/");
          router.refresh();
        }}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-ink-600 hover:bg-cream hover:text-alert lg:mt-2"
      >
        <LogOut className="size-4" aria-hidden />
        Déconnexion
      </button>
    </nav>
  );
}
