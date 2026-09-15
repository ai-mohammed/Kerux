import { NextResponse } from "next/server";
import { login } from "@/lib/api/auth";
import { errorResponse, readJson, requireString } from "@/lib/api/http";
import { setSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await readJson<{ identifier?: string; password?: string }>(req);
    const identifier = requireString(body.identifier, "Email ou téléphone", 120);
    const password = requireString(body.password, "Mot de passe", 200);
    const { token, user } = await login(identifier, password);
    const res = NextResponse.json({ ok: true, user });
    setSession(res, { token, userId: String(user.id), kind: user.kind });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
