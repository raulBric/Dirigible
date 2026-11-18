"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, CreditCard, Loader2, Lock, RefreshCw, ShieldCheck, Smartphone, Wallet, XCircle } from "lucide-react";
import { AIRPORTS, BRAND, EXTRAS, MENUS, PRICING, SEATING } from "@/config/site";
import { formatDateShort } from "@/lib/dates";
import { formatEUR } from "@/lib/format";
import { autoAssignSeats, snapshot } from "@/lib/bookings";
import { computeQuote, PAX_LABEL, paxPrice, pointsEarnedFor, normalizePromo } from "@/lib/pricing";
import { generateLocator } from "@/lib/random";
import { formatCardNumber, validateCardNumber, validateCvc, validateExpiry, validateName, validatePhone } from "@/lib/validation";
import { isWindowSeat } from "@/lib/flights";
import type { Booking, PaymentMethod } from "@/lib/types";
import { useApp, useCurrentUser, useLocalOccupancy } from "@/store/app";
import { useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextField, announce, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Card, Notice } from "@/components/ui/Primitives";
import { useDraftQuote, useSelectedFlights } from "./useDraft";

const FAILING_CARD = "4000000000000002";

const METHODS: { id: PaymentMethod; label: string; icon: typeof CreditCard; hint: string }[] = [
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard, hint: "Visa, Mastercard, Amex" },
  { id: "bizum", label: "Bizum", icon: Smartphone, hint: "Pago con tu móvil" },
  { id: "paypal", label: "PayPal", icon: Wallet, hint: "Cuenta PayPal (demo)" },
  { id: "wallet", label: "Apple Pay / Google Pay", icon: Smartphone, hint: "Monedero del dispositivo" },
];

type PayState = "idle" | "processing" | "3ds" | "external" | "error";

