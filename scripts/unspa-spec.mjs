// Generates the Unspaghettit executable spec of the Kerux ordering flow into unspa/kerux-foods/.
// Source of truth for the modelled rules: docs/01-analyse-existant.md §7 + the checkout code.
// Run: node scripts/unspa-spec.mjs   then   unspa check --snapshots unspa --model-check
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";

const id = (key) => createHash("sha1").update(key).digest("hex").slice(0, 8);
const now = "2026-09-15T08:00:00.000Z";

/* ------------------------------------------------------------ expression helpers */
const st = (path) => ({ kind: "state", path });
const pr = (name) => ({ kind: "param", name });
const lit = (value) => ({ kind: "literal", value });
const add = (l, r) => ({ kind: "add", left: l, right: r });
const sub = (l, r) => ({ kind: "sub", left: l, right: r });
const mul = (l, r) => ({ kind: "mul", left: l, right: r });
const div = (l, r) => ({ kind: "div", left: l, right: r });
const min = (l, r) => ({ kind: "min", left: l, right: r });
const max = (l, r) => ({ kind: "max", left: l, right: r });
const sw = (cases, dflt) => ({ kind: "switch", cases, default: dflt });

/* ------------------------------------------------------------ condition helpers */
const c = (left, operator, right) => (right === undefined ? { left, operator } : { left, operator, right });
const all = (...conditions) => ({ kind: "all", conditions });
const any = (...conditions) => ({ kind: "any", conditions });
const not = (condition) => ({ kind: "not", condition });

/* ------------------------------------------------------------ builders */
const set = (key, path, value, description) => ({ id: id(`fx:${key}`), type: "set_state", path, value, description });
const emit = (key, event) => ({ id: id(`ev:${key}`), type: "emit_event", event });
const block = (key, category, condition, reason) => ({
  id: id(`rule:${key}`),
  category,
  condition,
  effect: { id: id(`blk:${key}`), type: "block_action", reason },
  description: reason,
});
const param = (key, name, type, extra = {}) => ({ id: id(`p:${key}:${name}`), name, type, required: true, description: extra.description ?? name, ...extra });
const state = (path, type, defaultValue, description, extra = {}) => ({ id: id(`s:${path}`), path, type, defaultValue, description, ...extra });

const SURF = { menu: id("surf:menu"), checkout: id("surf:checkout"), suivi: id("surf:suivi") };
const ACT = (name) => id(`act:${name}`);
const HOST = {
  statut: "menu", restaurant: "menu", ajouter: "menu", vider: "menu", passer: "menu",
  service: "checkout", quartier: "checkout", coordonnees: "checkout", promo: "checkout", connexion: "checkout", points: "checkout", retour: "checkout", confirmer: "checkout",
  caissier: "suivi", cuisine: "suivi", annuler: "suivi", nouvelle: "suivi",
};

const action = ({ key, name, intent, roles = ["primary"], parameters = [], rules = [], effects = [], events = [], transitions = [], requiredStates = [], scenarios = [] }) => ({
  id: ACT(key),
  name,
  intent,
  roles,
  parameters,
  requiredStates,
  rules,
  invariants: [],
  effects: [...effects, ...events.map((e) => emit(`${key}:${e}`, e)), ...transitions.map((target, i) => ({ id: id(`nav:${key}:${i}`), type: "transition_surface", target }))],
  emittedEvents: events,
  transitions: transitions.map((target, i) => ({ id: id(`tr:${key}:${i}`), target })),
  scenarios,
});

/* ------------------------------------------------------------ reusable steps (for multi-step scenarios) */
const step = (key, overrides = {}, expectedStatus = "success") => ({
  actionId: ACT(key),
  surfaceId: SURF[HOST[key]],
  parameterOverrides: Object.entries(overrides).map(([parameterName, value]) => ({ parameterName, value })),
  expectedStatus,
});
const scenario = (key, name, { steps = [], params = {}, state = {}, expectedStatus = "success", assertions = [], description }) => ({
  id: id(`sc:${key}`),
  name,
  description,
  stateOverrides: Object.entries(state).map(([path, value]) => ({ path, value })),
  parameterOverrides: Object.entries(params).map(([parameterName, value]) => ({ parameterName, value })),
  expectedStatus,
  expectedAssertions: assertions.map(([path, operator, value]) => (value === undefined ? { path, operator } : { path, operator, value })),
  steps,
});

