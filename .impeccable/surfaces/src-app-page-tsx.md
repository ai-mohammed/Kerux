---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/menu/page.tsx","src/app/checkout/page.tsx"]
---

# Surface brief — public site (home, menu, product, cart, checkout, order tracking)

Scope: the whole public ordering site (Persuade on `/`, `/restaurants`; Operate on `/menu`, `/menu/[slug]`, `/cart`, `/checkout`, `/order/[id]`, account; Read on `/droits`).

Audience: a hungry person in Oran on a phone. Job: find a Kerux product, order it for delivery / pickup / dine-in. Action: "Commander". Proof: real photos, real prices in DA, the two real restaurants with real phone numbers, the live open/closed status.

Constraints: brief-pinned palette (red `#E43B15` for action, yellow `#F4C616`, blue `#1662A8`, cream `#F8F5EF`, near-black), photos lead, one display face + one body face, no online payment (say "paiement à la réception"), no invented hours/reviews/figures, mobile-first, indexable menu.

## Direction contract

THESIS: The Oran fast-food storefront, modernised — the site is the shop front you walk up to: a neon OUVERT pill that is really wired to the restaurant's live status, sign-lettering headlines, stamped price tags, awning stripes between courses. It refuses the delivery-app feed (white cards in a grey app shell with a floating basket) and the corporate hero.

OWN-WORLD: Cream `#F8F5EF` ground with pure white cards; red `#E43B15` only on primary actions, the awning stripe and price stamps; yellow `#F4C616` for shelf-tag badges ("Populaire", "Épuisé"); blue `#1662A8` as the cap-blue secondary (links, selected states). Display: Anton (condensed sign lettering) in uppercase for H1/H2 and prices; body: Manrope. Components: 14 px radius white boards with a 1 px line rule and a soft offset drop shadow (sign-board, not glass; the hero board and product-page board carry a 2 px ink rule); price stamp = yellow pill rotated −2° with a 2/3 px hard ink shadow, the one sign-painter drop-shadow on the page; section dividers = one 10 px red/cream awning stripe (on the red band and the black footer only the cream dashes read); neon status pill with a soft red or green glow; sticker badges with white outline. No gradients, no blur.

STORY: "This is Kerux, Oran's chicken place; it's open right now; here is what people order; tap and it's yours." The visitor believes the food is real (photos, prices) and the shop is live (status), and taps Commander.

FIRST VIEWPORT (mobile 390 / desktop 1440): Sticky header: mascot disc + KERUX wordmark, restaurant selector (AKID / BDL) with the live neon OUVERT/FERMÉ pill, cart button with count, red Commander button (desktop) / bottom sticky order bar (mobile). Hero: left (desktop) or top (mobile) — sign-lettering H1 "LE POULET COMME VOUS L'AIMEZ." at 88/56 px, sub-line, red Commander + outlined Voir le menu; right/below — the food photo cropped in a large rounded sign-board with a rotated yellow price tag of a real product (name + price from the API) and the mascot disc peeking at the corner. Directly beneath: the category pills row (from the API) scrolling horizontally, then "Nos incontournables" grid.

FORM: Grounded candidate 5 of 7 (1 Instagram food-reel grid, 2 backlit combo board, 3 bucket/wrapper packaging print, 4 mascot sticker sheet, 5 storefront signage, 6 kitchen ticket, 7 club-kit scoreboard). Seed key 705eff8f. Raises: honest absence (VHS wall) → unavailable products keep their card with a yellow "Épuisé" tag, never hidden; ruler of identical units (VU bridge) → product cards strictly uniform, one photo ratio, one type scale; end-cap hero + lid-open detail (toy shelf) → one featured product per category row, product options open as a bottom sheet on mobile; next change visible before it sounds (algorave) → the sticky order bar shows the live cart total before checkout; courses (clay tower) → page paced in horizontal bands separated by awning stripes; type as matter (alphabet storm) → the H1 at monumental scale. Signature interaction: add-to-cart = the price tag "stamps" onto the cart button (scale 1.15 → 1, 180 ms) and the count ticks; motion grammar: 150–200 ms ease-out, transform/opacity only, respects prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved

- Guest ordering accepted by the API? (try guest, fall back to login on 401)
- Opening hours: not in the backend → "Horaires : à confirmer" until provided.
