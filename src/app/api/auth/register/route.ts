import { NextResponse } from "next/server";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorResponse, optionalString, readJson, requireString } from "@/lib/api/http";
import { setSession } from "@/lib/auth/session";
import { isValidPhone, normalizePhone } from "@/lib/utils/format";

export async function POST(req: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    const firstName = requireString(body.firstName, "Prénom", 60);
    const lastName = requireString(body.lastName, "Nom", 60);
    const email = optionalString(body.email, 120);
    const phone = normalizePhone(optionalString(body.phone, 20));
    const password = requireString(body.password, "Mot de passe", 200);
    if (!email && !phone) throw new ApiError(422, "Indiquez un email ou un numéro de téléphone.");
    if (phone && !isValidPhone(phone)) throw new ApiError(422, "Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres.");
    if (password.length < 6) throw new ApiError(422, "Le mot de passe doit contenir au moins 6 caractères.");
    const { token, user } = await register({ firstName, lastName, email: email || null, phone: phone || null, password });
    const res = NextResponse.json({ ok: true, user }, { status: 201 });
    setSession(res, { token, userId: String(user.id), kind: user.kind });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
