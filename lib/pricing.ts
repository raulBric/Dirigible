import { AIRPORTS, CANCELLATION_POLICY, EXTRAS, PRICING, PROMO_CODES, SEATING, WIND_POINTS } from "@/config/site";
import { dateTime, diffDays, hoursUntil, todayISO } from "./dates";
import { isWindowSeat } from "./flights";
import { round2 } from "./format";
import type { Booking, Extras, LegSnapshot, PassengerType, PriceLine, Quote, SeatSelection } from "./types";

export const PAX_LABEL: Record<PassengerType, string> = { adult: "Adulto", child: "Niño (2–11)", infant: "Bebé (<2)" };

export function paxPrice(adultPrice: number, type: PassengerType) {
  if (type === "infant") return PRICING.infantPrice;
  if (type === "child") return round2(adultPrice * (1 - PRICING.childDiscount));
  return adultPrice;
}

export function normalizePromo(code: string | null | undefined) {
  const c = (code ?? "").trim().toUpperCase();
  return c && PROMO_CODES[c] ? c : null;
}

interface QuoteInput {
  legs: Pick<LegSnapshot, "adultPrice" | "origin" | "destination">[];
  paxTypes: PassengerType[];
  seats: SeatSelection;
  extras: Extras;
  promoCode: string | null;
  pointsRedeemed: number;
}

export function computeQuote({ legs, paxTypes, seats, extras, promoCode, pointsRedeemed }: QuoteInput): Quote {
  const lines: PriceLine[] = [];
  const legLabel = (i: number) =>
    `${i === 0 ? "Ida" : "Vuelta"} · ${AIRPORTS[legs[i].origin].city} → ${AIRPORTS[legs[i].destination].city}`;

  // Billetes por pasajero y tramo
  let tickets = 0;
  legs.forEach((leg, li) => {
    const counts: Partial<Record<PassengerType, number>> = {};
    paxTypes.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1));
    (Object.keys(counts) as PassengerType[]).forEach((t) => {
      const n = counts[t]!;
      const unit = paxPrice(leg.adultPrice, t);
      const amount = round2(unit * n);
      tickets += amount;
      lines.push({ label: `${n} × ${PAX_LABEL[t]}`, detail: legLabel(li), amount, group: "billetes" });
    });
  });

  // Asientos junto a ventanal
  let seatsTotal = 0;
  seats.forEach((legSeats, li) => {
    if (li >= legs.length) return;
    const windows = legSeats.filter((s) => s && isWindowSeat(s)).length;
    if (windows) {
      const amount = windows * SEATING.windowPrice;
      seatsTotal += amount;
      lines.push({ label: `${windows} × Asiento ventanal`, detail: legLabel(li), amount, group: "asientos" });
    }
  });

  // Extras
  const seated = paxTypes.filter((t) => t !== "infant").length;
  const nLegs = legs.length;
  let extrasTotal = 0;
  const addExtra = (label: string, amount: number, detail?: string) => {
    if (amount <= 0) return;
    extrasTotal += amount;
    lines.push({ label, detail, amount: round2(amount), group: "extras" });
  };
  const menus = extras.menus.filter(Boolean).length;
  addExtra(`${menus} × ${EXTRAS.menu.label}`, menus * EXTRAS.menu.price * nLegs, nLegs > 1 ? "Ida y vuelta" : undefined);
  addExtra(`${extras.bags} × ${EXTRAS.bag.label}`, extras.bags * EXTRAS.bag.price * nLegs, nLegs > 1 ? "Ida y vuelta" : undefined);
  if (extras.insurance) addExtra(EXTRAS.insurance.label, seated * EXTRAS.insurance.price, `${seated} pasajeros`);
  addExtra(`${EXTRAS.parking.label} (${extras.parkingDays} días)`, extras.parkingDays * EXTRAS.parking.price);
  if (extras.shuttle) addExtra(EXTRAS.shuttle.label, seated * EXTRAS.shuttle.price, `${seated} pasajeros`);

  const subtotal = round2(tickets + seatsTotal + extrasTotal);

  // Descuentos
  const promo = normalizePromo(promoCode);
  const promoDiscount = promo ? round2(subtotal * PROMO_CODES[promo].discount) : 0;
  if (promoDiscount) lines.push({ label: PROMO_CODES[promo!].label, detail: promo!, amount: -promoDiscount, group: "descuentos" });

  const afterPromo = subtotal - promoDiscount;
  const maxPoints = Math.floor(afterPromo * WIND_POINTS.pointsPerEuro);
  const usedPoints = Math.min(Math.max(0, Math.floor(pointsRedeemed)), maxPoints);
  const pointsDiscount = round2(usedPoints / WIND_POINTS.pointsPerEuro);
  if (pointsDiscount) lines.push({ label: "Canje de Wind Points", detail: `${usedPoints} puntos`, amount: -pointsDiscount, group: "descuentos" });

  const total = round2(Math.max(0, afterPromo - pointsDiscount));
  const taxBase = round2(total / (1 + PRICING.vatRate));
  return {
    lines,
    tickets: round2(tickets),
    seats: seatsTotal,
    extras: round2(extrasTotal),
    subtotal,
    promoDiscount,
    pointsDiscount,
    total,
    vat: round2(total - taxBase),
    taxBase,
  };
}

export function pointsEarnedFor(total: number) {
  return Math.floor(total * WIND_POINTS.earnPerEuro);
}

export function tierFor(lifetime: number) {
  const tiers = WIND_POINTS.tiers;
  let idx = 0;
  tiers.forEach((t, i) => {
    if (lifetime >= t.min) idx = i;
  });
  const next = tiers[idx + 1] ?? null;
  const progress = next ? (lifetime - tiers[idx].min) / (next.min - tiers[idx].min) : 1;
  return { tier: tiers[idx], next, progress: Math.min(1, Math.max(0, progress)), toNext: next ? next.min - lifetime : 0 };
}

/** Salida del primer trayecto aún no volado. */
export function firstDeparture(b: Booking) {
  return dateTime(b.legs[0].date, b.legs[0].departure);
}

export function isPastBooking(b: Booking, now = new Date()) {
  const last = b.legs[b.legs.length - 1];
  return dateTime(last.date, last.departure) < now;
}

/** Reembolso según la política de cancelación. */
export function refundFor(b: Booking, now = new Date()) {
  const hours = hoursUntil(firstDeparture(b), now);
  if (hours <= 0) return { rate: 0, amount: 0, reason: "El vuelo ya ha salido." };
  if (b.extras.insurance && hours >= CANCELLATION_POLICY.insuranceMinHours) {
    return { rate: 1, amount: b.quote.total, reason: CANCELLATION_POLICY.insuranceLabel };
  }
  const days = diffDays(b.legs[0].date, todayISO());
  const tier = CANCELLATION_POLICY.tiers.find((t) => days > t.minDays) ?? CANCELLATION_POLICY.tiers.at(-1)!;
  // El seguro no es reembolsable cuando se aplica la política estándar
  return { rate: tier.refund, amount: round2(b.quote.total * tier.refund), reason: tier.label };
}

export function checkInWindow(b: Booking, legIndex: number, now = new Date()) {
  const leg = b.legs[legIndex];
  const dep = dateTime(leg.date, leg.departure);
  const opens = new Date(dep.getTime() - CANCELLATION_POLICY.checkInOpensHours * 3_600_000);
  const closes = new Date(dep.getTime() - CANCELLATION_POLICY.boardingClosesMin * 60_000);
  return { opens, closes, open: now >= opens && now < closes, closed: now >= closes };
}
