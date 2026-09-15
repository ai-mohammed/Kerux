import "server-only";
import { NextResponse } from "next/server";
import { ApiError, ApiUnreachable } from "./client";

/** Uniform JSON error envelope for our own route handlers. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ ok: false, status: err.status, code: err.code, message: err.message, errors: err.errors }, { status: err.status });
  }
  if (err instanceof ApiUnreachable) {
    return NextResponse.json(
      { ok: false, status: 503, code: "UNREACHABLE", message: "Kerux est momentanément injoignable. Réessayez dans un instant." },
      { status: 503 },
    );
  }
  console.error(err);
  return NextResponse.json({ ok: false, status: 500, message: "Une erreur inattendue s'est produite." }, { status: 500 });
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError(400, "Requête invalide.");
  }
}

export const requireString = (v: unknown, label: string, max = 500): string => {
  if (typeof v !== "string" || !v.trim()) throw new ApiError(422, `${label} est obligatoire.`, "VALIDATION", { [label]: [`${label} est obligatoire.`] });
  return v.trim().slice(0, max);
};

export const optionalString = (v: unknown, max = 500): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
