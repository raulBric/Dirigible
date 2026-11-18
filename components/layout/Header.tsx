"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { NAV_LINKS } from "@/config/site";
import { useCurrentUser } from "@/store/app";
import { useHydrated } from "@/components/ui/ClientOnly";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";

function AccountLink() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  return (
    <Link
      href={hydrated && user ? "/mi-cuenta" : "/acceso"}
      className="flex items-center gap-2 rounded-full px-3 py-2 text-[15px] font-medium text-navy transition hover:bg-navy-50"
    >
      <UserRound className="size-5" aria-hidden />
      <span>{hydrated && user ? user.firstName : "Mi cuenta"}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/85 shadow-[0_6px_24px_-12px_rgb(31_56_100/0.25)] backdrop-blur-md" : "bg-white/55 backdrop-blur-sm"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Inicio" className="min-w-0 shrink rounded-lg">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.filter((l) => l.href !== "/reservar").map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className="rounded-full px-3 py-2 text-[15px] font-medium text-ink/80 transition hover:bg-navy-50 hover:text-navy aria-[current=page]:bg-navy-50 aria-[current=page]:text-navy"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <AccountLink />
          <ButtonLink href="/reservar" size="sm">
            Reservar vuelo
          </ButtonLink>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ButtonLink href="/reservar" size="sm" className="max-[380px]:hidden">
            Reservar
          </ButtonLink>
          <MobileDrawer />
        </div>
      </div>
    </header>
  );
}
