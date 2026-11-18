"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { create } from "zustand";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  CloudLightning,
  Eye,
  FileText,
  PlusCircle,
  RotateCcw,
  Ticket,
  Undo2,
} from "lucide-react";
import { AIRPORTS, CANCELLATION_POLICY, EXTRAS, MENUS, type MenuId } from "@/config/site";
import { formatDateLong, formatDateShort, formatDateTime, todayISO, type ISODate } from "@/lib/dates";
import { flightsFor } from "@/lib/flights";
import { formatEUR } from "@/lib/format";
import { autoAssignSeats, snapshot } from "@/lib/bookings";
import { checkInWindow, computeQuote, isPastBooking, PAX_LABEL, paxPrice, refundFor } from "@/lib/pricing";
import { downloadBoardingPasses, downloadICS, downloadInvoice } from "@/lib/documents";
import type { Booking, Extras, Flight } from "@/lib/types";
import { localOccupancy, useApp } from "@/store/app";
import { Button } from "@/components/ui/Button";
import { Checkbox, Counter, announce } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { Badge, Card, Notice } from "@/components/ui/Primitives";
import { PriceCalendar } from "@/components/booking/PriceCalendar";
import { EmailPreview } from "@/components/booking/StepConfirmation";

const STATUS: Record<Booking["status"], { label: string; tone: "green" | "red" | "amber" | "gray" }> = {
  confirmada: { label: "Confirmada", tone: "green" },
  cancelada: { label: "Cancelada", tone: "gray" },
  cancelada_meteo: { label: "Cancelada por meteorología", tone: "red" },
  reembolsada: { label: "Reembolsada", tone: "gray" },
};

const seatedOf = (b: Booking) => b.passengers.filter((p) => p.type !== "infant").length;
const nowISO = () => new Date().toISOString();

/**
 * Confirmación inmediata que sobrevive al desmontaje de la tarjeta
 * (al cancelar o reembolsar, la reserva cambia de lista).
 */
const useFlash = create<{ msg: string | null; show: (m: string) => void; clear: () => void }>()((set) => ({
  msg: null,
  show: (msg) => set({ msg }),
  clear: () => set({ msg: null }),
}));

export function FlashMessage() {
  const msg = useFlash((s) => s.msg);
  const clear = useFlash((s) => s.clear);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (msg) ref.current?.focus();
  }, [msg]);
  if (!msg) return null;
  return (
    <div ref={ref} tabIndex={-1} role="status" className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-green-300 bg-green-50 p-4 text-green-900 focus:outline-none">
      <p className="flex items-start gap-2 font-medium">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden /> {msg}
      </p>
      <button type="button" onClick={clear} className="text-sm font-semibold underline underline-offset-2">
        Cerrar
      </button>
    </div>
  );
}

/* ───────────── Cambiar fecha ───────────── */

