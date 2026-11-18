"use client";

import Link from "next/link";
import { useMemo, useRef, type KeyboardEvent } from "react";
import { Lock } from "lucide-react";
import { SEATING } from "@/config/site";
import { isWindowSeat, occupiedSeats, type LocalOccupancy } from "@/lib/flights";

interface Props {
  flightId: string;
  local: LocalOccupancy;
  /** Asiento elegido por cada pasajero con asiento (índice = pasajero). */
  selection: (string | null)[];
  passengerNames: string[];
  activePax: number;
  onPick: (seat: string) => void;
  /** Asientos que ya pertenecen a esta reserva (al cambiar de asiento en una reserva existente). */
  ownSeats?: string[];
}

const COLS: (string | null)[] = ["A", null, "B", "C", "D", null, "E"]; // 1-3-1 con pasillos

export function SeatMap({ flightId, local, selection, passengerNames, activePax, onPick, ownSeats = [] }: Props) {
  const occupied = useMemo(() => {
    const s = occupiedSeats(flightId, local);
    ownSeats.forEach((x) => s.delete(x));
    return s;
  }, [flightId, local, ownSeats]);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstFree = useMemo(() => {
    const active = selection[activePax];
    if (active) return active;
    for (let r = 1; r <= SEATING.rows; r++) for (const l of SEATING.letters) if (!occupied.has(`${r}${l}`)) return `${r}${l}`;
    return "1A";
  }, [selection, activePax, occupied]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const target = e.target as HTMLElement;
    const seat = target.dataset.seat;
    if (!seat) return;
    const row = Number(seat.slice(0, -1));
    const li = SEATING.letters.indexOf(seat.slice(-1) as (typeof SEATING.letters)[number]);
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const m = moves[e.key];
    if (!m) return;
    const nr = row + m[0];
    const nl = li + m[1];
    if (nr < 1 || nr > SEATING.rows || nl < 0 || nl >= SEATING.letters.length) return; // sin destino: deja el scroll nativo
    e.preventDefault();
    const next = gridRef.current?.querySelector<HTMLButtonElement>(`[data-seat="${nr}${SEATING.letters[nl]}"]`);
    if (next) {
      gridRef.current?.querySelectorAll<HTMLButtonElement>("[data-seat]").forEach((b) => (b.tabIndex = -1));
      next.tabIndex = 0;
      next.focus();
      next.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Leyenda de asientos">
        <li className="flex items-center gap-1.5">
          <span className="size-4 rounded-md bg-amber-50 ring-2 ring-amber" aria-hidden /> Ventanal +{SEATING.windowPrice} €
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-4 rounded-md bg-white ring-1 ring-navy/30" aria-hidden /> Estándar (incluido)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-4 rounded-md bg-gray-200" aria-hidden /> Ocupado
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-4 rounded-md bg-navy" aria-hidden /> Tu selección
        </li>
      </ul>

      <div className="mx-auto max-w-sm rounded-[48px] bg-linear-to-b from-navy-50 to-lilac-50 p-4 ring-1 ring-line sm:p-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-muted">Proa · ventanal panorámico</p>
        <div ref={gridRef} role="grid" aria-label="Mapa de la cabina Lounge, 50 butacas" onKeyDown={onKeyDown} className="space-y-2">
          <div role="row" className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1.5 text-center text-[11px] font-semibold text-muted">
            {COLS.map((c, i) => (
              <span key={i} role={c ? "columnheader" : "presentation"} aria-label={c ? (c === "A" || c === "E" ? `Columna ${c}, ventanal` : `Columna ${c}`) : undefined}>
                {c ?? ""}
              </span>
            ))}
          </div>
          {Array.from({ length: SEATING.rows }, (_, r) => r + 1).map((row) => (
            <div key={row} role="row" className="grid grid-cols-[repeat(7,minmax(0,1fr))] items-center gap-1.5">
              {COLS.map((c, ci) => {
                if (!c) {
                  return (
                    <span key={ci} role="presentation" className="text-center text-[10px] text-muted/70">
                      {ci === 1 ? row : ""}
                    </span>
                  );
                }
                const id = `${row}${c}`;
                const ownerIdx = selection.findIndex((s) => s === id);
                const taken = occupied.has(id);
                const win = isWindowSeat(id);
                const mine = ownerIdx >= 0;
                const isActive = ownerIdx === activePax;
                const label = `Asiento ${id}${win ? ", ventanal, 15 € más" : ", estándar, incluido"}, ${
                  taken ? "ocupado" : mine ? `elegido para ${passengerNames[ownerIdx]}` : "libre"
                }`;
                return (
                  <span key={ci} role="gridcell" className="flex justify-center">
                    <button
                      type="button"
                      data-seat={id}
                      tabIndex={id === firstFree ? 0 : -1}
                      aria-disabled={taken || undefined}
                      aria-pressed={mine}
                      aria-label={label}
                      onClick={() => !taken && onPick(id)}
                      className={`relative grid aspect-square w-full max-w-11 place-items-center rounded-lg text-[11px] font-bold transition ${
                        taken
                          ? "cursor-not-allowed bg-gray-200 text-gray-400"
                          : mine
                            ? `bg-navy text-white ${isActive ? "ring-4 ring-pink" : ""}`
                            : win
                              ? "bg-amber-50 text-amber-700 ring-2 ring-amber hover:bg-amber-100 hover:scale-105"
                              : "bg-white text-navy ring-1 ring-navy/30 hover:bg-navy-50 hover:scale-105"
                      }`}
                    >
                      {mine ? ownerIdx + 1 : taken ? "×" : c}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <Link
          href="/empresas"
          className="mt-5 flex items-center gap-3 rounded-3xl border-2 border-dashed border-navy/25 bg-white/60 p-4 text-sm text-muted transition hover:border-navy/50"
        >
          <Lock className="size-5 shrink-0 text-navy" aria-hidden />
          <span>
            <strong className="block text-navy">Zona privada · {SEATING.privateZoneSeats} plazas</strong>
            Reservada para empresas y grupos. Consulta las opciones →
          </span>
        </Link>
        <p className="mt-3 text-center text-xs font-semibold uppercase tracking-widest text-muted">Popa</p>
      </div>
    </div>
  );
}
