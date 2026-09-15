---
name: Kerux Foods
description: Oran fast-food storefront signage, modernised — sign lettering, stamped prices, awning stripes, a live neon OUVERT pill.
colors:
  cream: "#f8f5ef"
  cream-200: "#efe9de"
  white: "#ffffff"
  ink: "#050305"
  ink-800: "#1a1917"
  ink-600: "#5a5651"
  ink-500: "#6b6660"
  line: "#e0ddd8"
  line-strong: "#c9c4bb"
  red: "#e43b15"
  red-600: "#c22f0e"
  red-800: "#7b170f"
  red-100: "#fde6df"
  yellow: "#f4c616"
  yellow-600: "#d9ad00"
  yellow-100: "#fff5d0"
  blue: "#1662a8"
  blue-700: "#0f4c85"
  blue-100: "#e1edf8"
  alert: "#e00b19"
  green: "#1a8a48"
  green-100: "#dcf3e4"
typography:
  display:
    fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif"
    fontSize: "56px / 72px / 88px (mobile / sm / lg)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.01em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif"
    fontSize: "36px / 48px (mobile / sm)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
    textTransform: "uppercase"
  title:
    fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
    textTransform: "uppercase"
  price:
    fontFamily: "Anton, 'Arial Narrow', Impact, sans-serif"
    fontSize: "21.6px (1.35rem); 16px small; 30–36px large"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  body:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "15px / 16px / 18px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'ss01', 'cv11'"
  label:
    fontFamily: "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "11.5px (0.72rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.12em"
    textTransform: "uppercase"
rounded:
  chip: "8px"
  stamp: "10px"
  control: "12px"
  card: "14px"
  panel: "16px"
  sheet: "24px"
  sign: "28px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
  band: "48px"
  band-lg: "64px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.red-600}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.cream}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.ink-800}"
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "52px"
  button-yellow-hover:
    backgroundColor: "{colors.yellow-600}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.cream-200}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  input-disabled:
    backgroundColor: "{colors.cream-200}"
  board:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  price-stamp:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.stamp}"
    padding: "0.2em 0.6em 0.15em"
    typography: "{typography.price}"
  chip-category:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-category-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  sticker-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chip}"
    padding: "3.5px 8.8px"
    typography: "{typography.label}"
  sticker-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.chip}"
  sticker-red:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
    rounded: "{rounded.chip}"
  neon-open:
    backgroundColor: "{colors.green-100}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "4.8px 12px 4.8px 9.6px"
    typography: "{typography.label}"
  neon-closed:
    backgroundColor: "{colors.red-100}"
    textColor: "{colors.red-600}"
    rounded: "{rounded.pill}"
  neon-unknown:
    backgroundColor: "{colors.cream-200}"
    textColor: "{colors.ink-500}"
    rounded: "{rounded.pill}"
---

# Design System: Kerux Foods

## Overview

**Creative North Star: "The Oran Storefront, Modernised"**

The site is the shop front you walk up to on an Oran boulevard: a painted sign in condensed capitals, a yellow price tag stamped by hand, a red-and-cream awning between the courses, and a small neon pill by the door that is genuinely wired to the kitchen's open/closed status. Everything sits on a warm cream ground with white sign-boards, so the food photography (served live from the backend, always on a dark plate) is the loudest thing on the page. Red is reserved for action; yellow for price and shelf tags; cap-blue for links, focus and the selected restaurant.

Density is high but orderly: product cards are one strictly uniform unit (5:4 photo, name, two-line description, straight price stamp, round add button) repeated in a 2/3/4-column grid, with one wider "end-cap" board per category on the menu. Pages are paced as horizontal bands (cream, red, cream, black) separated by a single 10 px awning stripe. The system refuses the delivery-app feed (white cards in a grey app shell with a floating basket), the corporate hero, SaaS chrome, glassmorphism and purple/blue gradients.

**Key Characteristics:**
- Cream ground, white boards with a 1 px line rule and a soft offset drop shadow; ink 2 px rules on the hero and product-page sign-boards only.
- Anton in uppercase for every heading and every price; Manrope for everything else. Two faces, never a third.
- Yellow price stamp with a hard ink offset shadow: the one sign-painter drop shadow in the system.
- Red/cream awning stripe as the only section divider, on cream, red and black grounds alike.
- Live neon status pill (green OUVERT / red FERMÉ) with a soft glow, in the header on every viewport.
- One authored motion: add-to-cart "stamps" the header basket (220 ms) and the count ticks in.
- French UI; short, food-first copy from the approved brand lines.

