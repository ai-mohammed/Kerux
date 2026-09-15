import { NextResponse } from "next/server";
import { sendContact } from "@/lib/api/auth";
import { errorResponse, optionalString, readJson, requireString } from "@/lib/api/http";

const TOPICS = new Set(["reclamation", "suggestion", "question"]);

export async function POST(req: Request) {
  try {
    const body = await readJson<Record<string, unknown>>(req);
    const topic = optionalString(body.topic, 20);
    await sendContact({
      name: requireString(body.name, "Nom", 80),
      email: requireString(body.email, "Email", 120),
      topic: TOPICS.has(topic) ? topic : "question",
      subject: requireString(body.subject, "Sujet", 120),
      message: requireString(body.message, "Message", 2000),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
