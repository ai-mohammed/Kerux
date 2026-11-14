// Faux back-office Kerux pour tester les écrans en local (npm run demo:backoffice).
// Sert le catalogue de src/lib/api/fixtures comme le ferait l'API Laravel,
// et une page http://localhost:4000/ pour changer prix et disponibilité.
const http = require("http");
const fs = require("fs");
const path = require("path");
const FIX = path.resolve(__dirname, "..", "src", "lib", "api", "fixtures");
const read = (f) => JSON.parse(fs.readFileSync(path.join(FIX, f), "utf8"));
const products = read("products.json");
const categories = read("categories.json");
const status = read("service-status.json");
const catName = Object.fromEntries(categories.map((c) => [c.id, c.nom]));
const routes = {
  "/api/categories": () => categories,
  "/api/products": () => products,
  "/api/restaurants": () => read("restaurants.json"),
  "/api/supplements": () => read("supplements.json"),
  "/api/observations": () => read("observations.json"),
  "/api/districtDelivery": () => read("districts.json"),
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function page() {
  const rows = [...products.data]
    .sort((a, b) => String(catName[a.categorie_id]).localeCompare(String(catName[b.categorie_id])) || a.nom.localeCompare(b.nom))
    .map((p) => `<tr><td>${esc(catName[p.categorie_id] ?? "")}</td><td><b>${esc(p.nom)}</b></td>
      <td><input id="p${p.id}" type="number" step="10" min="0" value="${Math.round(Number(p.prix_vente))}"> DA</td>
      <td><label><input id="a${p.id}" type="checkbox" ${p.actif ? "checked" : ""}> disponible</label></td>
      <td><button onclick="save(${p.id})">Enregistrer</button> <span id="s${p.id}"></span></td></tr>`)
    .join("");
  return `<!doctype html><meta charset="utf-8"><title>Back-office de test Kerux</title>
  <style>body{font-family:system-ui;margin:24px;background:#f8f5ef}table{border-collapse:collapse;background:#fff}td{padding:6px 10px;border-bottom:1px solid #e0ddd8}
  input[type=number]{width:90px;font-size:16px}button{background:#e43b15;color:#fff;border:0;border-radius:8px;padding:6px 12px;cursor:pointer}</style>
  <h1>Back-office de test Kerux</h1><p>Changez un prix ou décochez « disponible », cliquez Enregistrer, puis regardez l'écran : il se met à jour seul en 1 à 2 minutes.</p>
  <table>${rows}</table>
  <script>async function save(id){const r=await fetch('/__demo/product?id='+id+'&price='+document.getElementById('p'+id).value+'&actif='+(document.getElementById('a'+id).checked?1:0),{method:'POST'});
  document.getElementById('s'+id).textContent=r.ok?'Enregistré à '+new Date().toLocaleTimeString():'Erreur';}</script>`;
}
http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    const send = (code, body) => {
      res.writeHead(code, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (u.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(page());
    }
    if (u.pathname === "/__demo/product") {
      const p = products.data.find((x) => String(x.id) === u.searchParams.get("id"));
      if (!p) return send(404, { message: "produit inconnu" });
      if (u.searchParams.has("price")) p.prix_vente = Number(u.searchParams.get("price")).toFixed(2);
      if (u.searchParams.has("actif")) p.actif = u.searchParams.get("actif") === "1";
      console.log(new Date().toLocaleTimeString(), "modifié :", p.nom, p.prix_vente, p.actif ? "disponible" : "épuisé");
      return send(200, { id: p.id, nom: p.nom, prix_vente: p.prix_vente, actif: p.actif });
    }
    const m = u.pathname.match(/^\/api\/restaurants\/(\d+)\/service-status$/);
    if (m) return send(200, status[m[1]] ?? { restaurant_id: Number(m[1]), is_open: true });
    const r = routes[u.pathname];
    if (r) return send(200, r());
    send(404, { message: "Introuvable." });
  })
  .listen(4000, "127.0.0.1", () => console.log("Back-office de test : http://localhost:4000/"));