## Colors

The palette is the brand's own six colours plus a warm neutral ramp; nothing is tinted grey, and the accents are rationed by role rather than spread.

### Primary
- **Kerux Red** (`{colors.red}`): primary buttons (Commander, add-to-cart), the awning stripe, the "Votre Kerux" services band, the cart count badge, the required-field asterisk, the caret. Hover state darkens to **Red Deep** (`{colors.red-600}`). **Sign Maroon** (`{colors.red-800}`) is the KERUX wordmark on light grounds and the text colour of error notices. **Red Wash** (`{colors.red-100}`) is the FERMÉ neon fill and the error-notice fill.

### Secondary
- **Tag Yellow** (`{colors.yellow}`): the price stamp, the "Épuisé" sticker, the yellow CTA on the red band, headings and links on the red band and in the black footer, the wordmark on dark grounds, text selection. Hover darkens to **Yellow Deep** (`{colors.yellow-600}`). **Yellow Wash** (`{colors.yellow-100}`) marks the selected service-type card at checkout and the TODO highlights on the rights page.

### Tertiary
- **Cap Blue** (`{colors.blue}`): links, focus outline (3 px), input focus border and ring, checkbox accent, the selected restaurant's border, info-toast icon. **Blue Wash** (`{colors.blue-100}`) fills a checked option row. **Blue Deep** (`{colors.blue-700}`) is defined for pressed links and rarely appears.
- **Open Green** (`{colors.green}`) / **Green Wash** (`{colors.green-100}`): the OUVERT neon, completed order steps, the "free delivery" figure, the success toast border.
- **Alert Red** (`{colors.alert}`): form error text, invalid input border, cancelled order step, error toast border. Distinct from Kerux Red on purpose: alert is never a button.

### Neutral
- **Cream** (`{colors.cream}`): page and header ground, secondary-button hover, quiet info panels at checkout.
- **Cream Deep** (`{colors.cream-200}`): skeletons, ghost-button hover, disabled inputs, the unknown-status neon, the radial photo ground behind cut-out product PNGs.
- **Paper White** (`{colors.white}`): boards, cards, inputs, pills, sheet panels, sticker outline.
- **Ink** (`{colors.ink}`): body text, hard rules (2 px borders on stamp, hero board, stepper and add buttons), the footer and sticky order bar ground, active category chip. **Ink 800** (`{colors.ink-800}`) is the long-form reading colour and ink-button hover; **Ink 600** (`{colors.ink-600}`) is secondary body copy; **Ink 500** (`{colors.ink-500}`) is hints, placeholders, breadcrumbs and disabled step labels.
- **Line** (`{colors.line}`) / **Line Strong** (`{colors.line-strong}`): the 1 px board rule, dividers, sheet header/footer rules (Line); input and select borders, inactive category chips, thin scrollbars (Line Strong).

### Named Rules
**The Red-For-Action Rule.** Red appears on the primary button, the awning stripe, the price-carrying red band and the cart badge; it never becomes a page background outside the one services band, and never a text colour for body copy.

**The Yellow-Means-Price Rule.** Yellow fills the price stamp and the shelf sticker; on dark or red grounds it is the heading colour. It is not a button colour on cream (the one yellow button lives on the red band).

**The Blue-Is-Never-Decorative Rule.** Cap blue signals interactivity or selection only: links, focus, checked, chosen restaurant. No blue gradients, no blue panels.

## Typography

**Display Font:** Anton (with Arial Narrow, Impact, sans-serif) — loaded via next/font as `--font-anton`, weight 400 only.
**Body Font:** Manrope (with system-ui, Segoe UI, sans-serif) — loaded via next/font as `--font-manrope`; features `ss01`, `cv11`; weights 400 / 600 / 700 / 800 in use.

**Character:** Condensed uppercase sign lettering against a round, legible sans. Anton is set tight (line-height 0.92–1, tracking 0.01–0.02 em) and always uppercase, so it reads as painted signage rather than a headline face; Manrope carries every sentence and label at 15–18 px with generous line-height. Prices are always display type with tabular numerals and a small "DA".

