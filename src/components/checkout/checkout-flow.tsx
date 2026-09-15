"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Check, ChevronLeft, ShoppingBag, Store, UtensilsCrossed } from "lucide-react";
import type { DeliveryDistrict, Order, Restaurant, ServiceType } from "@/types";
import { SERVICE_TYPE_LABEL } from "@/types";
import { cartTotals, useCartStore } from "@/lib/cart/store";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { rememberOrder } from "@/lib/orders/recent";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { formatDA, normalizePhone } from "@/lib/utils/format";
import { deliveryFeeFor, resolveDistrict, validateContact } from "@/lib/checkout/rules";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/use-user";
import { useServiceStatus } from "@/hooks/use-service-status";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { EmptyState, NeonStatus, Skeleton } from "@/components/ui/bits";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { CartSummary } from "@/components/cart/cart-summary";
import { PromoCodeField } from "@/components/cart/promo-code-field";
import { lineTotal } from "@/lib/cart/store";

type Props = { restaurants: Restaurant[]; districts: DeliveryDistrict[] };
type Step = 0 | 1 | 2 | 3;
const STEPS = ["Service", "Restaurant", "Coordonnées", "Récapitulatif"] as const;

const SERVICES: { value: ServiceType; icon: typeof Bike; text: string }[] = [
  { value: "livraison", icon: Bike, text: "Chez vous, dans les quartiers desservis." },
  { value: "emporter", icon: ShoppingBag, text: "Vous passez récupérer au restaurant." },
  { value: "sur_place", icon: UtensilsCrossed, text: "Vous mangez au restaurant." },
];

