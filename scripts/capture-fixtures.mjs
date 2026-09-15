// Captures a real snapshot of the public Kerux API into src/lib/api/fixtures/.
// Internal fields that must never reach the browser are stripped here too.
// Usage: KERUX_API_ORIGIN=https://www.kerux-foods.com:8000 node scripts/capture-fixtures.mjs
import { writeFile, mkdir } from "node:fs/promises";

const ORIGIN = process.env.KERUX_API_ORIGIN ?? "https://www.kerux-foods.com:8000";
if (process.env.KERUX_API_INSECURE_TLS === "1") process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const INTERNAL = new Set(["prix_achat", "stock", "tva", "code_barre", "photo_hash", "photo_source_url", "photo_synced_at", "photo_public_id"]);
const strip = (v) => {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).filter(([k]) => !INTERNAL.has(k)).map(([k, x]) => [k, strip(x)]));
  return v;
};

const get = async (path) => {
  const r = await fetch(ORIGIN + path, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
};

const out = "src/lib/api/fixtures";
await mkdir(out, { recursive: true });
const files = {
  "categories.json": await get("/api/categories"),
  "products.json": await get("/api/products?page=1&per_page=200"),
  "supplements.json": await get("/api/supplements"),
  "observations.json": await get("/api/observations"),
  "restaurants.json": await get("/api/restaurants"),
  "districts.json": await get("/api/districtDelivery"),
  "service-status.json": { 1: await get("/api/restaurants/1/service-status"), 2: await get("/api/restaurants/2/service-status") },
};
for (const [name, data] of Object.entries(files)) {
  await writeFile(`${out}/${name}`, JSON.stringify(strip(data), null, 2) + "\n");
  console.log("wrote", name);
}
await writeFile(`${out}/CAPTURED_AT`, new Date().toISOString() + "\n");
