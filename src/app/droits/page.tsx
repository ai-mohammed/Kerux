import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui/bits";

export const metadata: Metadata = {
  title: "Droits, confidentialité et mentions légales",
  description: "Politique de confidentialité, droits des utilisateurs et mentions légales de Kerux Foods.",
  alternates: { canonical: "/droits" },
};

/**
 * Legal template. Every bracketed « À COMPLÉTER » is a fact the business must
 * provide; nothing legal is invented here. The route name is kept from the
 * old site so existing links keep working.
 */
const TODO = (label: string) => <mark className="rounded bg-yellow-100 px-1 font-bold text-ink">[{label} — À COMPLÉTER]</mark>;

export default function DroitsPage() {
  return (
    <Container className="flex flex-col gap-10 py-8 sm:py-10">
      <SectionTitle as="h1" sub="Vos droits, l’usage de vos données et les informations légales de Kerux Foods.">
        Droits & confidentialité
      </SectionTitle>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Sommaire" className="board hidden self-start p-4 lg:sticky lg:top-24 lg:block">
          <ul className="flex flex-col gap-2 text-sm font-bold">
            <li><a href="#donnees" className="hover:text-red">Données collectées</a></li>
            <li><a href="#usage" className="hover:text-red">Utilisation</a></li>
            <li><a href="#conservation" className="hover:text-red">Conservation</a></li>
            <li><a href="#vos-droits" className="hover:text-red">Vos droits</a></li>
            <li><a href="#cookies" className="hover:text-red">Cookies</a></li>
            <li><a href="#mentions" className="hover:text-red">Mentions légales</a></li>
          </ul>
        </nav>

        <article className="board flex max-w-prose flex-col gap-8 p-6 text-[15px] leading-relaxed text-ink-800 sm:p-8">
          <section id="donnees" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Données collectées</h2>
            <p>Pour traiter une commande, Kerux Foods collecte : votre nom, votre numéro de téléphone, et, pour une livraison, votre adresse et votre quartier. Si vous créez un compte : votre email et un mot de passe (stocké de façon chiffrée par notre système).</p>
            <p>Les commandes passées sans compte sont mémorisées uniquement sur votre appareil pour vous permettre de les retrouver.</p>
          </section>

          <section id="usage" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Utilisation</h2>
            <p>Ces données servent à préparer, livrer et confirmer vos commandes (le restaurant peut vous appeler), à gérer votre compte et vos points bonus, et à répondre à vos messages. Elles ne sont pas vendues à des tiers.</p>
            <p>Le site utilise Google Analytics pour mesurer l’audience de façon agrégée {TODO("préciser si l’outil est conservé au déploiement")}.</p>
          </section>

          <section id="conservation" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Conservation</h2>
            <p>Les données de commande sont conservées {TODO("durée de conservation")}. Les données de compte sont conservées jusqu’à la suppression du compte, que vous pouvez demander à tout moment depuis la page « Supprimer mon compte ».</p>
          </section>

          <section id="vos-droits" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Vos droits</h2>
            <p>Conformément à la loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel, vous disposez d’un droit d’accès, de rectification, d’opposition et de suppression de vos données.</p>
            <p>Pour l’exercer : {TODO("email de contact données personnelles")} ou par courrier à l’adresse indiquée dans les mentions légales.</p>
          </section>

          <section id="cookies" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Cookies et stockage local</h2>
            <p>Le site dépose un cookie de session sécurisé lorsque vous vous connectez, et enregistre sur votre appareil votre panier, le restaurant choisi et vos dernières commandes. Aucun cookie publicitaire n’est utilisé.</p>
          </section>

          <section id="mentions" className="flex flex-col gap-3">
            <h2 className="display-tight text-2xl">Mentions légales</h2>
            <dl className="grid gap-2 sm:grid-cols-[180px_1fr]">
              <dt className="font-bold">Éditeur</dt>
              <dd>Kerux Foods — {TODO("forme juridique et raison sociale")}</dd>
              <dt className="font-bold">Siège</dt>
              <dd>{TODO("adresse du siège")}, Oran, Algérie</dd>
              <dt className="font-bold">Registre de commerce</dt>
              <dd>{TODO("numéro RC")}</dd>
              <dt className="font-bold">NIF</dt>
              <dd>{TODO("numéro d’identification fiscale")}</dd>
              <dt className="font-bold">Contact</dt>
              <dd>{TODO("email de contact")} · Akid Lotfi : 0550 31 93 12 · Boulevard des Lions : 0670 27 76 80</dd>
              <dt className="font-bold">Hébergement</dt>
              <dd>{TODO("hébergeur du site")}</dd>
            </dl>
          </section>
        </article>
      </div>
    </Container>
  );
}
