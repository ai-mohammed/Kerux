import { API_ORIGIN } from "@/lib/api/client";

/**
 * Same-origin proxy for product photos hosted on the API (`/media/produits/…`).
 * `next/image` optimises from this URL, so the browser gets AVIF/WebP at the
 * right size and never has to reach the backend (or its expired certificate).
 */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

export async function GET(_req: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path } = await ctx.params;
  if (!path?.length || path.length > 4 || !path.every((s) => SAFE_SEGMENT.test(s))) {
    return new Response("Not found", { status: 404 });
  }
  const upstream = `${API_ORIGIN}/media/${path.join("/")}`;
  let res: Response;
  try {
    res = await fetch(upstream, { signal: AbortSignal.timeout(10_000), next: { revalidate: 60 * 60 * 24 } });
  } catch {
    return new Response("Image indisponible", { status: 502 });
  }
  const type = res.headers.get("content-type")?.split(";")[0] ?? "";
  if (!res.ok || !IMAGE_TYPES.has(type)) return new Response("Not found", { status: 404 });
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
