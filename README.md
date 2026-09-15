# Kerux Foods — site web

Nouveau site public de **Kerux Foods** (Oran) : vitrine + commande en ligne (livraison, à emporter, sur place), branché sur le backend Laravel existant.

- Next.js 16 (App Router, React 19, TypeScript) · Tailwind CSS v4 · Zustand · Lucide
- Rendu serveur du menu (indexable), sitemap / robots / OpenGraph / JSON-LD
- Mobile-first, accessible (focus visible, labels, `aria-*`), images optimisées AVIF/WebP

Documents utiles : [`docs/01-analyse-existant.md`](docs/01-analyse-existant.md) (analyse + contrat API complet), [`PRODUCT.md`](PRODUCT.md) (vérités produit), [`DESIGN.md`](DESIGN.md) (système visuel).

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis ajustez si besoin
npm run dev                  # http://localhost:3000
```

Le serveur Next appelle l’API réelle (`KERUX_API_ORIGIN`). Le certificat TLS de `kerux-foods.com:8000` est **expiré** : en développement, `KERUX_API_INSECURE_TLS=1` désactive la vérification (jamais en production). Si l’API est injoignable, le catalogue bascule sur un snapshot réel (`src/lib/api/fixtures`, capturé le 2026-09-14) — la commande et l’authentification, eux, exigent le vrai backend.

Scripts :

| Commande | Rôle |
|---|---|
| `npm run dev` | développement |
| `npm run build` / `npm start` | build et serveur de production |
| `npm run lint` | ESLint |
| `npm test` | scénarios de la spec rejoués contre le code (Vitest) |
| `node scripts/capture-fixtures.mjs` | rafraîchir le snapshot du catalogue (`KERUX_API_INSECURE_TLS=1` si le certificat est encore expiré) |

## Variables d’environnement

| Variable | Rôle |
|---|---|
| `KERUX_API_ORIGIN` | origine de l’API Laravel (défaut `https://www.kerux-foods.com:8000`) |
| `KERUX_API_INSECURE_TLS` | `1` = ignorer le certificat **en dev uniquement** (ignoré si `NODE_ENV=production`) |
| `KERUX_DATA_SOURCE` | `auto` (défaut) · `fixtures` · `api` |
| `NEXT_PUBLIC_SITE_URL` | URL publique (canonical, sitemap, OpenGraph) |
| `NEXT_PUBLIC_GA_ID` | identifiant GA4 (vide = désactivé) |

## Déployer

1. **Renouveler le certificat TLS** de l’API (ou exposer l’API sur une origine avec un certificat valide, ex. `https://api.kerux-foods.com`). Sans cela, en production, la commande et la connexion échoueront (le site ne désactive jamais la vérification TLS en prod) et le catalogue tournera sur le snapshot.
2. Renseigner `KERUX_API_ORIGIN` et `NEXT_PUBLIC_SITE_URL` (ex. `https://www.kerux-foods.com`).
3. `npm run build` puis `npm start` (Node 20+), ou n’importe quel hébergeur Next.js (Vercel, Docker, PM2 derrière Caddy/Nginx).
4. Garder l’ancienne app accessible sous `/pos/…` pour le back-office (`/dashboard/*`) et le menu QR (`/qr-menu/*`) : ils ne font pas partie de cette refonte.

Les anciennes URLs (`/authentication/login`, `/myAccount/*`, `/menu/:id` numérique, `/contact/*`, `/delete-account`…) sont redirigées en 308 ; `/menu` et `/droits` gardent leur adresse.

## Architecture

```
src/
  app/                 routes (App Router) + route handlers sous app/api/*
    media/[...path]/   proxy des photos produits (même origine, cache 24 h)
  components/          ui/ layout/ home/ menu/ cart/ checkout/ order/ restaurant/ account/ seo/
  lib/api/             client serveur (client.ts), types bruts Laravel (raw.ts),
                       adaptateurs raw → domaine (adapters.ts), catalog/restaurants/orders/auth
  lib/auth/session.ts  cookie httpOnly du token backend (le navigateur ne le lit jamais)
  lib/cart/store.ts    panier persistant (localStorage) + totaux
  lib/orders/recent.ts commandes invité mémorisées sur l’appareil
  types/               types domaine
```

Règles : le navigateur ne parle **jamais** au backend directement (tout passe par `app/api/*` et `/media`), les champs internes de l’API (`prix_achat`, `stock`, URLs privées) ne sortent jamais des adaptateurs, l’enum de statuts et les payloads sont ceux du backend (voir `docs/01-analyse-existant.md`).

## Spécification exécutable (Unspaghettit)

Le parcours de commande est modélisé comme une spec exécutable dans `unspa/kerux-foods/` (3 surfaces, 17 actions, 8 invariants, 22 scénarios), générée par `scripts/unspa-spec.mjs` à partir du contrat backend documenté dans `docs/01-analyse-existant.md`.

| Commande | Rôle |
|---|---|
| `npm run spec:generate` | régénère `unspa/kerux-foods/*.json` depuis `scripts/unspa-spec.mjs` |
| `npm run spec:check` | simulateur + model checking bornés (`unspa check`) : scénarios, invariants, actions mortes, atteignabilité |
| `npm test` | rejoue chaque scénario de la spec **contre le vrai code** (`tests/spec-scenarios.test.ts` + `tests/unspa-adapter.ts`) : règles du checkout (`src/lib/checkout/rules.ts`), store panier, payload `POST /api/ventes/pending` |

Résultat courant : 22/22 scénarios verts dans le simulateur et contre le code, aucune violation d'invariant atteignable, toutes les surfaces atteignables. Un avertissement de liveness subsiste (« on peut toujours recommander ») : c'est une troncature de l'exploration (espace d'états du panier), le chemin signalé est rejoué avec succès par le scénario « Chemin signalé par le model checker ».

Ce que la spec a tranché : une seconde commande peut être passée pendant que la première est en attente (nouvelle tentative, nouvelle `Idempotency-Key`) ; le double clic est neutralisé par le vidage du panier après le 201. Le paiement en ligne n'est pas modélisé parce qu'il n'existe pas.

Le serveur MCP Unspaghettit est enregistré pour ce dépôt (`.mcp.json`) : depuis Claude Code / Cursor, la spec peut être interrogée et éditée par les outils `unspa` ; `unspa dashboard` ouvre l'éditeur/simulateur (`unspa check` ici demande `--snapshots unspa` car le modèle est rangé par projet).

## Points ouverts (à confirmer avec le backend)

- **Commande invité** : `POST /api/ventes/pending` répond 422 (validation) sans token — le site tente donc la commande sans compte et redirige vers la connexion si l’API répond 401.
- **Horaires** : `restaurants.horaires` est `null` → « Horaires : à confirmer » affiché ; à renseigner côté backend.
- **Paiement** : aucun paiement en ligne n’existe côté backend ; le site indique « Paiement à la réception ». Le paiement par carte est un chantier backend séparé.
- **Mentions légales** : `/droits` est un gabarit avec des blocs `[… — À COMPLÉTER]` à remplir avec les informations de l’entreprise.
- **Suivi invité** : l’API n’expose pas de suivi sans compte ; la page de suivi montre le dernier état connu sur l’appareil et invite à se connecter ou à appeler le restaurant.
