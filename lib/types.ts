import type { AirportId, MenuId, Season } from "@/config/site";
import type { ISODate } from "./dates";

export type TripType = "ida" | "idavuelta";
export type PassengerType = "adult" | "child" | "infant";
export type DocType = "DNI" | "NIE" | "Pasaporte";

export interface SearchParams {
  tripType: TripType;
  origin: AirportId;
  destination: AirportId;
  departDate: ISODate | null;
  returnDate: ISODate | null;
  adults: number;
  children: number;
  infants: number;
}

export interface Flight {
  id: string; // p. ej. "2026-07-12-0800-girona"
  date: ISODate;
  departure: string; // "08:00"
  arrival: string; // "10:15"
  origin: AirportId;
  destination: AirportId;
  season: Season;
  capacity: number;
  booked: number;
  available: number;
  occupancy: number; // 0–1
  adultPrice: number;
  basePrice: number;
  advanceDiscount: boolean;
  highDemand: boolean;
  lastSeats: boolean;
  bestPrice: boolean;
  gate: string;
}

export interface Passenger {
  type: PassengerType;
  firstName: string;
  lastName: string;
  birthDate: ISODate | "";
  docType: DocType;
  docNumber: string;
  nationality: string;
  assistance: boolean;
}

export interface Contact {
  email: string;
  phone: string;
}

export interface InvoiceData {
  companyName: string;
  nif: string;
  address: string;
}

export interface Extras {
  /** Menú por índice de pasajero (null = sin menú). Se aplica a todos los trayectos. */
  menus: (MenuId | null)[];
  allergyNotes: string;
  bags: number; // maletas adicionales por trayecto
  insurance: boolean;
  parkingDays: number;
  shuttle: boolean;
}

/** Asiento por trayecto (0 = ida, 1 = vuelta) y por pasajero con asiento. */
export type SeatSelection = (string | null)[][];

export type PaymentMethod = "tarjeta" | "bizum" | "paypal" | "wallet";

export interface LegSnapshot {
  flightId: string;
  date: ISODate;
  departure: string;
  arrival: string;
  origin: AirportId;
  destination: AirportId;
  gate: string;
  adultPrice: number;
  season: Season;
}

export interface PriceLine {
  label: string;
  detail?: string;
  amount: number;
  group: "billetes" | "asientos" | "extras" | "descuentos";
}

export interface Quote {
  lines: PriceLine[];
  tickets: number;
  seats: number;
  extras: number;
  subtotal: number;
  promoDiscount: number;
  pointsDiscount: number;
  total: number;
  vat: number;
  taxBase: number;
}

export type BookingStatus = "confirmada" | "cancelada" | "cancelada_meteo" | "reembolsada";

export interface Booking {
  locator: string;
  createdAt: string; // ISO datetime
  userId: string | null;
  tripType: TripType;
  legs: LegSnapshot[];
  passengers: Passenger[];
  contact: Contact;
  invoice: InvoiceData | null;
  seats: SeatSelection;
  extras: Extras;
  promoCode: string | null;
  pointsRedeemed: number;
  quote: Quote;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  checkedIn: boolean[]; // por trayecto
  refundAmount: number;
  pointsEarned: number;
  history: { date: string; text: string }[];
}

export interface FrequentPassenger {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: ISODate | "";
  docType: DocType;
  docNumber: string;
  nationality: string;
}

export interface PointsEntry {
  id: string;
  date: string;
  description: string;
  points: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // demo: almacenado en local, nunca usar así en producción
  phone: string;
  birthDate: ISODate | "";
  docType: DocType;
  docNumber: string;
  nationality: string;
  points: number;
  lifetimePoints: number;
  pointsHistory: PointsEntry[];
  frequentPassengers: FrequentPassenger[];
  createdAt: string;
}

export interface B2BRequest {
  id: string;
  createdAt: string;
  eventType: string;
  format: "privada" | "charter";
  roundTrip: boolean;
  preferredDate: ISODate | "";
  alternativeDate: ISODate | "";
  guests: number;
  customMenu: boolean;
  branding: boolean;
  transfers: boolean;
  notes: string;
  company: { name: string; nif: string; sector: string };
  contact: { name: string; role: string; email: string; phone: string };
  estimate: number;
}
