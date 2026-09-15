"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Refreshes the server-rendered order every 30 s while the tab is visible and the order is still moving. */
export function OrderLive({ finished }: { finished: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 30_000);
    return () => clearInterval(t);
  }, [finished, router]);
  return (
    <Button
      variant="secondary"
      size="sm"
      className="self-start"
      loading={busy}
      onClick={() => {
        setBusy(true);
        router.refresh();
        setTimeout(() => setBusy(false), 800);
      }}
    >
      <RefreshCw className="size-4" aria-hidden /> Actualiser
    </Button>
  );
}
