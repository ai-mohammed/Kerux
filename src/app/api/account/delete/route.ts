import { NextResponse } from "next/server";
import { deleteAccount } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorResponse } from "@/lib/api/http";
import { clearSession, getSession } from "@/lib/auth/session";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) throw new ApiError(401, "Connectez-vous pour supprimer votre compte.", "UNAUTHENTICATED");
    await deleteAccount(session.token, session.userId);
    const res = NextResponse.json({ ok: true });
    clearSession(res);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
