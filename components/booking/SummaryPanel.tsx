"use client";

import { useState } from "react";
import { ChevronUp, Plane, Users } from "lucide-react";
import { AIRPORTS, PRICING } from "@/config/site";
import { formatDateShort } from "@/lib/dates";
import { formatEUR, plural } from "@/lib/format";
import type { Quote } from "@/lib/types";
import { useBooking } from "@/store/booking";
import { useDraftQuote, useSelectedFlights } from "./useDraft";

const GROUPS: { id: Quote["lines"][number]["group"]; label: string }[] = [
  { id: "billetes", label: "Billetes" },
  { id: "asientos", label: "Asientos" },
  { id: "extras", label: "Extras" },
  { id: "descuentos", label: "Descuentos" },
];

function SummaryContent() {
  const search = useBooking((s) => s.search);
  const { outbound, inbound } = useSelectedFlights();
  const quote = useDraftQuote();

  const legRow = (label: string, from: string, to: string, date: string | null, time?: string) => (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-pink-50 text-pink-700">
        <Plane className="size-4" aria-hidden />
      </span>
      <div className="text-sm">
        <p className="font-semibold text-navy">
          {label}: {from} → {to}
        </p>
        <p className="text-muted">
          {date ? formatDateShort(date) : "Fecha por elegir"}
          {time ? ` · ${time}` : ""}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {legRow(
          "Ida",
          AIRPORTS[search.origin].city,
          AIRPORTS[search.destination].city,
          search.departDate,
          outbound ? `${outbound.departure} – ${outbound.arrival}` : undefined,
        )}
        {search.tripType === "idavuelta" &&
          legRow(
            "Vuelta",
            AIRPORTS[search.destination].city,
            AIRPORTS[search.origin].city,
            search.returnDate,
            inbound ? `${inbound.departure} – ${inbound.arrival}` : undefined,
          )}
        <p className="flex items-center gap-3 text-sm text-muted">
          <span className="grid size-8 place-items-center rounded-full bg-navy-50 text-navy">
            <Users className="size-4" aria-hidden />
          </span>
          {[plural(search.adults, "adulto", "adultos"), search.children ? plural(search.children, "niño", "niños") : null, search.infants ? plural(search.infants, "bebé", "bebés") : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {quote.lines.length > 0 ? (
        <dl className="space-y-4 border-t border-line pt-4 text-sm">
          {GROUPS.map((g) => {
            const lines = quote.lines.filter((l) => l.group === g.id);
            if (!lines.length) return null;
            return (
              <div key={g.id}>
                <dt className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">{g.label}</dt>
                {lines.map((l, i) => (
                  <dd key={i} className="flex justify-between gap-3 py-0.5">
                    <span>
                      {l.label}
                      {l.detail && <span className="block text-xs text-muted">{l.detail}</span>}
                    </span>
                    <span className={`shrink-0 tabular-nums ${l.amount < 0 ? "text-success" : ""}`}>{formatEUR(l.amount)}</span>
                  </dd>
                ))}
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="border-t border-line pt-4 text-sm text-muted">Elige tus vuelos para ver el precio.</p>
      )}

      <div className="rounded-2xl bg-pastel p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-navy">Total</span>
          <span className="font-display text-2xl font-bold tabular-nums text-navy" aria-live="polite" aria-atomic>
            {formatEUR(quote.total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          IVA ({PRICING.vatRate * 100} %) incluido: {formatEUR(quote.vat)}
        </p>
      </div>
    </div>
  );
}

export function SummaryPanel() {
  const quote = useDraftQuote();
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Escritorio: barra lateral fija */}
      <aside aria-labelledby="summary-title" className="card sticky top-24 hidden p-6 lg:block">
        <h2 id="summary-title" className="mb-5 text-lg text-navy">
          Tu reserva
        </h2>
        <SummaryContent />
      </aside>

      {/* Móvil: panel desplegable fijo abajo */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div id="mobile-summary" hidden={!open} className="max-h-[65dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-white px-5 pb-4 pt-5 shadow-[0_-12px_40px_-12px_rgb(31_56_100/0.3)]">
          <h2 className="mb-4 text-lg text-navy">Tu reserva</h2>
          <SummaryContent />
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-summary"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center justify-between bg-navy px-5 py-4 text-white ${open ? "" : "rounded-t-3xl shadow-[0_-8px_30px_-10px_rgb(31_56_100/0.5)]"}`}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ChevronUp className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
            {open ? "Ocultar resumen" : "Ver resumen"}
          </span>
          <span className="font-display text-xl font-bold tabular-nums">
            <span className="visually-hidden">Total: </span>
            {formatEUR(quote.total)}
          </span>
        </button>
      </div>
    </>
  );
}
