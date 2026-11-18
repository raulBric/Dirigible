"use client";

import Link from "next/link";
import { useState } from "react";
import { Cookie } from "lucide-react";
import { useApp } from "@/store/app";
import { useHydrated } from "@/components/ui/ClientOnly";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";

export function CookiePreferences({ onDone }: { onDone?: () => void }) {
  const consent = useApp((s) => s.cookieConsent);
  const setConsent = useApp((s) => s.setCookieConsent);
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [marketing, setMarketing] = useState(consent?.marketing ?? false);
  const save = (a: boolean, m: boolean) => {
    setConsent({ necessary: true, analytics: a, marketing: m, decidedAt: new Date().toISOString() });
    onDone?.();
  };
  return (
    <div className="space-y-4">
      <Checkbox label="Técnicas (necesarias)" description="Guardan tu reserva en curso, tu sesión y esta preferencia. No se pueden desactivar." checked disabled readOnly />
      <Checkbox label="Analíticas" description="Nos ayudarían a medir el uso del sitio (en este prototipo no se carga ninguna)." checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
      <Checkbox label="Marketing" description="Permitirían mostrarte ofertas personalizadas (en este prototipo no se carga ninguna)." checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
      <div className="flex flex-wrap gap-3 pt-2">
        <Button onClick={() => save(analytics, marketing)}>Guardar preferencias</Button>
        <Button variant="secondary" onClick={() => save(true, true)}>
          Aceptar todas
        </Button>
      </div>
    </div>
  );
}

/** Banner no bloqueante: no impide usar la página mientras el usuario decide. */
export function CookieBanner() {
  const hydrated = useHydrated();
  const consent = useApp((s) => s.cookieConsent);
  const setConsent = useApp((s) => s.setCookieConsent);
  const [configOpen, setConfigOpen] = useState(false);

  if (!hydrated || consent) return null;
  const decide = (all: boolean) => setConsent({ necessary: true, analytics: all, marketing: all, decidedAt: new Date().toISOString() });

  return (
    <>
      <section
        aria-label="Aviso de cookies"
        className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl animate-fade-up rounded-3xl bg-white p-5 shadow-[var(--shadow-lift)] ring-1 ring-line sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Cookie className="hidden size-10 shrink-0 text-amber sm:block" aria-hidden />
          <p className="text-sm leading-relaxed text-ink">
            Usamos almacenamiento local técnico para guardar tu reserva y tu sesión. Con tu permiso, usaríamos también cookies analíticas y de marketing.{" "}
            <Link href="/cookies" className="font-medium text-navy underline underline-offset-2">
              Más información
            </Link>
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfigOpen(true)}>
              Configurar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => decide(false)}>
              Solo necesarias
            </Button>
            <Button size="sm" onClick={() => decide(true)}>
              Aceptar todas
            </Button>
          </div>
        </div>
      </section>
      <Modal open={configOpen} onClose={() => setConfigOpen(false)} title="Preferencias de cookies" size="sm">
        <CookiePreferences onDone={() => setConfigOpen(false)} />
      </Modal>
    </>
  );
}

export function CookieSettingsButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-white/75 underline-offset-4 transition hover:text-white hover:underline">
        Configurar cookies
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Preferencias de cookies" size="sm">
        {open && <CookiePreferences onDone={() => setOpen(false)} />}
      </Modal>
    </>
  );
}
