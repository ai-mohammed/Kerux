import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetPasswordForm } from "@/components/account/password-forms";
import { AuthAside } from "@/components/account/auth-aside";

export const metadata: Metadata = { title: "Nouveau mot de passe", robots: { index: false } };

export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  return (
    <AuthShell title="Nouveau mot de passe" sub="Choisissez-en un que vous retiendrez." aside={<AuthAside />}>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
