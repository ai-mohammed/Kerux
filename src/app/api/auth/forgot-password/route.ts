import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/api/auth";
import { errorResponse, readJson, requireString } from "@/lib/api/http";

export async function POST(req: Request) {
  try {
    const body = await readJson<{ email?: string }>(req);
    await forgotPassword(requireString(body.email, "Email", 120));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
