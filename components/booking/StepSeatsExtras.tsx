"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Bus, Car, Check, Leaf, Luggage, ShieldCheck, Tag, UtensilsCrossed, Wind } from "lucide-react";
import { AIRPORTS, EXTRAS, MENUS, PROMO_CODES, WIND_POINTS, type MenuId } from "@/config/site";
import { diffDays } from "@/lib/dates";
import { formatEUR, formatNumber } from "@/lib/format";
import { normalizePromo, PAX_LABEL } from "@/lib/pricing";
import { useCurrentUser, useLocalOccupancy } from "@/store/app";
import { useBooking } from "@/store/booking";
import { Button } from "@/components/ui/Button";
import { Checkbox, Counter, TextArea, TextField, announce } from "@/components/ui/Form";
import { Badge, Card } from "@/components/ui/Primitives";
import { SeatMap } from "./SeatMap";
import { useDraftQuote, useSelectedFlights } from "./useDraft";

function SeatsSection() {
  const { legs } = useSelectedFlights();
  const passengers = useBooking((s) => s.passengers);
  const seats = useBooking((s) => s.seats);
  const setSeat = useBooking((s) => s.setSeat);
  const local = useLocalOccupancy();
  const [leg, setLeg] = useState(0);
  const [activePax, setActivePax] = useState(0);
  const seated = passengers.filter((p) => p.type !== "infant");
  const names = seated.map((p, i) => (p.firstName ? `${p.firstName} ${p.lastName}`.trim() : `${PAX_LABEL[p.type]} ${i + 1}`));
  const flight = legs[leg];
  if (!flight) return null;
  const selection = Array.from({ length: seated.length }, (_, i) => seats[leg]?.[i] ?? null);

  const pick = (seat: string) => {
    const owner = selection.findIndex((s) => s === seat);
    if (owner >= 0 && owner !== activePax) setSeat(leg, owner, null);
    setSeat(leg, activePax, selection[activePax] === seat ? null : seat);
    announce(`${names[activePax]}: asiento ${seat}`);
    const nextEmpty = selection.findIndex((s, i) => i > activePax && !s);
    if (nextEmpty >= 0) setActivePax(nextEmpty);
  };

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-1 text-lg text-navy">Elige tus asientos en la cabina «Lounge»</h3>
      <p className="mb-5 text-sm text-muted">Opcional: si no eliges, te asignaremos asientos estándar gratis. Los bebés viajan en brazos.</p>

      {legs.length > 1 && (
        <div className="mb-4 flex gap-2" role="group" aria-label="Trayecto">
          {legs.map((l, i) => (
            <button
              key={l.id}
              type="button"
              aria-pressed={leg === i}
              onClick={() => setLeg(i)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${leg === i ? "bg-navy text-white" : "bg-navy-50 text-navy hover:bg-navy/10"}`}
            >
              {i === 0 ? "Ida" : "Vuelta"} · {AIRPORTS[l.origin].code} → {AIRPORTS[l.destination].code}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">¿Para quién eliges?</legend>
          <div className="space-y-2">
            {names.map((n, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-sm transition has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy ${activePax === i ? "border-navy bg-navy-50" : "border-line hover:border-navy/30"}`}
              >
                <input type="radio" name={`active-pax-${leg}`} checked={activePax === i} onChange={() => setActivePax(i)} className="visually-hidden" />
                <span className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-navy text-xs font-bold text-white" aria-hidden>
                    {i + 1}
                  </span>
                  {n}
                </span>
                <span className="font-semibold text-navy">{selection[i] ?? "Sin elegir"}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <SeatMap flightId={flight.id} local={local} selection={selection} passengerNames={names} activePax={activePax} onPick={pick} />
      </div>
    </Card>
  );
}

function ExtrasSection() {
  const extras = useBooking((s) => s.extras);
  const setExtras = useBooking((s) => s.setExtras);
  const setMenu = useBooking((s) => s.setMenu);
  const passengers = useBooking((s) => s.passengers);
  const search = useBooking((s) => s.search);
  const { legs } = useSelectedFlights();
  const seated = passengers.filter((p) => p.type !== "infant");
  const n = legs.length;
  const suggestedDays = search.tripType === "idavuelta" && search.departDate && search.returnDate ? diffDays(search.returnDate, search.departDate) + 1 : 1;

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <UtensilsCrossed className="mt-1 size-6 text-pink-700" aria-hidden />
          <div>
            <h3 className="text-lg text-navy">{EXTRAS.menu.label}</h3>
            <p className="text-sm text-muted">
              +{EXTRAS.menu.price} € {EXTRAS.menu.unit}. Cocina de producto local servida en tu butaca.
            </p>
          </div>
        </div>
        <ul className="mb-5 grid gap-3 sm:grid-cols-3">
          {MENUS.map((m) => (
            <li key={m.id} className="rounded-2xl bg-pastel-soft p-4 ring-1 ring-line">
              <p className="flex items-center gap-2 font-semibold text-navy">
                {m.name}
                {m.vegetarian && (
                  <Badge tone="green">
                    <Leaf className="size-3" aria-hidden /> Veg
                  </Badge>
                )}
              </p>
              <p className="mt-1 text-sm text-ink/80">{m.description}</p>
              <p className="mt-2 text-xs text-muted">
                <span className="font-semibold">Alérgenos:</span> {m.allergens.join(", ")}
              </p>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 sm:grid-cols-2">
          {seated.map((p, i) => (
            <label key={i} className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{p.firstName ? `${p.firstName} ${p.lastName}` : `${PAX_LABEL[p.type]} ${i + 1}`}</span>
              <select
                value={extras.menus[i] ?? ""}
                onChange={(e) => setMenu(i, (e.target.value || null) as MenuId | null)}
                className="rounded-xl border border-line bg-white px-3 py-2.5 text-[15px]"
              >
                <option value="">Sin menú</option>
                {MENUS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (+{EXTRAS.menu.price * n} €)
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {extras.menus.some(Boolean) && (
          <TextArea
            wrapperClassName="mt-4"
            label="Alergias o intolerancias (opcional)"
            rows={2}
            value={extras.allergyNotes}
            onChange={(e) => setExtras({ allergyNotes: e.target.value })}
            hint="Nuestro equipo de cocina adaptará el menú."
          />
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Luggage className="mt-1 size-6 text-navy" aria-hidden />
            <div className="flex-1">
              <Counter
                label={EXTRAS.bag.label}
                description={`+${EXTRAS.bag.price} € ${EXTRAS.bag.unit} · 23 kg`}
                value={extras.bags}
                max={seated.length * 2}
                onChange={(bags) => setExtras({ bags })}
              />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Car className="mt-1 size-6 text-navy" aria-hidden />
            <div className="flex-1">
              <Counter
                label={EXTRAS.parking.label}
                description={`+${EXTRAS.parking.price} € ${EXTRAS.parking.unit}${suggestedDays > 1 ? ` · tu viaje: ${suggestedDays} días` : ""}`}
                value={extras.parkingDays}
                max={30}
                onChange={(parkingDays) => setExtras({ parkingDays })}
              />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-navy" aria-hidden />
            <Checkbox
              label={`${EXTRAS.insurance.label} · +${EXTRAS.insurance.price} € ${EXTRAS.insurance.unit}`}
              description="Cancela por cualquier motivo hasta 24 h antes y recupera el 100 %."
              checked={extras.insurance}
              onChange={(e) => setExtras({ insurance: e.target.checked })}
            />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <Bus className="mt-1 size-6 text-navy" aria-hidden />
            <Checkbox
              label={`${EXTRAS.shuttle.label} · +${EXTRAS.shuttle.price} € ${EXTRAS.shuttle.unit}`}
              description="Del vertipuerto de Palma al centro en 20 minutos, sincronizada con tu llegada."
              checked={extras.shuttle}
              onChange={(e) => setExtras({ shuttle: e.target.checked })}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function DiscountsSection() {
  const promoCode = useBooking((s) => s.promoCode);
  const setPromoCode = useBooking((s) => s.setPromoCode);
  const pointsToRedeem = useBooking((s) => s.pointsToRedeem);
  const setPoints = useBooking((s) => s.setPointsToRedeem);
  const user = useCurrentUser();
  const quote = useDraftQuote();
  const [code, setCode] = useState(promoCode);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(promoCode ? { ok: true, text: "Código aplicado." } : null);
  const maxPoints = user ? Math.min(user.points, Math.floor((quote.subtotal - quote.promoDiscount) * WIND_POINTS.pointsPerEuro)) : 0;

  const apply = () => {
    const valid = normalizePromo(code);
    if (valid) {
      setPromoCode(valid);
      setMsg({ ok: true, text: `${PROMO_CODES[valid].label} aplicado.` });
      announce(`${PROMO_CODES[valid].label} aplicado.`, 0);
    } else {
      setPromoCode("");
      const text = code.trim() ? "Este código no es válido o ha caducado." : "Escribe un código.";
      setMsg({ ok: false, text });
      announce(text, 0);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg text-navy">
          <Tag className="size-5 text-pink-700" aria-hidden /> Código promocional
        </h3>
        <div className="flex items-end gap-2">
          <TextField
            wrapperClassName="flex-1"
            label="Código"
            value={code}
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              }
            }}
          />
          <Button variant="secondary" onClick={apply}>
            Aplicar
          </Button>
        </div>
        {msg && (
          <p className={`mt-2 flex items-center gap-1.5 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>
            {msg.ok && <Check className="size-4" aria-hidden />}
            {msg.text}
          </p>
        )}
        <p className="mt-2 text-xs text-muted">Prueba con «LANZAMIENTO10».</p>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 text-lg text-navy">
          <Wind className="size-5 text-pink-700" aria-hidden /> Canjear Wind Points
        </h3>
        {user ? (
          <>
            <p className="mb-3 text-sm text-muted">
              Tienes <strong className="text-navy">{formatNumber(user.points)} puntos</strong>. 100 puntos = 1 €.
            </p>
            <label className="block text-sm font-medium" htmlFor="points-range">
              Puntos a canjear: <span className="text-navy">{formatNumber(Math.min(pointsToRedeem, maxPoints))}</span> ({formatEUR(Math.min(pointsToRedeem, maxPoints) / 100)})
            </label>
            <input
              id="points-range"
              type="range"
              min={0}
              max={maxPoints}
              step={100}
              value={Math.min(pointsToRedeem, maxPoints)}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="mt-2 w-full accent-navy"
              aria-valuetext={`${Math.min(pointsToRedeem, maxPoints)} puntos, ${formatEUR(Math.min(pointsToRedeem, maxPoints) / 100)}`}
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPoints(0)}>
                No canjear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPoints(maxPoints)}>
                Usar el máximo
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Inicia sesión en el paso anterior para canjear y acumular puntos.</p>
        )}
      </Card>
    </div>
  );
}

export function StepSeatsExtras({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-8">
      <SeatsSection />
      <section aria-labelledby="extras-title">
        <h3 id="extras-title" className="mb-4 font-display text-xl font-bold text-navy">
          Mejora tu viaje
        </h3>
        <ExtrasSection />
      </section>
      <section aria-label="Descuentos">
        <DiscountsSection />
      </section>
      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="size-4" aria-hidden />}>
          Volver
        </Button>
        <Button onClick={onNext}>
          Revisar y pagar <ArrowRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
