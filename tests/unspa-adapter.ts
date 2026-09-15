/**
 * Adapter between the executable spec (unspa/kerux-foods/commande-kerux.feature.json)
 * and the real site code. Every spec action is replayed through the same
 * functions the React checkout and the route handlers use:
 *   - cart: the Zustand store (`useCartStore`) and its totals
 *   - checkout: `validateContact` / `submitBlocker` / `deliveryFeeFor` (src/lib/checkout/rules.ts)
 *   - order payload: `toCreateOrderPayload` (src/lib/api/orders.ts)
 * The cashier / kitchen transitions live in the Laravel backend; they are
 * replayed here from the documented enum (docs/01-analyse-existant.md) so the
 * spec's status machine is checked against the contract the site relies on.
 */
import type { DeliveryDistrict, OrderStatus, Product, ServiceType } from "@/types";
import { cartCount, cartSubtotal, cartTotals, useCartStore } from "@/lib/cart/store";
import { deliveryFeeFor, resolveDistrict, submitBlocker } from "@/lib/checkout/rules";
import { toCreateOrderPayload } from "@/lib/api/orders";
import { toDistrict } from "@/lib/api/adapters";
import { isValidPhone } from "@/lib/utils/format";
import type { RawDistrict } from "@/lib/api/raw";
import rawDistricts from "@/lib/api/fixtures/districts.json";

export type Status = "success" | "blocked";
export type Params = Record<string, unknown>;

const FIXTURE_DISTRICTS: DeliveryDistrict[] = (rawDistricts as RawDistrict[]).map(toDistrict);

const product = (price: number, available = true): Product => ({
  id: 82,
  publicId: "f82f5935",
  slug: "beng-f82f5935",
  restaurantId: 1,
  categoryId: 130,
  categoryName: "burgers",
  name: "Beng",
  price,
  description: "",
  descriptionI18n: null,
  ingredients: "",
  imageUrl: null,
  available,
  onSale: false,
  isNew: false,
});

type AdapterState = {
  restaurantId: number;
  isOpen: boolean;
  serviceType: ServiceType | null;
  districtId: string;
  /** Fee override supplied by the spec (the fixtures all carry 0 DA today). */
  districtFee: number;
  name: string;
  phone: string;
  address: string;
  points: number;
  usePoints: boolean;
  order: { status: OrderStatus | "aucune"; total: number; articles: number };
  /** Exploration bound mirrored from the spec (the site caps a line at 50; the spec at 6 to stay finite). */
  cartCap: number;
};

const initial = (): AdapterState => ({
  restaurantId: 1,
  isOpen: true,
  serviceType: null,
  districtId: "",
  districtFee: 0,
  name: "",
  phone: "",
  address: "",
  points: 0,
  usePoints: false,
  order: { status: "aucune", total: 0, articles: 0 },
  cartCap: 6,
});

export class KeruxAdapter {
  state = initial();

  reset() {
    this.state = initial();
    useCartStore.getState().clear();
  }

  /** Scenario `stateOverrides` — only the paths the spec authors use. */
  override(path: string, value: unknown) {
    const s = this.state;
    switch (path) {
      case "ordre.statut": s.order.status = value as OrderStatus; return;
      case "ordre.articles": s.order.articles = Number(value); return;
      case "ordre.total": s.order.total = Number(value); return;
      case "points.disponibles": s.points = Number(value); return;
      case "restaurant.ouvert": s.isOpen = Boolean(value); return;
      case "restaurant.id": s.restaurantId = Number(value); return;
      default: throw new Error(`stateOverride non supporté par l'adaptateur : ${path}`);
    }
  }

  private districts(): DeliveryDistrict[] {
    // The checkout only offers the districts of the selected restaurant; the spec's fee parameter overrides the fixture's 0 DA.
    return FIXTURE_DISTRICTS.filter((d) => d.restaurantId === this.state.restaurantId).map((d) => (String(d.id) === this.state.districtId ? { ...d, fee: this.state.districtFee } : d));
  }

  private district(): DeliveryDistrict | null {
    return resolveDistrict({ districtId: this.state.districtId, districts: this.districts() });
  }

  private totals() {
    const { lines, promo } = useCartStore.getState();
    const fee = deliveryFeeFor(this.state.serviceType, this.district());
    const before = cartTotals(lines, promo, fee);
    const usedPoints = this.state.usePoints ? Math.min(this.state.points, before.total) : 0;
    return cartTotals(lines, promo, fee, usedPoints);
  }

