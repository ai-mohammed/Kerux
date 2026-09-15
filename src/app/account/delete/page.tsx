import type { Metadata } from "next";
import { DeleteAccountForm } from "@/components/account/delete-account-form";

export const metadata: Metadata = { title: "Supprimer mon compte", robots: { index: false } };

export default function DeleteAccountPage() {
  return <DeleteAccountForm />;
}
