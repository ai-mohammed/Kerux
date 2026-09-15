import { NextResponse } from "next/server";
import { me } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorResponse } from "@/lib/api/http";
import { clearSession, getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  // Logged-out is a normal state, not an error: 200 with a null user keeps the browser console clean.
  if (!session) return NextResponse.json({ ok: true, user: null }, { headers: { "Cache-Control": "private, no-store" } });
  try {
    const user = await me(session.token, session.kind);
    return NextResponse.json({ ok: true, user }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const res = NextResponse.json(
        { ok: false, status: 401, code: "SESSION_EXPIRED", message: "Votre session a expiré. Reconnectez-vous." },
        { status: 401 },
      );
      clearSession(res);
      return res;
    }
    return errorResponse(err);
  }
}
