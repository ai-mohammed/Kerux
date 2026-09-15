"use client";

import { useState } from "react";
import type { DeliveryDistrict, User } from "@/types";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { isValidPhone } from "@/lib/utils/format";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";

export function ProfileForm({ user, districts }: { user: User; districts: DeliveryDistrict[] }) {
  const { setUser } = useUser();
  const [first = "", ...rest] = user.name.split(" ");
  const [form, setForm] = useState({ firstName: first, lastName: rest.join(" "), phone: user.phone, district: user.district, address: user.address, password: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!form.firstName.trim()) er.firstName = "Prénom obligatoire.";
    if (!form.lastName.trim()) er.lastName = "Nom obligatoire.";
    if (!isValidPhone(form.phone)) er.phone = "Numéro attendu : 05, 06 ou 07 suivi de 8 chiffres.";
    if (changePassword) {
      if (!form.password) er.password = "Saisissez votre mot de passe actuel.";
      if (form.newPassword.length < 6) er.newPassword = "6 caractères minimum.";
      if (form.confirm !== form.newPassword) er.confirm = "Les deux mots de passe ne correspondent pas.";
    }
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const { user: updated } = await fetchJson<{ user: User }>("/api/account/profile", {
        method: "PUT",
        json: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          district: form.district,
          address: form.address.trim(),
          password: changePassword ? form.password : "",
          newPassword: changePassword ? form.newPassword : "",
        },
      });
      setUser(updated);
      setForm((f) => ({ ...f, password: "", newPassword: "", confirm: "" }));
      setChangePassword(false);
      toast("Profil enregistré.", "success");
    } catch (err) {
      toast(err instanceof RequestFailed ? err.message : "Enregistrement impossible.", "error");
    } finally {
      setBusy(false);
    }
  };

  const districtNames = Array.from(new Set(districts.map((d) => d.name))).sort((a, b) => a.localeCompare(b, "fr"));

  return (
    <form onSubmit={submit} className="board flex flex-col gap-5 p-5 sm:p-6" noValidate>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="display-tight text-2xl">Profil</h2>
        {user.points > 0 ? <span className="rounded-full bg-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-ink num">{user.points} points bonus</span> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom" htmlFor="firstName" required error={errors.firstName}>
          <Input id="firstName" value={form.firstName} onChange={update("firstName")} autoComplete="given-name" invalid={Boolean(errors.firstName)} />
        </Field>
        <Field label="Nom" htmlFor="lastName" required error={errors.lastName}>
          <Input id="lastName" value={form.lastName} onChange={update("lastName")} autoComplete="family-name" invalid={Boolean(errors.lastName)} />
        </Field>
        <Field label="Email" htmlFor="email" hint="L’email ne se modifie pas ici.">
          <Input id="email" value={user.email} readOnly disabled />
        </Field>
        <Field label="Téléphone" htmlFor="phone" required error={errors.phone}>
          <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" inputMode="tel" invalid={Boolean(errors.phone)} />
        </Field>
        <Field label="Quartier" htmlFor="district" hint="Pour la livraison.">
          <Select id="district" value={form.district} onChange={update("district")}>
            <option value="">—</option>
            {districtNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
            {form.district && !districtNames.includes(form.district) ? <option value={form.district}>{form.district}</option> : null}
          </Select>
        </Field>
        <Field label="Adresse" htmlFor="address">
          <Input id="address" value={form.address} onChange={update("address")} autoComplete="street-address" />
        </Field>
      </div>

      <div className="flex flex-col gap-4 border-t border-line pt-4">
        <label className="flex items-center gap-3 text-sm font-bold">
          <input type="checkbox" className="size-5 accent-blue" checked={changePassword} onChange={(e) => setChangePassword(e.target.checked)} />
          Changer mon mot de passe
        </label>
        {changePassword ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Actuel" htmlFor="password" required error={errors.password}>
              <Input id="password" type="password" value={form.password} onChange={update("password")} autoComplete="current-password" invalid={Boolean(errors.password)} />
            </Field>
            <Field label="Nouveau" htmlFor="newPassword" required error={errors.newPassword}>
              <Input id="newPassword" type="password" value={form.newPassword} onChange={update("newPassword")} autoComplete="new-password" invalid={Boolean(errors.newPassword)} />
            </Field>
            <Field label="Confirmation" htmlFor="confirm" required error={errors.confirm}>
              <Input id="confirm" type="password" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" invalid={Boolean(errors.confirm)} />
            </Field>
          </div>
        ) : null}
      </div>

      <Button type="submit" size="lg" loading={busy} className="self-start">
        Enregistrer
      </Button>
    </form>
  );
}
