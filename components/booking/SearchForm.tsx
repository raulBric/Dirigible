"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CalendarDays, Search, Users } from "lucide-react";
import { AIRPORTS, PRICING, type AirportId } from "@/config/site";
import { formatDateShort, type ISODate } from "@/lib/dates";
import { plural } from "@/lib/format";
import { useLocalOccupancy } from "@/store/app";
import { useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Counter, announce } from "@/components/ui/Form";
import { Modal } from "@/components/ui/Modal";
import { PriceCalendar, SeasonLegend } from "./PriceCalendar";

function TripTypeToggle() {
  const tripType = useBooking((s) => s.search.tripType);
  const setSearch = useBooking((s) => s.setSearch);
  return (
    <fieldset className="flex rounded-full bg-navy-50 p-1 text-sm font-semibold">
      <legend className="visually-hidden">Tipo de viaje</legend>
      {(
        [
          ["idavuelta", "Ida y vuelta"],
          ["ida", "Solo ida"],
        ] as const
      ).map(([v, l]) => (
        <label
          key={v}
          className={`flex-1 cursor-pointer rounded-full px-4 py-2 text-center transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-navy ${tripType === v ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}
        >
          <input type="radio" name="tripType" value={v} checked={tripType === v} onChange={() => setSearch({ tripType: v })} className="visually-hidden" />
          {l}
        </label>
      ))}
    </fieldset>
  );
}

function RouteFields() {
  const { origin, destination } = useBooking((s) => s.search);
  const setSearch = useBooking((s) => s.setSearch);
  const swap = useBooking((s) => s.swapRoute);
  const change = (o: AirportId) => setSearch({ origin: o, destination: o === "girona" ? "mallorca" : "girona" });
  return (
    <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2">
      <label className="flex flex-col rounded-2xl border border-line bg-white px-4 py-2.5 transition focus-within:border-navy">
        <span className="text-xs font-medium text-muted">Origen</span>
        <select value={origin} onChange={(e) => change(e.target.value as AirportId)} className="bg-transparent font-semibold text-navy focus:outline-none">
          {Object.values(AIRPORTS).map((a) => (
            <option key={a.id} value={a.id}>
              {a.city} ({a.region})
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={swap}
        className="absolute left-1/2 top-1/2 z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 rotate-90 place-items-center rounded-full bg-white text-navy shadow-md ring-1 ring-line transition hover:rotate-[270deg] hover:bg-pink-50 sm:rotate-0 sm:hover:rotate-180"
        aria-label={`Intercambiar origen y destino (ahora ${AIRPORTS[origin].city} a ${AIRPORTS[destination].city})`}
      >
        <ArrowLeftRight className="size-4" aria-hidden />
      </button>
      <label className="flex flex-col rounded-2xl border border-line bg-white px-4 py-2.5 transition focus-within:border-navy sm:pl-8">
        <span className="text-xs font-medium text-muted">Destino</span>
        <select value={destination} onChange={(e) => change(e.target.value === "girona" ? "mallorca" : "girona")} className="bg-transparent font-semibold text-navy focus:outline-none">
          {Object.values(AIRPORTS).map((a) => (
            <option key={a.id} value={a.id}>
              {a.city} ({a.region})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function PassengerCounters() {
  const s = useBooking((st) => st.search);
  const setSearch = useBooking((st) => st.setSearch);
  const seated = s.adults + s.children;
  return (
    <div className="divide-y divide-line">
      <Counter label="Adultos" description="12 años o más" value={s.adults} min={1} max={PRICING.maxPassengers - s.children} onChange={(adults) => setSearch({ adults })} />
      <Counter label="Niños" description="De 2 a 11 años · −25 %" value={s.children} max={PRICING.maxPassengers - s.adults} onChange={(children) => setSearch({ children })} />
      <Counter label="Bebés" description="Menores de 2 años · gratis, sin asiento" value={s.infants} max={s.adults} onChange={(infants) => setSearch({ infants })} />
      {seated >= PRICING.maxPassengers && <p className="pt-2 text-xs text-muted">Máximo {PRICING.maxPassengers} pasajeros con asiento por reserva. Para grupos, consulta Empresas.</p>}
    </div>
  );
}

const paxSummary = (a: number, c: number, i: number) =>
  [plural(a, "adulto", "adultos"), c ? plural(c, "niño", "niños") : null, i ? plural(i, "bebé", "bebés") : null].filter(Boolean).join(", ");

/** Buscador compacto (home): fechas y pasajeros en diálogos. */
export function HeroSearchForm() {
  const router = useRouter();
  const search = useBooking((s) => s.search);
  const setSearch = useBooking((s) => s.setSearch);
  const setStep = useBooking((s) => s.setStep);
  const local = useLocalOccupancy();
  const [dialog, setDialog] = useState<null | "depart" | "return" | "pax">(null);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!search.departDate) return setDialog("depart");
    if (search.tripType === "idavuelta" && !search.returnDate) return setDialog("return");
    setStep(2);
    router.push("/reservar");
  };

  const dateBtn = (which: "depart" | "return", value: ISODate | null, label: string) => (
    <button
      type="button"
      onClick={() => setDialog(which)}
      className="flex flex-1 flex-col items-start rounded-2xl border border-line bg-white px-4 py-2.5 text-left transition hover:border-navy/40 focus-visible:border-navy"
    >
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="flex items-center gap-2 font-semibold text-navy">
        <CalendarDays className="size-4" aria-hidden />
        {value ? formatDateShort(value) : "Elegir fecha"}
      </span>
    </button>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3" aria-label="Buscar vuelos">
      <TripTypeToggle />
      <RouteFields />
      <div className="flex flex-col gap-2 sm:flex-row">
        {dateBtn("depart", search.departDate, "Ida")}
        {search.tripType === "idavuelta" && dateBtn("return", search.returnDate, "Vuelta")}
      </div>
      <button
        type="button"
        onClick={() => setDialog("pax")}
        className="flex flex-col items-start rounded-2xl border border-line bg-white px-4 py-2.5 text-left transition hover:border-navy/40"
      >
        <span className="text-xs font-medium text-muted">Pasajeros</span>
        <span className="flex items-center gap-2 font-semibold text-navy">
          <Users className="size-4" aria-hidden />
          {paxSummary(search.adults, search.children, search.infants)}
        </span>
      </button>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" icon={<Search className="size-5" aria-hidden />} className="mt-1 w-full">
        Buscar vuelos
      </Button>

      <Modal
        open={dialog === "depart" || dialog === "return"}
        onClose={() => setDialog(null)}
        title={dialog === "return" ? "Fecha de vuelta" : "Fecha de ida"}
        description={`${dialog === "return" ? AIRPORTS[search.destination].city : AIRPORTS[search.origin].city} → ${dialog === "return" ? AIRPORTS[search.origin].city : AIRPORTS[search.destination].city} · precio "desde" por adulto`}
        size="lg"
      >
        <SeasonLegend />
        <div className="mt-4">
          {dialog && dialog !== "pax" && (
            <PriceCalendar
              key={dialog}
              label={dialog === "return" ? "Calendario de vuelta" : "Calendario de ida"}
              origin={dialog === "return" ? search.destination : search.origin}
              value={dialog === "return" ? search.returnDate : search.departDate}
              minDate={dialog === "return" ? (search.departDate ?? undefined) : undefined}
              rangeStart={dialog === "return" ? search.departDate : null}
              local={local}
              months={2}
              onSelect={(d) => {
                setError(null);
                if (dialog === "depart") {
                  setSearch({ departDate: d });
                  setDialog(search.tripType === "idavuelta" ? "return" : null);
                  announce(`Ida seleccionada: ${formatDateShort(d)}`);
                } else {
                  setSearch({ returnDate: d });
                  setDialog(null);
                  announce(`Vuelta seleccionada: ${formatDateShort(d)}`);
                }
              }}
            />
          )}
        </div>
      </Modal>

      <Modal open={dialog === "pax"} onClose={() => setDialog(null)} title="Pasajeros" size="sm">
        <PassengerCounters />
        <Button className="mt-5 w-full" onClick={() => setDialog(null)}>
          Listo
        </Button>
      </Modal>
    </form>
  );
}

/** Paso 1 del checkout: calendario visible en la página. */
export function StepSearchForm({ onDone }: { onDone: () => void }) {
  const search = useBooking((s) => s.search);
  const setSearch = useBooking((s) => s.setSearch);
  const local = useLocalOccupancy();
  const [editing, setEditing] = useState<"depart" | "return">(search.departDate && search.tripType === "idavuelta" && !search.returnDate ? "return" : "depart");
  const [error, setError] = useState<string | null>(null);
  const roundTrip = search.tripType === "idavuelta";
  const which = roundTrip ? editing : "depart";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!search.departDate) {
      setError("Elige la fecha de ida en el calendario.");
      setEditing("depart");
      announce("Elige la fecha de ida en el calendario.", 0);
      return;
    }
    if (roundTrip && !search.returnDate) {
      setError("Elige la fecha de vuelta en el calendario.");
      setEditing("return");
      announce("Elige la fecha de vuelta en el calendario.", 0);
      return;
    }
    onDone();
  };

  const tab = (w: "depart" | "return", label: string, value: ISODate | null) => (
    <button
      type="button"
      aria-pressed={which === w}
      onClick={() => setEditing(w)}
      className={`flex flex-1 flex-col items-start rounded-2xl border-2 px-4 py-2.5 text-left transition ${which === w ? "border-navy bg-navy-50" : "border-line bg-white hover:border-navy/40"}`}
    >
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="font-semibold text-navy">{value ? formatDateShort(value) : "Elige en el calendario"}</span>
    </button>
  );

  return (
    <form onSubmit={submit} className="space-y-6" aria-labelledby="step-title" noValidate>
      <div className="grid gap-4 lg:grid-cols-2">
        <TripTypeToggle />
        <RouteFields />
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          {tab("depart", `Ida · ${AIRPORTS[search.origin].city} → ${AIRPORTS[search.destination].city}`, search.departDate)}
          {roundTrip && tab("return", `Vuelta · ${AIRPORTS[search.destination].city} → ${AIRPORTS[search.origin].city}`, search.returnDate)}
        </div>
        <SeasonLegend />
        <div className="mt-4">
          <PriceCalendar
            key={which}
            label={which === "return" ? "Calendario de vuelta" : "Calendario de ida"}
            origin={which === "return" ? search.destination : search.origin}
            value={which === "return" ? search.returnDate : search.departDate}
            minDate={which === "return" ? (search.departDate ?? undefined) : undefined}
            rangeStart={which === "return" ? search.departDate : null}
            local={local}
            months={2}
            onSelect={(d) => {
              setError(null);
              if (which === "depart") {
                setSearch({ departDate: d });
                announce(`Ida seleccionada: ${formatDateShort(d)}`);
                if (roundTrip) setEditing("return");
              } else {
                setSearch({ returnDate: d });
                announce(`Vuelta seleccionada: ${formatDateShort(d)}`);
              }
            }}
          />
        </div>
        <p className="mt-3 text-xs text-muted">En temporada baja (noviembre a marzo) solo operamos de jueves a domingo.</p>
      </div>

      <div className="card p-5 sm:p-6">
        <h3 className="mb-2 text-lg text-navy">Pasajeros</h3>
        <PassengerCounters />
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="lg" icon={<Search className="size-5" aria-hidden />}>
          Ver vuelos disponibles
        </Button>
      </div>
    </form>
  );
}
