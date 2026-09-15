import { NextResponse } from "next/server";
import { me, updateProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { errorResponse, optionalString, readJson, requireString } from "@/lib/api/http";
import { getSession } from "@/lib/auth/session";
import { isValidPhone, normalizePhone } from "@/lib/utils/format";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session) throw new ApiError(401, "Connectez-vous pour modifier votre profil.", "UNAUTHENTICATED");
    const body = await readJson<Record<string, unknown>>(req);
    const phone = normalizePhone(requireString(body.phone, "Téléphone", 20));
    if (!isValidPhone(phone)) throw new ApiError(422, "Le numéro doit commencer par 05, 06 ou 07 et contenir 10 chiffres.");
    const newPassword = optionalString(body.newPassword, 200);
    if (newPassword && newPassword.length < 6) throw new ApiError(422, "Le nouveau mot de passe doit contenir au moins 6 caractères.");
    await updateProfile(session.token, session.userId, {
      firstName: requireString(body.firstName, "Prénom", 60),
      lastName: requireString(body.lastName, "Nom", 60),
      phone,
      district: optionalString(body.district, 80),
      address: optionalString(body.address, 200),
      password: optionalString(body.password, 200) || undefined,
      newPassword: newPassword || undefined,
    });
    const user = await me(session.token, session.kind);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return errorResponse(err);
  }
}
