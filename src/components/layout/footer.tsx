import Link from "next/link";
import type { Restaurant } from "@/types";
import { Container, Awning } from "@/components/ui/bits";
import { Logo } from "./logo";
import { SOCIAL_LINKS } from "./nav-links";

const columns = [
  {
    title: "Commander",
    links: [
      { href: "/menu", label: "Menu" },
      { href: "/restaurants", label: "Nos restaurants" },
      { href: "/track-order", label: "Suivre ma commande" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/login", label: "Connexion" },
      { href: "/account", label: "Mon compte" },
      { href: "/account/orders", label: "Mes commandes" },
    ],
  },
  {
    title: "Informations",
    links: [
      { href: "/droits", label: "Droits & confidentialité" },
      { href: "/droits#mentions", label: "Mentions légales" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <footer className="mt-16 bg-ink text-white">
      <Awning />
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo size="lg" tone="light" />
          <p className="display text-2xl text-yellow">Saveur · Vitalité</p>
          <ul className="flex flex-col gap-2 text-sm text-white/80">
            {restaurants.map((r) => (
              <li key={r.id}>
                <span className="font-bold text-white">{r.name}</span> — {r.address}
                {r.phone ? (
                  <>
                    {" · "}
                    <a href={r.phoneHref} className="underline underline-offset-4 hover:text-yellow">
                      {r.phone}
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
            <p className="display-tight text-xl text-yellow">{col.title}</p>
            {col.links.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm font-semibold text-white/85 hover:text-yellow">
                {l.label}
              </Link>
            ))}
          </nav>
        ))}
      </Container>
      <Container className="flex flex-col gap-4 border-t border-white/15 py-6 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
          {SOCIAL_LINKS.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-yellow">
                {s.label} <span className="font-normal text-white/60">{s.handle}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Kerux Foods — Oran, Algérie.</p>
      </Container>
    </footer>
  );
}