function Review() {
  const passengers = useBooking((s) => s.passengers);
  const seats = useBooking((s) => s.seats);
  const extras = useBooking((s) => s.extras);
  const { legs } = useSelectedFlights();
  const quote = useDraftQuote();
  const seated = passengers.filter((p) => p.type !== "infant");

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-4 text-lg text-navy">Revisa tu reserva</h3>
      <div className="space-y-5">
        {legs.map((leg, li) => (
          <div key={leg.id}>
            <p className="mb-2 text-sm font-semibold text-pink-700">
              {li === 0 ? "Ida" : "Vuelta"} · {AIRPORTS[leg.origin].city} → {AIRPORTS[leg.destination].city} · {formatDateShort(leg.date)}, {leg.departure}–{leg.arrival}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="visually-hidden">Billetes del trayecto de {li === 0 ? "ida" : "vuelta"}</caption>
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th scope="col" className="py-1 font-medium">
                      Pasajero
                    </th>
                    <th scope="col" className="py-1 font-medium">
                      Asiento
                    </th>
                    <th scope="col" className="py-1 text-right font-medium">
                      Billete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, pi) => {
                    const si = seated.indexOf(p);
                    const seat = p.type === "infant" ? "En brazos" : (seats[li]?.[si] ?? "Asignación automática");
                    return (
                      <tr key={pi} className="border-t border-line">
                        <td className="py-2">
                          {p.firstName} {p.lastName} <span className="text-muted">· {PAX_LABEL[p.type]}</span>
                        </td>
                        <td className="py-2">
                          {seat}
                          {p.type !== "infant" && seats[li]?.[si] && isWindowSeat(seats[li][si]!) ? ` (+${SEATING.windowPrice} €)` : ""}
                        </td>
                        <td className="py-2 text-right tabular-nums">{formatEUR(paxPrice(leg.adultPrice, p.type))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {quote.extras > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-pink-700">Extras</p>
            <ul className="space-y-1 text-sm">
              {quote.lines
                .filter((l) => l.group === "extras")
                .map((l, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>{l.label}</span>
                    <span className="tabular-nums">{formatEUR(l.amount)}</span>
                  </li>
                ))}
            </ul>
            {extras.menus.some(Boolean) && (
              <p className="mt-1 text-xs text-muted">
                Menús: {extras.menus.filter(Boolean).map((m) => MENUS.find((x) => x.id === m)?.name).join(", ")}
              </p>
            )}
          </div>
        )}

        <dl className="space-y-1 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Billetes</dt>
            <dd className="tabular-nums">{formatEUR(quote.tickets)}</dd>
          </div>
          {quote.seats > 0 && (
            <div className="flex justify-between">
              <dt>Asientos ventanal</dt>
              <dd className="tabular-nums">{formatEUR(quote.seats)}</dd>
            </div>
          )}
          {quote.extras > 0 && (
            <div className="flex justify-between">
              <dt>Extras</dt>
              <dd className="tabular-nums">{formatEUR(quote.extras)}</dd>
            </div>
          )}
          {quote.lines
            .filter((l) => l.group === "descuentos")
            .map((l, i) => (
              <div key={i} className="flex justify-between text-success">
                <dt>
                  {l.label} {l.detail && <span className="text-xs">({l.detail})</span>}
                </dt>
                <dd className="tabular-nums">{formatEUR(l.amount)}</dd>
              </div>
            ))}
          <div className="flex justify-between text-muted">
            <dt>Base imponible</dt>
            <dd className="tabular-nums">{formatEUR(quote.taxBase)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>IVA ({PRICING.vatRate * 100} %)</dt>
            <dd className="tabular-nums">{formatEUR(quote.vat)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-navy">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatEUR(quote.total)}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

export function StepPayment({ onBack }: { onBack: () => void }) {
  const draft = useBooking();
  const user = useCurrentUser();
  const app = useApp();
  const local = useLocalOccupancy();
  const { legs } = useSelectedFlights();
  const quote = useDraftQuote();
  const v = useValidation();
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [bizumPhone, setBizumPhone] = useState(draft.contact.phone);
  const [state, setState] = useState<PayState>("idle");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const method = draft.paymentMethod;
  const errors = {
    terms: draft.acceptedTerms ? null : "Debes aceptar las condiciones de transporte.",
    privacy: draft.acceptedPrivacy ? null : "Debes aceptar la política de privacidad.",
    number: method === "tarjeta" ? validateCardNumber(card.number) : null,
    name: method === "tarjeta" ? validateName(card.name, "El titular") : null,
    exp: method === "tarjeta" ? validateExpiry(card.exp) : null,
    cvc: method === "tarjeta" ? validateCvc(card.cvc) : null,
    bizum: method === "bizum" ? validatePhone(bizumPhone) : null,
  };

  const finalize = () => {
    const seated = draft.passengers.filter((p) => p.type !== "infant").length;
    const snaps = legs.map(snapshot);
    const seats = autoAssignSeats(snaps, draft.seats, seated, local);
    const points = user ? Math.min(draft.pointsToRedeem, user.points) : 0;
    const finalQuote = computeQuote({
      legs: snaps,
      paxTypes: draft.passengers.map((p) => p.type),
      seats,
      extras: draft.extras,
      promoCode: draft.promoCode,
      pointsRedeemed: points,
    });
    const locator = generateLocator(app.bookings.map((b) => b.locator));
    const earned = pointsEarnedFor(finalQuote.total);
    const now = new Date().toISOString();
    const booking: Booking = {
      locator,
      createdAt: now,
      userId: user?.id ?? null,
      tripType: draft.search.tripType,
      legs: snaps,
      passengers: draft.passengers,
      contact: draft.contact,
      invoice: draft.wantsInvoice ? draft.invoice : null,
      seats,
      extras: draft.extras,
      promoCode: normalizePromo(draft.promoCode),
      pointsRedeemed: Math.round(finalQuote.pointsDiscount * 100),
      quote: finalQuote,
      paymentMethod: method,
      status: "confirmada",
      checkedIn: snaps.map(() => false),
      refundAmount: 0,
      pointsEarned: user ? earned : 0,
      history: [{ date: now, text: `Reserva pagada con ${METHODS.find((m) => m.id === method)?.label} (simulado)` }],
    };
    app.addBooking(booking);
    if (user) {
      if (booking.pointsRedeemed > 0) app.addPoints(user.id, -booking.pointsRedeemed, `Canje en reserva ${locator}`);
      app.addPoints(user.id, earned, `Reserva ${locator}`);
      // Guarda acompañantes como pasajeros frecuentes
      draft.passengers.slice(1).forEach((p) => {
        const exists = user.frequentPassengers.some((f) => f.docNumber === p.docNumber || (f.firstName === p.firstName && f.lastName === p.lastName));
        if (!exists && p.firstName) {
          app.saveFrequentPassenger(user.id, {
            firstName: p.firstName,
            lastName: p.lastName,
            birthDate: p.birthDate,
            docType: p.docType,
            docNumber: p.docNumber,
            nationality: p.nationality,
          });
        }
      });
    }
    draft.confirm(locator);
    announce(`Pago completado. Tu localizador es ${locator.split("").join(" ")}.`, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pay = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errors).some(Boolean)) {
      announce("Revisa los campos marcados antes de pagar.", 0);
      return focusFirstInvalid(e?.currentTarget ?? document);
    }
    setState("processing");
    setTimeout(() => {
      if (method === "tarjeta") {
        if (card.number.replace(/\s/g, "") === FAILING_CARD) {
          setState("error");
          announce("Pago rechazado.", 0);
          return;
        }
        setOtp("");
        setOtpError(null);
        setState("3ds");
      } else if (method === "bizum" || method === "paypal") {
        setState("external");
      } else {
        finalize();
      }
    }, 1600);
  };

  const confirm3ds = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Introduce los 6 dígitos del código.");
      return;
    }
    setState("processing");
    setTimeout(finalize, 1200);
  };

  const busy = state === "processing";

  return (
    <>
    <form onSubmit={pay} noValidate className="space-y-6">
      <Review />

      <Card className="space-y-3 p-5 sm:p-6">
        <Checkbox
          label={
            <>
              He leído y acepto las{" "}
              <Link href="/condiciones-de-transporte" target="_blank" className="text-navy underline underline-offset-2">
                condiciones de transporte
              </Link>
            </>
          }
          checked={draft.acceptedTerms}
          onChange={(e) => draft.setAccepted("acceptedTerms", e.target.checked)}
          error={errors.terms}
          showError={v.shouldShow("terms")}
          required
        />
        <Checkbox
          label={
            <>
              He leído y acepto la{" "}
              <Link href="/privacidad" target="_blank" className="text-navy underline underline-offset-2">
                política de privacidad
              </Link>
            </>
          }
          checked={draft.acceptedPrivacy}
          onChange={(e) => draft.setAccepted("acceptedPrivacy", e.target.checked)}
          error={errors.privacy}
          showError={v.shouldShow("privacy")}
          required
        />
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="mb-1 flex items-center gap-2 text-lg text-navy">
          <Lock className="size-5" aria-hidden /> Pago seguro (simulado)
        </h3>
        <p className="mb-5 text-sm text-muted">No se realiza ningún cargo real. Para probar un rechazo, usa la tarjeta 4000 0000 0000 0002.</p>

        <fieldset>
          <legend className="visually-hidden">Método de pago</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => (
              <label
                key={m.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${method === m.id ? "border-navy bg-navy-50" : "border-line hover:border-navy/30"}`}
              >
                <input type="radio" name="method" className="visually-hidden" checked={method === m.id} onChange={() => draft.setPaymentMethod(m.id)} />
                <m.icon className="size-6 text-navy" aria-hidden />
                <span>
                  <span className="block font-semibold text-navy">{m.label}</span>
                  <span className="text-xs text-muted">{m.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5">
          {method === "tarjeta" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                wrapperClassName="sm:col-span-2"
                label="Número de tarjeta"
                inputMode="numeric"
                autoComplete="cc-number"
                maxLength={23}
                required
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                onBlur={() => v.touch("number")}
                error={errors.number}
                showError={v.shouldShow("number")}
                placeholder="4242 4242 4242 4242"
              />
              <TextField
                wrapperClassName="sm:col-span-2"
                label="Titular de la tarjeta"
                autoComplete="cc-name"
                required
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                onBlur={() => v.touch("name")}
                error={errors.name}
                showError={v.shouldShow("name")}
              />
              <TextField
                label="Caducidad"
                hint="Formato: MM/AA"
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={5}
                required
                value={card.exp}
                onChange={(e) => {
                  let x = e.target.value.replace(/[^\d/]/g, "");
                  if (/^\d{2}$/.test(x) && card.exp.length < x.length) x += "/";
                  setCard({ ...card, exp: x.slice(0, 5) });
                }}
                onBlur={() => v.touch("exp")}
                error={errors.exp}
                showError={v.shouldShow("exp")}
              />
              <TextField
                label="Código de seguridad (CVC)"
                hint="3 o 4 dígitos al dorso"
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
                required
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "") })}
                onBlur={() => v.touch("cvc")}
                error={errors.cvc}
                showError={v.shouldShow("cvc")}
              />
            </div>
          )}
          {method === "bizum" && (
            <TextField
              label="Teléfono asociado a Bizum"
              type="tel"
              autoComplete="tel"
              required
              value={bizumPhone}
              onChange={(e) => setBizumPhone(e.target.value)}
              onBlur={() => v.touch("bizum")}
              error={errors.bizum}
              showError={v.shouldShow("bizum")}
            />
          )}
          {method === "paypal" && <Notice tone="info">Al pagar se abrirá una ventana simulada de PayPal para confirmar el cargo.</Notice>}
          {method === "wallet" && (
            <div className="flex flex-wrap gap-3">
              <Button type="submit" className="!bg-black !text-white" disabled={busy}>
                Apple Pay · demo
              </Button>
              <Button type="submit" variant="secondary" disabled={busy}>
                Google Pay · demo
              </Button>
            </div>
          )}
        </div>

        {state === "error" && (
          <div role="alert" className="mt-5 flex flex-col gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 font-semibold text-danger">
              <XCircle className="size-5" aria-hidden /> Pago rechazado. Tu banco no ha autorizado la operación.
            </p>
            <Button variant="danger" size="sm" onClick={() => setState("idle")} icon={<RefreshCw className="size-4" aria-hidden />}>
              Reintentar
            </Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onBack} disabled={busy} icon={<ArrowLeft className="size-4" aria-hidden />}>
          Volver
        </Button>
        {method !== "wallet" && (
          <Button type="submit" size="lg" loading={busy} icon={<ShieldCheck className="size-5" aria-hidden />}>
            {busy ? "Procesando pago…" : `Pagar ${formatEUR(quote.total)}`}
          </Button>
        )}
      </div>
      <p className="text-center text-xs text-muted">
        Al pagar recibirás la confirmación por email (simulado). {EXTRAS.insurance.label}: {draft.extras.insurance ? "incluido" : "no incluido"}.
      </p>
    </form>

      {busy && (
        <div role="status" className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
          <div className="card flex flex-col items-center gap-3 p-8 text-center">
            <Loader2 className="size-10 animate-spin text-navy" aria-hidden />
            <p className="font-semibold text-navy">Procesando el pago…</p>
            <p className="text-sm text-muted">No cierres ni recargues la página.</p>
          </div>
        </div>
      )}

      <Modal open={state === "3ds"} onClose={() => state === "3ds" && setState("idle")} title="Verificación 3-D Secure" description="Simulación de la autenticación de tu banco." size="sm">
        <form onSubmit={confirm3ds} noValidate className="space-y-4">
          <p className="text-sm">
            Hemos enviado un código a tu móvil para autorizar un pago de <strong>{formatEUR(quote.total)}</strong> a {BRAND.name}.
          </p>
          <TextField
            label="Código de verificación"
            hint="Demo: introduce cualquier código de 6 dígitos, p. ej. 123456"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              setOtpError(null);
            }}
            error={otpError}
            showError={Boolean(otpError)}
          />
          <Button type="submit" className="w-full">
            Confirmar pago
          </Button>
        </form>
      </Modal>

      <Modal
        open={state === "external"}
        onClose={() => state === "external" && setState("idle")}
        title={method === "bizum" ? "Confirma el pago en tu app" : "PayPal (simulado)"}
        description="Simulación de la confirmación externa."
        size="sm"
      >
        <div className="space-y-4 text-sm">
          <p>
            {method === "bizum"
              ? `Hemos enviado una solicitud de ${formatEUR(quote.total)} al ${bizumPhone}. Confírmala en tu app bancaria.`
              : `Inicia sesión en PayPal y autoriza el pago de ${formatEUR(quote.total)}.`}
          </p>
          <div className="flex gap-3">
            <Button
              className="flex-1"
              autoFocus
              onClick={() => {
                setState("processing");
                setTimeout(finalize, 1000);
              }}
            >
              Autorizar pago
            </Button>
            <Button variant="secondary" onClick={() => setState("idle")}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
