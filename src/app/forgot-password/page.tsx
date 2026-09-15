import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotPasswordForm } from "@/components/account/password-forms";
import { AuthAside } from "@/components/account/auth-aside";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Mot de passe oublié" sub="On vous envoie un lien pour en choisir un nouveau." aside={<AuthAside />}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
