import "server-only";

/**
 * The only place that talks to the Laravel backend. Runs on the Next server
 * (server components + route handlers); the browser never sees the origin,
 * the Bearer token or the expired certificate.
 */

export const API_ORIGIN = (process.env.KERUX_API_ORIGIN ?? "https://www.kerux-foods.com:8000").replace(/\/+$/, "");

const DATA_SOURCE = (process.env.KERUX_DATA_SOURCE ?? "auto") as "auto" | "fixtures" | "api";
const INSECURE_TLS = process.env.KERUX_API_INSECURE_TLS === "1" && process.env.NODE_ENV !== "production";

if (INSECURE_TLS) {
  // Development-only escape hatch for the expired certificate on :8000.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
  constructor(status: number, message: string, code?: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export class ApiUnreachable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiUnreachable";
  }
}

export type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  restaurantId?: number | null;
  headers?: Record<string, string>;
  /** Next data-cache options for GET requests (`revalidate` seconds, tags). */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  timeoutMs?: number;
};

export type ApiResponse<T> = { status: number; data: T };

/** Extracts the backend's own error message, which is already in French. */
function messageFrom(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "message" in payload && typeof (payload as { message: unknown }).message === "string") {
    return (payload as { message: string }).message;
  }
  if (status === 401) return "Non authentifié. Veuillez vous connecter.";
  if (status === 404) return "Introuvable.";
  if (status === 422) return "Certaines informations sont invalides.";
  return "Le service est momentanément indisponible.";
}

export async function apiFetch<T>(path: string, req: ApiRequest = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json", ...req.headers };
  if (req.body !== undefined) headers["Content-Type"] = "application/json";
  if (req.token) headers.Authorization = `Bearer ${req.token}`;
  if (req.restaurantId) headers["X-Restaurant-Id"] = String(req.restaurantId);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? 12_000);
  let res: Response;
  try {
    res = await fetch(API_ORIGIN + path, {
      method: req.method ?? "GET",
      headers,
      body: req.body === undefined ? undefined : JSON.stringify(req.body),
      signal: controller.signal,
      next: req.next,
      cache: req.cache ?? (req.next ? undefined : "no-store"),
    });
  } catch (err) {
    throw new ApiUnreachable(err instanceof Error ? err.message : "network error");
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (res.status >= 500) throw new ApiUnreachable(`API ${res.status}`);
  if (!res.ok) {
    const p = (payload ?? {}) as { code?: string; errors?: Record<string, string[]> };
    throw new ApiError(res.status, messageFrom(payload, res.status), p.code, p.errors);
  }
  return { status: res.status, data: payload as T };
}

let warned = false;

/**
 * GET with a real-data fallback. `fixture` is a lazy loader for the snapshot
 * captured from the live API (src/lib/api/fixtures). Only catalogue reads use
 * it — orders and auth always need the real backend.
 */
export async function apiGet<T>(path: string, fixture?: () => Promise<T>, req: ApiRequest = {}): Promise<T> {
  if (DATA_SOURCE === "fixtures" && fixture) return fixture();
  try {
    const { data } = await apiFetch<T>(path, { ...req, method: "GET" });
    return data;
  } catch (err) {
    if (fixture && DATA_SOURCE !== "api" && err instanceof ApiUnreachable) {
      if (!warned) {
        warned = true;
        console.warn(`[kerux] API injoignable (${err.message}) — repli sur les fixtures pour ${path}`);
      }
      return fixture();
    }
    throw err;
  }
}

/** True when the failure should be shown to the user as "service indisponible". */
export function isUnreachable(err: unknown): err is ApiUnreachable {
  return err instanceof ApiUnreachable;
}
