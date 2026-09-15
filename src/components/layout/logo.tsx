import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, size = "md", withWordmark = true, tone = "dark" }: { className?: string; size?: "sm" | "md" | "lg"; withWordmark?: boolean; tone?: "dark" | "light" }) {
  const px = size === "lg" ? 64 : size === "sm" ? 36 : 44;
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="Kerux Foods — accueil">
      <Image src="/brand/mascotte.png" alt="" width={px} height={px} priority className="shrink-0 rounded-full" />
      {withWordmark ? (
        <span className={cn("display leading-none", tone === "light" ? "text-yellow" : "text-red-800", size === "lg" ? "text-4xl" : size === "sm" ? "text-2xl" : "text-[28px]")}>
          KERUX
        </span>
      ) : null}
    </Link>
  );
}
