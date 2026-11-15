import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BOARDS } from "@/lib/screens/boards";
import { getScreenBoard } from "@/lib/screens/data";
import { StudioNoirScreen } from "@/components/screens/studio-noir";

export const revalidate = 60;

export function generateStaticParams() {
  return BOARDS.map((b) => ({ board: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ecrans/[board]">): Promise<Metadata> {
  const { board } = await params;
  const cfg = BOARDS.find((b) => b.slug === board);
  return { title: cfg ? `Écran ${cfg.title}` : "Écran", robots: { index: false, follow: false } };
}

export default async function ScreenPage({ params }: PageProps<"/ecrans/[board]">) {
  const { board } = await params;
  if (!BOARDS.some((b) => b.slug === board)) notFound();
  // Back-office unreachable: at build the page renders without a menu and the screen loads it
  // itself; on a later refresh the error keeps the last good page cached. Never the old snapshot.
  const data = await getScreenBoard(board).catch((err) => {
    if (process.env.NEXT_PHASE === "phase-production-build") return null;
    throw err;
  });
  return <StudioNoirScreen slug={board} initial={data} />;
}
