"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Download, Gem, Plane, Send, UsersRound } from "lucide-react";
import { B2B, SEASONS } from "@/config/site";
import { addDays, formatDateLong, todayISO } from "@/lib/dates";
import { seasonOf } from "@/lib/flights";
import { formatEUR, round2 } from "@/lib/format";
import { uid } from "@/lib/random";
import { downloadB2BProposal } from "@/lib/documents";
import type { B2BRequest } from "@/lib/types";
import { validateEmail, validateName, validatePhone, validateTaxId, required } from "@/lib/validation";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/Button";
import { Checkbox, Counter, TextArea, TextField, announce, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Card } from "@/components/ui/Primitives";

type Draft = Omit<B2BRequest, "id" | "createdAt" | "estimate">;

const initial: Draft = {
  eventType: "",
  format: "privada",
  roundTrip: true,
  preferredDate: "",
  alternativeDate: "",
  guests: 10,
  customMenu: true,
  branding: false,
  transfers: false,
  notes: "",
  company: { name: "", nif: "", sector: "" },
  contact: { name: "", role: "", email: "", phone: "" },
};

export function estimateB2B(d: Draft) {
  const legs = d.roundTrip ? 2 : 1;
  const f = B2B.formats[d.format];
  const fare = SEASONS[d.preferredDate ? seasonOf(d.preferredDate) : "media"].fare;
  const lines: { label: string; amount: number }[] = [{ label: `${f.label} · ${legs} ${legs > 1 ? "trayectos" : "trayecto"}`, amount: f.pricePerLeg * legs }];
  if (d.format === "privada") lines.push({ label: `Billetes · ${d.guests} invitados × ${legs} × ${fare} €`, amount: d.guests * fare * legs });
  if (d.customMenu) lines.push({ label: `${B2B.extras.customMenu.label} · ${d.guests} pax`, amount: B2B.extras.customMenu.pricePerGuest * d.guests * (d.format === "privada" ? legs : 1) });
  if (d.branding) lines.push({ label: B2B.extras.branding.label, amount: B2B.extras.branding.price });
  if (d.transfers) lines.push({ label: `${B2B.extras.transfers.label} · ${d.guests} pax`, amount: B2B.extras.transfers.pricePerGuest * d.guests });
  return { lines, total: round2(lines.reduce((s, l) => s + l.amount, 0)) };
}

const STEP_LABELS = ["Tipo de evento", "Formato", "Detalles", "Empresa y contacto"];