function ChangeDateDialog({ booking, open, onClose, free = false }: { booking: Booking; open: boolean; onClose: () => void; free?: boolean }) {
  const bookings = useApp((s) => s.bookings);
  const updateBooking = useApp((s) => s.updateBooking);
  const [leg, setLeg] = useState(0);
  const [date, setDate] = useState<ISODate | null>(null);
  const [flightId, setFlightId] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  // Ocupación sin contar los asientos de esta misma reserva
  const local = useMemo(() => localOccupancy(bookings.filter((b) => b.locator !== booking.locator)), [bookings, booking.locator]);
  const current = booking.legs[leg];
  const seated = seatedOf(booking);
  const flights = useMemo(() => (date ? flightsFor(date, current.origin, todayISO(), local).filter((f) => f.available >= seated) : []), [date, current.origin, local, seated]);
  const chosen = flights.find((f) => f.id === flightId) ?? null;

  const legTickets = (adultPrice: number) => booking.passengers.reduce((s, p) => s + paxPrice(adultPrice, p.type), 0);
  const diff = chosen ? (free ? 0 : legTickets(chosen.adultPrice) - legTickets(current.adultPrice)) : 0;

  const minDate = leg === 1 ? booking.legs[0].date : undefined;
  const maxDate = leg === 0 && booking.legs[1] ? booking.legs[1].date : undefined;

  const confirm = () => {
    if (!chosen) return;
    updateBooking(booking.locator, (b) => {
      const legs = b.legs.map((l, i) => (i === leg ? snapshot(chosen as Flight) : l));
      const seats = b.seats.map((s, i) => (i === leg ? [] : s));
      const assigned = autoAssignSeats(legs, seats, seated, local);
      const quote = free
        ? b.quote
        : computeQuote({ legs, paxTypes: b.passengers.map((p) => p.type), seats: assigned, extras: b.extras, promoCode: b.promoCode, pointsRedeemed: b.pointsRedeemed });
      return {
        legs,
        seats: assigned,
        quote,
        status: "confirmada",
        checkedIn: b.checkedIn.map((c, i) => (i === leg ? false : c)),
        history: [
          ...b.history,
          { date: nowISO(), text: `Cambio de fecha (${leg === 0 ? "ida" : "vuelta"}) al ${formatDateShort(chosen.date)} ${chosen.departure}${free ? " · gratuito por meteorología" : diff ? ` · diferencia ${formatEUR(diff)}` : ""}` },
        ],
      };
    });
    const msg = `Cambio confirmado para la reserva ${booking.locator}: ${formatDateLong(chosen.date)} a las ${chosen.departure}.`;
    if (free) {
      // La alerta (y este diálogo) desaparecen al volver a "confirmada"
      useFlash.getState().show(`${msg} Sin coste por la cancelación meteorológica.`);
      return;
    }
    setDone(msg);
    announce(msg, 0);
  };

  const close = () => {
    setDate(null);
    setFlightId(null);
    setDone(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title={free ? "Cambio de fecha gratuito" : "Cambiar fecha"} description={`Reserva ${booking.locator}`} size="lg">
      {done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <p className="text-lg font-semibold text-navy">{done}</p>
          <p className="text-sm text-muted">Te hemos enviado un email con los nuevos datos (simulado).</p>
          <Button onClick={close}>Cerrar</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {booking.legs.length > 1 && (
            <div className="flex gap-2" role="group" aria-label="Trayecto a cambiar">
              {booking.legs.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={leg === i}
                  onClick={() => {
                    setLeg(i);
                    setDate(null);
                    setFlightId(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${leg === i ? "bg-navy text-white" : "bg-navy-50 text-navy"}`}
                >
                  {i === 0 ? "Ida" : "Vuelta"} · {formatDateShort(l.date)}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-muted">
            Actual: {AIRPORTS[current.origin].city} → {AIRPORTS[current.destination].city}, {formatDateLong(current.date)} a las {current.departure}.
          </p>
          <PriceCalendar
            key={leg}
            label="Nueva fecha"
            origin={current.origin}
            value={date}
            minDate={minDate}
            local={local}
            onSelect={(d) => {
              if (maxDate && d > maxDate) {
                announce("La nueva fecha de ida no puede ser posterior a la vuelta.", 0);
                return;
              }
              setDate(d);
              setFlightId(null);
            }}
          />
          {date && (
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-semibold">Vuelos del {formatDateShort(date)}</legend>
              {flights.length === 0 && <p className="text-sm text-muted">No hay plazas suficientes este día.</p>}
              {flights.map((f) => {
                const d = free ? 0 : legTickets(f.adultPrice) - legTickets(current.adultPrice);
                return (
                  <label
                    key={f.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${flightId === f.id ? "border-navy bg-navy-50" : "border-line"}`}
                  >
                    <input type="radio" name="new-flight" className="visually-hidden" checked={flightId === f.id} onChange={() => setFlightId(f.id)} />
                    <span>
                      <strong className="text-navy">
                        {f.departure} – {f.arrival}
                      </strong>{" "}
                      <span className="text-sm text-muted">· {f.available} plazas</span>
                    </span>
                    <span className={`text-sm font-semibold ${d > 0 ? "text-danger" : "text-success"}`}>
                      {free ? "Sin coste" : d === 0 ? "Mismo precio" : d > 0 ? `+${formatEUR(d)}` : `${formatEUR(d)} (te devolvemos)`}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          )}
          {chosen && (
            <Notice tone={diff > 0 ? "warning" : "success"}>
              {free
                ? "Cambio sin coste por cancelación meteorológica."
                : diff > 0
                  ? `Diferencia de tarifa a pagar: ${formatEUR(diff)} (pago simulado).`
                  : diff < 0
                    ? `Te devolveremos ${formatEUR(-diff)} de diferencia.`
                    : "No hay diferencia de precio."}
            </Notice>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={close}>
              Cancelar
            </Button>
            <Button disabled={!chosen} onClick={confirm}>
              {diff > 0 ? `Pagar ${formatEUR(diff)} y confirmar` : "Confirmar cambio"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ───────────── Añadir extras ───────────── */

function AddExtrasDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const updateBooking = useApp((s) => s.updateBooking);
  const [extras, setExtras] = useState<Extras>(booking.extras);
  const [done, setDone] = useState(false);
  const seated = booking.passengers.filter((p) => p.type !== "infant");
  const newQuote = useMemo(
    () =>
      computeQuote({
        legs: booking.legs,
        paxTypes: booking.passengers.map((p) => p.type),
        seats: booking.seats,
        extras,
        promoCode: booking.promoCode,
        pointsRedeemed: booking.pointsRedeemed,
      }),
    [booking, extras],
  );
  const diff = Math.max(0, newQuote.total - booking.quote.total);

  const confirm = () => {
    updateBooking(booking.locator, (b) => ({
      extras,
      quote: newQuote,
      history: [...b.history, { date: nowISO(), text: `Extras añadidos · ${formatEUR(diff)} (pago simulado)` }],
    }));
    setDone(true);
    announce("Extras añadidos a tu reserva.", 0);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setDone(false);
        onClose();
      }}
      title="Añadir extras"
      description={`Reserva ${booking.locator}`}
    >
      {done ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <p className="font-semibold text-navy">¡Extras añadidos! Hemos cobrado {formatEUR(diff)} (simulado).</p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">{EXTRAS.menu.label} (+{EXTRAS.menu.price} € por trayecto)</p>
            {seated.map((p, i) => (
              <label key={i} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {p.firstName} {p.lastName}
                </span>
                <select
                  className="rounded-xl border border-line px-3 py-2"
                  value={extras.menus[i] ?? ""}
                  disabled={Boolean(booking.extras.menus[i])}
                  onChange={(e) => {
                    const menus = [...extras.menus];
                    menus[i] = (e.target.value || null) as MenuId | null;
                    setExtras({ ...extras, menus });
                  }}
                >
                  <option value="">Sin menú</option>
                  {MENUS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <Counter label="Maletas facturadas" description={`+${EXTRAS.bag.price} € por trayecto`} value={extras.bags} min={booking.extras.bags} max={seated.length * 2} onChange={(bags) => setExtras({ ...extras, bags })} />
          <Counter
            label="Días de aparcamiento"
            description={`+${EXTRAS.parking.price} € por día`}
            value={extras.parkingDays}
            min={booking.extras.parkingDays}
            max={30}
            onChange={(parkingDays) => setExtras({ ...extras, parkingDays })}
          />
          <Checkbox
            label={`${EXTRAS.insurance.label} (+${EXTRAS.insurance.price} €/pax)`}
            checked={extras.insurance}
            disabled={booking.extras.insurance}
            onChange={(e) => setExtras({ ...extras, insurance: e.target.checked })}
          />
          <Checkbox
            label={`${EXTRAS.shuttle.label} (+${EXTRAS.shuttle.price} €/pax)`}
            checked={extras.shuttle}
            disabled={booking.extras.shuttle}
            onChange={(e) => setExtras({ ...extras, shuttle: e.target.checked })}
          />
          <div className="flex items-center justify-between rounded-2xl bg-pastel p-4">
            <span className="font-semibold text-navy">A pagar ahora</span>
            <span className="font-display text-2xl font-bold text-navy">{formatEUR(diff)}</span>
          </div>
          <Button className="w-full" disabled={diff <= 0} onClick={confirm}>
            Pagar y añadir (simulado)
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ───────────── Cancelar ───────────── */

function CancelDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const updateBooking = useApp((s) => s.updateBooking);
  const addPoints = useApp((s) => s.addPoints);
  const refund = refundFor(booking);
  const confirm = () => {
    updateBooking(booking.locator, (b) => ({
      status: "cancelada",
      refundAmount: refund.amount,
      history: [...b.history, { date: nowISO(), text: `Reserva cancelada · reembolso ${formatEUR(refund.amount)}` }],
    }));
    if (booking.userId && booking.pointsEarned) addPoints(booking.userId, -booking.pointsEarned, `Anulación de puntos · ${booking.locator}`);
    useFlash.getState().show(`Reserva ${booking.locator} cancelada. Recibirás ${formatEUR(refund.amount)} en 5–7 días (simulado).`);
  };
  return (
    <Modal open={open} onClose={onClose} title="Cancelar reserva" description={`Reserva ${booking.locator}`} size="sm">
      {(
        <div className="space-y-4">
          <dl className="space-y-2 rounded-2xl bg-navy-50/60 p-4 text-sm">
            <div className="flex justify-between">
              <dt>Importe pagado</dt>
              <dd>{formatEUR(booking.quote.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Política aplicable</dt>
              <dd className="text-right">{refund.reason}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-navy">
              <dt>Reembolso</dt>
              <dd>{formatEUR(refund.amount)}</dd>
            </div>
          </dl>
          {!booking.extras.insurance && <p className="text-xs text-muted">{CANCELLATION_POLICY.insuranceLabel}. Esta reserva no lo incluye.</p>}
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose} autoFocus>
              Mantener reserva
            </Button>
            <Button variant="danger" className="flex-1" onClick={confirm}>
              Cancelar reserva
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ───────────── Ver ───────────── */

function ViewDialog({ booking, open, onClose }: { booking: Booking; open: boolean; onClose: () => void }) {
  const seated = booking.passengers.filter((p) => p.type !== "infant");
  return (
    <Modal open={open} onClose={onClose} title={`Reserva ${booking.locator}`} description={`Creada el ${formatDateTime(booking.createdAt)}`} size="lg">
      <div className="space-y-5 text-sm">
        {booking.legs.map((l, i) => (
          <div key={i} className="rounded-2xl bg-navy-50/60 p-4">
            <p className="font-semibold text-navy">
              {i === 0 ? "Ida" : "Vuelta"} · {AIRPORTS[l.origin].city} → {AIRPORTS[l.destination].city}
            </p>
            <p className="first-letter:uppercase">
              {formatDateLong(l.date)} · {l.departure}–{l.arrival} · Puerta {l.gate}
            </p>
            <p className="text-muted">
              {booking.passengers
                .map((p) => (p.type === "infant" ? `${p.firstName} (en brazos)` : `${p.firstName}: ${booking.seats[i]?.[seated.indexOf(p)] ?? "—"}`))
                .join(" · ")}
            </p>
          </div>
        ))}
        <div>
          <p className="mb-1 font-semibold text-navy">Pasajeros</p>
          <ul className="space-y-1">
            {booking.passengers.map((p, i) => (
              <li key={i}>
                {p.firstName} {p.lastName} · {PAX_LABEL[p.type]} · {p.docType} {p.docNumber}
                {p.assistance && " · Asistencia PMR"}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-navy">Desglose</p>
          <ul className="space-y-1">
            {booking.quote.lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {l.label} {l.detail && <span className="text-muted">· {l.detail}</span>}
                </span>
                <span className="tabular-nums">{formatEUR(l.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between border-t border-line pt-1 font-bold text-navy">
              <span>Total</span>
              <span>{formatEUR(booking.quote.total)}</span>
            </li>
            {booking.refundAmount > 0 && (
              <li className="flex justify-between text-success">
                <span>Reembolsado</span>
                <span>{formatEUR(booking.refundAmount)}</span>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="mb-1 font-semibold text-navy">Historial</p>
          <ol className="space-y-1 text-muted">
            {booking.history.map((h, i) => (
              <li key={i}>
                {formatDateTime(h.date)} · {h.text}
              </li>
            ))}
          </ol>
        </div>
        <details>
          <summary className="cursor-pointer font-semibold text-navy">Ver email de confirmación</summary>
          <div className="mt-3">
            <EmailPreview booking={booking} />
          </div>
        </details>
      </div>
    </Modal>
  );
}

/* ───────────── Alerta meteorológica ───────────── */

function WeatherAlert({ booking }: { booking: Booking }) {
  const updateBooking = useApp((s) => s.updateBooking);
  const addPoints = useApp((s) => s.addPoints);
  const [changeOpen, setChangeOpen] = useState(false);

  const refund = () => {
    updateBooking(booking.locator, (b) => ({
      status: "reembolsada",
      refundAmount: b.quote.total,
      history: [...b.history, { date: nowISO(), text: `Reembolso íntegro por meteorología · ${formatEUR(b.quote.total)}` }],
    }));
    if (booking.userId && booking.pointsEarned) addPoints(booking.userId, -booking.pointsEarned, `Anulación de puntos · ${booking.locator}`);
    useFlash
      .getState()
      .show(`Reembolso íntegro confirmado para la reserva ${booking.locator}: te devolveremos ${formatEUR(booking.quote.total)} en 5–7 días (simulado). Sentimos las molestias.`);
  };

  return (
    <div role="alert" className="rounded-3xl border-2 border-red-200 bg-red-50 p-5">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-danger">
        <CloudLightning className="size-6" aria-hidden /> Tu vuelo ha sido cancelado por condiciones meteorológicas
      </p>
      <p className="mt-1 text-sm text-red-900">
        Reserva {booking.locator} · {AIRPORTS[booking.legs[0].origin].city} → {AIRPORTS[booking.legs[0].destination].city}, {formatDateLong(booking.legs[0].date)}. Por tu seguridad,
        no volamos con viento fuerte. Elige cómo quieres continuar:
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={() => setChangeOpen(true)} icon={<CalendarClock className="size-4" aria-hidden />}>
          Cambiar de fecha gratis
        </Button>
        <Button variant="secondary" onClick={refund} icon={<Undo2 className="size-4" aria-hidden />}>
          Reembolso íntegro ({formatEUR(booking.quote.total)})
        </Button>
      </div>
      <ChangeDateDialog booking={booking} open={changeOpen} onClose={() => setChangeOpen(false)} free />
    </div>
  );
}

/* ───────────── Tarjeta de reserva ───────────── */

export function BookingCard({ booking, demoControls = true }: { booking: Booking; demoControls?: boolean }) {
  const updateBooking = useApp((s) => s.updateBooking);
  const [dialog, setDialog] = useState<null | "view" | "change" | "extras" | "cancel">(null);
  const [busy, setBusy] = useState<string | null>(null);
  const past = isPastBooking(booking);
  const active = booking.status === "confirmada" && !past;
  const status = past && booking.status === "confirmada" ? { label: "Completada", tone: "gray" as const } : STATUS[booking.status];

  const run = async (key: string, fn: () => Promise<void> | void) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const checkIn = (li: number) =>
    run(`ci${li}`, async () => {
      updateBooking(booking.locator, (b) => ({
        checkedIn: b.checkedIn.map((c, i) => (i === li ? true : c)),
        history: b.checkedIn[li] ? b.history : [...b.history, { date: nowISO(), text: `Check-in online (${li === 0 ? "ida" : "vuelta"})` }],
      }));
      announce("Check-in completado. Descargando tu tarjeta de embarque.", 0);
      await downloadBoardingPasses(booking, [li]);
    });

  const simulateWeather = () => {
    updateBooking(booking.locator, (b) => ({
      status: "cancelada_meteo",
      history: [...b.history, { date: nowISO(), text: "Vuelo cancelado por condiciones meteorológicas (simulación)" }],
    }));
    announce("Alerta: tu vuelo ha sido cancelado por condiciones meteorológicas.", 0);
  };

  return (
    <Card className="overflow-hidden">
      {booking.status === "cancelada_meteo" && (
        <div className="p-4 pb-0 sm:p-6 sm:pb-0">
          <WeatherAlert booking={booking} />
        </div>
      )}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Localizador</p>
            <p className="font-display text-2xl font-bold tracking-widest text-navy">{booking.locator}</p>
          </div>
          <div className="text-right">
            <Badge tone={status.tone}>{status.label}</Badge>
            <p className="mt-1 font-semibold text-navy">{formatEUR(booking.quote.total)}</p>
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {booking.legs.map((l, i) => {
            const w = checkInWindow(booking, i);
            return (
              <li key={i} className="flex flex-col gap-3 rounded-2xl bg-pastel-soft p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-navy">
                    {AIRPORTS[l.origin].city} → {AIRPORTS[l.destination].city}
                  </p>
                  <p className="text-sm first-letter:uppercase text-muted">
                    {formatDateLong(l.date)} · {l.departure}–{l.arrival}
                  </p>
                </div>
                {active && (
                  <div className="text-sm">
                    {booking.checkedIn[i] ? (
                      <Button size="sm" variant="accent" loading={busy === `ci${i}`} onClick={() => checkIn(i)} icon={<Ticket className="size-4" aria-hidden />}>
                        Tarjeta de embarque
                      </Button>
                    ) : w.open ? (
                      <Button size="sm" loading={busy === `ci${i}`} onClick={() => checkIn(i)} icon={<CheckCircle2 className="size-4" aria-hidden />}>
                        Hacer check-in
                      </Button>
                    ) : w.closed ? (
                      <span className="text-muted">Check-in cerrado</span>
                    ) : (
                      <span className="text-muted">Check-in desde el {formatDateTime(w.opens)}</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-muted">
          {booking.passengers.length} {booking.passengers.length === 1 ? "pasajero" : "pasajeros"}: {booking.passengers.map((p) => p.firstName).join(", ")}
          {booking.refundAmount > 0 && <span className="text-success"> · Reembolsado {formatEUR(booking.refundAmount)}</span>}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setDialog("view")} icon={<Eye className="size-4" aria-hidden />}>
            Ver
          </Button>
          {active && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setDialog("change")} icon={<CalendarClock className="size-4" aria-hidden />}>
                Cambiar fecha
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setDialog("extras")} icon={<PlusCircle className="size-4" aria-hidden />}>
                Añadir extras
              </Button>
              <Button size="sm" variant="ghost" onClick={() => downloadICS(booking)} icon={<CalendarPlus className="size-4" aria-hidden />}>
                Calendario
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" loading={busy === "inv"} onClick={() => run("inv", () => downloadInvoice(booking))} icon={<FileText className="size-4" aria-hidden />}>
            Factura
          </Button>
          {active && (
            <Button size="sm" variant="danger" onClick={() => setDialog("cancel")} icon={<Ban className="size-4" aria-hidden />}>
              Cancelar
            </Button>
          )}
        </div>

        {demoControls && active && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-line pt-4 text-xs text-muted">
            <AlertTriangle className="size-4 text-amber-700" aria-hidden />
            Demo:
            <button type="button" onClick={simulateWeather} className="font-semibold text-navy underline underline-offset-2">
              Simular alerta meteorológica
            </button>
          </div>
        )}
        {demoControls && booking.status === "cancelada" && (
          <p className="mt-4 flex items-center gap-2 border-t border-dashed border-line pt-4 text-xs text-muted">
            <RotateCcw className="size-4" aria-hidden /> Reserva cancelada el {formatDateTime(booking.history.at(-1)?.date ?? booking.createdAt)}
          </p>
        )}
      </div>

      <ViewDialog booking={booking} open={dialog === "view"} onClose={() => setDialog(null)} />
      {active && <ChangeDateDialog booking={booking} open={dialog === "change"} onClose={() => setDialog(null)} />}
      {active && dialog === "extras" && <AddExtrasDialog booking={booking} open onClose={() => setDialog(null)} />}
      {active && <CancelDialog booking={booking} open={dialog === "cancel"} onClose={() => setDialog(null)} />}
    </Card>
  );
}

export function BookingList({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<"next" | "past">("next");
  const upcoming = bookings.filter((b) => !isPastBooking(b) && b.status !== "cancelada" && b.status !== "reembolsada");
  const past = bookings.filter((b) => !upcoming.includes(b));
  const list = (tab === "next" ? upcoming : past).sort((a, b) => (tab === "next" ? a.legs[0].date.localeCompare(b.legs[0].date) : b.legs[0].date.localeCompare(a.legs[0].date)));
  const weather = upcoming.filter((b) => b.status === "cancelada_meteo");

  return (
    <div>
      <FlashMessage />
      {weather.length > 0 && tab === "past" && (
        <Notice tone="error" icon={CloudLightning} title="Tienes vuelos cancelados por meteorología">
          Revisa la pestaña «Próximas» para elegir cambio de fecha o reembolso.
        </Notice>
      )}
      <div className="mb-6 flex rounded-full bg-navy-50 p-1 text-sm font-semibold sm:w-fit" role="group" aria-label="Filtrar reservas">
        {(
          [
            ["next", `Próximas (${upcoming.length})`],
            ["past", `Pasadas y canceladas (${past.length})`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            aria-pressed={tab === k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-full px-4 py-2 transition ${tab === k ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
          >
            {l}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Card className="p-8 text-center text-muted">{tab === "next" ? "No tienes viajes próximos. ¿Planeamos uno?" : "Aún no hay reservas pasadas."}</Card>
      ) : (
        <ul className="space-y-6">
          {list.map((b) => (
            <li key={b.locator}>
              <BookingCard booking={b} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