const OPEN = step("statut", { ouvert: true });
const CLOSED = step("statut", { ouvert: false });
const ADD = (quantite = 2, prix = 700) => step("ajouter", { disponible: true, quantite, prix });
const SERVICE = (mode) => step("service", { mode });
const DISTRICT = (quartier = 34, frais = 0) => step("quartier", { quartier: String(quartier), frais });
const CONTACT = (nom = true, telephone = true, adresse = true) => step("coordonnees", { nomRenseigne: nom, telephoneValide: telephone, adresseRenseignee: adresse });
const GOTO_CHECKOUT = step("passer");

/* ------------------------------------------------------------ state (declared on Menu, shared everywhere) */
const shared = [SURF.checkout, SURF.suivi];
const stateDefinitions = [
  state("restaurant.id", "number", 1, "Restaurant choisi dans le header (1 = Akid Lotfi, 2 = Boulevard des Lions).", { sharedWith: shared }),
  state("restaurant.ouvert", "boolean", true, "Statut live du restaurant (GET /api/restaurants/{id}/service-status → is_open).", { sharedWith: shared }),
  state("panier.articles", "number", 0, "Nombre d'articles dans le panier (somme des quantités).", { sharedWith: shared }),
  state("panier.sousTotal", "number", 0, "Sous-total du panier en DA (prix unitaire + suppléments) × quantité.", { sharedWith: shared }),
  state("commande.mode", "enum", "aucun", "type_commande envoyé au backend.", { enumValues: ["aucun", "livraison", "emporter", "sur_place"], sharedWith: shared }),
  state("commande.quartierId", "number", 0, "delivery_district_id (0 = non choisi).", { sharedWith: shared }),
  state("commande.quartierRestaurantId", "number", 0, "Restaurant auquel appartient le quartier choisi.", { sharedWith: shared }),
  state("commande.fraisQuartier", "number", 0, "delivery_price du quartier choisi (DA).", { sharedWith: shared }),
  state("commande.fraisLivraison", "number", 0, "delivery_fee réellement facturé : frais du quartier si livraison, sinon 0.", { sharedWith: shared }),
  state("commande.nomRenseigne", "boolean", false, "customer_name non vide.", { sharedWith: shared }),
  state("commande.telephoneValide", "boolean", false, "customer_phone au format 05/06/07 + 8 chiffres.", { sharedWith: shared }),
  state("commande.adresseRenseignee", "boolean", false, "customer_address renseignée (livraison).", { sharedWith: shared }),
  state("promo.pourcentage", "number", 0, "Réduction du code promo vérifié (GET /api/promos/vrf).", { sharedWith: shared }),
  state("points.disponibles", "number", 0, "Points bonus du client connecté (0 pour un invité).", { sharedWith: shared }),
  state("points.utilises", "number", 0, "use_score envoyé au backend.", { sharedWith: shared }),
  state("ordre.statut", "enum", "aucune", "Enum réel du backend (statut de la vente).", { enumValues: ["aucune", "en_attente_validation_caissier", "en_cours", "validee", "annulee"], sharedWith: shared }),
  state("ordre.total", "number", 0, "total_apres_remise de la dernière commande envoyée (DA).", { sharedWith: shared }),
  state("ordre.articles", "number", 0, "Articles de la dernière commande envoyée.", { sharedWith: shared }),
];

/* ------------------------------------------------------------ derived amounts (as expressions, reused) */
const remise = div(mul(st("panier.sousTotal"), st("promo.pourcentage")), lit(100));
const montantAvantPoints = add(sub(st("panier.sousTotal"), remise), st("commande.fraisLivraison"));

