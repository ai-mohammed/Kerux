import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

/**
 * The backend token lives in an httpOnly cookie set by our own route handlers.
 * The browser never reads it; server code forwards it as a Bearer header.
 */
const TOKEN = "kerux_token";
const UID = "kerux_uid";
const KIND = "kerux_kind";
const MAX_AGE = 60 * 60 * 24 * 3; // 3 days, same as the legacy app

export type Session = { token: string; userId: string; kind: "client" | "user" };

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(TOKEN)?.value;
  const userId = jar.get(UID)?.value;
  if (!token || !userId) return null;
  return { token, userId, kind: jar.get(KIND)?.value === "user" ? "user" : "client" };
}

const base = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setSession(res: NextResponse, session: Session) {
  res.cookies.set(TOKEN, session.token, { ...base, maxAge: MAX_AGE });
  res.cookies.set(UID, String(session.userId), { ...base, maxAge: MAX_AGE });
  res.cookies.set(KIND, session.kind, { ...base, maxAge: MAX_AGE });
}

export function clearSession(res: NextResponse) {
  for (const name of [TOKEN, UID, KIND]) res.cookies.set(name, "", { ...base, maxAge: 0 });
}
