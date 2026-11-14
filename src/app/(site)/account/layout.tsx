import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Container, SectionTitle } from "@/components/ui/bits";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  if (!(await getSession())) redirect("/login?next=/account");
  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10">
      <SectionTitle as="h1">Mon compte</SectionTitle>
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
