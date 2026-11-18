"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Backpack, CalendarPlus, Car, CheckCircle2, Download, FileText, Mail, MapPin, Sparkles, Ticket, Train } from "lucide-react";
import { AIRPORTS, BRAND, CANCELLATION_POLICY } from "@/config/site";
import { addMinutesToTime, formatDateLong } from "@/lib/dates";
import { formatEUR, formatNumber } from "@/lib/format";
import { downloadBoardingPasses, downloadICS, downloadInvoice } from "@/lib/documents";
import type { Booking } from "@/lib/types";
import { useApp } from "@/store/app";
import { useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Card, Notice } from "@/components/ui/Primitives";
import { PAX_LABEL } from "@/lib/pricing";

export function EmailPreview({ booking }: { booking: Booking }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white text-sm shadow-[var(--shadow-soft)]">
      <div className="border-b border-line bg-gray-50 px-5 py-3 text-xs text-muted">
        <p>
          <strong>De:</strong> {BRAND.name} &lt;{BRAND.email}&gt;
        </p>
        <p>
          <strong>Para:</strong> {booking.contact.email}
        </p>
        <p>
          <strong>Asunto:</strong> ¡Todo listo para volar! Reserva {booking.locator}
        </p>
      </div>
      <div className="bg-pastel px-6 py-6">
        <p className="font-display text-xl font-bold text-navy">Hola, {booking.passengers[0].firstName}:</p>
        <p className="mt-2 text-ink/90">
          Gracias por elegirnos. Tu viaje ya forma parte de la experiencia: prepárate para ver la Costa Brava y Mallorca como nunca.
        </p>
      </div>
      <div className="space-y-3 px-6 py-5">
        {booking.legs.map((l, i) => (
          <p key={i}>
            <strong>{i === 0 ? "Ida" : "Vuelta"}:</strong> {AIRPORTS[l.origin].city} → {AIRPORTS[l.destination].city}, {formatDateLong(l.date)} a las {l.departure}. Puerta {l.gate}.
          </p>
        ))}
        <p>
          <strong>Pasajeros:</strong> {booking.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(", ")}
        </p>
        <p>
          <strong>Total pagado:</strong> {formatEUR(booking.quote.total)}
        </p>
        <p className="text-xs text-muted">
          Check-in online disponible {CANCELLATION_POLICY.checkInOpensHours} h antes. Email simulado: no se ha enviado ningún mensaje real.
        </p>
      </div>
    </div>
  );
}

