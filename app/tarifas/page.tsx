import type { Metadata } from "next";
import { CalendarDays, Check, Percent, TrendingUp } from "lucide-react";
import { EXTRAS, LOW_SEASON_WEEKDAYS, PRICING, SCHEDULES, SEASONS, SEATING, type Season } from "@/config/site";
import { formatEUR } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Primitives";
import { InfoPage } from "@/components/ui/InfoPage";

export const metadata: Metadata = {
  title: "Tarifas y horarios",
  description: "Precios por trayecto con IVA incluido: temporada alta 179 €, media 149 € y baja 129 €. Niños −25 %, bebés gratis. Horarios y extras.",
};

const WEEKDAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export default function TarifasPage() {
  const seasons = Object.keys(SEASONS) as Season[];
  return (
    <InfoPage eyebrow="Tarifas" title="Precios claros, sin sorpresas" subtitle="Precio por trayecto y pasajero, con IVA incluido. El calendario de reserva te muestra el precio exacto de cada día." narrow={false}>
      <div className="grid gap-6 md:grid-cols-3">
        {seasons.map((s) => (
          <Card key={s} className="relative overflow-hidden p-7">
            <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: SEASONS[s].color }} aria-hidden />
            <h2 className="text-xl text-navy">{SEASONS[s].label}</h2>
            <p className="text-sm text-muted">{SEASONS[s].description}</p>
            <p className="mt-5 font-display text-5xl font-bold text-navy">{SEASONS[s].fare} €</p>
            <p className="text-sm text-muted">adulto · por trayecto</p>
            <ul className="mt-5 space-y-1.5 text-sm">
              <li className="flex gap-2">
                <Check className="size-4 text-success" aria-hidden /> Niño (2–11): {formatEUR(SEASONS[s].fare * (1 - PRICING.childDiscount))}
              </li>
              <li className="flex gap-2">
                <Check className="size-4 text-success" aria-hidden /> Bebé (&lt;2): gratis, sin asiento
              </li>
              <li className="flex gap-2">
                <CalendarDays className="size-4 text-navy" aria-hidden /> Salidas: {SCHEDULES[s].map((x) => x.time).join(" · ")}
              </li>
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <Percent className="size-7 text-success" aria-hidden />
          <h2 className="mt-3 text-lg text-navy">Reserva con antelación: −10 %</h2>
          <p className="mt-1 text-sm text-muted">Si reservas con más de {PRICING.advanceDays} días de antelación, el billete tiene un 10 % de descuento.</p>
        </Card>
        <Card className="p-6">
          <TrendingUp className="size-7 text-amber-700" aria-hidden />
          <h2 className="mt-3 text-lg text-navy">Alta demanda: +15 %</h2>
          <p className="mt-1 text-sm text-muted">Cuando un vuelo supera el 80 % de ocupación, su tarifa sube un 15 %. Te avisamos con la etiqueta «Últimas plazas».</p>
        </Card>
      </div>

      <section className="mt-16" aria-labelledby="extras-title">
        <SectionTitle id="extras-title" title="Extras" />
        <Card className="overflow-x-auto p-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th scope="col" className="pb-2 font-medium">
                  Servicio
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-line">
                <td className="py-3">Asiento junto a ventanal</td>
                <td className="py-3">+{SEATING.windowPrice} € por asiento y trayecto</td>
              </tr>
              {Object.values(EXTRAS).map((e) => (
                <tr key={e.label} className="border-t border-line">
                  <td className="py-3">{e.label}</td>
                  <td className="py-3">
                    +{e.price} € {e.unit}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-line">
                <td className="py-3">Equipaje de cabina (10 kg + bolso)</td>
                <td className="py-3">Incluido</td>
              </tr>
            </tbody>
          </table>
        </Card>
        <p className="mt-4 text-sm text-muted">
          En temporada baja operamos {LOW_SEASON_WEEKDAYS.map((d) => WEEKDAY_NAMES[d]).join(", ")}. IVA ({PRICING.vatRate * 100} %) incluido en todos los precios.
        </p>
        <ButtonLink href="/reservar" className="mt-6">
          Ver precios en el calendario
        </ButtonLink>
      </section>
    </InfoPage>
  );
}
