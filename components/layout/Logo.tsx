import { BRAND } from "@/config/site";

export function AirshipIcon({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id="logo-env" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="0.55" stopColor="#F472B6" />
          <stop offset="1" stopColor="#1F3864" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="16" rx="26" ry="12" fill="url(#logo-env)" />
      <path d="M52 10 62 4v24l-10-6z" fill="#1F3864" />
      <path d="M12 9c6-3 30-3 36 0" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20" y="28" width="18" height="7" rx="3.5" fill="#1F3864" />
      <path d="M24 26v2M34 26v2" stroke="#1F3864" strokeWidth="2" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <AirshipIcon className="h-8 w-12 shrink-0" />
      <span className={`truncate font-display text-base font-bold leading-tight sm:text-lg ${light ? "text-white" : "text-navy"}`}>{BRAND.name}</span>
    </span>
  );
}