### Hierarchy
- **Display** (Anton 400, 56 px mobile / 72 px ≥ 640 / 88 px ≥ 1024, line-height 0.92, uppercase): the hero H1 only ("Le poulet comme vous l'aimez."), with the second clause in red.
- **Headline** (Anton 400, 36 px / 48 px, line-height 0.95, uppercase): section titles ("Nos incontournables", "Le menu", "Nos restaurants") and page H1s; the red band and product-page H1 step up to 48 / 60 px; the checkout step title sits at 30 / 36 px; the end-cap card name at 48 px ≥ 768.
- **Title** (Anton 400, 24 px, line-height 1, tracking 0.02 em, uppercase; `display-tight`): product-card names, sheet titles, the featured product name on the hero, social-link names, rights-page H2s, the cart "Total" figure at 30 px; 20 px for fieldset legends, order-timeline steps, footer column titles and the sticky-bar total.
- **Price** (Anton 400, 21.6 px default / 16 px small / 30–36 px large, tabular): the stamp only; "DA" at 0.62 em with 0.06 em tracking.
- **Body** (Manrope 400, 15 px controls and lists / 16 px prose / 18–20 px lead paragraphs, line-height ~1.5): descriptions, hero sub-line, section sub-lines in Ink 600; long-form text on the rights page at 15 px `leading-relaxed` in Ink 800, max width `prose` (65 ch).
- **Label** (Manrope 800, 11.5 px, tracking 0.12 em, uppercase): the neon status pill; stickers at 11.2 px / 0.10 em; checkout step labels at 12 px / `tracking-wider`. Buttons and chips use Manrope 800 at 14–16 px with `tracking-wide`, sentence case.

### Named Rules
**The Two-Face Rule.** Anton for headings, prices and quantities; Manrope for everything that is read. No third family, no Anton below 20 px, no Manrope heading.

**The Sign-Case Rule.** Anton is always uppercase. Anything set in Anton that arrives in sentence case is a bug, not a variant.

## Layout

One container at 1280 px max (`max-w-7xl`) with 16 / 24 / 32 px gutters at mobile / ≥ 640 / ≥ 1024. Breakpoints follow Tailwind: sm 640, md 768, lg 1024, xl 1280. Target phones are 375–430 px; screenshots were taken at 390 px.

**Bands.** Pages are stacked horizontal bands: hero (py 40 / 56 / 80 px), category rail, cream sections (py 24 or 56 px), the red services band (py 48 / 64 px), the black footer (py 48 px, margin-top 64 px). A 10 px awning stripe (28 px red / 28 px cream repeat) opens and closes the red band, opens the footer, and separates the hero group from "Nos incontournables". It is the only divider between bands; inside bands, 1 px Line rules separate rows.

**Header.** Sticky, 68 px tall (76 px ≥ 1024), cream ground with a 1 px Line bottom rule. Order: mascot disc (44 px) + KERUX wordmark, primary nav (≥ 1024 only), restaurant selector pill + neon status, account button (≥ 640), cart button, red Commander (≥ 1024), hamburger (< 1024). On phones (< 640) the wordmark is hidden so the compact selector (max 120 px) and the small neon chip fit on one line.

**Grids.** Product grids are 2 columns on phones, 3 at ≥ 768, 4 at ≥ 1280, gap 12 px (16 px ≥ 640). On the menu page the first product of any category with three or more products spans the full row as an end-cap (photo left, copy right at ≥ 768). Restaurant cards are 1 / 2 columns. The product page is a 1.1fr / 1fr split at ≥ 1024; checkout is 1fr / 380 px; auth pages are 440 px / 1fr with the brand aside hidden below 1024; the rights page is 220 px sticky summary / prose.

**Mobile primary action.** Below 1024 the main content carries 96 px bottom padding for the sticky order bar (56 px tall, 12 px side inset, safe-area bottom padding), which shows the live cart total and Commander. It is hidden on cart, checkout, order, auth and account routes, and on the menu when the cart is empty.

**Rhythm.** Component gaps run 8 / 12 / 16 / 24 px; board padding is 16 px on cards, 20–24 px on checkout sections, 24–32 px on auth and long-form boards, 28 px on the end-cap copy. Sheets: 20 px horizontal, 16 px vertical, header and footer separated by Line rules; bottom sheet on phones (max 92 dvh, 24 px top radius), right drawer of 440 / 520 px ≥ 640.

