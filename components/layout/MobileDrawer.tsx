"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, CircleHelp, Building2, Leaf, Menu, Plane, ShieldCheck, Tag, Ticket, UserRound, Wind, X } from "lucide-react";
import { BRAND } from "@/config/site";
import { formatNumber } from "@/lib/format";
import { tierFor } from "@/lib/pricing";
import { useCurrentUser } from "@/store/app";
import { useHydrated } from "@/components/ui/ClientOnly";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/reservar", label: "Reservar vuelo", icon: Plane },
  { href: "/gestionar-reserva", label: "Gestionar reserva", icon: Ticket },
  { href: "/tarifas", label: "Tarifas y horarios", icon: Tag },
  { href: "/empresas", label: "Empresas y eventos", icon: Building2 },
  { href: "/sostenibilidad", label: "Sostenibilidad", icon: Leaf },
  { href: "/seguridad", label: "Seguridad", icon: ShieldCheck },
  { href: "/faq", label: "Preguntas frecuentes", icon: CircleHelp },
];

/**
 * Menú móvil tipo "drawer": <dialog> modal con un carril de scroll-snap horizontal,
 * de modo que el panel se abre/cierra deslizando con el dedo (gesto nativo del navegador).
 */
export function MobileDrawer() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);

  const closeDrawer = () => {
    const sc = scrollerRef.current;
    // No cerramos el diálogo aquí: el IntersectionObserver lo hace al terminar la animación
    sc?.scrollTo({ left: sc.offsetWidth, behavior: "auto" });
  };

  const openDrawer = async () => {
    const d = dialogRef.current;
    const sc = scrollerRef.current;
    if (!d || !sc) return;
    d.showModal();
    if (!CSS.supports("scroll-initial-target", "nearest")) {
      sc.scrollTo({ left: sc.offsetWidth, behavior: "instant" });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    sc.scrollTo({ left: 0, behavior: "auto" });
  };

  useEffect(() => {
    const d = dialogRef.current;
    const sc = scrollerRef.current;
    const sheet = sheetRef.current;
    if (!d || !sc || !sheet) return;
    const visible = 1 / window.innerWidth;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries.at(-1)!;
        if (e.intersectionRatio < visible) {
          if (d.open) d.close();
          setExpanded(false);
        }
        if (e.intersectionRatio === 1) setExpanded(true);
      },
      { root: d, threshold: [visible, 1] },
    );
    observer.observe(sheet);

    const onClick = (ev: MouseEvent) => {
      if (!sheet.contains(ev.target as Node)) closeDrawer();
    };
    const onCancel = (ev: Event) => {
      if (ev.cancelable) {
        ev.preventDefault();
        closeDrawer();
      }
    };
    // Fallback del oscurecimiento si no hay animaciones ligadas al scroll
    const onScroll = () => d.style.setProperty("--drawer-backdrop", String(1 - sc.scrollLeft / sheet.offsetWidth));
    const sda = CSS.supports("animation-timeline: scroll()");
    d.addEventListener("click", onClick);
    d.addEventListener("cancel", onCancel);
    if (!sda) sc.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      d.removeEventListener("click", onClick);
      d.removeEventListener("cancel", onCancel);
      sc.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Cerrar al navegar
  useEffect(() => {
    if (dialogRef.current?.open) closeDrawer();
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const tier = user ? tierFor(user.lifetimePoints).tier : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDrawer}
        aria-expanded={expanded}
        aria-controls="mobile-drawer"
        aria-label="Abrir menú"
        className="grid size-11 place-items-center rounded-2xl bg-white/70 text-navy shadow-sm ring-1 ring-line transition active:scale-95 lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <dialog ref={dialogRef} id="mobile-drawer" aria-label="Menú principal" className="drawer lg:hidden">
        <div ref={scrollerRef} className="drawer-scroller">
          <nav ref={sheetRef} aria-label="Principal (móvil)" className="drawer-sheet">
            <div className="relative overflow-hidden bg-pastel px-5 pb-5 pt-4">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={closeDrawer} aria-label="Inicio">
                  <Logo />
                </Link>
                <button
                  type="button"
                  onClick={closeDrawer}
                  autoFocus
                  aria-label="Cerrar menú"
                  className="grid size-10 place-items-center rounded-full bg-white/80 text-navy shadow-sm transition active:scale-95"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              {/* Tarjeta de cuenta */}
              <Link
                href={hydrated && user ? "/mi-cuenta" : "/acceso"}
                onClick={closeDrawer}
                className="mt-5 flex items-center gap-3 rounded-2xl bg-white/85 p-3.5 shadow-sm backdrop-blur transition active:scale-[0.98]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-pink to-amber font-display text-lg font-bold text-white">
                  {hydrated && user ? user.firstName[0] : <UserRound className="size-5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  {hydrated && user ? (
                    <>
                      <span className="block truncate font-semibold text-navy">
                        {user.firstName} {user.lastName.split(" ")[0]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Wind className="size-3.5 text-pink-700" aria-hidden /> {tier?.name} · {formatNumber(user.points)} puntos
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block font-semibold text-navy">Inicia sesión</span>
                      <span className="text-xs text-muted">Acumula Wind Points en cada vuelo</span>
                    </>
                  )}
                </span>
                <ChevronRight className="size-5 text-muted" aria-hidden />
              </Link>
            </div>

            <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {LINKS.map((l) => {
                const active = isActive(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={closeDrawer}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3.5 rounded-2xl px-3 py-3 text-[15px] font-medium transition active:scale-[0.98] ${
                        active ? "bg-navy text-white shadow-md" : "text-ink hover:bg-navy-50"
                      }`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${active ? "bg-white/15" : "bg-navy-50 text-navy group-hover:bg-white"}`}>
                        <l.icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="flex-1">{l.label}</span>
                      <ChevronRight className={`size-4 ${active ? "text-white/70" : "text-muted/60"}`} aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              <Link
                href="/reservar"
                onClick={closeDrawer}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-navy py-3.5 font-semibold text-white shadow-[0_8px_20px_-8px_rgb(31_56_100/0.6)] transition active:scale-[0.98]"
              >
                <Plane className="size-5" aria-hidden /> Reservar vuelo
              </Link>
              <p className="mt-3 text-center text-[11px] text-muted">{BRAND.disclaimer}</p>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}
