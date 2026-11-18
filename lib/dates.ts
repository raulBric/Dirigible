/**
 * Utilidades de fecha. Las fechas de calendario se manejan como cadenas "YYYY-MM-DD"
 * (fecha local, sin zona horaria) para evitar desfases al serializar en localStorage.
 */

export type ISODate = string; // "YYYY-MM-DD"

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(s: ISODate): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): ISODate {
  return toISODate(new Date());
}

export function addDays(s: ISODate, days: number): ISODate {
  const d = parseISODate(s);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  const ms = parseISODate(a).getTime() - parseISODate(b).getTime();
  return Math.round(ms / 86_400_000);
}

/** Combina una fecha y una hora "HH:MM" en un Date local. */
export function dateTime(date: ISODate, time: string): Date {
  const d = parseISODate(date);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${pad(hh)}:${pad(mm)}`;
}

export function hoursUntil(target: Date, now = new Date()): number {
  return (target.getTime() - now.getTime()) / 3_600_000;
}

/** Edad cumplida en una fecha de referencia. */
export function ageOn(birth: ISODate, ref: ISODate): number {
  const b = parseISODate(birth);
  const r = parseISODate(ref);
  let age = r.getFullYear() - b.getFullYear();
  const m = r.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && r.getDate() < b.getDate())) age--;
  return age;
}

const fmtLong = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtShort = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });
const fmtNumeric = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
const fmtMonth = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
const fmtDateTime = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export const formatDateLong = (s: ISODate) => fmtLong.format(parseISODate(s));
export const formatDateShort = (s: ISODate) => fmtShort.format(parseISODate(s));
export const formatDateNumeric = (s: ISODate) => fmtNumeric.format(parseISODate(s));
export const formatMonth = (d: Date) => {
  const t = fmtMonth.format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
export const formatDateTime = (d: Date | string) => fmtDateTime.format(typeof d === "string" ? new Date(d) : d);
