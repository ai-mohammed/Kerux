import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/login-form";
import { safeNext } from "@/lib/utils/safe-next";
import { AuthAside } from "@/components/account/auth-aside";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target = safeNext(typeof next === "string" ? next : null);
  if (await getSession()) redirect(target);
  return (
    <AuthShell title="Connexion" sub="Retrouvez vos commandes et vos infos." aside={<AuthAside />}>
      <LoginForm next={target} />
    </AuthShell>
  );
}
