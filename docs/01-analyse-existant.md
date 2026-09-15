# Kerux Foods — Analyse de l'existant

Date : 2026-09-14
Source : site de production `https://www.kerux-foods.com:8000/` (HTML, bundle `main.8db9dffa.js`, 30 chunks lazy, `main.65d74baf.css`, `manifest.json`) et endpoints publics de l'API. Aucun code source n'est disponible dans ce repo : le dossier `Kerux/` était vide.

Tout ce qui suit est **observé**, pas supposé. Les points marqués `À VÉRIFIER` doivent être confirmés avec le propriétaire du backend avant implémentation.

---

## 1. Architecture actuelle

```
https://www.kerux-foods.com:8000
├── /                 → SPA React (CRA) servie depuis /pos/ (index.html 911 o)
├── /pos/static/…     → main.js 877 Ko + 30 chunks + main.css 278 Ko
├── /media/produits/… → photos produits (jpg/png)
└── /api/…            → backend Laravel (PHP 8.4.22) derrière Caddy, même origine
```

| Couche | Techno observée |
|---|---|
| Frontend | React 18 (create-react-app), react-router **v5**, styled-components, react-bootstrap + Bootstrap 5, react-slick, i18next (fr / en / ar), Google Analytics `G-0PPLR8X2FL` |
| Backend | Laravel (cookies `pos-backend-session` + `XSRF-TOKEN`, `/sanctum/csrf-cookie` répond 200, messages d'erreur Laravel) |
| Serveur | Caddy, HTTP/3 annoncé, port **8000** |
| Auth | Bearer token (Sanctum personal access token) stocké en **cookies** JS : `kerux-user-id`, `kerux-user-token`, `kerux-auth-kind` (3 jours, via js-cookie). Header `X-Restaurant-Id` ajouté sur chaque appel |
| PWA | `manifest.json` : name **"Kerux QR Menu"**, theme `#E43B15`, background `#F8F5EF` |

Le même bundle contient **trois applications** : le site client, le menu QR (commande à table) et le **back-office** (`/dashboard/*` : produits, catégories, commandes, utilisateurs, promos, bannières, écran cuisine, SSE `/api/dashboard/orders/stream`).

### Routes actuelles (extraites du router)

Public / client :
```
/                      /menu                 /menu/:productId
/authentication        /authentication/login /authentication/singUp
/authentication/logout /authentication/confirmation
/authentication/forgotPassword               /authentication/resetPassword/:token
/myAccount/orderMethod (checkout)            /myAccount/myProfile
/myAccount/myOrders    /myAccount/myOrders/:orderID
/contact  /contact/complaint  /contact/suggestion  /contact/thanks
/droits   /delete-account
/qr-menu/:restaurantId/:qrCodeNumber
/qr-menu/:restaurantId/:qrCodeNumber/product/:productId
```
Back-office (hors périmètre du nouveau site) :
```
/dashboard, /dashboard/orders, /dashboard/orders/:orderID, /dashboard/myProducts,
/dashboard/newProduct, /dashboard/editProduct/:id, /dashboard/categories,
/dashboard/newCategorie, /dashboard/editCategorie/:id, /dashboard/users,
/dashboard/users/:id, /dashboard/promo, /dashboard/banners,
/dashboard/deliveryDistricts, /dashboard/screen, /dashboard/settings
```

### Design tokens actuels (thème styled-components + CSS)

```
primary    #E43B15   (rouge-orangé, CTA)        highlight  #F4C616 (jaune)
info       #1662A8   (bleu)                     alert      #E00B19
black      #050305                              formWhite  #F8F5EF (crème)
formGrey   #A0A0A1                              dark red   #7B170F
Police : Nunito (unique). Bootstrap 5 pour la grille et les composants.
```
Ces valeurs sont **plus fiables** que la palette approximative du brief (`#9B2518`, `#F6AD28`…) : elles viennent du code.

### Assets récupérés

| Fichier | Contenu | Note |
|---|---|---|
| `static/media/KeruxLogo.png` (316 Ko) | mascotte poulet dans un cercle rouge/orange bordé jaune, casquette bleue KERUX, pouce levé | logo principal |
| `/pos/logo.png` (**919 Ko**) | favicon | beaucoup trop lourd |
| `logo192.png`, `logo512.png` | icônes PWA | |
| `static/media/ChickenMenu3.jpg` (243 Ko) | photo hero du slider | |
| `/media/produits/*.jpg\|png` | 40 photos produits + 11 photos catégories | servies par l'API |

Copies dans le scratchpad de session (à rapatrier dans `public/brand/` au démarrage).

---

## 2. Contrat API existant (à respecter tel quel)

Base : même origine. Le front résout `REACT_APP_BACKEND_ORIGIN` sinon `window.location.origin` (et `:8000` en dev sur le port 4001). Les URLs `/media/...` sont réécrites vers cette origine.

Headers envoyés : `Accept: application/json`, `Authorization: Bearer <token>` (si connecté), `X-Restaurant-Id: <id>`, `Idempotency-Key: <uuid>` sur la création de commande.

### Catalogue (public, sans auth)

| Méthode | Endpoint | Réponse |
|---|---|---|
| GET | `/api/categories` | tableau `[{id, public_id, restaurant_id, nom, actif, quantity (nb produits), photo_url, img, created_at, updated_at}]` |
| GET | `/api/products?page=&per_page=&category=` | paginateur Laravel `{current_page, data:[Product], last_page, per_page, total, from, to, …}` |
| GET | `/api/products/{id}` | un `Product` |
| GET | `/api/supplements` | `[{id, public_id, restaurant_id, nom, prix_vente:"150.00", actif, categorie_ids:[…]}]` — suppléments **payants** |
| GET | `/api/observations` | `[{id, public_id, restaurant_id, nom, actif, categorie_ids:[…]}]` — options **gratuites** ("S Sauce", "S Onion", "Mayonnaise"… = "sans X" / choix de sauce) |
| GET | `/api/banners` | `{data:[]}` (vide aujourd'hui) |
| GET | `/api/promos` | `{successful, data:[]}` (vide aujourd'hui) |
| GET | `/api/promos/vrf?promo_code=` | vérification d'un code |
| GET | `/api/restaurants` | `{data:[{id, nom, adresse, telephone, horaires}]}` |
| GET | `/api/restaurants/{id}/service-status` | `{restaurant_id, is_open, session_id}` — **ouvert/fermé en temps réel** |
| GET | `/api/districtDelivery` | `[{id, public_id, restaurant_id, district_name, delivery_price}]` |

`Product` (tel que renvoyé) :
```json
{
  "id": 82, "public_id": "f82f5935…", "restaurant_id": 1, "categorie_id": 130,
  "nom": "Beng", "prix_vente": "700.00", "actif": true,
  "description": {"fr": "…", "en": "…", "ar": "…"}, "ingredients": null,
  "photo_url": "https://www.kerux-foods.com:8000/media/produits/….png",
  "categorie": {"id": 130, "nom": "burgers", "actif": true, …},
  // champs INTERNES exposés (voir §3) :
  "prix_achat": "0.00", "stock": -83, "tva": "0.00", "code_barre": "6",
  "photo_source_url": "http://100.118.64.119/api/v1/media/…", "photo_hash": "…"
}
```
Le front normalise : `name = nom`, `price = Number(prix_vente)`, `img = photo_url`, `active = actif`, `description = description[lang] ?? fr ?? en ?? ar`, `sold` (promo/solde).

### Données réelles au 2026-09-14

- **2 restaurants** : `{id:1, nom:"AKID", adresse:"Akid Lotfi, Oran", telephone:"0550 31 93 12", horaires:null}` et `{id:2, nom:"BDL", adresse:"Boulevard des Lions, Oran", telephone:"0670 27 76 80", horaires:null}`. Téléphones vérifiés via l'API ; **horaires absents** (→ TODO, ne pas inventer).
- **11 catégories** : boissons, burgers, dessert, formules, frite, menu enfant, pain maison, pizza, plats, salade, tortillas. Elles portent un `restaurant_id` (catalogue par restaurant).
- **40 produits**, prix 50 → 2 650 DA. Ex. : Beng 700, Bogota 750, Chessy 650, Spicy 750, Kerux 750, Tenders - 3 / - 5 (500 / 700), Wings - 03 / - 05 (300 / 450), Wrap 600, Box Family 2 650, Pizza K - * (490 → 1 400).
  → Le brief liste "Tenders / Wings / Wraps" comme catégories : **ce sont des produits**, pas des catégories. Il y a aussi des **pizzas** et des **tortillas** non mentionnées. Les catégories doivent venir de l'API, pas du brief.
- **~15 quartiers de livraison** (Akid Lotfi, Belgaïd, Bir El Djir, Boulevard des Lions, Canastel, Centre-Ville, El Hamri, Es Sénia, Gambetta, Hai Sabah, Maraval, Médina Jdida…), tous à `delivery_price: 0` actuellement.
- **9 suppléments** payants (150 → 500 DA), **10 observations** gratuites.
- Bannières et promos : vides.

### Auth & compte

| Méthode | Endpoint | Détail |
|---|---|---|
| POST | `/api/auth/login` | body `{email, password}` → `{access_token, user, auth_kind}` ; sert **aux clients et au staff** (`auth_kind` = `client` \| `user`) |
| POST | `/api/client-auth/register` | → `{access_token, auth_kind, user}` |
| GET | `/api/client-auth/me` | profil client (`/api/me` pour le staff) |
| PUT | `/api/users/me/{id}` | mise à jour profil (nom, téléphone, adresse, quartier…) |
| POST | `/api/auth/forgotPassword`, `/api/auth/resetPassword/{token}`, `/api/auth/confirmation` | |
| DELETE | `/api/auth/suppression/{id}` | suppression de compte (page `/delete-account`) |
| POST | `/api/contact` | réclamation / suggestion |

Le profil porte un `profileState` ; l'ancien front **bloque la commande** tant qu'il n'est pas `"complited"` (sic) et **exige la connexion** avant d'ouvrir le checkout.

### Commande

**Création (site web)** — `POST /api/ventes/pending` + header `Idempotency-Key` :
```json
{
  "restaurant_id": 1,
  "source": "website",
  "type_commande": "livraison" | "emporter" | "sur_place",
  "customer_name": "…", "customer_phone": "…",
  "customer_address": "…" | null,
  "delivery_district_id": 34 | null, "delivery_district_name": "…" | null,
  "delivery_fee": 0,
  "comment": "… | Quartier: …" | null,
  "use_score": 0,            // points fidélité utilisés
  "promo_code": "…" | null,
  "details": [
    {"produit_id": 82, "quantite": 2, "supplement_ids": [60], "observation_ids": [69]}
  ]
}
```
→ `201` avec `{order: {public_id, …}}`. Validation serveur (422) : `restaurant_id`, `source`, `type_commande`, `details` requis.

`À VÉRIFIER` : un POST **sans token** renvoie 422 (validation) et non 401 → l'API accepte peut-être la commande invité. À confirmer avec le backend (ne pas tester en prod : cela créerait une vraie commande en cuisine).

**Lecture** :
- `GET /api/client-auth/orders?page=` — historique du client
- `GET /api/client-auth/orders/{public_id}` — détail
- `GET /api/ventes/{id}`, `POST /api/ventes/{id}/approve` — staff

**Statuts (enum backend, ne pas en inventer d'autres)** :
```
en_attente_validation_caissier → en_cours → validee
                              ↘ annulee
```
Timeline affichée : *En attente* → *En cours* → *Terminée* (ou *Annulée*). Terminal si `validee` ou `annulee`.

`Order` (champs lus par le front) : `id, public_id, order_reference|numero_commande|ticket_no, date_vente|created_at, statut, type_commande, customer_name, customer_phone, customer_address, customer_note, delivery_district_name, delivery_fee, total_ttc, total_apres_remise, promo_code_pourcentage, use_score, client{nom, telephone, adresse, quartier}, details[{id, parent_id, is_supplement, is_observation, produit{…}, quantite, prix_unitaire, total_ligne}]`.

**Menu QR (commande à table)** : `GET /api/qr-menu/context?restaurant_id&qr_code_number`, `POST /api/qr-menu/orders`, `GET /api/qr-menu/orders/{publicId}/status?…`.

### Paiement — point critique

**Il n'existe aucun paiement en ligne.** La section "Paiement" de l'ancien checkout contient uniquement : *Utiliser vos Points Bonus* (`use_score`) et *code de réduction* (`promo_code`). Aucun champ `mode_paiement`, aucun prestataire (CIB/SATIM, Edahabia, Chargily…) dans le code. Le paiement se fait **à la livraison / au comptoir**.

Conséquence : le nouveau site affiche "Paiement à la réception" et ne propose **pas** de carte tant que le backend n'expose pas un endpoint de paiement. Le paiement par carte = **projet backend séparé**, à spécifier avec le prestataire choisi.

---

## 3. Problèmes détectés

### Bloquants / sécurité
1. **Certificat TLS expiré** sur `kerux-foods.com:8000` — navigateurs et fetch serveur refusent la connexion. À renouveler avant tout SSR.
2. **L'API publique expose des données internes** : `prix_achat`, `stock` (négatif), `tva`, `code_barre`, `photo_hash`, et surtout `photo_source_url` pointant sur une **IP privée** (`100.118.64.119`, réseau Tailscale). Le front n'utilise aucun de ces champs. → Le backend devrait servir une *resource* client filtrée ; côté front, l'adaptateur ne les propagera jamais.
3. Header `X-Powered-By: PHP/8.4.22` exposé.
4. Token d'auth dans un **cookie lisible en JS** (pas `httpOnly`) → XSS = vol de session.

### SEO / découvrabilité
5. SPA CRA sans SSR : `<html lang="en">`, `<meta description="Web site created using create-react-app">`, titre "Kerux FOOD". Le menu est invisible pour Google.
6. Pas de `sitemap.xml` (404), pas de canonical, pas d'OpenGraph, pas de structured data.
7. Port `:8000` dans l'URL publique → mauvais pour le SEO, le partage et la confiance.

### Performance
8. 877 Ko de JS + 278 Ko de CSS (Bootstrap complet + styled-components + slick) pour afficher un menu.
9. Favicon `logo.png` de **919 Ko** ; logo 316 Ko ; aucune image WebP/AVIF, pas de srcset.
10. Back-office, menu QR et site client dans **le même bundle** : chaque visiteur télécharge du code d'administration.

### UX métier
11. **Connexion obligatoire** + profil "complet" avant de commander → friction maximale au moment clé.
12. Catégories brutes (`frite`, `menu enfant`, minuscules), noms produits opaques (*Beng, Smap, Poni, Ruxy*) sans sous-titre explicatif → la description i18n existe mais n'est pas mise en avant.
13. `horaires: null` sur les deux restaurants ; bannières et promos vides → sections marketing sans contenu.
14. Statut de commande sans temps réel côté client (polling manuel, "rafraîchir").
15. Le nom PWA est "Kerux QR Menu" : le produit a dérivé vers l'usage tablette/QR au détriment du site public.

---

## 4. Ce qu'il faut conserver

- **Le backend et son contrat** intégralement (endpoints, payloads, enum de statuts, header `Idempotency-Key`, `X-Restaurant-Id`).
- La logique métier : catalogue **par restaurant**, suppléments payants + observations gratuites filtrés par `categorie_ids`, quartiers de livraison avec tarif, code promo, points fidélité (`use_score`), statut ouvert/fermé (`service-status`).
- Les trois modes : `livraison`, `emporter`, `sur_place`.
- L'identité : mascotte, rouge `#E43B15`, jaune `#F4C616`, bleu `#1662A8`, crème `#F8F5EF`, slogan "Saveur - Vitalité", réseaux (@keruxfoods).
- Les descriptions trilingues fr/en/ar déjà saisies (fr par défaut).
- Les URLs historiques `/menu`, `/authentication/login`, `/droits` (+ redirections pour les autres).
- Le menu QR et le back-office **restent sur l'ancienne app** (`/pos/…`) dans un premier temps ; hors périmètre de cette refonte.

## 5. Ce qu'il faut refaire

- Tout le frontend public : Next.js App Router, rendu serveur/statique du menu, bundle minimal.
- Le parcours de commande : menu → fiche produit (options) → panier → checkout en étapes → suivi, **sans login obligatoire** si l'API le permet (`À VÉRIFIER`), sinon login/inscription *au moment du checkout* seulement.
- La couche d'accès aux données : adaptateur typé qui traduit les shapes Laravel (`nom`, `prix_vente` string, `actif`, `description{fr,en,ar}`) en types domaine propres et **filtre les champs internes**.
- Auth : token en cookie `httpOnly` posé par une route handler Next (proxy), jamais lisible côté client.
- SEO complet : métadonnées, OG, sitemap, robots, JSON-LD `Restaurant` / `Menu` / `MenuItem`.
- Images : pipeline `next/image` + WebP/AVIF, tailles adaptées, lazy.
- Design system Kerux (tokens, typographie display + corps, boutons, cards) — via Impeccable.

---

## 6. Architecture proposée

```
kerux-web/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                    /            accueil
│   │   │   ├── restaurants/page.tsx        /restaurants
│   │   │   ├── droits/page.tsx             /droits
│   │   │   └── contact/page.tsx            /contact
│   │   ├── (shop)/
│   │   │   ├── menu/page.tsx               /menu?c=burgers   (SSR/ISR, indexable)
│   │   │   ├── menu/[slug]/page.tsx        /menu/beng-f82f5935   fiche produit
│   │   │   ├── cart/page.tsx               /cart
│   │   │   ├── checkout/page.tsx           /checkout
│   │   │   └── order/[publicId]/page.tsx   /order/…   suivi
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx              /login
│   │   │   ├── register/page.tsx           /register
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/[token]/page.tsx
│   │   ├── (account)/account/
│   │   │   ├── page.tsx                    /account   profil
│   │   │   ├── orders/page.tsx             /account/orders
│   │   │   ├── orders/[publicId]/page.tsx
│   │   │   └── delete/page.tsx             /account/delete
│   │   ├── track-order/page.tsx            /track-order   (saisie n° + téléphone)
│   │   ├── api/                            route handlers = proxy vers Laravel
│   │   │   ├── auth/[...]/route.ts         pose/retire le cookie httpOnly
│   │   │   └── orders/route.ts             POST commande (ajoute Idempotency-Key)
│   │   ├── sitemap.ts  robots.ts  manifest.ts
│   │   ├── layout.tsx  not-found.tsx  error.tsx  loading.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/    Header, MobileNav, Footer, CartButton, StickyOrderBar
│   │   ├── home/      Hero, CategoryPills, FeaturedProducts, RestaurantsTeaser, SocialStrip
│   │   ├── menu/      MenuSearch, CategoryNav, ProductGrid, ProductCard, ProductOptions,
│   │   │              SupplementPicker, ObservationPicker, QuantityStepper, UnavailableBadge
│   │   ├── cart/      CartDrawer, CartLine, CartSummary, PromoCodeField, EmptyCart
│   │   ├── checkout/  ServiceTypeStep, RestaurantStep, ContactStep, DeliveryStep,
│   │   │              ReviewStep, PaymentNotice (paiement à la réception)
│   │   ├── order/     OrderTimeline, OrderSummary, OrderLookupForm
│   │   ├── restaurant/RestaurantCard, OpenStatusBadge, HoursTable (TODO data)
│   │   ├── account/   ProfileForm, OrdersList, DeleteAccountForm
│   │   └── ui/        Button, Badge, Card, Input, Select, Sheet, Skeleton, Toast, Price
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts        fetch typé, base URL, X-Restaurant-Id, gestion erreurs
│   │   │   ├── raw.ts           types EXACTS de Laravel (RawProduct, RawOrder…)
│   │   │   ├── adapters.ts      raw → domaine (filtre les champs internes)
│   │   │   ├── catalog.ts       categories, products, supplements, observations
│   │   │   ├── restaurants.ts   restaurants, service-status, districts
│   │   │   ├── orders.ts        create (ventes/pending), get, list
│   │   │   ├── auth.ts          login, register, me, forgot/reset
│   │   │   └── promos.ts        vrf
│   │   ├── auth/      session (cookie httpOnly), guards
│   │   ├── cart/      store (Zustand + persist localStorage), totals, validation
│   │   ├── i18n/      fr par défaut ; ar/en plus tard
│   │   ├── seo/       jsonld.ts (Restaurant, Menu, MenuItem), metadata helpers
│   │   └── utils/     slug.ts, price.ts (DA), phone.ts (format DZ)
│   ├── types/         Product, Category, Restaurant, Cart, Order, OrderStatus, User
│   └── hooks/         useCart, useRestaurant, useServiceStatus, useOrderTracking
├── public/brand/      logo, mascotte, OG image
├── specs/             Spec Kit (constitution, spec, plan, tasks)
├── unspaghettit/      modèle exécutable (état commande, invariants, scénarios)
└── DESIGN.md          produit par Impeccable
```

Stack : **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Zustand** (panier) ; composants maison ; `next/image` ; pas de Bootstrap.

### Redirections de compatibilité (`next.config.ts`)

| Ancienne | Nouvelle |
|---|---|
| `/authentication/login` | `/login` |
| `/authentication/singUp` | `/register` |
| `/authentication/forgotPassword` | `/forgot-password` |
| `/authentication/resetPassword/:token` | `/reset-password/:token` |
| `/myAccount/myProfile` | `/account` |
| `/myAccount/myOrders` | `/account/orders` |
| `/myAccount/myOrders/:id` | `/account/orders/:id` |
| `/myAccount/orderMethod` | `/checkout` |
| `/menu/:id` (numérique) | `/menu/:slug` (lookup par id) |
| `/contact/complaint`, `/contact/suggestion` | `/contact?type=…` |
| `/delete-account` | `/account/delete` |
| `/droits` | conservée telle quelle |
| `/dashboard/*`, `/qr-menu/*` | restent sur l'ancienne app (`/pos/…`) |

### Types domaine (cibles de l'adaptateur)

```ts
type Category  = { id: number; publicId: string; restaurantId: number; slug: string; name: string; imageUrl: string | null; productCount: number; active: boolean };
type Product   = { id: number; publicId: string; slug: string; restaurantId: number; categoryId: number; name: string; price: number; description: I18nText; ingredients: I18nText | null; imageUrl: string | null; available: boolean; onSale: boolean };
type Supplement  = { id: number; name: string; price: number; categoryIds: number[] };
type Observation = { id: number; name: string; categoryIds: number[] };
type Restaurant  = { id: number; code: 'AKID' | 'BDL'; name: string; address: string; phone: string; hours: null /* TODO backend */ };
type ServiceStatus = { restaurantId: number; isOpen: boolean };
type DeliveryDistrict = { id: number; restaurantId: number; name: string; fee: number };
type ServiceType = 'livraison' | 'emporter' | 'sur_place';
type OrderStatus = 'en_attente_validation_caissier' | 'en_cours' | 'validee' | 'annulee';
type CartLine  = { product: Product; quantity: number; supplements: Supplement[]; observations: Observation[] };
type CreateOrderInput = { restaurantId; serviceType; customer: {name; phone}; delivery?: {address; districtId; districtName}; comment?; promoCode?; useScore?; lines: CartLine[] };
```

---

## 7. Modèle métier pour Unspaghettit (à formaliser en spec exécutable)

**État** : `cart{lines, restaurantId}`, `serviceType`, `restaurantOpen`, `district`, `promo`, `order.status`, `session{isLoggedIn, profileComplete}`.

**Actions** : `addToCart`, `changeQuantity`, `removeLine`, `applyPromo`, `chooseServiceType`, `chooseRestaurant`, `chooseDistrict`, `submitOrder`, `cashierApprove`, `cashierCancel`, `complete`.

**Invariants candidats** (à confronter au backend) :
- `submitOrder` interdit si `cart.lines.length === 0`.
- `submitOrder` interdit si `restaurantOpen === false` (service-status).
- `serviceType === 'livraison'` ⇒ `district` choisi ∧ `address` non vide ∧ `district.restaurantId === cart.restaurantId`.
- Toutes les lignes du panier ont le même `restaurantId` (un panier = un restaurant).
- Un supplément/observation n'est sélectionnable que si `product.categoryId ∈ categoryIds`.
- Ajout d'un produit `available === false` interdit.
- `total = Σ(price × qty) + Σ(supplements) + fee(district) − promo%` ; `delivery_fee` envoyé = `district.fee` (aujourd'hui 0).
- Un seul code promo par commande ; `use_score ≤ points du client`.
- Statuts : `en_attente_validation_caissier → en_cours → validee`, `→ annulee` depuis les deux premiers ; **aucune** transition depuis `validee`/`annulee` (terminaux).
- Deux `submitOrder` avec la même `Idempotency-Key` ⇒ une seule commande.

Scénarios Given/When/Then à dériver de la spec fonctionnelle (Spec Kit) puis exécuter dans le simulateur.

---

## 8. Décisions à prendre avant l'implémentation

1. **Commande invité** : l'API accepte-t-elle `POST /api/ventes/pending` sans token ? (422 observé sans auth, pas 401.) Si oui → guest checkout ; sinon → login/inscription au checkout uniquement.
2. **Paiement par carte** : hors périmètre du site tant qu'aucun endpoint backend n'existe. Prévoir l'emplacement dans le checkout (`PaymentStep`) avec uniquement "Paiement à la réception" pour l'instant.
3. **Horaires** : à saisir dans le backend (`restaurants.horaires` existe mais est `null`) ou en config front temporaire marquée TODO.
4. **Certificat + port** : renouveler le TLS et idéalement exposer l'API sur `https://api.kerux-foods.com` (ou `/api` derrière le même domaine que le nouveau site) pour éviter le `:8000`.
5. **Filtrage des champs internes** côté backend (resource client) — recommandé mais le front filtrera de toute façon.
6. **Multi-restaurant** : le catalogue est par `restaurant_id`. L'utilisateur choisit-il le restaurant **avant** de voir le menu (comme l'ancienne app via `X-Restaurant-Id`) ou au checkout ? Recommandation : sélecteur discret dans le header, mémorisé, par défaut le plus proche / le dernier utilisé.
7. **Langues** : fr seul au lancement, ar/en ensuite (les descriptions existent déjà).
