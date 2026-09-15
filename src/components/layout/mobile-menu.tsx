"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import type { Restaurant } from "@/types";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RestaurantSwitcher } from "./restaurant-switcher";
import { NAV_LINKS } from "./nav-links";

export function MobileMenu({ restaurants }: { restaurants: Restaurant[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu de navigation" className="grid size-11 place-items-center rounded-full border-2 border-ink bg-white text-ink lg:hidden">
        <Menu className="size-5" aria-hidden />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Kerux" side="right" footer={<Button href="/menu" size="lg" className="w-full" onClick={() => setOpen(false)}>Commander</Button>}>
        <nav aria-label="Navigation principale" className="flex flex-col">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="display-tight border-b border-line py-4 text-3xl text-ink hover:text-red">
              {l.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className="display-tight border-b border-line py-4 text-3xl text-ink hover:text-red">
            Mon compte
          </Link>
        </nav>
        <div className="mt-6">
          <p className="mb-2 text-sm font-bold text-ink-600">Votre restaurant</p>
          <RestaurantSwitcher restaurants={restaurants} stacked />
        </div>
      </Sheet>
    </>
  );
}
