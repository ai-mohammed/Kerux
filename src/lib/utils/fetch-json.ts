"use client";

import type { ApiFailure } from "@/types";

export class RequestFailed extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  constructor(f: ApiFailure) {
    super(f.message);
    this.name = "RequestFailed";
    this.status = f.status;
    this.code = f.code;
    this.errors = f.errors;
  }
}

/** Browser → our own route handlers. Throws `RequestFailed` with the server's French message. */
export async function fetchJson<T>(input: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(input, {
      ...rest,
      headers: { Accept: "application/json", ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: "same-origin",
    });
  } catch {
    throw new RequestFailed({ ok: false, status: 0, code: "NETWORK", message: "Pas de connexion. Vérifiez votre réseau et réessayez." });
  }
  const text = await res.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const p = (payload ?? {}) as Partial<ApiFailure>;
    throw new RequestFailed({ ok: false, status: res.status, code: p.code, message: p.message ?? "Une erreur est survenue.", errors: p.errors });
  }
  return payload as T;
}
