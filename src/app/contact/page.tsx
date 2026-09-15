import type { Metadata } from "next";
import { getRestaurants } from "@/lib/api/restaurants";
import { Container, SectionTitle } from "@/components/ui/bits";
import { ContactForm } from "@/components/account/contact-form";
import { SOCIAL_LINKS } from "@/components/layout/nav-links";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une réclamation ou une suggestion pour Kerux Foods ? Écrivez-nous ou appelez directement le restaurant.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { type } = await searchParams;
  const restaurants = await getRestaurants().catch(() => []);
  return (
    <Container className="flex flex-col gap-8 py-8 sm:py-10">
      <SectionTitle as="h1" sub="Pour une commande en cours, le plus rapide reste d’appeler le restaurant.">
        Contact
      </SectionTitle>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <ContactForm initialTopic={typeof type === "string" ? type : undefined} />
        <aside className="board flex flex-col gap-4 p-5" aria-label="Nous joindre directement">
          <h2 className="display-tight text-2xl">Par téléphone</h2>
          <ul className="flex flex-col gap-3">
            {restaurants.map((r) => (
              <li key={r.id} className="flex flex-col">
                <span className="font-bold">{r.shortName}</span>
                {r.phone ? (
                  <a href={r.phoneHref} className="text-blue underline underline-offset-4">
                    {r.phone}
                  </a>
                ) : null}
                <span className="text-sm text-ink-500">{r.address}</span>
              </li>
            ))}
          </ul>
          <h2 className="display-tight mt-2 text-2xl">Sur les réseaux</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-blue underline underline-offset-4">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Container>
  );
}
