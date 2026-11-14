import { getScreenBoard } from "@/lib/screens/data";

/** Polled by each in-store screen to pick up price and availability changes made in the back-office. */
export async function GET(_req: Request, ctx: RouteContext<"/api/screens/[board]">) {
  const { board } = await ctx.params;
  const data = await getScreenBoard(board).catch(() => null);
  if (!data) return Response.json({ message: "Écran inconnu ou catalogue indisponible" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
