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
  const data = await getScreenBoard(board);
  if (!data) notFound();
  return <StudioNoirScreen initial={data} />;
}
