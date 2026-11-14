import type { Metadata } from "next";
import Link from "next/link";
import { BOARDS } from "@/lib/screens/boards";

export const metadata: Metadata = { title: "Écrans du restaurant", robots: { index: false, follow: false } };

/** Setup page for staff: one link per screen, to open in full screen on each TV. */
export default function ScreensIndex() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <h1 className="display text-5xl">Écrans du restaurant</h1>
      <p className="text-lg text-ink-600">
        Ouvrez une adresse par TV, en plein écran. Les prix et la disponibilité viennent du back-office : un changement apparaît sur les écrans en moins de deux minutes, sans rien
        toucher ici.
      </p>
      <ul className="flex flex-col gap-3">
        {BOARDS.map((b) => (
          <li key={b.slug}>
            <Link href={`/ecrans/${b.slug}`} className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-white hover:bg-ink-800">
              <span className="display text-2xl">{b.title}</span>
              <span className="font-mono text-sm opacity-80">/ecrans/{b.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-600">Un produit passé en « inactif » dans le back-office s’affiche « Épuisé » à sa place. Si internet coupe, l’écran garde le dernier menu affiché.</p>
    </main>
  );
}