export function CheckoutFlow({ restaurants, districts }: Props) {
  const router = useRouter();
  const { lines, promo, hydrated, clear } = useCartStore();
  const { selectedId, select, hydrated: restaurantHydrated } = useRestaurantStore();
  const { user, loading: userLoading } = useUser();

  const [step, setStep] = useState<Step>(0);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", districtId: "", address: "", comment: "" });
  const [usePoints, setUsePoints] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  const restaurant = restaurants.find((r) => r.id === selectedId) ?? restaurants[0] ?? null;
  const { isOpen } = useServiceStatus(restaurantHydrated ? restaurant?.id ?? null : null);
  const restaurantDistricts = useMemo(() => districts.filter((d) => !restaurant || d.restaurantId === restaurant.id), [districts, restaurant]);
  const district = resolveDistrict({ districtId: form.districtId, districts: restaurantDistricts });

  // Prefill contact details once the profile is known (state adjusted during render, no effect).
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && prefilledFor !== String(user.id)) {
    setPrefilledFor(String(user.id));
    setForm((f) => ({
      ...f,
      name: f.name || user.name,
      phone: f.phone || user.phone,
      address: f.address || user.address,
      districtId: f.districtId || String(restaurantDistricts.find((d) => d.name.toLowerCase() === user.district.toLowerCase())?.id ?? ""),
    }));
  }

  const deliveryFee = deliveryFeeFor(serviceType, district);
  const pointsAvailable = user?.points ?? 0;
  const totals = cartTotals(lines, promo, deliveryFee, usePoints ? Math.min(pointsAvailable, cartTotals(lines, promo, deliveryFee).total) : 0);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  // The same pure rules the executable spec (unspa/) replays.
  const checkContact = () => {
    const er = validateContact({ serviceType, name: form.name, phone: form.phone, districtId: form.districtId, address: form.address, districts: restaurantDistricts });
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const next = () => {
    if (step === 0 && !serviceType) return;
    if (step === 2 && !checkContact()) return;
    setStep((s) => Math.min(3, s + 1) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const submit = async () => {
    if (!restaurant || !serviceType) return;
    if (!checkContact()) {
      setStep(2);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const { order } = await fetchJson<{ order: Order }>("/api/orders", {
        method: "POST",
        json: {
          restaurantId: restaurant.id,
          serviceType,
          customer: { name: form.name.trim(), phone: normalizePhone(form.phone) },
          delivery: serviceType === "livraison" && district ? { address: form.address.trim(), districtId: district.id, districtName: district.name, fee: district.fee } : null,
          comment: form.comment.trim(),
          promoCode: promo?.code ?? null,
          usePoints: totals.usedPoints,
          lines: lines.map((l) => ({ lineId: l.lineId, productId: l.productId, productSlug: l.productSlug, productName: l.productName, unitPrice: l.unitPrice, quantity: l.quantity, supplements: l.supplements, observations: l.observations })),
          idempotencyKey: idempotencyKey.current,
        },
      });
      // The backend echo may be sparse; keep what we know for the guest confirmation page.
      const snapshot: Order = {
        ...order,
        restaurantId: order.restaurantId ?? restaurant.id,
        serviceType: order.serviceType ?? serviceType,
        customerName: order.customerName || form.name.trim(),
        customerPhone: order.customerPhone || normalizePhone(form.phone),
        customerAddress: order.customerAddress || (serviceType === "livraison" ? form.address.trim() : ""),
        districtName: order.districtName || (serviceType === "livraison" ? district?.name ?? "" : ""),
        lines: order.lines.length
          ? order.lines
          : lines.map((l) => ({ id: l.lineId, productName: l.productName, productImageUrl: l.productImageUrl, unitPrice: l.unitPrice, quantity: l.quantity, supplements: l.supplements.map((s) => ({ name: s.name, price: s.price })), observations: l.observations.map((o) => o.name), total: lineTotal(l) })),
        subtotal: order.subtotal || totals.subtotal,
        deliveryFee: order.deliveryFee || totals.deliveryFee,
        total: order.total || totals.total,
      };
      rememberOrder(snapshot);
      idempotencyKey.current = null;
      clear();
      router.push(`/order/${encodeURIComponent(snapshot.publicId)}?new=1`);
    } catch (err) {
      if (err instanceof RequestFailed && err.status === 401) {
        toast(err.message, "info");
        router.push("/login?next=/checkout");
        return;
      }
      if (err instanceof RequestFailed && err.status === 422) {
        // A new key for the corrected attempt: the previous one may be remembered by the backend.
        idempotencyKey.current = null;
      }
      setServerError(err instanceof RequestFailed ? err.message : "Impossible d’envoyer la commande. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated || !restaurantHydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]" aria-busy="true">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (!lines.length) {
    return <EmptyState title="Votre panier est vide" text="Ajoutez des produits avant de commander." action={<Button href="/menu">Voir le menu</Button>} />;
  }
  if (!restaurant) {
    return <EmptyState title="Restaurants indisponibles" text="Impossible de charger les restaurants pour le moment. Réessayez dans un instant." />;
  }

  const closed = isOpen === false;
  const canContinue = step === 0 ? Boolean(serviceType) : true;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <ol className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider" aria-label="Étapes">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span className={cn("grid size-7 place-items-center rounded-full border-2 text-[11px] num", i < step ? "border-green bg-green text-white" : i === step ? "border-ink bg-ink text-white" : "border-line-strong text-ink-500")} aria-current={i === step ? "step" : undefined}>
                {i < step ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn("hidden sm:inline", i === step ? "text-ink" : "text-ink-500")}>{label}</span>
              {i < STEPS.length - 1 ? <span className="h-0.5 w-4 bg-line-strong sm:w-8" aria-hidden /> : null}
            </li>
          ))}
        </ol>

        <section className="board flex flex-col gap-5 p-5 sm:p-6" aria-labelledby="step-title">
          {step === 0 ? (
            <>
              <h2 id="step-title" className="display text-3xl sm:text-4xl">Comment voulez-vous votre Kerux ?</h2>
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Mode de réception">
                {SERVICES.map(({ value, icon: Icon, text }) => {
                  const active = serviceType === value;
                  return (
                    <button key={value} type="button" role="radio" aria-checked={active} aria-label={SERVICE_TYPE_LABEL[value]} onClick={() => setServiceType(value)} className={cn("flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors", active ? "border-ink bg-yellow-100" : "border-line bg-white hover:border-ink")}>
                      <Icon className={cn("size-7", active ? "text-red" : "text-ink-600")} aria-hidden />
                      <span className="display-tight text-2xl">{SERVICE_TYPE_LABEL[value]}</span>
                      <span className="text-sm text-ink-600">{text}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h2 id="step-title" className="display text-3xl sm:text-4xl">{serviceType === "livraison" ? "Quel Kerux vous livre ?" : "Quel Kerux ?"}</h2>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Restaurant">
                {restaurants.map((r) => (
                  <RestaurantChoice key={r.id} restaurant={r} active={r.id === restaurant.id} onSelect={() => select(r.id)} />
                ))}
              </div>
              {closed ? (
                <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
                  {restaurant.shortName} est fermé pour le moment. Vous pouvez préparer votre commande, mais elle ne pourra être envoyée qu’à la réouverture.
                </p>
              ) : null}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 id="step-title" className="display text-3xl sm:text-4xl">Vos coordonnées</h2>
              {!user && !userLoading ? (
                <p className="text-sm text-ink-600">
                  Vous avez un compte ?{" "}
                  <a href="/login?next=/checkout" className="font-bold text-blue underline underline-offset-4">
                    Connectez-vous
                  </a>{" "}
                  pour retrouver vos informations et suivre vos commandes.
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom" htmlFor="name" required error={errors.name}>
                  <Input id="name" value={form.name} onChange={update("name")} autoComplete="name" invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
                </Field>
                <Field label="Téléphone" htmlFor="phone" required error={errors.phone} hint="On vous appelle pour confirmer.">
                  <Input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" placeholder="05 / 06 / 07…" invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-hint"} />
                </Field>
              </div>
              {serviceType === "livraison" ? (
                <div className="grid gap-4">
                  <Field label="Quartier" htmlFor="district" required error={errors.districtId} hint={restaurantDistricts.length ? `Quartiers livrés par ${restaurant.shortName}.` : "Aucun quartier de livraison configuré pour ce restaurant."}>
                    <Select id="district" value={form.districtId} onChange={update("districtId")} invalid={Boolean(errors.districtId)} disabled={!restaurantDistricts.length}>
                      <option value="">Choisir un quartier…</option>
                      {restaurantDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                          {d.fee ? ` — ${formatDA(d.fee)}` : " — livraison offerte"}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Adresse" htmlFor="address" required error={errors.address}>
                    <Input id="address" value={form.address} onChange={update("address")} autoComplete="street-address" placeholder="Rue, immeuble, étage, porte…" invalid={Boolean(errors.address)} />
                  </Field>
                </div>
              ) : null}
              <Field label="Note pour la cuisine ou le livreur" htmlFor="comment" hint="Facultatif — 500 caractères max.">
                <Textarea id="comment" value={form.comment} onChange={update("comment")} maxLength={500} placeholder="Ex. : sonner deux fois, sauce à part…" />
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 id="step-title" className="display text-3xl sm:text-4xl">On récapitule</h2>
              <dl className="grid gap-3 text-[15px] sm:grid-cols-2">
                <Row label="Mode">{serviceType ? SERVICE_TYPE_LABEL[serviceType] : "—"}</Row>
                <Row label="Restaurant">{restaurant.name}</Row>
                <Row label="Nom">{form.name}</Row>
                <Row label="Téléphone">{form.phone}</Row>
                {serviceType === "livraison" ? (
                  <>
                    <Row label="Quartier">{district?.name ?? "—"}</Row>
                    <Row label="Adresse">{form.address}</Row>
                  </>
                ) : null}
                {form.comment ? <Row label="Note">{form.comment}</Row> : null}
              </dl>
              <ul className="divide-y divide-line border-y border-line">
                {lines.map((l) => (
                  <li key={l.lineId} className="flex items-start justify-between gap-3 py-2.5 text-[15px]">
                    <span>
                      <span className="font-bold num">{l.quantity} ×</span> {l.productName}
                      {l.supplements.length || l.observations.length ? <span className="block text-sm text-ink-500">{[...l.supplements.map((s) => `+ ${s.name}`), ...l.observations.map((o) => o.name)].join(" · ")}</span> : null}
                    </span>
                    <span className="font-bold num">{formatDA(lineTotal(l))}</span>
                  </li>
                ))}
              </ul>
              {pointsAvailable > 0 ? (
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-cream px-4 py-3">
                  <span className="flex flex-col">
                    <span className="font-bold">Utiliser mes points bonus</span>
                    <span className="text-sm text-ink-600">{pointsAvailable} pts disponibles</span>
                  </span>
                  <input type="checkbox" className="size-5 accent-blue" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
                </label>
              ) : null}
              <div className="rounded-xl border border-line bg-cream px-4 py-3 text-sm">
                <p className="font-bold">Paiement à la réception</p>
                <p className="text-ink-600">Vous réglez à la livraison ou au comptoir. Aucun paiement en ligne n’est demandé.</p>
              </div>
              {serverError ? (
                <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
                  {serverError}
                </p>
              ) : null}
            </>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="ghost" onClick={back}>
                <ChevronLeft className="size-4" aria-hidden /> Retour
              </Button>
            ) : (
              <Button variant="ghost" href="/cart">
                <ChevronLeft className="size-4" aria-hidden /> Panier
              </Button>
            )}
            {step < 3 ? (
              <Button size="lg" onClick={next} disabled={!canContinue}>
                Continuer
              </Button>
            ) : (
              <Button size="lg" onClick={submit} loading={submitting} disabled={closed}>
                {closed ? "Restaurant fermé" : `Confirmer · ${formatDA(totals.total)}`}
              </Button>
            )}
          </div>
        </section>
      </div>

      <aside className="board flex flex-col gap-5 p-5 lg:sticky lg:top-24" aria-label="Votre commande">
        <div className="flex items-center justify-between">
          <h2 className="display-tight text-2xl">Votre commande</h2>
          <NeonStatus isOpen={isOpen} compact />
        </div>
        <p className="text-sm text-ink-600">
          {restaurant.name}
          {serviceType ? ` · ${SERVICE_TYPE_LABEL[serviceType]}` : ""}
        </p>
        <PromoCodeField />
        <CartSummary totals={totals} deliveryLabel={serviceType === "livraison" ? (district ? `Livraison — ${district.name}` : "Livraison") : "Livraison"} />
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-500">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

function RestaurantChoice({ restaurant, active, onSelect }: { restaurant: Restaurant; active: boolean; onSelect: () => void }) {
  const { isOpen } = useServiceStatus(restaurant.id);
  return (
    <button type="button" role="radio" aria-checked={active} aria-label={restaurant.name} onClick={onSelect} className={cn("flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors", active ? "border-ink bg-yellow-100" : "border-line bg-white hover:border-ink")}>
      <span className="flex w-full items-center justify-between gap-2">
        <Store className={cn("size-6", active ? "text-red" : "text-ink-600")} aria-hidden />
        <NeonStatus isOpen={isOpen} compact />
      </span>
      <span className="display-tight text-2xl">{restaurant.shortName}</span>
      <span className="text-sm text-ink-600">{restaurant.address}</span>
    </button>
  );
}
