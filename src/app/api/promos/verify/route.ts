import { NextResponse } from "next/server";
import { verifyPromo } from "@/lib/api/orders";
import { errorResponse } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    const code = new URL(req.url).searchParams.get("code")?.trim().slice(0, 40) ?? "";
    if (!code) return NextResponse.json({ ok: false, status: 422, message: "Saisissez un code." }, { status: 422 });
    const session = await getSession();
    const promo = await verifyPromo(code, session?.token ?? null);
    if (promo.percent <= 0) {
      return NextResponse.json({ ok: false, status: 404, message: "Ce code n’est pas valide." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, promo });
  } catch (err) {
    return errorResponse(err);
  }
}
