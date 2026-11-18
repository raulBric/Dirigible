"use client";

import { useEffect, useRef } from "react";
import { STEPS, useBooking, type StepId } from "@/store/booking";
import { ProgressBar } from "./ProgressBar";
import { SummaryPanel } from "./SummaryPanel";
import { StepSearchForm } from "./SearchForm";
import { StepFlights } from "./StepFlights";
import { StepPassengers } from "./StepPassengers";
import { StepSeatsExtras } from "./StepSeatsExtras";
import { StepPayment } from "./StepPayment";
import { StepConfirmation } from "./StepConfirmation";

const TITLES: Record<StepId, { title: string; subtitle: string }> = {
  1: { title: "¿Cuándo quieres volar?", subtitle: "Elige ruta, fechas y pasajeros. El calendario muestra el precio desde por adulto." },
  2: { title: "Elige tu vuelo", subtitle: "Precios por trayecto con IVA incluido. Capacidad: 50 pasajeros." },
  3: { title: "¿Quién viaja?", subtitle: "Introduce los datos tal y como aparecen en el documento de identidad." },
  4: { title: "Asientos y extras", subtitle: "Personaliza tu experiencia a bordo." },
  5: { title: "Revisión y pago", subtitle: "Comprueba que todo está correcto antes de pagar." },
  6: { title: "¡Buen viaje!", subtitle: "Tu reserva está confirmada." },
};

export function BookingFlow() {
  const step = useBooking((s) => s.step);
  const setStep = useBooking((s) => s.setStep);
  const goNext = useBooking((s) => s.goNext);
  const outboundId = useBooking((s) => s.outboundId);
  const confirmed = useBooking((s) => s.confirmedLocator);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Coherencia: no se puede estar en un paso posterior sin haber elegido vuelo
  useEffect(() => {
    if (step >= 3 && step < 6 && !outboundId) setStep(2);
    if (step === 6 && !confirmed) setStep(1);
  }, [step, outboundId, confirmed, setStep]);

  // Al cambiar de paso: foco al título del paso y scroll arriba
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const back = () => setStep(Math.max(1, step - 1) as StepId);
  const t = TITLES[step];

  return (
    <div className="bg-pastel-soft pb-28 lg:pb-16">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <ProgressBar />
        <div className={`grid gap-8 ${step < 6 ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
          <div className="min-w-0">
            <header className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-700">
                Paso {step} de {STEPS.length} · {STEPS[step - 1].label}
              </p>
              <h1 ref={headingRef} id="step-title" tabIndex={-1} className="mt-1 text-3xl text-navy outline-none focus:outline-none focus-visible:outline-none sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-2 text-muted">{t.subtitle}</p>
            </header>
            {step === 1 && <StepSearchForm onDone={goNext} />}
            {step === 2 && <StepFlights onBack={back} onNext={goNext} />}
            {step === 3 && <StepPassengers onBack={back} onNext={goNext} />}
            {step === 4 && <StepSeatsExtras onBack={back} onNext={goNext} />}
            {step === 5 && <StepPayment onBack={back} />}
            {step === 6 && <StepConfirmation />}
          </div>
          {step < 6 && <SummaryPanel />}
        </div>
      </div>
    </div>
  );
}