/* ------------------------------------------------------------ Menu surface */
const menuActions = [
  action({
    key: "statut",
    name: "Le restaurant ouvre ou ferme",
    intent: "Le statut live (service-status) change ; le site le rafraîchit toutes les 60 s.",
    roles: ["async"],
    parameters: [param("statut", "ouvert", "boolean", { description: "is_open renvoyé par le backend." })],
    effects: [set("statut", "restaurant.ouvert", pr("ouvert"), "Reflète is_open.")],
    events: ["restaurant.status.changed"],
  }),
  action({
    key: "restaurant",
    name: "Changer de restaurant",
    intent: "Sélecteur du header : le catalogue reste global, mais les quartiers de livraison et la commande suivent le restaurant.",
    parameters: [param("restaurant", "restaurantId", "enum", { enumValues: ["1", "2"], description: "1 = Akid Lotfi, 2 = Boulevard des Lions." })],
    effects: [
      set("restaurant:id", "restaurant.id", sw([{ when: c(pr("restaurantId"), "equals", "2"), then: lit(2) }], lit(1)), "Mémorisé dans le header."),
      set("restaurant:q", "commande.quartierId", 0, "Le quartier choisi n'appartient plus au restaurant : il est réinitialisé."),
      set("restaurant:qr", "commande.quartierRestaurantId", 0),
      set("restaurant:fq", "commande.fraisQuartier", 0),
      set("restaurant:fl", "commande.fraisLivraison", 0),
    ],
    events: ["restaurant.selected"],
  }),
  action({
    key: "ajouter",
    name: "Ajouter au panier",
    intent: "Bouton + d'une carte produit ou fiche produit, avec quantité et suppléments déjà inclus dans le prix unitaire.",
    parameters: [
      param("ajouter", "disponible", "boolean", { description: "actif du produit dans le catalogue." }),
      param("ajouter", "quantite", "number", { validations: [{ type: "integer" }, { type: "min", value: 0 }, { type: "max", value: 3 }], description: "Quantité ajoutée (1 à 50 dans le site)." }),
      param("ajouter", "prix", "number", { validations: [{ type: "min", value: 700 }, { type: "max", value: 700 }], defaultValue: 700, description: "Prix unitaire DA (suppléments inclus) ; fixé à 700 pour l'exploration." }),
    ],
    rules: [
      block("ajouter:indispo", "validation", c(pr("disponible"), "is_false"), "Produit épuisé : impossible de l'ajouter."),
      block("ajouter:qte", "validation", c(pr("quantite"), "lower_or_equal", 0), "La quantité doit être au moins 1."),
      block("ajouter:plafond", "validation", c("panier.articles", "greater_or_equal", 6), "Quantité maximale atteinte (le site plafonne à 50 par ligne ; 6 ici pour garder l'exploration finie)."),
    ],
    effects: [
      set("ajouter:n", "panier.articles", add(st("panier.articles"), pr("quantite"))),
      set("ajouter:t", "panier.sousTotal", add(st("panier.sousTotal"), mul(pr("prix"), pr("quantite")))),
    ],
    events: ["cart.item.added"],
    scenarios: [
      scenario("ajouter:ok", "Ajout de 2 × 700 DA", { params: { disponible: true, quantite: 2, prix: 700 }, assertions: [["panier.articles", "equals", 2], ["panier.sousTotal", "equals", 1400]] }),
      scenario("ajouter:epuise", "Produit épuisé refusé", { params: { disponible: false, quantite: 1, prix: 700 }, expectedStatus: "blocked", assertions: [["panier.articles", "equals", 0]] }),
    ],
  }),
  action({
    key: "vider",
    name: "Vider le panier",
    intent: "Lien « Vider le panier » de la page panier.",
    roles: ["destructive"],
    effects: [set("vider:n", "panier.articles", 0), set("vider:t", "panier.sousTotal", 0), set("vider:p", "promo.pourcentage", 0)],
    events: ["cart.cleared"],
  }),
  action({
    key: "passer",
    name: "Passer commande",
    intent: "Bouton Commander (header, barre mobile, panier) : ouvre le checkout si le panier n'est pas vide.",
    roles: ["entry"],
    rules: [block("passer:vide", "validation", c("panier.articles", "equals", 0), "Votre panier est vide.")],
    transitions: [SURF.checkout],
    scenarios: [
      scenario("passer:vide", "Panier vide : pas de checkout", { expectedStatus: "blocked" }),
      scenario("passer:ok", "Panier rempli : checkout ouvert", { steps: [ADD(1)] }),
    ],
  }),
];

