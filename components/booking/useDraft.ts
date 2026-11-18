"use client";

import { useMemo } from "react";
import { todayISO } from "@/lib/dates";
import { flightById } from "@/lib/flights";
import { computeQuote } from "@/lib/pricing";
import type { Flight } from "@/lib/types";
import { useCurrentUser, useLocalOccupancy } from "@/store/app";
import { useBooking } from "@/store/booking";

export function useSelectedFlights() {
  const outboundId = useBooking((s) => s.outboundId);
  const inboundId = useBooking((s) => s.inboundId);
  const tripType = useBooking((s) => s.search.tripType);
  const local = useLocalOccupancy();
  return useMemo(() => {
    const today = todayISO();
    const outbound = outboundId ? flightById(outboundId, today, local) : null;
    const inbound = tripType === "idavuelta" && inboundId ? flightById(inboundId, today, local) : null;
    const legs = [outbound, inbound].filter(Boolean) as Flight[];
    return { outbound, inbound, legs };
  }, [outboundId, inboundId, tripType, local]);
}

export function useDraftQuote() {
  const { legs } = useSelectedFlights();
  const passengers = useBooking((s) => s.passengers);
  const seats = useBooking((s) => s.seats);
  const extras = useBooking((s) => s.extras);
  const promoCode = useBooking((s) => s.promoCode);
  const pointsToRedeem = useBooking((s) => s.pointsToRedeem);
  const user = useCurrentUser();
  const points = user ? Math.min(pointsToRedeem, user.points) : 0;
  return useMemo(
    () =>
      computeQuote({
        legs,
        paxTypes: passengers.map((p) => p.type),
        seats,
        extras,
        promoCode,
        pointsRedeemed: points,
      }),
    [legs, passengers, seats, extras, promoCode, points],
  );
}
