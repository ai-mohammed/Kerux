"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="flex flex-col gap-3">
        <p className="display-tight text-2xl">Email envoyé</p>
        <p className="text-ink-600">Si un compte existe pour {email}, vous recevrez un lien pour choisir un nouveau mot de passe.</p>
        <Button href="/login" variant="secondary">
          Retour à la connexion
        </Button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await fetchJson("/api/auth/forgot-password", { method: "POST", json: { email: email.trim() } });
          setDone(true);
        } catch (err) {
          setError(err instanceof RequestFailed ? err.message : "Envoi impossible pour le moment.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Email du compte" htmlFor="email" required error={error ?? undefined}>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus invalid={Boolean(error)} />
      </Field>
      <Button type="submit" size="lg" loading={busy} disabled={!email.trim()}>
        Envoyer le lien
      </Button>
      <Link href="/login" className="text-sm font-bold text-blue underline underline-offset-4">
        Retour à la connexion
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (mismatch || password.length < 6) return;
        setBusy(true);
        setError(null);
        try {
          await fetchJson(`/api/auth/reset-password/${encodeURIComponent(token)}`, { method: "POST", json: { password, confirm } });
          toast("Mot de passe modifié. Connectez-vous.", "success");
          router.push("/login");
        } catch (err) {
          setError(err instanceof RequestFailed ? err.message : "Modification impossible. Le lien a peut-être expiré.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Nouveau mot de passe" htmlFor="password" required hint="6 caractères minimum.">
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required autoFocus />
      </Field>
      <Field label="Confirmation" htmlFor="confirm" required error={mismatch ? "Les deux mots de passe ne correspondent pas." : undefined}>
        <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required invalid={mismatch} />
      </Field>
      {error ? (
        <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={busy} disabled={password.length < 6 || mismatch || !confirm}>
        Enregistrer
      </Button>
    </form>
  );
}
