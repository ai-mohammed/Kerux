import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";
import { errorResponse } from "@/lib/api/http";
import { getOrder } from "@/lib/api/orders";
import { getSession } from "@/lib/auth/session";

export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  try {
    const { id } = await ctx.params;
    const session = await getSession();
    if (!session) throw new ApiError(401, "Connectez-vous pour suivre cette commande.", "UNAUTHENTICATED");
    const order = await getOrder(id, session.token);
    return NextResponse.json({ ok: true, order }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