/* ------------------------------------------------------------ Checkout surface */
const checkoutActions = [
  action({
    key: "service",
    name: "Choisir le mode",
    intent: "Étape 1 : Livraison, À emporter ou Sur place.",
    parameters: [param("service", "mode", "enum", { enumValues: ["livraison", "emporter", "sur_place"] })],
    effects: [
      set("service:mode", "commande.mode", pr("mode")),
      set("service:frais", "commande.fraisLivraison", sw([{ when: c(pr("mode"), "equals", "livraison"), then: st("commande.fraisQuartier") }], lit(0)), "Les frais ne s'appliquent qu'en livraison."),
    ],
  }),
  action({
    key: "quartier",
    name: "Choisir le quartier",
    intent: "Étape 3 (livraison) : quartier desservi par le restaurant choisi, avec son tarif.",
    parameters: [
      param("quartier", "quartier", "enum", { enumValues: ["1", "34"], description: "1 = Akid Lotfi (restaurant 1), 34 = Boulevard des Lions (restaurant 1)." }),
      param("quartier", "frais", "number", { validations: [{ type: "min", value: 0 }, { type: "max", value: 200 }], defaultValue: 0, description: "delivery_price du quartier (0 DA aujourd'hui)." }),
    ],
    rules: [block("quartier:mode", "validation", c("commande.mode", "not_equals", "livraison"), "Le quartier n'est demandé qu'en livraison.")],
    effects: [
      set("quartier:id", "commande.quartierId", sw([{ when: c(pr("quartier"), "equals", "34"), then: lit(34) }], lit(1))),
      set("quartier:r", "commande.quartierRestaurantId", st("restaurant.id"), "La liste proposée est filtrée par restaurant."),
      set("quartier:fq", "commande.fraisQuartier", pr("frais")),
      set("quartier:fl", "commande.fraisLivraison", pr("frais")),
    ],
  }),
  action({
    key: "coordonnees",
    name: "Renseigner les coordonnées",
    intent: "Étape 3 : nom, téléphone (05/06/07 + 8 chiffres), adresse si livraison.",
    parameters: [param("coordonnees", "nomRenseigne", "boolean"), param("coordonnees", "telephoneValide", "boolean"), param("coordonnees", "adresseRenseignee", "boolean")],
    effects: [
      set("coord:n", "commande.nomRenseigne", pr("nomRenseigne")),
      set("coord:t", "commande.telephoneValide", pr("telephoneValide")),
      set("coord:a", "commande.adresseRenseignee", pr("adresseRenseignee")),
    ],
  }),
  action({
    key: "promo",
    name: "Appliquer un code promo",
    intent: "Code vérifié par GET /api/promos/vrf ; un seul code par commande, le nouveau remplace l'ancien.",
    parameters: [param("promo", "pourcentage", "number", { validations: [{ type: "min", value: 0 }, { type: "max", value: 100 }], description: "pourcentage renvoyé par le backend (0 = code invalide)." })],
    rules: [block("promo:invalide", "validation", c(pr("pourcentage"), "lower_or_equal", 0), "Ce code n'est pas valide.")],
    effects: [set("promo:p", "promo.pourcentage", pr("pourcentage"))],
    events: ["promo.applied"],
  }),
  action({
    key: "connexion",
    name: "Se connecter",
    intent: "Connexion pendant le checkout : le profil pré-remplit les champs et expose les points bonus.",
    roles: ["entry"],
    parameters: [param("connexion", "points", "number", { validations: [{ type: "integer" }, { type: "min", value: 0 }, { type: "max", value: 500 }], description: "Points bonus du compte." })],
    effects: [
      set("connexion:pts", "points.disponibles", pr("points")),
      set("connexion:used", "points.utilises", min(st("points.utilises"), pr("points")), "Les points utilisés sont recalculés à partir du compte courant (jamais plus que disponibles)."),
    ],
  }),
  action({
    key: "points",
    name: "Utiliser mes points bonus",
    intent: "Case à cocher du récapitulatif ; plafonnée aux points disponibles et au montant restant.",
    parameters: [param("points", "utiliser", "boolean")],
    rules: [block("points:aucun", "validation", all(c(pr("utiliser"), "is_true"), c("points.disponibles", "equals", 0)), "Aucun point bonus disponible.")],
    effects: [set("points:u", "points.utilises", sw([{ when: c(pr("utiliser"), "is_true"), then: min(st("points.disponibles"), montantAvantPoints) }], lit(0)))],
  }),
  action({
    key: "retour",
    name: "Retour au menu",
    intent: "Lien Panier / Retour : on peut toujours revenir compléter le panier.",
    transitions: [SURF.menu],
  }),
  action({
    key: "confirmer",
    name: "Confirmer la commande",
    intent: "POST /api/ventes/pending avec Idempotency-Key ; paiement à la réception, aucun paiement en ligne.",
    roles: ["primary", "persistence"],
    rules: [
      block("confirmer:vide", "validation", c("panier.articles", "equals", 0), "Votre panier est vide."),
      block("confirmer:ferme", "business", c("restaurant.ouvert", "is_false"), "Le restaurant est fermé pour le moment."),
      block("confirmer:mode", "validation", c("commande.mode", "equals", "aucun"), "Choisissez livraison, à emporter ou sur place."),
      block("confirmer:nom", "validation", c("commande.nomRenseigne", "is_false"), "Indiquez votre nom pour la commande."),
      block("confirmer:tel", "validation", c("commande.telephoneValide", "is_false"), "Numéro attendu : 05, 06 ou 07 suivi de 8 chiffres."),
      block("confirmer:quartier", "validation", all(c("commande.mode", "equals", "livraison"), c("commande.quartierId", "equals", 0)), "Choisissez votre quartier pour la livraison."),
      block("confirmer:adresse", "validation", all(c("commande.mode", "equals", "livraison"), c("commande.adresseRenseignee", "is_false")), "Indiquez une adresse précise."),
      block("confirmer:mauvais-resto", "business", all(c("commande.mode", "equals", "livraison"), c("commande.quartierRestaurantId", "not_equals", st("restaurant.id"))), "Ce quartier n'est pas livré par le restaurant choisi."),
    ],
    effects: [
      set("confirmer:statut", "ordre.statut", "en_attente_validation_caissier", "Le backend crée la vente en attente de validation caissier."),
      set("confirmer:total", "ordre.total", max(lit(0), sub(montantAvantPoints, st("points.utilises"))), "sous-total − remise + frais − points, jamais négatif."),
      set("confirmer:art", "ordre.articles", st("panier.articles")),
      set("confirmer:vide-n", "panier.articles", 0, "Le panier est vidé après envoi."),
      set("confirmer:vide-t", "panier.sousTotal", 0),
      set("confirmer:promo", "promo.pourcentage", 0),
      set("confirmer:pts", "points.utilises", 0),
    ],
    events: ["order.submitted"],
    transitions: [SURF.suivi],
    scenarios: [
      scenario("ok:livraison", "Livraison complète : 2 × 700 DA, quartier livré, coordonnées OK", {
        steps: [OPEN, ADD(2), GOTO_CHECKOUT, SERVICE("livraison"), DISTRICT(34, 0), CONTACT()],
        assertions: [["ordre.statut", "equals", "en_attente_validation_caissier"], ["ordre.total", "equals", 1400], ["ordre.articles", "equals", 2], ["panier.articles", "equals", 0]],
      }),
      scenario("ok:emporter", "À emporter : ni quartier ni adresse requis", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false)],
        assertions: [["ordre.statut", "equals", "en_attente_validation_caissier"], ["ordre.total", "equals", 700], ["commande.fraisLivraison", "equals", 0]],
      }),
      scenario("ko:ferme", "Restaurant fermé : la commande n'est pas envoyée", {
        steps: [CLOSED, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT()],
        expectedStatus: "blocked",
        assertions: [["ordre.statut", "equals", "aucune"], ["panier.articles", "equals", 1]],
      }),
      scenario("ko:vide", "Panier vide : rien à envoyer", {
        steps: [OPEN, SERVICE("emporter"), CONTACT()],
        expectedStatus: "blocked",
      }),
      scenario("ko:quartier", "Livraison sans quartier", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("livraison"), CONTACT()],
        expectedStatus: "blocked",
      }),
      scenario("ko:telephone", "Téléphone invalide", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("sur_place"), CONTACT(true, false, false)],
        expectedStatus: "blocked",
      }),
      scenario("ko:changement-resto", "Changer de restaurant après le quartier : le quartier est réinitialisé", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("livraison"), DISTRICT(34, 0), CONTACT(), step("retour"), step("restaurant", { restaurantId: "2" }), GOTO_CHECKOUT],
        expectedStatus: "blocked",
        assertions: [["commande.quartierId", "equals", 0], ["ordre.statut", "equals", "aucune"]],
      }),
      scenario("ok:promo-points", "Promo 10 % puis 500 points : 1400 − 140 − 500 = 760 DA", {
        steps: [OPEN, ADD(2), GOTO_CHECKOUT, SERVICE("sur_place"), CONTACT(true, true, false), step("promo", { pourcentage: 10 }), step("connexion", { points: 500 }), step("points", { utiliser: true })],
        assertions: [["ordre.total", "equals", 760]],
      }),
      scenario("ok:frais", "Livraison avec frais de quartier : 700 + 200 = 900 DA", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("livraison"), DISTRICT(1, 200), CONTACT()],
        assertions: [["ordre.total", "equals", 900], ["commande.fraisLivraison", "equals", 200]],
      }),
      scenario("ok:frais-annules", "Frais de quartier annulés si on repasse en emporter", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("livraison"), DISTRICT(1, 200), SERVICE("emporter"), CONTACT(true, true, false)],
        assertions: [["ordre.total", "equals", 700], ["commande.fraisLivraison", "equals", 0]],
      }),
      scenario("ko:double-clic", "Double clic : la seconde confirmation trouve un panier vide et ne renvoie rien", {
        description: "Le site vide le panier dès que le backend a répondu 201 ; un second envoi de la même tentative n'a plus rien à envoyer. La requête elle-même porte une Idempotency-Key.",
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false), step("confirmer")],
        expectedStatus: "blocked",
        assertions: [["ordre.statut", "equals", "en_attente_validation_caissier"], ["ordre.articles", "equals", 1]],
      }),
      scenario("ok:deuxieme-commande", "Une nouvelle commande peut être passée pendant que la première est en attente", {
        description: "Décision produit : un client peut recommander (nouvelle tentative, nouvelle clé) sans attendre la validation de la première.",
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false), step("confirmer"), step("retour"), ADD(2), GOTO_CHECKOUT],
        assertions: [["ordre.statut", "equals", "en_attente_validation_caissier"], ["ordre.articles", "equals", 2], ["panier.articles", "equals", 0]],
      }),
    ],
  }),
];

