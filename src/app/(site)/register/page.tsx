import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/register-form";
import { safeNext } from "@/lib/utils/safe-next";
import { AuthAside } from "@/components/account/auth-aside";

export const metadata: Metadata = { title: "Créer un compte", robots: { index: false } };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : null);
  if (await getSession()) redirect(target);
  return (
    <AuthShell title="Créer un compte" sub="Une minute, et vos prochaines commandes iront plus vite." aside={<AuthAside />}>
      <RegisterForm next={target} />
    </AuthShell>
  );
}
