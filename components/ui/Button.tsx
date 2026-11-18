import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] select-none";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white shadow-[0_8px_20px_-8px_rgb(31_56_100/0.6)] hover:bg-navy-700 hover:-translate-y-0.5",
  secondary: "bg-white text-navy ring-1 ring-inset ring-navy/25 hover:ring-navy/60 hover:bg-navy-50",
  accent: "bg-pink text-navy-700 shadow-[0_8px_20px_-8px_rgb(244_114_182/0.7)] hover:brightness-105 hover:-translate-y-0.5",
  ghost: "text-navy hover:bg-navy-50",
  danger: "bg-white text-danger ring-1 ring-inset ring-danger/40 hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2 min-h-9",
  md: "text-[15px] px-5 py-2.5 min-h-11",
  lg: "text-base px-7 py-3.5 min-h-13",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean; icon?: ReactNode };

export function Button({ variant = "primary", size = "md", loading, icon, className = "", children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode };

export function ButtonLink({ variant = "primary", size = "md", icon, className = "", children, ...rest }: LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
