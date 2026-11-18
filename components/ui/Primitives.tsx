import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  as: Tag = "h2",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  id?: string;
}) {
  const center = align === "center";
  return (
    <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-pink-700">{eyebrow}</p>}
      <Tag id={id} className={`text-3xl leading-tight text-navy sm:text-4xl ${Tag === "h1" ? "md:text-5xl" : ""}`}>
        <span className="brush">{title}</span>
      </Tag>
      {subtitle && <p className="mt-6 text-lg leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}

export function Card({ className = "", children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

const badgeTones = {
  navy: "bg-navy-50 text-navy",
  pink: "bg-pink-50 text-pink-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-green-50 text-success",
  red: "bg-red-50 text-danger",
  gray: "bg-gray-100 text-gray-700",
} as const;

export function Badge({ tone = "navy", children, className = "" }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeTones[tone]} ${className}`}>{children}</span>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10" role="status" aria-live="polite">
      <span className="visually-hidden">Cargando…</span>
      <Skeleton className="mb-4 h-10 w-2/3 max-w-md" />
      <Skeleton className="mb-10 h-5 w-1/2 max-w-sm" />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="hidden h-80 md:block" />
      </div>
    </div>
  );
}

/** Imagen de marcador con texto alternativo descriptivo. */
export function ImagePlaceholder({
  alt,
  icon: Icon,
  tone = "sunset",
  className = "",
  label,
}: {
  alt: string;
  icon?: LucideIcon;
  tone?: "sunset" | "sea" | "lilac" | "amber";
  className?: string;
  label?: string;
}) {
  const tones = {
    sunset: "from-amber-200 via-pink-200 to-violet-300",
    sea: "from-sky-200 via-cyan-100 to-indigo-200",
    lilac: "from-violet-200 via-pink-100 to-amber-100",
    amber: "from-amber-100 via-orange-200 to-pink-200",
  };
  return (
    <div role="img" aria-label={alt} className={`relative flex items-center justify-center overflow-hidden bg-linear-to-br ${tones[tone]} ${className}`}>
      {Icon && <Icon className="size-12 text-white drop-shadow" strokeWidth={1.5} aria-hidden />}
      {label && <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-navy" aria-hidden>{label}</span>}
    </div>
  );
}

export function Notice({ tone = "info", icon: Icon, title, children }: { tone?: "info" | "warning" | "success" | "error"; icon?: LucideIcon; title?: string; children: ReactNode }) {
  const tones = {
    info: "bg-navy-50 text-navy border-navy/15",
    warning: "bg-amber-50 text-amber-800 border-amber/40",
    success: "bg-green-50 text-green-800 border-green-300",
    error: "bg-red-50 text-red-800 border-red-300",
  };
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${tones[tone]}`}>
      {Icon && <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />}
      <div>
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
