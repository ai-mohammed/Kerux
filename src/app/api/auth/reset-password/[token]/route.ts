import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorResponse, readJson, requireString } from "@/lib/api/http";

export async function POST(req: Request, ctx: RouteContext<"/api/auth/reset-password/[token]">) {
  try {
    const { token } = await ctx.params;
    const body = await readJson<{ password?: string; confirm?: string }>(req);
    const password = requireString(body.password, "Mot de passe", 200);
    const confirm = requireString(body.confirm, "Confirmation", 200);
    if (password !== confirm) throw new ApiError(422, "Les deux mots de passe ne correspondent pas.");
    if (password.length < 6) throw new ApiError(422, "Le mot de passe doit contenir au moins 6 caractères.");
    await resetPassword(token, password, confirm);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
