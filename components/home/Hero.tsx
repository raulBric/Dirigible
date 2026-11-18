import { Leaf, Sparkles, Wind } from "lucide-react";
import { BRAND, SEASONS, STATS } from "@/config/site";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { Skeleton } from "@/components/ui/Primitives";
import { HeroSearchForm } from "@/components/booking/SearchForm";
import { HeroIllustration } from "./Illustrations";

function SearchSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <Skeleton className="h-11 w-full rounded-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-13 w-full rounded-full" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate -mt-16 flex min-h-[100svh] items-center overflow-hidden pt-16" aria-labelledby="hero-title">
      <HeroIllustration className="absolute inset-0 -z-10 h-full w-full max-lg:opacity-70" />
      {/* En móvil el texto queda sobre la ilustración: velo más opaco para mantener el contraste */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-white/85 via-white/70 to-white/30 lg:bg-linear-to-r lg:from-white/70 lg:via-white/30 lg:to-transparent" aria-hidden />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_420px]">
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-navy shadow-sm backdrop-blur">
            <Sparkles className="size-4 text-pink-700" aria-hidden /> {BRAND.tagline}
          </p>
          <h1 id="hero-title" className="text-4xl leading-[1.08] text-navy sm:text-5xl lg:text-6xl">
            {BRAND.heroTitle.split(", ")[0]},<br />
            <span className="brush">{BRAND.heroTitle.split(", ")[1]}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/85">{BRAND.heroSubtitle}</p>
          <ul className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-navy">
            <li className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur">
              <Leaf className="size-4 text-success" aria-hidden /> ~{STATS.reduction} % menos CO₂
            </li>
            <li className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 backdrop-blur">
              <Wind className="size-4 text-pink-700" aria-hidden /> Desde {SEASONS.baja.fare} € por trayecto
            </li>
          </ul>
        </div>
        <div className="card animate-fade-up p-5 [animation-delay:150ms] sm:p-6">
          <h2 className="mb-4 text-xl text-navy">Encuentra tu vuelo</h2>
          <ClientOnly fallback={<SearchSkeleton />}>
            <HeroSearchForm />
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}
