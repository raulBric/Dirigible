import { addDays, todayISO, toISODate, dateTime } from "./dates";
import { ALL_SEATS, flightsFor, isWindowSeat, occupiedSeats, operatesOn, type LocalOccupancy } from "./flights";
import { computeQuote, pointsEarnedFor } from "./pricing";
import { generateLocator, uid } from "./random";
import type { Booking, Extras, Flight, LegSnapshot, Passenger, SeatSelection, User } from "./types";

export function snapshot(f: Flight): LegSnapshot {
  return {
    flightId: f.id,
    date: f.date,
    departure: f.departure,
    arrival: f.arrival,
    origin: f.origin,
    destination: f.destination,
    gate: f.gate,
    adultPrice: f.adultPrice,
    season: f.season,
  };
}

/** Asigna asientos estándar libres a quien no haya elegido. */
export function autoAssignSeats(legs: LegSnapshot[], seats: SeatSelection, seated: number, local: LocalOccupancy): SeatSelection {
  return legs.map((leg, li) => {
    const taken = occupiedSeats(leg.flightId, local);
    const chosen = Array.from({ length: seated }, (_, i) => seats[li]?.[i] ?? null);
    chosen.forEach((s) => s && taken.add(s));
    const free = ALL_SEATS.filter((s) => !taken.has(s) && !isWindowSeat(s)).concat(ALL_SEATS.filter((s) => !taken.has(s) && isWindowSeat(s)));
    return chosen.map((s) => s ?? free.shift() ?? null);
  });
}

/* ───────────── Datos de demostración ───────────── */

const demoPassengers = (u: Pick<User, "firstName" | "lastName" | "birthDate" | "docType" | "docNumber" | "nationality">): Passenger[] => [
  { type: "adult", firstName: u.firstName, lastName: u.lastName, birthDate: u.birthDate, docType: u.docType, docNumber: u.docNumber, nationality: u.nationality, assistance: false },
  { type: "adult", firstName: "Jordi", lastName: "Puig Serra", birthDate: "1986-09-21", docType: "DNI", docNumber: "87654321X", nationality: "Española", assistance: false },
];

function findOperatingDate(from: string, maxDays = 30) {
  for (let i = 0; i <= maxDays; i++) {
    const d = addDays(from, i);
    if (operatesOn(d)) return d;
  }
  return from;
}

function demoBooking(user: User, flight: Flight, opts: { createdAt: Date; extras?: Partial<Extras>; status?: Booking["status"] }): Booking {
  const passengers = demoPassengers(user);
  const legs = [snapshot(flight)];
  const extras: Extras = { menus: ["empordanes", "huerta"], allergyNotes: "", bags: 0, insurance: false, parkingDays: 0, shuttle: false, ...opts.extras };
  const seats = autoAssignSeats(legs, [["3A", "3B"]], 2, {});
  const quote = computeQuote({ legs, paxTypes: passengers.map((p) => p.type), seats, extras, promoCode: null, pointsRedeemed: 0 });
  return {
    locator: generateLocator(),
    createdAt: opts.createdAt.toISOString(),
    userId: user.id,
    tripType: "ida",
    legs,
    passengers,
    contact: { email: user.email, phone: user.phone },
    invoice: null,
    seats,
    extras,
    promoCode: null,
    pointsRedeemed: 0,
    quote,
    paymentMethod: "tarjeta",
    status: opts.status ?? "confirmada",
    checkedIn: [false],
    refundAmount: 0,
    pointsEarned: pointsEarnedFor(quote.total),
    history: [{ date: opts.createdAt.toISOString(), text: "Reserva confirmada" }],
  };
}

/** Cuenta demo con reservas próximas (check-in abierto), futuras y pasadas. */
export function buildDemoData(): { users: User[]; bookings: Booking[] } {
  const today = todayISO();
  const user: User = {
    id: uid("usr"),
    firstName: "Laura",
    lastName: "Martí Vidal",
    email: "demo@dirigible.es",
    password: "demo1234",
    phone: "+34 600 123 456",
    birthDate: "1990-04-15",
    docType: "DNI",
    docNumber: "12345678Z",
    nationality: "Española",
    points: 0,
    lifetimePoints: 0,
    pointsHistory: [],
    frequentPassengers: [
      { id: uid("fp"), firstName: "Jordi", lastName: "Puig Serra", birthDate: "1986-09-21", docType: "DNI", docNumber: "87654321X", nationality: "Española" },
      { id: uid("fp"), firstName: "Martina", lastName: "Puig Martí", birthDate: "2018-06-02", docType: "Pasaporte", docNumber: "PAB123456", nationality: "Española" },
    ],
    createdAt: new Date(Date.now() - 200 * 86_400_000).toISOString(),
  };

  const bookings: Booking[] = [];
  const pick = (date: string, origin: "girona" | "mallorca") => flightsFor(date, origin, date)[0] ?? null;

  // 1) Vuelo próximo (check-in abierto si sale en < 48 h)
  const soonDate = findOperatingDate(addDays(today, 1), 14);
  const now = new Date();
  let soon = flightsFor(soonDate, "girona", today).find((f) => dateTime(f.date, f.departure) > now) ?? pick(soonDate, "girona");
  if (!soon) soon = pick(findOperatingDate(addDays(today, 2)), "girona");
  if (soon) bookings.push(demoBooking(user, soon, { createdAt: new Date(Date.now() - 20 * 86_400_000), extras: { insurance: true } }));

  // 2) Vuelo futuro de verano
  const summer = new Date(new Date().getFullYear() + (new Date().getMonth() >= 6 ? 1 : 0), 6, 18);
  const summerDate = findOperatingDate(toISODate(summer));
  const future = pick(summerDate, "mallorca");
  if (future) bookings.push(demoBooking(user, future, { createdAt: new Date(Date.now() - 3 * 86_400_000), extras: { shuttle: false, bags: 1 } }));

  // 3) Vuelo pasado
  const pastDate = findOperatingDate(addDays(today, -45), 10);
  const past = pick(pastDate, "girona");
  if (past) {
    const b = demoBooking(user, past, { createdAt: new Date(Date.now() - 80 * 86_400_000), extras: { shuttle: true } });
    b.checkedIn = [true];
    bookings.push(b);
  }

  const earned = bookings.reduce((s, b) => s + b.pointsEarned, 0) + 1800;
  user.points = earned - 400;
  user.lifetimePoints = earned;
  user.pointsHistory = [
    ...bookings.map((b) => ({ id: uid("pt"), date: b.createdAt, description: `Reserva ${b.locator}`, points: b.pointsEarned })),
    { id: uid("pt"), date: new Date(Date.now() - 120 * 86_400_000).toISOString(), description: "Canje en reserva anterior", points: -400 },
    { id: uid("pt"), date: new Date(Date.now() - 150 * 86_400_000).toISOString(), description: "Vuelos de 2025 (traspaso de saldo)", points: 1550 },
    { id: uid("pt"), date: user.createdAt, description: "Bienvenida al programa Wind Points", points: 250 },
  ].sort((a, b) => b.date.localeCompare(a.date));

  return { users: [user], bookings };
}
