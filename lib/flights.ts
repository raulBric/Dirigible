import { LOW_SEASON_WEEKDAYS, PRICING, ROUTE, SCHEDULES, SEASONS, SEATING, type AirportId, type Season } from "@/config/site";
import { addMinutesToTime, diffDays, parseISODate, type ISODate } from "./dates";
import { round2 } from "./format";
import { seededRandom } from "./random";
import type { Flight } from "./types";

/** Asientos ocupados por reservas hechas en este navegador, por id de vuelo. */
export type LocalOccupancy = Record<string, string[]>;

export function seasonOf(date: ISODate): Season {
  const month = parseISODate(date).getMonth() + 1;
  return (Object.keys(SEASONS) as Season[]).find((s) => SEASONS[s].months.includes(month)) ?? "baja";
}

export function operatesOn(date: ISODate): boolean {
  if (seasonOf(date) !== "baja") return true;
  return LOW_SEASON_WEEKDAYS.includes(parseISODate(date).getDay());
}

export const ALL_SEATS: string[] = Array.from({ length: SEATING.rows }, (_, r) =>
  SEATING.letters.map((l) => `${r + 1}${l}`),
).flat();

export const isWindowSeat = (seat: string) => (SEATING.windowLetters as readonly string[]).includes(seat.slice(-1));

/** Plazas vendidas "por otros clientes" (simuladas), deterministas por vuelo. */
function simulatedBooked(id: string, date: ISODate, season: Season): number {
  const rnd = seededRandom(id);
  const weekday = parseISODate(date).getDay();
  const weekend = weekday === 5 || weekday === 6 || weekday === 0;
  let f = 0.12 + rnd() * 0.62;
  if (season === "alta") f += 0.18;
  if (season === "media") f += 0.06;
  if (weekend) f += 0.08;
  if (rnd() < 0.08) f = 0.97 + rnd() * 0.05; // algunos vuelos casi llenos o completos
  return Math.min(ROUTE.capacity, Math.round(f * ROUTE.capacity));
}

/** Asientos concretos ocupados por terceros (selección determinista). */
export function simulatedSeats(flightId: string, count: number): string[] {
  const rnd = seededRandom(`${flightId}-seats`);
  const pool = [...ALL_SEATS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function occupiedSeats(flightId: string, local: LocalOccupancy = {}): Set<string> {
  const flight = flightById(flightId);
  const base = flight ? simulatedSeats(flightId, simulatedBooked(flightId, flight.date, flight.season)) : [];
  return new Set([...base, ...(local[flightId] ?? [])]);
}

export function adultFare(season: Season, date: ISODate, occupancy: number, today: ISODate) {
  const base = SEASONS[season].fare;
  const advance = diffDays(date, today) > PRICING.advanceDays;
  const highDemand = occupancy > PRICING.highDemandThreshold;
  let price = base;
  if (advance) price *= 1 - PRICING.advanceDiscount;
  if (highDemand) price *= 1 + PRICING.highDemandSurcharge;
  return { price: round2(price), base, advance, highDemand };
}

function buildFlight(date: ISODate, time: string, from: AirportId, today: ISODate, local: LocalOccupancy): Flight {
  const season = seasonOf(date);
  const destination: AirportId = from === "girona" ? "mallorca" : "girona";
  const id = `${date}-${time.replace(":", "")}-${from}`;
  const extra = local[id]?.length ?? 0;
  const booked = Math.min(ROUTE.capacity, simulatedBooked(id, date, season) + extra);
  const occupancy = booked / ROUTE.capacity;
  const fare = adultFare(season, date, occupancy, today);
  const available = ROUTE.capacity - booked;
  const gateRnd = seededRandom(`${id}-gate`)();
  return {
    id,
    date,
    departure: time,
    arrival: addMinutesToTime(time, ROUTE.durationMin),
    origin: from,
    destination,
    season,
    capacity: ROUTE.capacity,
    booked,
    available,
    occupancy,
    adultPrice: fare.price,
    basePrice: fare.base,
    advanceDiscount: fare.advance,
    highDemand: fare.highDemand,
    lastSeats: available > 0 && (available <= PRICING.lastSeatsThreshold || fare.highDemand),
    bestPrice: false,
    gate: `${from === "girona" ? "G" : "P"}${1 + Math.floor(gateRnd * 4)}`,
  };
}

/** Vuelos de un día en un sentido. Marca "Mejor precio" el más barato con plazas. */
export function flightsFor(date: ISODate, origin: AirportId, today: ISODate, local: LocalOccupancy = {}): Flight[] {
  if (!operatesOn(date)) return [];
  if (diffDays(date, today) < 0) return [];
  const flights = SCHEDULES[seasonOf(date)]
    .filter((s) => s.from === origin)
    .map((s) => buildFlight(date, s.time, s.from, today, local));
  const withSeats = flights.filter((f) => f.available > 0);
  if (withSeats.length) {
    const min = Math.min(...withSeats.map((f) => f.adultPrice));
    withSeats.forEach((f) => {
      if (f.adultPrice === min && (f.advanceDiscount || withSeats.length > 1)) f.bestPrice = true;
    });
  }
  return flights;
}

/** Precio "desde" de un día para el calendario (null si no se opera o no quedan plazas). */
export function fromPrice(date: ISODate, origin: AirportId, today: ISODate, local: LocalOccupancy = {}): number | null {
  const f = flightsFor(date, origin, today, local).filter((x) => x.available > 0);
  return f.length ? Math.min(...f.map((x) => x.adultPrice)) : null;
}

/** Reconstruye un vuelo a partir de su id (para reservas guardadas). */
export function flightById(id: string, today?: ISODate, local: LocalOccupancy = {}): Flight | null {
  const m = id.match(/^(\d{4}-\d{2}-\d{2})-(\d{2})(\d{2})-(girona|mallorca)$/);
  if (!m) return null;
  const [, date, hh, mm, from] = m;
  return buildFlight(date, `${hh}:${mm}`, from as AirportId, today ?? date, local);
}
