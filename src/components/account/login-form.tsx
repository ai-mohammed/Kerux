"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import type { User } from "@/types";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { safeNext } from "@/lib/utils/safe-next";
import { useUser } from "@/hooks/use-user";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const { setUser } = useUser();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user } = await fetchJson<{ user: User }>("/api/auth/login", { method: "POST", json: { identifier: identifier.trim(), password } });
      setUser(user);
      toast(`Bienvenue${user.name ? `, ${user.name}` : ""} !`, "success");
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      setError(err instanceof RequestFailed ? (err.status === 401 || err.status === 422 ? "Identifiants incorrects. Vérifiez votre email/téléphone et votre mot de passe." : err.message) : "Connexion impossible pour le moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Field label="Email ou téléphone" htmlFor="identifier" required>
        <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="email" required autoFocus />
      </Field>
      <Field label="Mot de passe" htmlFor="password" required>
        <div className="relative">
          <Input id="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="pr-12" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-cream">
            {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
      </Field>
      {error ? (
        <p role="alert" className="rounded-xl border border-alert bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" loading={busy} disabled={!identifier.trim() || !password}>
        Se connecter
      </Button>
      <div className="flex flex-col gap-2 text-sm">
        <Link href="/forgot-password" className="font-bold text-blue underline underline-offset-4">
          Mot de passe oublié ?
        </Link>
        <p className="text-ink-600">
          Pas encore de compte ?{" "}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-blue underline underline-offset-4">
            Créer un compte
          </Link>
        </p>
      </div>
    </form>
  );
}