/* ------------------------------------------------------------ Suivi surface (cashier / kitchen / customer) */
const suiviActions = [
  action({
    key: "caissier",
    name: "Le caissier valide",
    intent: "POST /api/ventes/{id}/approve : en_attente_validation_caissier → en_cours.",
    roles: ["async"],
    rules: [block("caissier:etat", "business", c("ordre.statut", "not_equals", "en_attente_validation_caissier"), "Seule une commande en attente peut être validée.")],
    effects: [set("caissier:s", "ordre.statut", "en_cours")],
    events: ["order.approved"],
  }),
  action({
    key: "cuisine",
    name: "La cuisine termine",
    intent: "en_cours → validee (statut terminal).",
    roles: ["async"],
    rules: [block("cuisine:etat", "business", c("ordre.statut", "not_equals", "en_cours"), "Seule une commande en cours peut être terminée.")],
    effects: [set("cuisine:s", "ordre.statut", "validee")],
    events: ["order.completed"],
  }),
  action({
    key: "annuler",
    name: "Annuler la commande",
    intent: "Annulation par le restaurant : possible en attente ou en cours, jamais après validee.",
    roles: ["destructive"],
    rules: [block("annuler:etat", "business", not(any(c("ordre.statut", "equals", "en_attente_validation_caissier"), c("ordre.statut", "equals", "en_cours"))), "Une commande terminée ou déjà annulée ne peut pas être annulée.")],
    effects: [set("annuler:s", "ordre.statut", "annulee")],
    events: ["order.cancelled"],
    scenarios: [
      scenario("annuler:en-cours", "Annulation pendant la préparation", {
        state: { "ordre.statut": "en_cours", "ordre.articles": 1, "ordre.total": 700 },
        assertions: [["ordre.statut", "equals", "annulee"]],
      }),
      scenario("annuler:terminee", "Impossible d'annuler une commande terminée", {
        state: { "ordre.statut": "validee", "ordre.articles": 1, "ordre.total": 700 },
        expectedStatus: "blocked",
        assertions: [["ordre.statut", "equals", "validee"]],
      }),
    ],
  }),
  action({
    key: "nouvelle",
    name: "Nouvelle commande",
    intent: "Une fois la commande terminée ou annulée, le client peut recommander (retour au menu).",
    roles: ["entry"],
    rules: [block("nouvelle:etat", "business", not(any(c("ordre.statut", "equals", "validee"), c("ordre.statut", "equals", "annulee"))), "Attendez la fin de la commande en cours.")],
    effects: [set("nouvelle:s", "ordre.statut", "aucune"), set("nouvelle:t", "ordre.total", 0), set("nouvelle:a", "ordre.articles", 0)],
    transitions: [SURF.menu],
    scenarios: [
      scenario("nouvelle:apres-validee", "Cycle complet : commande → caissier → cuisine → nouvelle commande", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false), step("confirmer"), step("caissier"), step("cuisine")],
        assertions: [["ordre.statut", "equals", "aucune"], ["ordre.articles", "equals", 0], ["panier.articles", "equals", 0]],
      }),
      scenario("nouvelle:apres-annulee", "Cycle annulé : commande → annulation → nouvelle commande", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false), step("confirmer"), step("annuler")],
        assertions: [["ordre.statut", "equals", "aucune"]],
      }),
      scenario("nouvelle:chemin-model-check", "Chemin signalé par le model checker (livraison + points) : on peut bien recommander ensuite", {
        steps: [OPEN, ADD(1), ADD(1), SERVICE("livraison"), DISTRICT(1, 200), CONTACT(), step("connexion", { points: 500 }), step("points", { utiliser: true }), step("confirmer"), step("caissier"), step("cuisine")],
        assertions: [["ordre.statut", "equals", "aucune"]],
      }),
      scenario("nouvelle:trop-tot", "Impossible tant que la commande est en attente", {
        steps: [OPEN, ADD(1), GOTO_CHECKOUT, SERVICE("emporter"), CONTACT(true, true, false), step("confirmer")],
        expectedStatus: "blocked",
        assertions: [["ordre.statut", "equals", "en_attente_validation_caissier"]],
      }),
    ],
  }),
];