  /** The spec's state shape, derived from the real stores — nothing is stored twice. */
  snapshot() {
    const { lines, promo } = useCartStore.getState();
    const s = this.state;
    const d = this.district();
    const t = this.totals();
    return {
      restaurant: { id: s.restaurantId, ouvert: s.isOpen },
      panier: { articles: cartCount(lines), sousTotal: cartSubtotal(lines) },
      commande: {
        mode: s.serviceType ?? "aucun",
        quartierId: d?.id ?? 0,
        quartierRestaurantId: d?.restaurantId ?? 0,
        fraisQuartier: d?.fee ?? 0,
        fraisLivraison: t.deliveryFee,
        nomRenseigne: s.name.trim().length > 0,
        telephoneValide: isValidPhone(s.phone),
        adresseRenseignee: s.address.trim().length > 0,
      },
      promo: { pourcentage: promo?.percent ?? 0 },
      points: { disponibles: s.points, utilises: t.usedPoints },
      ordre: { statut: s.order.status, total: s.order.total, articles: s.order.articles },
    };
  }

  invoke(actionName: string, p: Params): Status {
    const s = this.state;
    const cart = useCartStore.getState();
    switch (actionName) {
      case "Le restaurant ouvre ou ferme":
        s.isOpen = Boolean(p.ouvert);
        return "success";
      case "Changer de restaurant":
        s.restaurantId = Number(p.restaurantId);
        return "success";
      case "Ajouter au panier": {
        const quantity = Number(p.quantite);
        if (!p.disponible) return "blocked"; // useAddToCart refuses unavailable products
        if (quantity <= 0) return "blocked"; // the stepper never goes below 1
        if (cartCount(cart.lines) >= s.cartCap) return "blocked"; // spec exploration bound
        cart.add(product(Number(p.prix)), { quantity });
        return "success";
      }
      case "Vider le panier":
        cart.clear();
        return "success";
      case "Passer commande":
        return cart.lines.length ? "success" : "blocked"; // CheckoutFlow shows the empty state instead of the steps
      case "Choisir le mode":
        s.serviceType = p.mode as ServiceType;
        return "success";
      case "Choisir le quartier":
        if (s.serviceType !== "livraison") return "blocked"; // the field only exists in delivery
        s.districtId = String(p.quartier);
        s.districtFee = Number(p.frais);
        return "success";
      case "Renseigner les coordonnées":
        s.name = p.nomRenseigne ? "Test Kerux" : "";
        s.phone = p.telephoneValide ? "05 61 38 42 24" : "123";
        s.address = p.adresseRenseignee ? "12 rue des Lions, bât. B" : "";
        return "success";
      case "Appliquer un code promo": {
        const percent = Number(p.pourcentage);
        if (percent <= 0) return "blocked"; // /api/promos/verify answers 404 → field error, nothing applied
        cart.setPromo({ code: "SPEC", percent });
        return "success";
      }
      case "Se connecter":
        s.points = Number(p.points);
        return "success";
      case "Utiliser mes points bonus":
        if (p.utiliser && s.points === 0) return "blocked"; // the toggle is not rendered without points
        s.usePoints = Boolean(p.utiliser);
        return "success";
      case "Retour au menu":
        return "success";
      case "Confirmer la commande": {
        const blocker = submitBlocker({
          lines: cart.lines,
          isOpen: s.isOpen,
          serviceType: s.serviceType,
          name: s.name,
          phone: s.phone,
          districtId: s.districtId,
          address: s.address,
          districts: this.districts(),
          alreadySubmitted: false,
        });
        if (blocker) return "blocked";
        const d = this.district();
        const t = this.totals();
        // The exact payload the route handler sends to POST /api/ventes/pending.
        const payload = toCreateOrderPayload({
          restaurantId: s.restaurantId,
          serviceType: s.serviceType!,
          customer: { name: s.name, phone: s.phone },
          delivery: s.serviceType === "livraison" && d ? { address: s.address, districtId: d.id, districtName: d.name, fee: d.fee } : null,
          promoCode: cart.promo?.code ?? null,
          usePoints: t.usedPoints,
          lines: cart.lines,
          idempotencyKey: "00000000-0000-4000-8000-000000000000",
        });
        if (payload.details.length === 0) throw new Error("payload sans details");
        if (payload.type_commande !== s.serviceType) throw new Error("type_commande incohérent");
        s.order = { status: "en_attente_validation_caissier", total: t.total, articles: cartCount(cart.lines) };
        s.usePoints = false;
        cart.clear(); // the site empties the cart (and its promo) after a successful submit
        return "success";
      }
      // ---- backend status machine (documented contract) ----
      case "Le caissier valide":
        if (s.order.status !== "en_attente_validation_caissier") return "blocked";
        s.order.status = "en_cours";
        return "success";
      case "La cuisine termine":
        if (s.order.status !== "en_cours") return "blocked";
        s.order.status = "validee";
        return "success";
      case "Annuler la commande":
        if (s.order.status !== "en_attente_validation_caissier" && s.order.status !== "en_cours") return "blocked";
        s.order.status = "annulee";
        return "success";
      case "Nouvelle commande":
        if (s.order.status !== "validee" && s.order.status !== "annulee") return "blocked";
        s.order = { status: "aucune", total: 0, articles: 0 };
        return "success";
      default:
        throw new Error(`Action inconnue de l'adaptateur : ${actionName}`);
    }
  }
}
