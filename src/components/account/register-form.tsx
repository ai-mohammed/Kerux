"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { isValidPhone } from "@/lib/utils/format";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { safeNext } from "@/lib/utils/safe-next";

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const { setUser } = useUser();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const validate = () => {
    const er: Record<string, string> = {};
    if (!form.firstName.trim()) er.firstName = "Votre prénom est obligatoire.";
    if (!form.lastName.trim()) er.lastName = "Votre nom est obligatoire.";
    if (!form.email.trim() && !form.phone.trim()) er.email = "Indiquez un email ou un téléphone.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "Email incorrect.";
    if (form.phone.trim() && !isValidPhone(form.phone)) er.phone = "Numéro attendu : 05, 06 ou 07 suivi de 8 chiffres.";
    if (form.password.length < 6) er.password = "6 caractères minimum.";
    if (form.confirm !== form.password) er.confirm = "Les deux mots de passe ne correspondent pas.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setServerError(null);
    try {
      const { user } = await fetchJson<{ user: User }>("/api/auth/register", {
        method: "POST",
        json: { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password },
      });
      setUser(user);
      toast("Compte créé. Bienvenue chez Kerux !", "success");
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      setServerError(err instanceof RequestFailed ? err.message : "Inscription impossible pour le moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="firstName" required error={errors.firstName}>
          <Input id="firstName" value={form.firstName} onChange={update("firstName")} autoComplete="given-name" invalid={Boolean(errors.firstName)} />
        </Field>
        <Field label="Nom" htmlFor="lastName" required error={errors.lastName}>
          <Input id="lastName" value={form.lastName} onChange={update("lastName")} autoComplete="family-name" invalid={Boolean(errors.lastName)} />
        </Field>
      </div>
      <Field label="Email" htmlFor="email" error={errors.email} hint="Email ou téléphone : au moins l’un des deux.">
        <Input id="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" inputMode="email" invalid={Boolean(errors.email)} />
      </Field>
      <Field label="Téléphone" htmlFor="phone" error={errors.phone}>
        <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" inputMode="tel" placeholder="05 / 06 / 07…" invalid={Boolean(errors.phone)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mot de passe" htmlFor="password" required error={errors.password}>
          <Input id="password" type="password" value={form.password} onChange={update("password")} autoComplete="new-password" invalid={Boolean(errors.password)} />
        </Field>
        <Field label="Confirmation" htmlFor="confirm" required error={errors.confirm}>
          <Input id="confirm" type="password" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" invalid={Boolean(errors.confirm)} />
        </Field>
      </div>
      {serverError ? (
        <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={busy}>
        Créer mon compte
      </Button>
      <p className="text-sm text-ink-600">
        Déjà un compte ?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-blue underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