## Elevation & Depth

Hybrid: white boards on the cream ground carry a 1 px Line rule plus a soft, downward offset shadow; the price stamp alone carries a hard ink offset; neon pills glow. Depth is otherwise tonal (cream → white → ink) and by rule weight (1 px Line → 2 px Ink).

### Shadow Vocabulary
- **Board** (`box-shadow: 0 10px 24px -14px rgb(5 3 5 / 0.35), 0 2px 6px -2px rgb(5 3 5 / 0.08)`): every `.board` at rest — product cards, restaurant cards, checkout sections, auth boards, empty states.
- **Board Lifted** (`box-shadow: 0 24px 48px -24px rgb(5 3 5 / 0.45), 0 4px 12px -6px rgb(5 3 5 / 0.12)`): the hero sign-board, product-card hover (with a 2 px lift), sheets, toasts, the sticky order bar.
- **Stamp** (`box-shadow: 2px 3px 0 #050305` rotated; `1px 2px 0 #050305` when straight on cards): the yellow price tag. The single hard offset shadow.
- **Primary Button Glow** (`box-shadow: 0 6px 16px -8px rgb(228 59 21 / 0.7)`): the red button only.
- **Neon Open** (`box-shadow: 0 0 0 3px rgb(26 138 72 / 0.18), 0 0 14px rgb(26 138 72 / 0.55)`) / **Neon Closed** (`0 0 0 3px rgb(228 59 21 / 0.18), 0 0 14px rgb(228 59 21 / 0.55)`): the status pill; its dot adds `0 0 8px currentColor`. Unknown status has no glow.
- **Sticker Outline** (`box-shadow: 0 0 0 2px #ffffff`): the white cut-line around shelf stickers.

### Named Rules
**The One Hard Shadow Rule.** Only the price stamp has a hard, opaque offset shadow. Boards, buttons and sheets use the soft Board shadows; nothing else gets a 0-blur offset.

**The Rule-Then-Shadow Rule.** A board is a 1 px Line rule first and a shadow second; a shadow on an unbordered white panel is not a board. Hero and product-page boards, the price stamp, category chips at rest, stepper and add buttons upgrade to a 2 px Ink rule.

## Shapes

Rounded but not soft: radii step from 8 px (stickers) through 10 px (stamp), 12 px (buttons, inputs, option rows), 14 px (boards and cards), 16 px (toasts, sticky bar, service-type cards), 24 px (bottom-sheet top) to 28 px (hero and product-page sign-boards, the auth aside). Full pills (999 px) are for the category rail, the restaurant selector, the neon status, nav links and every round icon button (40–44 px, 2 px Ink rule on cart / add / stepper; 1 px Line on the sheet close).

Borders do structural work: 1 px Line on boards, dividers and inputs; 1 px Line Strong on selects and inactive chips; 2 px Ink on the hero board, product-page board, stamp, secondary button, round icon buttons, active chips and checked radio cards. The price stamp is the one rotated element (−2°, straight on cards); the mascot disc peeks over the hero board at +6° and over the auth aside. Product photos are clipped by their board with `object-cover` at 5:4 (square on the product page below 640); cut-out PNGs sit on the radial `photo-ground` when rendered with `contain`.

## Components

Tactile and confident: everything you can press has a visible edge (ink rule or filled ground), a 150 ms colour transition and a 2 % press-down.

### Buttons
- **Shape:** rounded rectangle (12 px), Manrope 800 with `tracking-wide`, height 36 / 44 / 52 px for sm / md / lg with 14 / 20 / 28 px horizontal padding, 8 px icon gap.
- **Primary:** Kerux Red on white text with the Primary Button Glow; hover Red Deep; used for Commander, add / "Ajouter · total", "Commander ici".
- **Secondary:** white with a 2 px Ink rule, Ink text; hover Cream. "Voir le menu", "Tout le menu", "Itinéraire".
- **Ink:** Ink ground, white text; hover Ink 800.
- **Yellow:** Tag Yellow ground, Ink text; hover Yellow Deep; used on the red band only.
- **Ghost:** transparent; hover Cream Deep.
- **States:** `active:scale-[0.98]`; disabled at 50 % opacity with pointer events off; loading swaps in a spinning 16 px icon; focus-visible is the global 3 px Cap Blue outline offset 2 px.

