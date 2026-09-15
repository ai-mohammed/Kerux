"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils/cn";

export function AccountButton({ className }: { className?: string }) {
  const { user } = useUser();
  const href = user ? "/account" : "/login";
  const label = user ? `Mon compte (${user.name || user.email || "client"})` : "Se connecter";
  return (
    <Link href={href} aria-label={label} className={cn("grid size-11 place-items-center rounded-full border-2 border-ink bg-white text-ink transition-colors hover:bg-cream", user && "border-blue text-blue", className)}>
      <UserRound className="size-5" aria-hidden />
    </Link>
  );
}
