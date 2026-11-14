import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { DeliveryDistrict, User } from "@/types";
import { me } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getDeliveryDistricts } from "@/lib/api/restaurants";
import { getSession, type Session } from "@/lib/auth/session";
import { ProfileForm } from "@/components/account/profile-form";
import { EmptyState } from "@/components/ui/bits";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false } };
export const dynamic = "force-dynamic";

type Loaded = { kind: "ok"; user: User; districts: DeliveryDistrict[] } | { kind: "expired" } | { kind: "error" };

async function load(session: Session): Promise<Loaded> {
  try {
    const [user, districts] = await Promise.all([me(session.token, session.kind), getDeliveryDistricts().catch(() => [])]);
    return { kind: "ok", user, districts };
  } catch (err) {
    return err instanceof ApiError && err.status === 401 ? { kind: "expired" } : { kind: "error" };
  }
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const result = await load(session);
  if (result.kind === "expired") redirect("/login?next=/account&expired=1");
  if (result.kind === "error") {
    return <EmptyState title="Profil indisponible" text="Impossible de charger votre profil pour le moment. Réessayez dans un instant." />;
  }
  return <ProfileForm key={String(result.user.id)} user={result.user} districts={result.districts} />;
}