### Chips (category rail)
- **Style:** pill, 2 px rule, Manrope 800 14 px, `capitalize`, padding 8 × 16 px; horizontal rail with hidden scrollbar and a 16 px bleed on phones. Items come straight from the API, prefixed by "Tous".
- **State:** inactive = white with Line Strong rule, hover Ink rule; active = Ink ground, white text, Ink rule. Links carry `aria-current="page"`; tab mode uses `role="tab"`.

### Cards / Containers (Board)
- **Corner Style:** 14 px; 28 px for the hero and product-page sign-boards.
- **Background:** Paper White on Cream; the auth aside is the one red board.
- **Shadow Strategy:** Board at rest, Board Lifted on hover (product cards translate up 2 px over 200 ms).
- **Border:** 1 px Line; 2 px Ink on the hero/product boards; 2 px Cap Blue on the selected restaurant card.
- **Internal Padding:** 16 px (cards), 20–24 px (sections), 24–32 px (auth, prose), 28 px (end-cap copy).
- **Product card:** photo 5:4 with `group-hover` zoom 1.04, stickers stacked top-left (12 px inset), Anton 24 px name (whole card is the link), two-line Ink 600 description, straight price stamp and a 44 px round red add button with a 2 px Ink rule; when the product is already in the cart the button turns Ink and shows the quantity in Anton; unavailable products stay in the grid at 90 % opacity with the photo desaturated 60 %, a yellow "Épuisé" sticker and the add button disabled (Cream Deep ground, Line rule).
- **End-cap:** the same card spanning the full row (categories with three or more products, menu page only), photo left at ≥ 768 (min 300 px tall), copy centred right with the name at 48 px and the large stamp.

### Inputs / Fields
- **Style:** white, 1 px Line Strong rule, 12 px radius, 48 px tall, 16 px side padding, Manrope 15 px, placeholder Ink 500. Textareas 96 px min with 12 px vertical padding. Selects get an inline ink chevron at right 14 px. Labels are Manrope 700 14 px with a red asterisk when required; hints Ink 500 14 px.
- **Focus:** Cap Blue border plus a 3 px Cap Blue ring at 25 % opacity (outline suppressed).
- **Error / Disabled:** `aria-invalid` turns the rule Alert Red and the message (`role="alert"`) Alert Red 600-weight; disabled fills Cream Deep. Form-level errors sit in a Red Wash panel with an Alert rule and Sign Maroon text.
- **Option rows / radio cards:** checkbox rows are 12 px-radius white panels with a Line rule that turn Blue Wash with a Cap Blue rule when checked; large choice cards (service type, restaurant) are 16 px radius with a 2 px rule that turns Ink and fills Yellow Wash when selected.

### Navigation
- **Header links** (≥ 1024): Manrope 700 15 px pills, hover Cream Deep ground and red text. Below 1024 they move into a drawer opened by the hamburger.
- **Restaurant selector:** a white pill select with a red map-pin, Line Strong rule, 40 px tall (36 px compact), Manrope 700 14 px (12 px compact), paired with the neon status.
- **Cart button:** 44 px round, white with a 2 px Ink rule; a red count badge (Anton, 24 px min, 2 px cream ring) sits top-right. Adding to cart replays the stamp animation on the button and ticks the badge in.
- **Footer:** Ink ground under an awning stripe; wordmark and slogan in Tag Yellow, columns headed by Anton 20 px yellow titles, links white at 85 % with yellow hover, socials with handles at 60 % white.
- **Breadcrumb / steps:** Manrope 600 14 px in Ink 500 with red hover; the checkout stepper is 28 px round numbers (Ink when current, Open Green with a check when done, Line Strong when pending) joined by 2 px rules.

### Price Stamp (signature)
Tag Yellow pill with a 2 px Ink rule, 10 px radius, Anton with tabular numerals, "DA" at 0.62 em, rotated −2° with the 2 px 3 px hard ink shadow on the hero and product page; straight with a 1 px 2 px shadow on cards; small (16 px, 8 px radius) in lists and large (30–36 px) on the hero, product page and end-cap. Always a real price from the API.

### Neon Status (signature)
A pill with a 1 px `currentColor` rule, a glowing 8.8 px dot and an 11.5 px uppercase label: green "Ouvert", red "Fermé", grey "Statut…" while loading. `role="status"` with `aria-live="polite"`; compact padding in the phone header. It is bound to the selected restaurant's live `is_open`; never rendered from a constant.

