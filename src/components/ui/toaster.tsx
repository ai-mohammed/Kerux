"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useToastStore } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

const icons = { success: CheckCircle2, error: CircleAlert, info: Info };

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6 sm:items-end sm:px-6" aria-live="polite">
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-board-lg animate-tick",
              t.tone === "success" && "border-green bg-white text-ink",
              t.tone === "error" && "border-alert bg-white text-ink",
              t.tone === "info" && "border-line bg-white text-ink",
            )}
          >
            <Icon className={cn("size-5 shrink-0", t.tone === "success" && "text-green", t.tone === "error" && "text-alert", t.tone === "info" && "text-blue")} aria-hidden />
            <span className="flex-1">{t.message}</span>
            {t.action ? (
              <Link href={t.action.href} className="shrink-0 font-extrabold text-blue underline underline-offset-4" onClick={() => dismiss(t.id)}>
                {t.action.label}
              </Link>
            ) : null}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Fermer la notification" className="grid size-7 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-cream">
              <X className="size-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
