"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRICING, SEASONS, type AirportId, type Season } from "@/config/site";
import { addDays, formatDateLong, formatMonth, parseISODate, todayISO, toISODate, type ISODate } from "@/lib/dates";
import { fromPrice, operatesOn, seasonOf, type LocalOccupancy } from "@/lib/flights";
import { formatEURShort } from "@/lib/format";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAYS_LONG = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

const seasonBg: Record<Season, string> = {
  alta: "bg-pink-50 hover:bg-pink-100",
  media: "bg-amber-50 hover:bg-amber-100",
  baja: "bg-sky-50 hover:bg-sky-100",
};

export function SeasonLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Leyenda de temporadas">
      {(Object.keys(SEASONS) as Season[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ background: SEASONS[s].color }} aria-hidden />
          {SEASONS[s].label} · desde {formatEURShort(SEASONS[s].fare * (1 - PRICING.advanceDiscount))}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full bg-gray-200" aria-hidden />
        Sin operación
      </li>
    </ul>
  );
}

interface Props {
  origin: AirportId;
  value: ISODate | null;
  onSelect: (d: ISODate) => void;
  minDate?: ISODate;
  rangeStart?: ISODate | null;
  local?: LocalOccupancy;
  months?: 1 | 2;
  label: string;
}

function monthMatrix(year: number, month: number): (ISODate | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (ISODate | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISODate(new Date(year, month, d)));
  while (cells.length % 7) cells.push(null);
  return cells;
}

export function PriceCalendar({ origin, value, onSelect, minDate, rangeStart, local, months = 1, label }: Props) {
  const today = todayISO();
  const min = minDate && minDate > today ? minDate : today;
  const max = addDays(today, PRICING.bookingHorizonDays);
  const initial = value ?? min;
  const [view, setView] = useState(() => {
    const d = parseISODate(initial);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [focusDate, setFocusDate] = useState<ISODate>(initial);
  const gridRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  const prices = useMemo(() => {
    const map = new Map<ISODate, number | null>();
    for (let i = 0; i < months; i++) {
      const d = new Date(view.y, view.m + i, 1);
      monthMatrix(d.getFullYear(), d.getMonth()).forEach((iso) => {
        if (iso && iso >= min && iso <= max) map.set(iso, fromPrice(iso, origin, today, local));
      });
    }
    return map;
  }, [view, months, origin, min, max, today, local]);

  const isEnabled = (iso: ISODate) => iso >= min && iso <= max && prices.get(iso) != null;

  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, view]);

  const viewStart = toISODate(new Date(view.y, view.m, 1));
  const viewEnd = toISODate(new Date(view.y, view.m + months, 0));
  const canPrev = viewStart > toISODate(new Date(parseISODate(min).getFullYear(), parseISODate(min).getMonth(), 1));
  const canNext = viewEnd < max;

  const shift = (delta: number) => {
    const d = new Date(view.y, view.m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    const iso = toISODate(d);
    setFocusDate(iso < min ? min : iso);
  };

  const moveFocus = (target: ISODate) => {
    if (target < min || target > max) return false;
    const t = parseISODate(target);
    const start = new Date(view.y, view.m, 1);
    const end = new Date(view.y, view.m + months, 0);
    if (t < start || t > end) setView({ y: t.getFullYear(), m: t.getMonth() });
    shouldFocus.current = true;
    setFocusDate(target);
    return true;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let target: ISODate | null = null;
    if (e.key in deltas) target = addDays(focusDate, deltas[e.key]);
    else if (e.key === "PageUp") target = addDays(focusDate, -30);
    else if (e.key === "PageDown") target = addDays(focusDate, 30);
    else if (e.key === "Home") target = addDays(focusDate, -((parseISODate(focusDate).getDay() + 6) % 7));
    else if (e.key === "End") target = addDays(focusDate, 6 - ((parseISODate(focusDate).getDay() + 6) % 7));
    if (target && moveFocus(target)) e.preventDefault();
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="grid size-10 place-items-center rounded-full text-navy transition hover:bg-navy-50 disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <p className="font-display text-sm font-semibold text-navy" aria-live="polite">
          {Array.from({ length: months }, (_, i) => formatMonth(new Date(view.y, view.m + i, 1))).join(" · ")}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          className="grid size-10 place-items-center rounded-full text-navy transition hover:bg-navy-50 disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div ref={gridRef} onKeyDown={onKeyDown} className={`grid gap-6 ${months === 2 ? "md:grid-cols-2" : ""}`}>
        {Array.from({ length: months }, (_, mi) => {
          const d = new Date(view.y, view.m + mi, 1);
          const cells = monthMatrix(d.getFullYear(), d.getMonth());
          const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
          return (
            <table key={mi} role="grid" aria-label={`${label}: ${formatMonth(d)}`} className={`w-full table-fixed border-separate border-spacing-1 ${mi === 1 ? "hidden md:table" : ""}`}>
              <thead>
                <tr>
                  {WEEKDAYS.map((w, i) => (
                    <th key={w} scope="col" className="pb-1 text-xs font-semibold text-muted">
                      <abbr title={WEEKDAYS_LONG[i]} className="no-underline">
                        {w}
                      </abbr>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((iso, ci) => {
                      if (!iso) return <td key={ci} />;
                      const enabled = isEnabled(iso);
                      const price = prices.get(iso);
                      const season = seasonOf(iso);
                      const selected = iso === value;
                      const inRange = rangeStart && value && iso > rangeStart && iso < value;
                      const isStart = rangeStart === iso;
                      const reason = iso < min || iso > max ? "no disponible" : !operatesOn(iso) ? "sin operación" : price == null ? "completo" : "";
                      return (
                        <td key={ci} className="p-0">
                          <button
                            type="button"
                            data-date={iso}
                            tabIndex={iso === focusDate ? 0 : -1}
                            aria-disabled={!enabled || undefined}
                            aria-pressed={selected}
                            aria-label={`${formatDateLong(iso)}, ${enabled ? `desde ${formatEURShort(price!)}, ${SEASONS[season].label.toLowerCase()}` : reason}${isStart ? ", fecha de ida" : ""}`}
                            onClick={() => {
                              setFocusDate(iso);
                              if (enabled) onSelect(iso);
                            }}
                            onFocus={() => setFocusDate(iso)}
                            className={`flex h-14 w-full flex-col items-center justify-center rounded-xl text-sm transition sm:h-16 ${
                              selected
                                ? "bg-navy text-white shadow-md"
                                : isStart
                                  ? "bg-navy/80 text-white"
                                  : enabled
                                    ? `${inRange ? "bg-lilac/40" : seasonBg[season]} text-ink`
                                    : "cursor-not-allowed bg-gray-50 text-gray-400 line-through decoration-gray-300"
                            }`}
                          >
                            <span className="font-semibold">{parseISODate(iso).getDate()}</span>
                            {enabled && (
                              <span className={`text-[10px] leading-tight sm:text-[11px] ${selected || isStart ? "text-white/90" : "text-muted"}`} aria-hidden>
                                {formatEURShort(Math.floor(price!))}
                              </span>
                            )}
                            {enabled && !selected && !isStart && (
                              <span className="mt-0.5 h-1 w-4 rounded-full" style={{ background: SEASONS[season].color }} aria-hidden />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">Usa las flechas del teclado para moverte por los días y Re Pág / Av Pág para cambiar de mes.</p>
    </div>
  );
}