### Sticker (shelf tag)
8 px radius, 11.2 px uppercase Manrope 800, 2 px white outline: yellow "Épuisé", red "Nouveau", ink "Promo". Stacked top-left on the photo; never more than one visible per product in practice (Épuisé wins).

### Awning
A 10 px repeating stripe (28 px red / 28 px cream). Used full-width between bands; on the red band and black footer only the cream dashes read. Also runs along the top edge of the hero sign-board and the auth aside. Purely decorative (`aria-hidden`).

### Sheet / Drawer
Bottom sheet on phones (24 px top radius, 92 dvh max) and a 440 / 520 px right drawer at ≥ 640; white, Board Lifted, rising in over 320 ms; backdrop Ink at 45 %. Header with an Anton 24 px title and a 40 px round close button; footer on white with a Line rule and safe-area padding. Focus is trapped and restored; Escape and backdrop close.

### Toast
16 px radius white panel, Board Lifted, 14 px Manrope 600, coloured 1 px rule and icon per tone (green success, alert error, blue info), optional blue underlined action, ticks in over 260 ms. Top-centred on phones, bottom-right on desktop.

### Motion
One authored moment: adding to cart replays `stamp` on the header basket (scale 1.18 → 1, rotate −3° → 0, 220 ms, ease-out-expo) while the count badge plays `tick` (6 px rise + fade, 260 ms). Sheets, the sticky order bar and toasts `rise` in (12 px + fade, 320 ms). Everything else is a 150–200 ms colour or transform transition; product photos zoom 4 % over 300 ms on card hover. Only transform and opacity animate. `prefers-reduced-motion: reduce` collapses every animation and transition to 0.01 ms and disables smooth scroll.

### Voice and accessibility (durable constraints)
French UI with `lang="fr"`; headings and CTAs reuse the approved brand lines ("Une envie de Kerux ?", "À vous de choisir.", "Nos incontournables", "Commandez. Savourez.", "Votre Kerux, où vous voulez.", "Le poulet comme vous l'aimez."); "Paiement à la réception" is stated plainly. Skip link to `#contenu`; global 3 px Cap Blue focus outline; icon-only buttons carry `aria-label`; product photos carry the product name as alt; the mascot fallback is decorative (`alt=""`, 30 % grey). Quantity output and status pills are live regions; tap targets are 44 px (36 px minimum for compact controls).

## Do's and Don'ts

### Do:
- **Do** set every heading and price in Anton uppercase and every sentence in Manrope; keep the H1 at 56 / 72 / 88 px.
- **Do** build panels as `.board`: white, 1 px Line rule, 14 px radius, the soft Board shadow; upgrade to a 2 px Ink rule and 28 px radius only for the hero and product-page sign-boards.
- **Do** show prices only as the yellow stamp with a hard ink shadow (2 px 3 px rotated, 1 px 2 px straight), sourced from the API.
- **Do** separate page bands with the 10 px red/cream awning stripe and nothing else.
- **Do** keep red for primary buttons, the awning, the services band and the cart badge; use Cap Blue for links, focus, checked and the selected restaurant.
- **Do** keep unavailable products in the grid with the yellow "Épuisé" sticker and a disabled add button.
- **Do** keep the product card strictly uniform (5:4 photo, 24 px Anton name, two-line description, straight stamp, 44 px round add button) and make the end-cap the same card spanning the row.
- **Do** honour `prefers-reduced-motion`, animate transform and opacity only, and keep transitions at 150–320 ms with ease-out-expo.

### Don't:
- **Don't** introduce a third typeface, a Manrope heading, or Anton in sentence case.
- **Don't** put a hard offset shadow on anything but the price stamp, or a shadow on a panel without its 1 px rule.
- **Don't** use blue or purple gradients, glassmorphism, grey app-shell backgrounds, or a floating basket over the content; the basket lives in the header and the phone-only sticky order bar.
- **Don't** paint red as a page ground outside the single services band, and don't use Alert Red for buttons.
- **Don't** invent prices, popularity ranks, opening hours, reviews or figures; render the neon status from a constant.
- **Don't** hide the mascot wordmark on tablets or desktop; below 640 px only, the disc stands alone.
