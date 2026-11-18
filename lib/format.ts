const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const eurRound = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("es-ES");

export const formatEUR = (n: number) => eur.format(n);
/** Precio sin decimales cuando es entero (p. ej. "179 €"). */
export const formatEURShort = (n: number) => (Number.isInteger(n) ? eurRound.format(n) : eur.format(n));
export const formatNumber = (n: number) => num.format(n);

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
