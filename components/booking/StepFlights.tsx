"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CloudSun, Clock, Flame, Sparkles, Users } from "lucide-react";
import { AIRPORTS, PRICING, ROUTE, SEASONS } from "@/config/site";
import { formatDateLong, todayISO, type ISODate } from "@/lib/dates";
import { flightsFor } from "@/lib/flights";
import { formatEUR } from "@/lib/format";
import type { Flight } from "@/lib/types";
import { useLocalOccupancy } from "@/store/app";
import { seatedCount, useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Badge, Notice } from "@/components/ui/Primitives";
import { announce } from "@/components/ui/Form";
import type { AirportId } from "@/config/site";

function FlightOption({ flight, selected, onSelect, needed, name }: { flight: Flight; selected: boolean; onSelect: () => void; needed: number; name: string }) {
  const enough = flight.available >= needed;
  const pct = Math.round(flight.occupancy * 100);
  return (
    <label
      className={`group relative block cursor-pointer rounded-3xl border-2 bg-white p-5 transition sm:p-6 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${
        !enough ? "cursor-not-allowed opacity-60" : selected ? "border-navy shadow-[var(--shadow-lift)]" : "border-transparent shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-navy/30"
      }`}
    >
      <input type="radio" name={name} checked={selected} onChange={onSelect} disabled={!enough} className="visually-hidden" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <p className="font-display text-2xl font-bold text-navy sm:text-3xl">{flight.departure}</p>
            <p className="text-sm text-muted">{AIRPORTS[flight.origin].code}</p>
          </div>
          <div className="flex flex-col items-center text-xs text-muted">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {ROUTE.durationLabel.replace("~", "")}
            </span>
            <span className="my-1 h-px w-16 bg-linear-to-r from-pink to-amber sm:w-24" aria-hidden />
            <span>Directo</span>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-navy sm:text-3xl">{flight.arrival}</p>
            <p className="text-sm text-muted">{AIRPORTS[flight.destination].code}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">por adulto</p>
          <p className="font-display text-2xl font-bold text-navy">{formatEUR(flight.adultPrice)}</p>
          {flight.adultPrice !== flight.basePrice && <p className="text-xs text-muted line-through">{formatEUR(flight.basePrice)}</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="gray">{SEASONS[flight.season].label}</Badge>
        {flight.bestPrice && (
          <Badge tone="green">
            <Sparkles className="size-3.5" aria-hidden /> Mejor precio
          </Badge>
        )}
        {flight.advanceDiscount && <Badge tone="navy">−10 % por antelación</Badge>}
        {flight.lastSeats && (
          <Badge tone="red">
            <Flame className="size-3.5" aria-hidden /> Últimas plazas
          </Badge>
        )}
        {flight.highDemand && <Badge tone="amber">Alta demanda +15 %</Badge>}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <Users className="size-4 text-muted" aria-hidden />
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className={`h-full rounded-full ${pct > 80 ? "bg-pink" : "bg-navy/60"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={flight.available <= PRICING.lastSeatsThreshold ? "font-semibold text-danger" : "text-muted"}>
          {flight.available > 0 ? `${flight.available} de ${flight.capacity} plazas libres` : "Completo"}
        </span>
      </div>
      {!enough && flight.available > 0 && <p className="mt-2 text-sm text-danger">No quedan plazas suficientes para {needed} pasajeros.</p>}
      {selected && <span className="absolute -top-3 left-6 rounded-full bg-navy px-3 py-0.5 text-xs font-semibold text-white">Seleccionado</span>}
    </label>
  );
}

function LegList({ title, date, origin, selectedId, onSelect, name }: { title: string; date: ISODate; origin: AirportId; selectedId: string | null; onSelect: (f: Flight) => void; name: string }) {
  const local = useLocalOccupancy();
  const search = useBooking((s) => s.search);
  const needed = seatedCount(search);
  const flights = useMemo(() => flightsFor(date, origin, todayISO(), local), [date, origin, local]);
  const dest = origin === "girona" ? "mallorca" : "girona";
  return (
    <fieldset className="space-y-4">
      <legend className="mb-4">
        <span className="block text-sm font-semibold uppercase tracking-wider text-pink-700">{title}</span>
        <span className="font-display text-xl font-bold text-navy">
          {AIRPORTS[origin].city} → {AIRPORTS[dest].city}
        </span>
        <span className="block text-sm first-letter:uppercase text-muted">{formatDateLong(date)}</span>
      </legend>
      {flights.length === 0 ? (
        <Notice tone="warning" title="No hay vuelos este día">
          Vuelve al paso anterior y elige otra fecha en el calendario.
        </Notice>
      ) : (
        flights.map((f) => <FlightOption key={f.id} name={name} flight={f} needed={needed} selected={selectedId === f.id} onSelect={() => onSelect(f)} />)
      )}
    </fieldset>
  );
}

export function StepFlights({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const search = useBooking((s) => s.search);
  const outboundId = useBooking((s) => s.outboundId);
  const inboundId = useBooking((s) => s.inboundId);
  const select = useBooking((s) => s.selectFlight);
  const [error, setError] = useState<string | null>(null);
  const roundTrip = search.tripType === "idavuelta";

  if (!search.departDate || (roundTrip && !search.returnDate)) {
    return (
      <Notice tone="info" title="Primero elige las fechas">
        <Button variant="secondary" size="sm" className="mt-2" onClick={onBack}>
          Ir a la búsqueda
        </Button>
      </Notice>
    );
  }

  const next = () => {
    if (!outboundId || (roundTrip && !inboundId)) {
      const msg = !outboundId ? "Selecciona un vuelo de ida." : "Selecciona un vuelo de vuelta.";
      setError(msg);
      announce(msg, 0);
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-8">
      <Notice tone="info" icon={CloudSun}>
        Los vuelos en dirigible dependen de la meteorología. Si se cancela, cambias de fecha gratis o te devolvemos el importe.
      </Notice>

      <LegList
        title="Vuelo de ida"
        name="outbound"
        date={search.departDate}
        origin={search.origin}
        selectedId={outboundId}
        onSelect={(f) => {
          setError(null);
          select("outbound", f.id);
          announce(`Vuelo de ida de las ${f.departure} seleccionado, ${formatEUR(f.adultPrice)} por adulto`);
        }}
      />
      {roundTrip && search.returnDate && (
        <LegList
          title="Vuelo de vuelta"
          name="inbound"
          date={search.returnDate}
          origin={search.destination}
          selectedId={inboundId}
          onSelect={(f) => {
            setError(null);
            select("inbound", f.id);
            announce(`Vuelo de vuelta de las ${f.departure} seleccionado, ${formatEUR(f.adultPrice)} por adulto`);
          }}
        />
      )}

      <p className="text-sm text-muted">
        Precios por trayecto con IVA incluido. Niños de 2 a 11 años: −{PRICING.childDiscount * 100} % sobre la tarifa adulta. Bebés gratis, sin asiento.
      </p>

      {error && (
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="size-4" aria-hidden />}>
          Cambiar búsqueda
        </Button>
        <Button onClick={next}>
          Continuar a pasajeros <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
