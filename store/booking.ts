"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AirportId } from "@/config/site";
import type { Contact, Extras, InvoiceData, Passenger, PassengerType, PaymentMethod, SearchParams, SeatSelection } from "@/lib/types";

export const STEPS = [
  { id: 1, label: "Búsqueda" },
  { id: 2, label: "Vuelo" },
  { id: 3, label: "Pasajeros" },
  { id: 4, label: "Asientos y extras" },
  { id: 5, label: "Pago" },
  { id: 6, label: "Confirmación" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export interface BookingDraft {
  step: StepId;
  maxStep: StepId;
  search: SearchParams;
  outboundId: string | null;
  inboundId: string | null;
  passengers: Passenger[];
  contact: Contact;
  wantsInvoice: boolean;
  invoice: InvoiceData;
  seats: SeatSelection;
  extras: Extras;
  promoCode: string;
  pointsToRedeem: number;
  paymentMethod: PaymentMethod;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  confirmedLocator: string | null;
}

interface BookingActions {
  setStep: (s: StepId) => void;
  goNext: () => void;
  setSearch: (p: Partial<SearchParams>) => void;
  swapRoute: () => void;
  selectFlight: (leg: "outbound" | "inbound", id: string | null) => void;
  updatePassenger: (i: number, p: Partial<Passenger>) => void;
  setContact: (c: Partial<Contact>) => void;
  setWantsInvoice: (v: boolean) => void;
  setInvoice: (c: Partial<InvoiceData>) => void;
  setSeat: (leg: number, pax: number, seat: string | null) => void;
  setExtras: (e: Partial<Extras>) => void;
  setMenu: (pax: number, menu: Extras["menus"][number]) => void;
  setPromoCode: (c: string) => void;
  setPointsToRedeem: (n: number) => void;
  setPaymentMethod: (m: PaymentMethod) => void;
  setAccepted: (k: "acceptedTerms" | "acceptedPrivacy", v: boolean) => void;
  confirm: (locator: string) => void;
  reset: () => void;
}

const emptyPassenger = (type: PassengerType): Passenger => ({
  type,
  firstName: "",
  lastName: "",
  birthDate: "",
  docType: type === "adult" ? "DNI" : "Pasaporte",
  docNumber: "",
  nationality: "Española",
  assistance: false,
});

const initialSearch: SearchParams = {
  tripType: "idavuelta",
  origin: "girona",
  destination: "mallorca",
  departDate: null,
  returnDate: null,
  adults: 2,
  children: 0,
  infants: 0,
};

const emptyExtras = (): Extras => ({ menus: [], allergyNotes: "", bags: 0, insurance: false, parkingDays: 0, shuttle: false });

const initialDraft = (): BookingDraft => ({
  step: 1,
  maxStep: 1,
  search: initialSearch,
  outboundId: null,
  inboundId: null,
  passengers: syncPassengers([], initialSearch),
  contact: { email: "", phone: "" },
  wantsInvoice: false,
  invoice: { companyName: "", nif: "", address: "" },
  seats: [[], []],
  extras: emptyExtras(),
  promoCode: "",
  pointsToRedeem: 0,
  paymentMethod: "tarjeta",
  acceptedTerms: false,
  acceptedPrivacy: false,
  confirmedLocator: null,
});

/** Mantiene la lista de pasajeros alineada con los contadores, conservando los datos ya escritos. */
function syncPassengers(current: Passenger[], s: SearchParams): Passenger[] {
  const byType = (t: PassengerType, n: number) => {
    const existing = current.filter((p) => p.type === t);
    return Array.from({ length: n }, (_, i) => existing[i] ?? emptyPassenger(t));
  };
  return [...byType("adult", s.adults), ...byType("child", s.children), ...byType("infant", s.infants)];
}

export const seatedCount = (s: SearchParams) => s.adults + s.children;

export const useBooking = create<BookingDraft & BookingActions>()(
  persist(
    (set) => ({
      ...initialDraft(),
      setStep: (step) => set((st) => ({ step, maxStep: (Math.max(st.maxStep, step) as StepId) })),
      goNext: () =>
        set((st) => {
          const step = Math.min(6, st.step + 1) as StepId;
          return { step, maxStep: Math.max(st.maxStep, step) as StepId };
        }),
      setSearch: (p) =>
        set((st) => {
          const search = { ...st.search, ...p };
          if (search.tripType === "ida") search.returnDate = null;
          if (search.departDate && search.returnDate && search.returnDate < search.departDate) search.returnDate = null;
          if (search.infants > search.adults) search.infants = search.adults;
          const passengers = syncPassengers(st.passengers, search);
          const seated = seatedCount(search);
          const routeChanged =
            p.origin !== undefined || p.destination !== undefined || p.departDate !== undefined || p.returnDate !== undefined || p.tripType !== undefined;
          return {
            search,
            passengers,
            // Si cambia la búsqueda, el vuelo elegido deja de ser válido
            outboundId: routeChanged ? null : st.outboundId,
            inboundId: routeChanged ? null : st.inboundId,
            seats: routeChanged ? [[], []] : st.seats.map((l) => l.slice(0, seated)),
            extras: { ...st.extras, menus: st.extras.menus.slice(0, seated) },
            maxStep: routeChanged ? (Math.min(st.maxStep, 2) as StepId) : st.maxStep,
            confirmedLocator: null,
          };
        }),
      swapRoute: () =>
        set((st) => {
          const origin: AirportId = st.search.destination;
          return {
            search: { ...st.search, origin, destination: st.search.origin },
            outboundId: null,
            inboundId: null,
            seats: [[], []],
            maxStep: Math.min(st.maxStep, 2) as StepId,
          };
        }),
      selectFlight: (leg, id) =>
        set((st) => ({
          [leg === "outbound" ? "outboundId" : "inboundId"]: id,
          seats: leg === "outbound" ? [[], st.seats[1]] : [st.seats[0], []],
        })),
      updatePassenger: (i, p) => set((st) => ({ passengers: st.passengers.map((x, j) => (j === i ? { ...x, ...p } : x)) })),
      setContact: (c) => set((st) => ({ contact: { ...st.contact, ...c } })),
      setWantsInvoice: (wantsInvoice) => set({ wantsInvoice }),
      setInvoice: (c) => set((st) => ({ invoice: { ...st.invoice, ...c } })),
      setSeat: (leg, pax, seat) =>
        set((st) => {
          const seats = st.seats.map((l) => [...l]);
          seats[leg] = seats[leg] ?? [];
          seats[leg][pax] = seat;
          return { seats };
        }),
      setExtras: (e) => set((st) => ({ extras: { ...st.extras, ...e } })),
      setMenu: (pax, menu) =>
        set((st) => {
          const menus = [...st.extras.menus];
          menus[pax] = menu;
          return { extras: { ...st.extras, menus } };
        }),
      setPromoCode: (promoCode) => set({ promoCode }),
      setPointsToRedeem: (pointsToRedeem) => set({ pointsToRedeem }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
      setAccepted: (k, v) => set({ [k]: v } as Pick<BookingDraft, typeof k>),
      confirm: (locator) => set({ confirmedLocator: locator, step: 6, maxStep: 6 }),
      reset: () => set(initialDraft()),
    }),
    {
      name: "dirigible-reserva",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
