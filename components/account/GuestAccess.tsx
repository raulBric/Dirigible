"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { useApp, useCurrentUser } from "@/store/app";
import { Button } from "@/components/ui/Button";
import { TextField, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Card, Notice } from "@/components/ui/Primitives";
import { AuthTabs } from "./AuthForms";
import { BookingCard, FlashMessage } from "./BookingManager";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .toLowerCase();

export function ManageBooking() {
  const bookings = useApp((s) => s.bookings);
  const [locator, setLocator] = useState("");
  const [lastName, setLastName] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const v = useValidation();
  const booking = bookings.find((b) => b.locator === found);
  const errors = {
    locator: /^[A-Z0-9]{6}$/.test(locator.trim().toUpperCase()) ? null : "El localizador tiene 6 caracteres (letras y números).",
    lastName: lastName.trim() ? null : "El apellido es obligatorio.",
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (errors.locator || errors.lastName) return focusFirstInvalid(e.currentTarget);
    const loc = locator.trim().toUpperCase();
    const b = bookings.find((x) => x.locator === loc && x.passengers.some((p) => normalize(p.lastName).split(" ").includes(normalize(lastName).split(" ")[0])));
    if (!b) {
      setFound(null);
      setError("No encontramos ninguna reserva con esos datos. Revisa el localizador y el primer apellido de un pasajero.");
      return;
    }
    setError(null);
    setFound(b.locator);
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <TextField
            label="Localizador"
            required
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={6}
            value={locator}
            onChange={(e) => setLocator(e.target.value.toUpperCase())}
            onBlur={() => v.touch("locator")}
            error={errors.locator}
            showError={v.shouldShow("locator")}
          />
          <TextField
            label="Primer apellido"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => v.touch("lastName")}
            error={errors.lastName}
            showError={v.shouldShow("lastName")}
          />
          <Button type="submit" icon={<Search className="size-4" aria-hidden />}>
            Buscar reserva
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-muted">
          Las reservas se guardan en este navegador. Prueba con una reserva que hayas hecho o inicia sesión con la cuenta demo para ver ejemplos.
        </p>
      </Card>
      <FlashMessage />
      {booking && <BookingCard booking={booking} />}
    </div>
  );
}

export function AccessPage() {
  const router = useRouter();
  const user = useCurrentUser();
  if (user) {
    return (
      <Notice tone="success" title={`Ya has iniciado sesión como ${user.firstName}`}>
        <Button size="sm" className="mt-2" onClick={() => router.push("/mi-cuenta")}>
          Ir a mi cuenta
        </Button>
      </Notice>
    );
  }
  return (
    <Card className="p-6 sm:p-8">
      <AuthTabs onSuccess={() => router.push("/mi-cuenta")} />
    </Card>
  );
}