export function ProposalConfigurator() {
  const addRequest = useApp((s) => s.addB2BRequest);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(initial);
  const [sent, setSent] = useState<B2BRequest | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const v = useValidation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  const est = estimateB2B(d);
  const max = B2B.formats[d.format].maxGuests;
  const minDate = addDays(todayISO(), 7);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, sent]);

  const errorsByStep: Record<number, Record<string, string | null>> = {
    0: { eventType: d.eventType ? null : "Elige un tipo de evento." },
    1: {},
    2: {
      preferredDate: d.preferredDate ? (d.preferredDate < minDate ? "Necesitamos al menos 7 días de antelación." : null) : "La fecha preferida es obligatoria.",
      alternativeDate: d.alternativeDate && d.alternativeDate === d.preferredDate ? "La fecha alternativa debe ser distinta." : null,
    },
    3: {
      companyName: required(d.company.name, "La razón social"),
      nif: validateTaxId(d.company.nif),
      contactName: validateName(d.contact.name, "El nombre de contacto"),
      email: validateEmail(d.contact.email),
      phone: validatePhone(d.contact.phone),
    },
  };
  const errs = errorsByStep[step];

  const next = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errs).some(Boolean)) {
      announce("Revisa los campos marcados.", 0);
      return focusFirstInvalid(e.currentTarget);
    }
    v.reset();
    if (step < 3) return setStep(step + 1);
    const req: B2BRequest = { ...d, id: uid("prop"), createdAt: new Date().toISOString(), estimate: est.total };
    addRequest(req);
    setSent(req);
    announce("Solicitud enviada. Un gestor comercial te contactará en 24 horas.", 0);
  };

  const setGuests = (guests: number) => setD({ ...d, guests: Math.min(Math.max(2, guests), max) });

  if (sent) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
        <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl text-navy focus:outline-none">
          ¡Solicitud enviada!
        </h2>
        <p className="mt-2 text-lg">Un gestor comercial te contactará en 24 h.</p>
        <p className="mt-1 text-sm text-muted">
          Referencia {sent.id.toUpperCase()} · Estimación {formatEUR(sent.estimate)} · Enviada a {sent.contact.email} (simulado)
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            loading={pdfBusy}
            onClick={async () => {
              setPdfBusy(true);
              try {
                await downloadB2BProposal(sent);
              } finally {
                setPdfBusy(false);
              }
            }}
            icon={<Download className="size-4" aria-hidden />}
          >
            Descargar propuesta resumida (PDF)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setD(initial);
              setStep(0);
              setSent(null);
            }}
          >
            Nueva solicitud
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={next} noValidate className="min-w-0 space-y-6">
        <nav aria-label="Progreso de la propuesta">
          <ol className="flex gap-2">
            {STEP_LABELS.map((l, i) => (
              <li key={l} className="flex-1" aria-current={i === step ? "step" : undefined}>
                <div className={`h-1.5 rounded-full ${i <= step ? "bg-linear-to-r from-pink to-amber" : "bg-line"}`} aria-hidden />
                <p className={`mt-2 hidden text-xs font-medium sm:block ${i === step ? "text-navy" : "text-muted"}`}>
                  {i + 1}. {l}
                </p>
              </li>
            ))}
          </ol>
        </nav>
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl text-navy focus:outline-none">
          <span className="text-base font-semibold text-pink-700">Paso {step + 1} de 4 · </span>
          {STEP_LABELS[step]}
        </h2>

        {step === 0 && (
          <fieldset>
            <legend className="mb-3 text-sm text-muted">¿Qué quieres celebrar a bordo?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {B2B.eventTypes.map((t) => (
                <label
                  key={t.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-4 font-medium transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${d.eventType === t.id ? "border-navy bg-navy-50 text-navy" : "border-line hover:border-navy/30"}`}
                >
                  <input
                    type="radio"
                    name="eventType"
                    className="size-4 accent-navy"
                    checked={d.eventType === t.id}
                    onChange={() => setD({ ...d, eventType: t.id })}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            {v.submitted && errs.eventType && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {errs.eventType}
              </p>
            )}
          </fieldset>
        )}

        {step === 1 && (
          <>
            <fieldset>
              <legend className="mb-3 text-sm text-muted">Elige el formato</legend>
              <div className="grid gap-4 md:grid-cols-2">
                {(Object.keys(B2B.formats) as (keyof typeof B2B.formats)[]).map((k) => {
                  const f = B2B.formats[k];
                  const Icon = k === "privada" ? Gem : Plane;
                  return (
                    <label
                      key={k}
                      className={`flex cursor-pointer flex-col rounded-3xl border-2 bg-white p-6 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${d.format === k ? "border-navy shadow-[var(--shadow-lift)]" : "border-line hover:border-navy/30"}`}
                    >
                      <input
                        type="radio"
                        name="format"
                        className="visually-hidden"
                        checked={d.format === k}
                        onChange={() => setD({ ...d, format: k, guests: Math.min(d.guests, f.maxGuests), customMenu: k === "privada" ? d.customMenu : d.customMenu })}
                      />
                      <Icon className="size-8 text-pink-700" aria-hidden />
                      <span className="mt-3 font-display text-xl font-bold text-navy">{f.label}</span>
                      <span className="mt-1 font-semibold text-navy">
                        {k === "privada" ? `+${formatEUR(f.pricePerLeg)}/trayecto + billetes` : `${formatEUR(f.pricePerLeg)}/trayecto`}
                      </span>
                      <span className="mt-2 text-sm text-muted">{f.description}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Checkbox label="Ida y vuelta" description="Desmarca si solo necesitas un trayecto." checked={d.roundTrip} onChange={(e) => setD({ ...d, roundTrip: e.target.checked })} />
          </>
        )}

        {step === 2 && (
          <Card className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Fecha preferida"
                type="date"
                required
                min={minDate}
                value={d.preferredDate}
                onChange={(e) => setD({ ...d, preferredDate: e.target.value })}
                onBlur={() => v.touch("preferredDate")}
                error={errs.preferredDate}
                showError={v.shouldShow("preferredDate")}
                hint={d.preferredDate ? `${SEASONS[seasonOf(d.preferredDate)].label}` : "Mínimo 7 días de antelación"}
              />
              <TextField
                label="Fecha alternativa"
                type="date"
                min={minDate}
                value={d.alternativeDate}
                onChange={(e) => setD({ ...d, alternativeDate: e.target.value })}
                onBlur={() => v.touch("alternativeDate")}
                error={errs.alternativeDate}
                showError={v.shouldShow("alternativeDate")}
                hint="Opcional, por si la meteorología no acompaña"
              />
            </div>
            <Counter label="Número de invitados" description={`Entre 2 y ${max} personas`} value={d.guests} min={2} max={max} onChange={setGuests} />
            <div className="space-y-3 border-t border-line pt-4">
              <Checkbox
                label={`${B2B.extras.customMenu.label} (+${B2B.extras.customMenu.pricePerGuest} €/pax)`}
                description={d.format === "charter" ? "El chárter incluye menú; esto lo personaliza con tu chef y maridaje." : "Menú diseñado con vuestro equipo: producto local y maridaje."}
                checked={d.customMenu}
                onChange={(e) => setD({ ...d, customMenu: e.target.checked })}
              />
              <Checkbox
                label={`${B2B.extras.branding.label} (+${formatEUR(B2B.extras.branding.price)})`}
                description="Vinilos, pantallas y detalles con la imagen de tu marca."
                checked={d.branding}
                onChange={(e) => setD({ ...d, branding: e.target.checked })}
              />
              <Checkbox
                label={`${B2B.extras.transfers.label} (+${B2B.extras.transfers.pricePerGuest} €/pax)`}
                description="Recogida en hotel u oficina en Girona y Palma."
                checked={d.transfers}
                onChange={(e) => setD({ ...d, transfers: e.target.checked })}
              />
            </div>
            <TextArea label="Comentarios (opcional)" rows={3} value={d.notes} onChange={(e) => setD({ ...d, notes: e.target.value })} hint="Horarios, necesidades técnicas, alergias…" />
          </Card>
        )}

        {step === 3 && (
          <Card className="space-y-6 p-6">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 flex items-center gap-2 font-semibold text-navy">
                <Building2 className="size-5" aria-hidden /> Empresa
              </legend>
              <TextField
                label="Razón social"
                required
                autoComplete="organization"
                value={d.company.name}
                onChange={(e) => setD({ ...d, company: { ...d.company, name: e.target.value } })}
                onBlur={() => v.touch("companyName")}
                error={errs.companyName}
                showError={v.shouldShow("companyName")}
              />
              <TextField
                label="NIF"
                required
                value={d.company.nif}
                onChange={(e) => setD({ ...d, company: { ...d.company, nif: e.target.value.toUpperCase() } })}
                onBlur={() => v.touch("nif")}
                error={errs.nif}
                showError={v.shouldShow("nif")}
                hint="p. ej. B12345678"
              />
              <TextField label="Sector" value={d.company.sector} onChange={(e) => setD({ ...d, company: { ...d.company, sector: e.target.value } })} wrapperClassName="sm:col-span-2" />
            </fieldset>
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 flex items-center gap-2 font-semibold text-navy">
                <UsersRound className="size-5" aria-hidden /> Persona de contacto
              </legend>
              <TextField
                label="Nombre y apellidos"
                required
                autoComplete="name"
                value={d.contact.name}
                onChange={(e) => setD({ ...d, contact: { ...d.contact, name: e.target.value } })}
                onBlur={() => v.touch("contactName")}
                error={errs.contactName}
                showError={v.shouldShow("contactName")}
              />
              <TextField label="Cargo" autoComplete="organization-title" value={d.contact.role} onChange={(e) => setD({ ...d, contact: { ...d.contact, role: e.target.value } })} />
              <TextField
                label="Email"
                type="email"
                required
                autoComplete="email"
                value={d.contact.email}
                onChange={(e) => setD({ ...d, contact: { ...d.contact, email: e.target.value } })}
                onBlur={() => v.touch("email")}
                error={errs.email}
                showError={v.shouldShow("email")}
              />
              <TextField
                label="Teléfono"
                type="tel"
                required
                autoComplete="tel"
                value={d.contact.phone}
                onChange={(e) => setD({ ...d, contact: { ...d.contact, phone: e.target.value } })}
                onBlur={() => v.touch("phone")}
                error={errs.phone}
                showError={v.shouldShow("phone")}
              />
            </fieldset>
          </Card>
        )}

        <div className="flex justify-between gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep(step - 1)} icon={<ArrowLeft className="size-4" aria-hidden />}>
              Volver
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" variant={step === 3 ? "accent" : "primary"} icon={step === 3 ? <Send className="size-4" aria-hidden /> : undefined}>
            {step === 3 ? "Solicitar propuesta" : "Continuar"}
            {step < 3 && <ArrowRight className="size-4" aria-hidden />}
          </Button>
        </div>
      </form>

      <aside aria-labelledby="estimate-title" className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-6">
          <h2 id="estimate-title" className="mb-4 text-lg text-navy">
            Estimación en tiempo real
          </h2>
          <ul className="space-y-2 text-sm">
            {est.lines.map((l) => (
              <li key={l.label} className="flex justify-between gap-3">
                <span>{l.label}</span>
                <span className="shrink-0 tabular-nums">{formatEUR(l.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl bg-pastel p-4">
            <p className="flex items-baseline justify-between">
              <span className="font-semibold text-navy">Total estimado</span>
              <span className="font-display text-2xl font-bold text-navy" aria-live="polite" aria-atomic>
                {formatEUR(est.total)}
              </span>
            </p>
            <p className="mt-1 text-xs text-muted">IVA incluido · {formatEUR(est.total / d.guests)} por invitado</p>
          </div>
          {d.preferredDate && <p className="mt-3 text-xs first-letter:uppercase text-muted">{formatDateLong(d.preferredDate)}</p>}
          <p className="mt-3 text-xs text-muted">Precio orientativo. La propuesta final dependerá de la disponibilidad y la meteorología.</p>
        </Card>
      </aside>
    </div>
  );
}
