import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "ink" | "yellow";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-extrabold tracking-wide select-none transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white shadow-[0_6px_16px_-8px_rgb(228_59_21/0.7)] hover:bg-red-600",
  secondary: "bg-white text-ink border-2 border-ink hover:bg-cream",
  ghost: "bg-transparent text-ink hover:bg-cream-200",
  ink: "bg-ink text-white hover:bg-ink-800",
  yellow: "bg-yellow text-ink hover:bg-yellow-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

type Common = { variant?: Variant; size?: Size; className?: string; children: ReactNode; loading?: boolean };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = Common & { href: string; prefetch?: boolean; "aria-label"?: string; onClick?: () => void; target?: "_blank"; rel?: string };

export function Button(props: ButtonProps | LinkProps) {
  const { variant = "primary", size = "md", className, children, loading } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  if ("href" in props && props.href !== undefined) {
    const { href, prefetch, onClick, target, rel } = props;
    return (
      <Link href={href} prefetch={prefetch} onClick={onClick} className={cls} aria-label={props["aria-label"]} target={target} rel={target === "_blank" ? rel ?? "noopener noreferrer" : rel}>
        {children}
      </Link>
    );
  }
  // Strip our own props so they never reach the DOM (and `className` never overrides `cls`).
  const rest: Partial<ButtonProps> = { ...(props as ButtonProps) };
  delete rest.variant;
  delete rest.size;
  delete rest.className;
  delete rest.children;
  delete rest.loading;
  delete rest.href;
  const { type = "button", disabled, ...attrs } = rest;
  return (
    <button type={type} disabled={disabled || loading} className={cls} {...attrs}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
