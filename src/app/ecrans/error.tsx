"use client";

import { useEffect } from "react";

/** A screen has nobody to press "retry": show the mascot on black and try again on its own. */
export default function ScreenError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    const id = setTimeout(reset, 30_000);
    return () => clearTimeout(id);
  }, [reset]);
  return (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "#070606", cursor: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/mascotte.png" alt="Kerux" width={200} height={205} />
    </div>
  );
}
