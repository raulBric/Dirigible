"use client";

import { Check } from "lucide-react";
import { STEPS, useBooking, type StepId } from "@/store/booking";

export function ProgressBar() {
  const step = useBooking((s) => s.step);
  const maxStep = useBooking((s) => s.maxStep);
  const setStep = useBooking((s) => s.setStep);
  const confirmed = useBooking((s) => s.confirmedLocator);
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Progreso de la reserva" className="mb-8">
      <p className="mb-3 text-sm font-medium text-muted sm:hidden">
        Paso {step} de {STEPS.length}: <span className="text-navy">{STEPS[step - 1].label}</span>
      </p>
      <div className="relative">
        <div className="absolute left-4 right-4 top-4 hidden h-1 rounded-full bg-line sm:block" aria-hidden>
          <div className="h-full rounded-full bg-linear-to-r from-pink to-amber transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line sm:hidden" aria-hidden>
          <div className="h-full rounded-full bg-linear-to-r from-pink to-amber transition-[width] duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} />
        </div>
        <ol className="relative hidden justify-between sm:flex">
          {STEPS.map((s) => {
            const done = s.id < step;
            const current = s.id === step;
            // Se puede volver a pasos ya visitados (no después de pagar)
            const reachable = !confirmed && s.id <= maxStep && s.id !== step && s.id < 6;
            const circle = (
              <span
                className={`grid size-9 place-items-center rounded-full text-sm font-bold transition ${
                  current ? "bg-navy text-white ring-4 ring-navy/15" : done ? "bg-pink text-navy-700" : "bg-white text-muted ring-1 ring-line"
                }`}
              >
                {done ? <Check className="size-4" aria-hidden /> : s.id}
              </span>
            );
            const text = <span className={`mt-2 text-xs font-medium ${current ? "text-navy" : "text-muted"}`}>{s.label}</span>;
            return (
              <li key={s.id} className="flex w-24 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                {reachable ? (
                  <button type="button" onClick={() => setStep(s.id as StepId)} className="flex flex-col items-center rounded-xl">
                    {circle}
                    {text}
                    <span className="visually-hidden">{done ? " (completado, volver a este paso)" : " (volver a este paso)"}</span>
                  </button>
                ) : (
                  <>
                    {circle}
                    {text}
                    {done && <span className="visually-hidden"> (completado)</span>}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
