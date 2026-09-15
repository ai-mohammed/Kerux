# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Zustand — the brief recommends this stack when none is imposed; nothing is imposed (the old site is a create-react-app SPA being replaced, not extended). The user deploys the build themselves (target unspecified; the app must run as a standard `next build` / `next start` on any Node host).

## Users

Primary: people in Oran, Algeria, mostly on a phone, hungry now, who want to find a Kerux chicken product and order it for delivery, pickup ("emporter") or dine-in ("sur place") in the fewest taps. Many already know the brand from Instagram/TikTok (@keruxfoods) or from eating at one of the two restaurants.

Secondary: returning customers checking an order's status, reordering, or editing their profile (phone, delivery address, district). Kitchen/cashier staff use a separate back-office (`/dashboard/*` on the legacy app) that is out of scope.

## Product Purpose

The public website of Kerux Foods, a chicken-centric fast-food with two locations in Oran (Akid Lotfi and Boulevard des Lions). Two jobs: (A) present Kerux, its products and restaurants; (B) let a visitor find a product and order it. Success = a visitor lands, understands what Kerux is within seconds, reaches the menu in one tap, builds a cart and submits an order without friction — especially on a 375–430 px phone. The old site was a SPA invisible to search engines and required an account before ordering; the new one must be indexable and let ordering start without an account.

## Positioning

Kerux is Oran's own chicken fast-food: a local two-restaurant brand with a recognisable mascot (white rooster in a blue KERUX cap, thumbs-up), a real menu of chicken burgers, tenders, wings, wraps, "Pizza K" and family boxes priced in dinars, and its own delivery to named Oran districts. Slogan: "Saveur - Vitalité". A chain template could not truthfully claim the local identity, the mascot, or district-level delivery.

## Operating Context

- Visitors arrive from social links (Linktree, Instagram bio, TikTok), Google, or the printed QR menu in-restaurant.
- Orders are prepared in-restaurant; a cashier validates each web order (`en_attente_validation_caissier` → `en_cours` → `validee`, or `annulee`). The customer is reached by phone; the phone number is the key contact field.
- Payment happens on delivery or at the counter. **There is no online payment**; the backend exposes only loyalty points (`use_score`) and promo codes at checkout.
- Each restaurant has its own catalogue (`restaurant_id`), its own delivery districts with a per-district fee (all 0 DA today), and a live open/closed status.
- Language: French first; product descriptions also exist in Arabic and English in the backend.

## Capabilities and Constraints

Backend (Laravel, existing, consumed as-is — full contract in `docs/01-analyse-existant.md`):
- Public catalogue: categories, paginated products (`nom`, `prix_vente` string, `actif`, `description {fr,en,ar}`, `photo_url`), paid supplements and free "observations" (sauce / "sans X") filtered by `categorie_ids`.
- Restaurants (name, address, phone; `horaires` null), delivery districts, service status (`is_open`).
- Orders: `POST /api/ventes/pending` with `Idempotency-Key`; `type_commande ∈ {livraison, emporter, sur_place}`; detail via `/api/client-auth/orders/{public_id}` (authenticated).
- Auth: `POST /api/auth/login` (email + password → Bearer token), `POST /api/client-auth/register`, forgot/reset password, profile update, account deletion.
- Guest ordering: **undecided at the API level** (422 rather than 401 without a token). Decided behaviour: order as guest first; if the API answers 401, redirect to login keeping the cart.
- Not available, must not be invented: online/card payment, opening hours, customer reviews, marketing figures, banners and promos (both empty today).

Frontend constraints from the brief: mobile-first (375/390/430/768/1024/1440), SSR/static menu indexable without JS, sitemap/robots/canonical/OpenGraph/JSON-LD (Restaurant, Menu, MenuItem), WebP/AVIF images, small bundles, no secrets in the client, cart survives refresh, legacy routes `/menu`, `/authentication/login`, `/droits` kept (others redirected). Restaurant selection lives in the header and is remembered (user decision). Local dev talks to the real API through the Next server, with a real-data fixture fallback (user decision).

Terminology (French UI): Commander, Voir le menu, Nos restaurants, Suivre ma commande, Panier, Livraison / Emporter / Sur place, Supplément, quartier, DA.

## Brand Commitments

- Name: KERUX / Kerux Foods. Slogan: "Saveur - Vitalité".
- Mascot logo (binding): white rooster, blue cap reading KERUX, blue outfit, red comb, yellow beak, thumbs-up, inside a red/orange disc with a yellow rim; wordmark KERUX in yellow/orange with dark-red outline. Captured from the live site: mascot disc PNG, PWA icons.
- Identity colours (binding, from the live code): red `#E43B15`, yellow `#F4C616`, blue `#1662A8`, alert `#E00B19`, dark red `#7B170F`, near-black `#050305`, cream `#F8F5EF`. Red is for CTAs and key elements, not the whole surface; plenty of white/cream so food photography leads.
- Voice: short, young but not childish, food-first. Approved lines: "Une envie de Kerux ?", "À vous de choisir.", "Nos incontournables", "Commandez. Savourez.", "Votre Kerux, où vous voulez.", "Le poulet comme vous l'aimez." No AI-sounding marketing paragraphs, no lorem ipsum, no fake reviews or figures.
- Type direction pinned by the brief: one strong display face for big titles (Archivo Black / Bowlby One / Anton cited as examples) and one very legible body face; do not multiply fonts.
- Socials: Instagram @keruxfoods, TikTok @keruxfoods, Facebook "Kerux Foods" (profile id 61564410204577), Linktree keruxfoods.
- Explicitly banned: SaaS look, purple/blue gradients, glassmorphism, big slow animations, corporate hero.

## Evidence on Hand

- Live API data (captured 2026-09-14): 2 restaurants with real phone numbers (AKID `0550 31 93 12`, BDL `0670 27 76 80`), 11 categories, 40 products with real prices (50–2 650 DA) and photos at `/media/produits/*`, 9 supplements, 10 observations, ~15 delivery districts.
- Brand assets captured from the live site: mascot logo PNG, PWA icons, one hero photo (`ChickenMenu3.jpg`).
- Absent (do not fabricate): opening hours, legal notice / privacy policy text (template with TODO markers), testimonials, order volumes, restaurant interior photos, a card payment provider.

## Product Principles

1. Order in the fewest taps: "Commander" is reachable from every screen, thumb-friendly on mobile; the cart is never more than one tap away.
2. Food first: photography and product names lead; chrome recedes. Red is an accent for action, not wallpaper.
3. Never lie to the customer: real prices, real availability (product `actif`, restaurant open/closed), real statuses from the backend, "paiement à la réception" stated plainly.
4. Truthful to the backend contract: adapt shapes in one layer, never fork the API or invent endpoints; internal fields (`prix_achat`, `stock`, internal URLs) never reach the browser.
5. Indexable and fast: the public menu renders on the server, images are optimised, JS stays small.

## Accessibility & Inclusion

Brief-mandated: WCAG-level contrast, keyboard navigation with visible focus, `aria-label` on icon buttons, alt text on product images, real `<button>` elements, labelled forms. French UI with `lang="fr"`; Arabic descriptions exist in data (RTL is a later phase).