/* ------------------------------------------------------------ feature */
const NAV = { menu: ["checkout"], checkout: ["menu", "suivi"], suivi: ["menu"] };
const surface = (idKey, name, description, actions, stateDefs = []) => ({
  id: SURF[idKey],
  name,
  type: "screen",
  description,
  stateDefinitions: stateDefs,
  actions,
  rules: [],
  invariants: [],
  transitions: NAV[idKey].map((t) => ({ id: id(`snav:${idKey}:${t}`), target: SURF[t], label: `→ ${t}` })),
});

const invariant = (key, name, condition, message) => ({ id: id(`inv:${key}`), name, condition, message });

const feature = {
  id: id("feature:commande-kerux"),
  name: "Commande Kerux",
  description:
    "Parcours de commande du site Kerux Foods (menu → checkout → suivi) modélisé sur le contrat réel du backend Laravel : POST /api/ventes/pending, enum de statuts en_attente_validation_caissier → en_cours → validee | annulee, quartiers par restaurant, statut ouvert/fermé live, code promo, points bonus. Aucun paiement en ligne n'existe : il n'est donc pas modélisé.",
  tags: [
    { type: "domain", value: "restaurant" },
    { type: "kind", value: "ordering" },
  ],
  surfaces: [
    surface("menu", "Menu & panier", "Catalogue, sélecteur de restaurant, panier persistant.", menuActions, stateDefinitions),
    surface("checkout", "Checkout", "Mode, restaurant, coordonnées, récapitulatif, confirmation.", checkoutActions),
    surface("suivi", "Suivi de commande", "Timeline sur l'enum réel du backend ; actions caissier / cuisine.", suiviActions),
  ],
  personas: [
    { id: id("persona:invite"), name: "Client invité", description: "Commande sans compte : aucun point bonus.", stateOverrides: [{ path: "points.disponibles", value: 0 }], parameterOverrides: [] },
    { id: id("persona:fidele"), name: "Client fidèle connecté", description: "Compte avec 500 points bonus.", stateOverrides: [{ path: "points.disponibles", value: 500 }], parameterOverrides: [], persistAcrossSurfaces: true },
  ],
  resources: [],
  entities: [],
  dependencies: [
    {
      id: id("dep:backend"),
      name: "Backend Laravel Kerux",
      kind: "service",
      description: "https://www.kerux-foods.com:8000 — catalogue, statut live, création de vente, suivi.",
      operations: [
        { id: id("op:create"), name: "POST /api/ventes/pending", description: "Crée la vente ; Idempotency-Key obligatoire côté site.", timeoutMs: 20000, retries: 0, idempotent: true, failureModes: ["timeout", "422 validation", "401 non authentifié", "503 injoignable"] },
        { id: id("op:status"), name: "GET /api/restaurants/{id}/service-status", description: "is_open du restaurant, rafraîchi toutes les 60 s.", timeoutMs: 6000, retries: 0, idempotent: true, failureModes: ["timeout"] },
      ],
    },
  ],
  events: [
    { id: id("evd:restaurant.status.changed"), name: "restaurant.status.changed", description: "Le statut live du restaurant a changé." },
    { id: id("evd:restaurant.selected"), name: "restaurant.selected", description: "Le client a changé de restaurant dans le header." },
    { id: id("evd:cart.item.added"), name: "cart.item.added", description: "Un produit a été ajouté au panier (stamp sur le bouton panier)." },
    { id: id("evd:cart.cleared"), name: "cart.cleared", description: "Le panier a été vidé." },
    { id: id("evd:promo.applied"), name: "promo.applied", description: "Un code promo valide a été appliqué." },
    { id: id("evd:order.submitted"), name: "order.submitted", description: "La commande a été créée côté backend." },
    { id: id("evd:order.approved"), name: "order.approved", description: "Le caissier a validé la commande." },
    { id: id("evd:order.completed"), name: "order.completed", description: "La commande est terminée." },
    { id: id("evd:order.cancelled"), name: "order.cancelled", description: "La commande a été annulée." },
  ],
  featureInvariants: [
    invariant("panier-positif", "Panier jamais négatif", all(c("panier.articles", "greater_or_equal", 0), c("panier.sousTotal", "greater_or_equal", 0)), "Le nombre d'articles et le sous-total ne peuvent pas être négatifs."),
    invariant("panier-coherent", "Panier vide ⇔ sous-total nul", any(all(c("panier.articles", "equals", 0), c("panier.sousTotal", "equals", 0)), all(c("panier.articles", "greater_than", 0), c("panier.sousTotal", "greater_than", 0))), "Un panier sans article n'a pas de montant, et inversement."),
    invariant("frais-hors-livraison", "Frais de livraison nuls hors livraison", any(c("commande.mode", "equals", "livraison"), c("commande.fraisLivraison", "equals", 0)), "delivery_fee doit être 0 pour emporter et sur place."),
    invariant("quartier-du-restaurant", "Le quartier appartient au restaurant choisi", any(c("commande.quartierId", "equals", 0), c("commande.quartierRestaurantId", "equals", st("restaurant.id"))), "Un quartier choisi doit être livré par le restaurant sélectionné dans le header."),
    invariant("points-plafonnes", "Points utilisés ≤ points disponibles", c("points.utilises", "lower_or_equal", st("points.disponibles")), "use_score ne peut pas dépasser les points du client."),
    invariant("total-positif", "Total de commande jamais négatif", c("ordre.total", "greater_or_equal", 0), "Promo + points ne peuvent pas rendre le total négatif."),
    invariant("promo-bornee", "Pourcentage promo entre 0 et 100", all(c("promo.pourcentage", "greater_or_equal", 0), c("promo.pourcentage", "lower_or_equal", 100)), "Un code promo est un pourcentage."),
    invariant("commande-non-vide", "Une commande envoyée contient des articles", any(c("ordre.statut", "equals", "aucune"), c("ordre.articles", "greater_than", 0)), "Le backend ne doit jamais recevoir une vente sans details."),
  ],
  reachabilityGoals: [
    { id: id("goal:validee"), name: "Une commande peut aboutir", kind: "reachable", condition: c("ordre.statut", "equals", "validee"), message: "Il existe un chemin menu → checkout → confirmation → validation → terminée." },
    { id: id("goal:recommander"), name: "On peut toujours recommander", kind: "always_reachable", condition: c("ordre.statut", "equals", "aucune"), message: "Depuis n'importe quel état, le client finit par pouvoir repasser une commande (pas de blocage définitif)." },
  ],
  acceptanceCriteria: [
    { id: id("ac:1"), title: "Commande invité", given: "un visiteur sans compte avec un panier non vide et un restaurant ouvert", when: "il renseigne nom + téléphone valide et confirme", then: "la commande est envoyée sans connexion (repli sur la connexion uniquement si le backend répond 401)" },
    { id: id("ac:2"), title: "Restaurant fermé", given: "le statut live du restaurant est fermé", when: "le client tente de confirmer", then: "la confirmation est refusée et le panier conservé" },
    { id: id("ac:3"), title: "Livraison cohérente", given: "le client a choisi un quartier puis change de restaurant", when: "il revient au checkout", then: "le quartier est réinitialisé et la livraison bloquée tant qu'un quartier du nouveau restaurant n'est pas choisi" },
  ],
  nonGoals: ["Paiement en ligne (inexistant côté backend)", "Menu QR / commande à table", "Back-office caissier"],
  createdAt: now,
  updatedAt: now,
};

const project = {
  format: "unspaghettit-project",
  version: 1,
  project: {
    id: id("project:kerux"),
    name: "Kerux Foods",
    description: "Site public de commande de Kerux Foods (Oran) — spécification exécutable du parcours de commande, alignée sur le backend Laravel existant.",
    featureIds: [feature.id],
    tags: [{ type: "domain", value: "restaurant" }],
    createdAt: now,
    updatedAt: now,
  },
};

mkdirSync("unspa/kerux-foods", { recursive: true });
writeFileSync("unspa/kerux-foods/kerux-foods.project.json", JSON.stringify(project, null, 2) + "\n");
writeFileSync("unspa/kerux-foods/commande-kerux.feature.json", JSON.stringify({ format: "unspaghettit", version: 1, feature }, null, 2) + "\n");
console.log(`feature ${feature.id} — ${feature.surfaces.reduce((n, s) => n + s.actions.length, 0)} actions, ${feature.surfaces.reduce((n, s) => n + s.actions.reduce((m, a) => m + (a.scenarios?.length ?? 0), 0), 0)} scenarios, ${feature.featureInvariants.length} invariants`);
