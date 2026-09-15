"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Object-fit: product photos are mostly cut-outs on white, so `contain` keeps the whole dish visible. */
  fit?: "contain" | "cover";
};

/** Product photo with the mascot as a graceful fallback when the API has no picture (or it fails to load). */
export function ProductImage({ src, alt, sizes, priority, className, fit = "contain" }: Props) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  return (
    <div className={cn("photo-ground relative overflow-hidden", className)}>
      {showFallback ? (
        <Image src="/brand/mascotte.png" alt="" fill sizes={sizes} className="object-contain p-[18%] opacity-30 grayscale" aria-hidden />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(fit === "contain" ? "object-contain p-[6%]" : "object-cover", "transition-transform duration-300 ease-out group-hover:scale-[1.04]")}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
