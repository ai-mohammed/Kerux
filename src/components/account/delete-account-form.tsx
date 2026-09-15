"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { fetchJson, RequestFailed } from "@/lib/utils/fetch-json";
import { useUserStore } from "@/hooks/use-user";
import { useCartStore } from "@/lib/cart/store";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";

const CONFIRM_WORD = "SUPPRIMER";

export function DeleteAccountForm() {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const setUser = useUserStore((s) => s.setUser);
  const clearCart = useCartStore((s) => s.clear);

  return (
    <form
      className="board flex flex-col gap-5 border-alert/40 p-5 sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (typed !== CONFIRM_WORD) return;
        setBusy(true);
        try {
          await fetchJson("/api/account/delete", { method: "DELETE" });
          setUser(null);
          clearCart();
          toast("Votre compte a été supprimé.", "info");
          router.push("/");
          router.refresh();
        } catch (err) {
          toast(err instanceof RequestFailed ? err.message : "Suppression impossible pour le moment.", "error");
          setBusy(false);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-1 size-6 shrink-0 text-alert" aria-hidden />
        <div>
          <h2 className="display-tight text-2xl">Supprimer mon compte</h2>
          <p className="mt-1 text-ink-600">Cette action est définitive : profil, historique de commandes et points bonus seront effacés.</p>
        </div>
      </div>
      <Field label={`Tapez ${CONFIRM_WORD} pour confirmer`} htmlFor="confirm-word" required>
        <Input id="confirm-word" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} autoComplete="off" placeholder={CONFIRM_WORD} />
      </Field>
      <Button type="submit" variant="ink" className="self-start bg-alert hover:bg-red-800" loading={busy} disabled={typed !== CONFIRM_WORD}>
        Supprimer définitivement
      </Button>
    </form>
  );
}
