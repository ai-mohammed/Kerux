import { Check, X } from "lucide-react";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

/**
 * Mirrors the backend's real enum. Steps are derived from it, never invented:
 *   en_attente_validation_caissier → en_cours → validee   |   annulee
 */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  en_attente_validation_caissier: "Commande reçue",
  en_cours: "En préparation",
  validee: "Terminée",
  annulee: "Annulée",
};

export const STATUS_HINT: Record<OrderStatus, string> = {
  en_attente_validation_caissier: "Le restaurant confirme votre commande. On vous appelle si besoin.",
  en_cours: "Votre commande est en cuisine.",
  validee: "Commande terminée. Bon appétit !",
  annulee: "Cette commande a été annulée. Appelez le restaurant pour toute question.",
};

const PIPELINE: OrderStatus[] = ["en_attente_validation_caissier", "en_cours", "validee"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const cancelled = status === "annulee";
  const reached = cancelled ? 1 : PIPELINE.indexOf(status) + 1;
  const steps = cancelled ? ([PIPELINE[0], "annulee"] as OrderStatus[]) : PIPELINE;
  return (
    <ol className="flex flex-col gap-0" aria-label="Progression de la commande">
      {steps.map((s, i) => {
        const done = i < reached;
        const current = i === reached - 1;
        const isCancel = s === "annulee";
        return (
          <li key={s} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border-2",
                  isCancel ? "border-alert bg-red-100 text-alert" : done ? "border-green bg-green text-white" : "border-line-strong bg-white text-ink-500",
                  current && !isCancel && "ring-4 ring-green/20",
                )}
                aria-hidden
              >
                {isCancel ? <X className="size-4" /> : done ? <Check className="size-4" /> : <span className="text-xs font-extrabold num">{i + 1}</span>}
              </span>
              {i < steps.length - 1 ? <span className={cn("my-1 w-0.5 flex-1", done && !current ? "bg-green" : "bg-line")} aria-hidden /> : null}
            </div>
            <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
              <p className={cn("display-tight text-xl", !done && "text-ink-500")}>
                {STATUS_LABEL[s]}
                {current ? <span className="sr-only"> (étape actuelle)</span> : null}
              </p>
              {current ? <p className="mt-0.5 text-sm text-ink-600">{STATUS_HINT[s]}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
