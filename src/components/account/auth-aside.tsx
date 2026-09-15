import Image from "next/image";

/** Right-hand board on auth pages: the brand, not a stock illustration. */
export function AuthAside() {
  return (
    <div className="board relative overflow-hidden rounded-[28px] border-2 border-ink bg-red p-8 text-white">
      <div className="awning absolute inset-x-0 top-0" aria-hidden />
      <p className="display mt-4 text-balance text-5xl leading-[0.95] xl:text-6xl">
        Commandez.
        <br />
        <span className="text-yellow">Savourez.</span>
      </p>
      <ul className="mt-6 flex flex-col gap-2 text-[15px] text-white/90">
        <li>Vos coordonnées pré-remplies à chaque commande.</li>
        <li>Suivi en direct de vos commandes.</li>
        <li>Historique et points bonus sur votre compte.</li>
      </ul>
      <Image src="/brand/mascotte.png" alt="" width={220} height={220} className="absolute -bottom-10 -right-8 size-52 rotate-6 opacity-95" aria-hidden />
    </div>
  );
}
