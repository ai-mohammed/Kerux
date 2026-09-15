import { NextResponse } from "next/server";
import { getServiceStatus } from "@/lib/api/restaurants";
import { errorResponse } from "@/lib/api/http";

export async function GET(_req: Request, ctx: RouteContext<"/api/restaurants/[id]/status">) {
  try {
    const { id } = await ctx.params;
    const restaurantId = Number(id);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json({ ok: false, message: "Restaurant inconnu." }, { status: 404 });
    }
    const status = await getServiceStatus(restaurantId);
    return NextResponse.json({ ok: true, status }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