export function StepConfirmation() {
  const router = useRouter();
  const locator = useBooking((s) => s.confirmedLocator);
  const reset = useBooking((s) => s.reset);
  const booking = useApp((s) => s.bookings.find((b) => b.locator === locator));
  const [busy, setBusy] = useState<string | null>(null);

  if (!booking) {
    return (
      <Notice tone="warning" title="No encontramos la reserva">
        Empieza una nueva búsqueda.
        <Button size="sm" className="mt-2" onClick={reset}>
          Nueva reserva
        </Button>
      </Notice>
    );
  }

  const run = async (key: string, fn: () => Promise<void> | void) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const first = booking.legs[0];
  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-pastel opacity-60" aria-hidden />
        <div className="relative">
          <CheckCircle2 className="mx-auto size-14 animate-fade-up text-success" aria-hidden />
          <h2 className="mt-4 text-2xl text-navy sm:text-3xl">¡Reserva confirmada!</h2>
          <p className="mt-2 text-muted">Hemos enviado la confirmación a {booking.contact.email}.</p>
          <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted">Localizador</p>
          <p className="font-display text-5xl font-bold tracking-[0.2em] text-navy" aria-label={`Localizador: ${booking.locator.split("").join(" ")}`}>
            {booking.locator}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={() => run("ics", () => downloadICS(booking))} icon={<CalendarPlus className="size-4" aria-hidden />}>
              Añadir al calendario
            </Button>
            <Button
              variant="accent"
              loading={busy === "pdf"}
              onClick={() => run("pdf", () => downloadBoardingPasses(booking))}
              icon={<Ticket className="size-4" aria-hidden />}
            >
              Descargar tarjeta de embarque
            </Button>
            <Button variant="secondary" loading={busy === "inv"} onClick={() => run("inv", () => downloadInvoice(booking))} icon={<FileText className="size-4" aria-hidden />}>
              Factura
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg text-navy">Resumen del viaje</h3>
          <ul className="space-y-4 text-sm">
            {booking.legs.map((l, i) => (
              <li key={i} className="rounded-2xl bg-navy-50/60 p-4">
                <p className="font-semibold text-navy">
                  {i === 0 ? "Ida" : "Vuelta"} · {AIRPORTS[l.origin].city} → {AIRPORTS[l.destination].city}
                </p>
                <p className="first-letter:uppercase text-muted">{formatDateLong(l.date)}</p>
                <p className="mt-1">
                  Salida {l.departure} · Llegada {l.arrival} · Puerta <strong>{l.gate}</strong>
                </p>
                <p>
                  Embarque desde las {addMinutesToTime(l.departure, -CANCELLATION_POLICY.boardingStartsMin)} · <strong>cierra a las {addMinutesToTime(l.departure, -CANCELLATION_POLICY.boardingClosesMin)}</strong>
                </p>
                <p className="mt-1 text-muted">Asientos: {(booking.seats[i] ?? []).filter(Boolean).join(", ")}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">{booking.passengers.map((p) => `${p.firstName} ${p.lastName} (${PAX_LABEL[p.type]})`).join(" · ")}</p>
          <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold text-navy">
            <span>Total pagado</span>
            <span>{formatEUR(booking.quote.total)}</span>
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="bg-linear-to-br from-navy to-navy-700 p-6 text-white">
            <Sparkles className="size-7 text-amber" aria-hidden />
            {booking.pointsEarned > 0 ? (
              <>
                <p className="mt-3 font-display text-3xl font-bold">+{formatNumber(booking.pointsEarned)} Wind Points</p>
                <p className="mt-1 text-sm text-white/80">1 punto por cada euro. Ya están en tu cuenta.</p>
              </>
            ) : (
              <>
                <p className="mt-3 font-display text-2xl font-bold">Podrías haber ganado {formatNumber(Math.floor(booking.quote.total))} Wind Points</p>
                <p className="mt-1 text-sm text-white/80">Crea una cuenta para acumular puntos en tus próximas reservas.</p>
              </>
            )}
          </Card>
          <Card className="p-6">
            <h3 className="mb-3 text-lg text-navy">Cómo llegar al vertipuerto</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-3">
                <MapPin className="size-5 shrink-0 text-pink-700" aria-hidden /> {AIRPORTS[first.origin].name}
              </li>
              <li className="flex gap-3">
                <Car className="size-5 shrink-0 text-pink-700" aria-hidden /> Aparcamiento propio a 2 minutos a pie {booking.extras.parkingDays ? `(reservado: ${booking.extras.parkingDays} días)` : ""}
              </li>
              <li className="flex gap-3">
                <Train className="size-5 shrink-0 text-pink-700" aria-hidden /> {first.origin === "girona" ? "Lanzadera desde la estación de Girona cada 30 min" : "Bus urbano y lanzadera desde Palma centro"}
              </li>
            </ul>
            <h3 className="mb-3 mt-6 text-lg text-navy">Qué llevar</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex gap-3">
                <Backpack className="size-5 shrink-0 text-pink-700" aria-hidden /> DNI o pasaporte original de cada pasajero
              </li>
              <li className="flex gap-3">
                <Backpack className="size-5 shrink-0 text-pink-700" aria-hidden /> Una chaqueta ligera: en la cabina hay 21 °C, pero la terraza del vertipuerto es fresca
              </li>
              <li className="flex gap-3">
                <Backpack className="size-5 shrink-0 text-pink-700" aria-hidden /> Tu cámara: las mejores vistas, sobre las islas Medes y la Serra de Tramuntana
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <section aria-labelledby="email-preview-title">
        <h3 id="email-preview-title" className="mb-4 flex items-center gap-2 text-lg text-navy">
          <Mail className="size-5" aria-hidden /> Vista previa del email de confirmación
        </h3>
        <EmailPreview booking={booking} />
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="secondary" onClick={() => router.push(booking.userId ? "/mi-cuenta/reservas" : "/gestionar-reserva")} icon={<Download className="size-4" aria-hidden />}>
          Gestionar mi reserva
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            reset();
            window.scrollTo({ top: 0 });
          }}
        >
          Hacer otra reserva
        </Button>
      </div>
    </div>
  );
}
