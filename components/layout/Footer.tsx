import Link from "next/link";
import { AlertTriangle, Leaf, Mail, MapPin, Phone } from "lucide-react";
import { BRAND, FOOTER_LINKS } from "@/config/site";
import { Logo } from "./Logo";
import { CookieSettingsButton } from "./CookieBanner";

export function Footer() {
  const cols = [
    { title: "Viaja", links: FOOTER_LINKS.viaja },
    { title: "Compañía", links: FOOTER_LINKS.empresa },
    { title: "Legal", links: FOOTER_LINKS.legal },
  ];
  return (
    <footer className="mt-auto bg-navy text-white/85">
      <div className="bg-amber/95 text-navy-700">
        <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-semibold">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {BRAND.disclaimer}. Pagos, emails y reservas son simulados.
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
            Girona ⇄ Mallorca a bordo de un dirigible. {BRAND.tagline}: vistas panorámicas, calma y cero emisiones.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden /> {BRAND.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden /> {BRAND.phone}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden /> {BRAND.address}
            </li>
          </ul>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">{c.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/75 underline-offset-4 transition hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              {c.title === "Legal" && (
                <li>
                  <CookieSettingsButton />
                </li>
              )}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-6">
          <p>
            © {BRAND.year} {BRAND.name}. {BRAND.disclaimer}.
          </p>
          <p className="flex items-center gap-1.5">
            <Leaf className="size-3.5" aria-hidden /> Prototipo para Trabajo Fin de Máster
          </p>
        </div>
      </div>
    </footer>
  );
}
