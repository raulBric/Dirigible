"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Briefcase, LogIn, Sparkles, UserRound } from "lucide-react";
import type { DocType, Passenger } from "@/lib/types";
import type { ISODate } from "@/lib/dates";
import { PAX_LABEL } from "@/lib/pricing";
import { validateBirthDate, validateDocument, validateEmail, validateName, validatePhone, validateTaxId, required } from "@/lib/validation";
import { useCurrentUser } from "@/store/app";
import { useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Checkbox, SelectField, TextArea, TextField, announce, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Notice } from "@/components/ui/Primitives";
import { LoginDialog } from "@/components/account/AuthForms";

const NATIONALITIES = ["Española", "Alemana", "Británica", "Francesa", "Italiana", "Neerlandesa", "Portuguesa", "Estadounidense", "Otra"];

export function passengerErrors(p: Passenger, travelDate: ISODate | null) {
  return {
    firstName: validateName(p.firstName, "El nombre"),
    lastName: validateName(p.lastName, "Los apellidos"),
    birthDate: validateBirthDate(p.birthDate, p.type, travelDate),
    docNumber: validateDocument(p.docType, p.docNumber),
    nationality: required(p.nationality, "La nacionalidad"),
  };
}

export function StepPassengers({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const passengers = useBooking((s) => s.passengers);
  const update = useBooking((s) => s.updatePassenger);
  const contact = useBooking((s) => s.contact);
  const setContact = useBooking((s) => s.setContact);
  const wantsInvoice = useBooking((s) => s.wantsInvoice);
  const setWantsInvoice = useBooking((s) => s.setWantsInvoice);
  const invoice = useBooking((s) => s.invoice);
  const setInvoice = useBooking((s) => s.setInvoice);
  const departDate = useBooking((s) => s.search.departDate);
  const user = useCurrentUser();
  const [loginOpen, setLoginOpen] = useState(false);
  const v = useValidation();

  const paxErrors = passengers.map((p) => passengerErrors(p, departDate));
  const contactErrors = { email: validateEmail(contact.email), phone: validatePhone(contact.phone) };
  const invoiceErrors = wantsInvoice
    ? {
        companyName: required(invoice.companyName, "La razón social"),
        nif: validateTaxId(invoice.nif),
        address: required(invoice.address, "La dirección fiscal"),
      }
    : { companyName: null, nif: null, address: null };

  const fillFromUser = (u = user) => {
    if (!u) return;
    const firstAdult = passengers.findIndex((p) => p.type === "adult");
    if (firstAdult >= 0) {
      update(firstAdult, {
        firstName: u.firstName,
        lastName: u.lastName,
        birthDate: u.birthDate,
        docType: u.docType,
        docNumber: u.docNumber,
        nationality: u.nationality,
      });
    }
    setContact({ email: u.email, phone: u.phone });
    announce("Datos del titular completados con tu perfil.");
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    const hasErrors =
      paxErrors.some((pe) => Object.values(pe).some(Boolean)) || Object.values(contactErrors).some(Boolean) || Object.values(invoiceErrors).some(Boolean);
    if (hasErrors) {
      announce("Hay campos por revisar. Te llevamos al primero.", 0);
      return focusFirstInvalid(e.currentTarget);
    }
    onNext();
  };

  let adultN = 0;
  let childN = 0;
  let infantN = 0;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {user ? (
        <Notice tone="success" icon={Sparkles} title={`Hola, ${user.firstName}`}>
          Acumularás Wind Points con esta reserva (saldo actual: {user.points} puntos).{" "}
          <button type="button" onClick={() => fillFromUser()} className="font-semibold underline underline-offset-2">
            Rellenar con mis datos
          </button>
        </Notice>
      ) : (
        <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">
            <strong className="text-navy">¿Tienes cuenta?</strong> Inicia sesión para autocompletar tus datos y acumular Wind Points.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setLoginOpen(true)} icon={<LogIn className="size-4" aria-hidden />}>
            Iniciar sesión
          </Button>
        </div>
      )}
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={(u) => fillFromUser(u)} />

      {passengers.map((p, i) => {
        const n = p.type === "adult" ? ++adultN : p.type === "child" ? ++childN : ++infantN;
        const errs = paxErrors[i];
        const key = (f: string) => `p${i}-${f}`;
        const bind = (f: keyof typeof errs) => ({
          onBlur: () => v.touch(key(f)),
          error: errs[f],
          showError: v.shouldShow(key(f)),
          required: true,
        });
        return (
          <fieldset key={i} className="card p-5 sm:p-6">
            <legend className="sr-only">
              {PAX_LABEL[p.type]} {n}
            </legend>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-lg text-navy" aria-hidden>
                <UserRound className="size-5 text-pink-700" />
                {PAX_LABEL[p.type]} {n}
                {i === 0 && <span className="text-sm font-normal text-muted">· titular</span>}
              </h3>
              {user && user.frequentPassengers.length > 0 && (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted">Pasajero frecuente:</span>
                  <select
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-navy"
                    value=""
                    onChange={(e) => {
                      const fp = user.frequentPassengers.find((x) => x.id === e.target.value);
                      if (fp) {
                        const { id: _id, ...data } = fp;
                        void _id;
                        update(i, data);
                        announce(`Datos de ${fp.firstName} aplicados.`);
                      }
                    }}
                  >
                    <option value="">Elegir…</option>
                    {user.frequentPassengers.map((fp) => (
                      <option key={fp.id} value={fp.id}>
                        {fp.firstName} {fp.lastName}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nombre" autoComplete={i === 0 ? "given-name" : "off"} value={p.firstName} onChange={(e) => update(i, { firstName: e.target.value })} {...bind("firstName")} />
              <TextField label="Apellidos" autoComplete={i === 0 ? "family-name" : "off"} value={p.lastName} onChange={(e) => update(i, { lastName: e.target.value })} {...bind("lastName")} />
              <TextField
                label="Fecha de nacimiento"
                type="date"
                autoComplete={i === 0 ? "bday" : "off"}
                value={p.birthDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => update(i, { birthDate: e.target.value })}
                hint={p.type === "adult" ? "12 años o más el día del vuelo" : p.type === "child" ? "Entre 2 y 11 años el día del vuelo" : "Menos de 2 años el día del vuelo"}
                {...bind("birthDate")}
              />
              <SelectField label="Nacionalidad" value={p.nationality} onChange={(e) => update(i, { nationality: e.target.value })} {...bind("nationality")}>
                {NATIONALITIES.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </SelectField>
              <SelectField label="Tipo de documento" value={p.docType} onChange={(e) => update(i, { docType: e.target.value as DocType })} required>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="Pasaporte">Pasaporte</option>
              </SelectField>
              <TextField
                label="Número de documento"
                value={p.docNumber}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                onChange={(e) => update(i, { docNumber: e.target.value.toUpperCase() })}
                hint={p.docType === "DNI" ? "8 números y letra, p. ej. 12345678Z" : p.docType === "NIE" ? "X, Y o Z + 7 números + letra" : "6 a 9 letras o números"}
                {...bind("docNumber")}
              />
            </div>
            <Checkbox
              className="mt-4"
              label="Necesito asistencia (movilidad reducida)"
              description="Te acompañaremos desde el mostrador hasta tu butaca, sin coste."
              checked={p.assistance}
              onChange={(e) => update(i, { assistance: e.target.checked })}
            />
          </fieldset>
        );
      })}

      <fieldset className="card p-5 sm:p-6">
        <legend className="sr-only">Datos de contacto</legend>
        <h3 className="mb-1 text-lg text-navy" aria-hidden>
          Datos de contacto del titular
        </h3>
        <p className="mb-5 text-sm text-muted">Te enviaremos la confirmación y cualquier aviso meteorológico.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={contact.email}
            onChange={(e) => setContact({ email: e.target.value })}
            onBlur={() => v.touch("email")}
            error={contactErrors.email}
            showError={v.shouldShow("email")}
          />
          <TextField
            label="Teléfono"
            type="tel"
            autoComplete="tel"
            required
            value={contact.phone}
            onChange={(e) => setContact({ phone: e.target.value })}
            onBlur={() => v.touch("phone")}
            error={contactErrors.phone}
            showError={v.shouldShow("phone")}
            hint="Con prefijo si no es español, p. ej. +44…"
          />
        </div>
        <Checkbox
          className="mt-5"
          label={
            <span className="inline-flex items-center gap-2">
              <Briefcase className="size-4 text-navy" aria-hidden /> Viajo por trabajo (quiero factura)
            </span>
          }
          checked={wantsInvoice}
          onChange={(e) => setWantsInvoice(e.target.checked)}
          aria-expanded={wantsInvoice}
          aria-controls="invoice-fields"
        />
        <div id="invoice-fields" hidden={!wantsInvoice} className="mt-4 grid gap-4 rounded-2xl bg-navy-50/60 p-4 sm:grid-cols-2">
          {wantsInvoice && (
            <>
              <TextField
                label="Razón social"
                autoComplete="organization"
                required
                value={invoice.companyName}
                onChange={(e) => setInvoice({ companyName: e.target.value })}
                onBlur={() => v.touch("companyName")}
                error={invoiceErrors.companyName}
                showError={v.shouldShow("companyName")}
              />
              <TextField
                label="NIF"
                required
                autoCapitalize="characters"
                value={invoice.nif}
                onChange={(e) => setInvoice({ nif: e.target.value.toUpperCase() })}
                onBlur={() => v.touch("nif")}
                error={invoiceErrors.nif}
                showError={v.shouldShow("nif")}
                hint="p. ej. B12345678"
              />
              <TextArea
                label="Dirección fiscal"
                autoComplete="street-address"
                required
                wrapperClassName="sm:col-span-2"
                rows={2}
                value={invoice.address}
                onChange={(e) => setInvoice({ address: e.target.value })}
                onBlur={() => v.touch("address")}
                error={invoiceErrors.address}
                showError={v.shouldShow("address")}
              />
            </>
          )}
        </div>
      </fieldset>

      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="size-4" aria-hidden />}>
          Volver
        </Button>
        <Button type="submit">
          Continuar a asientos y extras <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
}
