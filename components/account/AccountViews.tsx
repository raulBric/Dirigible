"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CalendarDays, FileText, Gift, LayoutDashboard, LogOut, Plane, Plus, Trash2, UserRound, Users, Wind } from "lucide-react";
import { AIRPORTS, WIND_POINTS } from "@/config/site";
import { formatDateLong, formatDateNumeric, formatDateTime } from "@/lib/dates";
import { formatEUR, formatNumber } from "@/lib/format";
import { downloadInvoice } from "@/lib/documents";
import { isPastBooking, tierFor } from "@/lib/pricing";
import type { Booking, DocType, FrequentPassenger, User } from "@/lib/types";
import { validateDocument, validateEmail, validateName, validatePhone } from "@/lib/validation";
import { useApp, useCurrentUser } from "@/store/app";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextField, announce, focusFirstInvalid, useValidation } from "@/components/ui/Form";
import { Badge, Card, Notice } from "@/components/ui/Primitives";
import { AuthTabs } from "./AuthForms";
import { BookingList } from "./BookingManager";

const NAV = [
  { href: "/mi-cuenta", label: "Resumen", icon: LayoutDashboard },
  { href: "/mi-cuenta/reservas", label: "Mis reservas", icon: Plane },
  { href: "/mi-cuenta/wind-points", label: "Wind Points", icon: Wind },
  { href: "/mi-cuenta/perfil", label: "Perfil y pasajeros", icon: UserRound },
  { href: "/mi-cuenta/facturas", label: "Facturas", icon: FileText },
];

export function useUserBookings(user: User | null) {
  const bookings = useApp((s) => s.bookings);
  return useMemo(() => (user ? bookings.filter((b) => b.userId === user.id || b.contact.email.toLowerCase() === user.email) : []), [bookings, user]);
}

export function AccountShell({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  const logout = useApp((s) => s.logout);
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-14">
        <h1 className="mb-2 text-3xl text-navy">Mi cuenta</h1>
        <p className="mb-6 text-muted">Inicia sesión para ver tus reservas y Wind Points.</p>
        <Card className="p-6">
          <AuthTabs />
        </Card>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Reservaste sin cuenta?{" "}
          <Link href="/gestionar-reserva" className="font-semibold text-navy underline underline-offset-2">
            Gestiona tu reserva con el localizador
          </Link>
        </p>
      </div>
    );
  }

  const { tier } = tierFor(user.lifetimePoints);
  return (
    <div className="bg-pastel-soft">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <Card className="p-5">
            <p className="text-sm text-muted">Hola,</p>
            <p className="font-display text-xl font-bold text-navy">
              {user.firstName} {user.lastName.split(" ")[0]}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Badge tone="pink">
                <Wind className="size-3.5" aria-hidden /> {tier.name}
              </Badge>
              <span className="font-semibold text-navy">{formatNumber(user.points)} pts</span>
            </p>
            <nav aria-label="Mi cuenta" className="mt-5">
              <ul className="flex gap-1 overflow-x-auto lg:flex-col">
                {NAV.map((n) => {
                  const active = pathname === n.href;
                  return (
                    <li key={n.href} className="shrink-0">
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-navy text-white" : "text-ink hover:bg-navy-50"}`}
                      >
                        <n.icon className="size-4" aria-hidden />
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="mt-4 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-navy-50 hover:text-navy"
            >
              <LogOut className="size-4" aria-hidden /> Cerrar sesión
            </button>
          </Card>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

function PageHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl text-navy">{title}</h1>
      {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
    </header>
  );
}

/* ───────────── Resumen ───────────── */

export function TierProgress({ user }: { user: User }) {
  const { tier, next, progress, toNext } = tierFor(user.lifetimePoints);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span>
          Nivel <strong className="text-navy">{tier.name}</strong>
        </span>
        <span className="text-muted">{next ? `${formatNumber(toNext)} puntos para ${next.name}` : "Nivel máximo alcanzado"}</span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={`Progreso hacia ${next?.name ?? "nivel máximo"}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div className="h-full rounded-full bg-linear-to-r from-pink to-amber transition-[width] duration-700" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {WIND_POINTS.tiers.map((t) => (
          <span key={t.id}>
            {t.name} · {formatNumber(t.min)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function AccountOverview() {
  const user = useCurrentUser()!;
  const bookings = useUserBookings(user);
  const next = bookings
    .filter((b) => !isPastBooking(b) && (b.status === "confirmada" || b.status === "cancelada_meteo"))
    .sort((a, b) => a.legs[0].date.localeCompare(b.legs[0].date))[0];
  const weather = bookings.filter((b) => b.status === "cancelada_meteo" && !isPastBooking(b));
  return (
    <>
      <PageHead title="Resumen" subtitle="Tu próximo viaje, tus puntos y accesos rápidos." />
      {weather.length > 0 && (
        <div className="mb-6">
          <Notice tone="error" title="Tienes un vuelo cancelado por meteorología">
            <Link href="/mi-cuenta/reservas" className="font-semibold underline">
              Elige cambio de fecha gratis o reembolso íntegro
            </Link>
          </Notice>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg text-navy">
            <CalendarDays className="size-5 text-pink-700" aria-hidden /> Próximo viaje
          </h2>
          {next ? (
            <>
              <p className="font-display text-2xl font-bold text-navy">
                {AIRPORTS[next.legs[0].origin].city} → {AIRPORTS[next.legs[0].destination].city}
              </p>
              <p className="first-letter:uppercase text-muted">
                {formatDateLong(next.legs[0].date)} · {next.legs[0].departure}
              </p>
              <p className="mt-2 text-sm">
                Localizador <strong className="tracking-widest">{next.locator}</strong>
              </p>
              <ButtonLink href="/mi-cuenta/reservas" size="sm" className="mt-4">
                Gestionar
              </ButtonLink>
            </>
          ) : (
            <>
              <p className="text-muted">Aún no tienes viajes próximos.</p>
              <ButtonLink href="/reservar" size="sm" className="mt-4">
                Reservar vuelo
              </ButtonLink>
            </>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg text-navy">
            <Wind className="size-5 text-pink-700" aria-hidden /> Wind Points
          </h2>
          <p className="font-display text-4xl font-bold text-navy">{formatNumber(user.points)}</p>
          <p className="mb-4 text-sm text-muted">puntos disponibles · {formatEUR(user.points / WIND_POINTS.pointsPerEuro)} en descuentos</p>
          <TierProgress user={user} />
        </Card>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/mi-cuenta/reservas", icon: Plane, label: `${bookings.length} reservas` },
          { href: "/mi-cuenta/perfil", icon: Users, label: `${user.frequentPassengers.length} pasajeros frecuentes` },
          { href: "/mi-cuenta/facturas", icon: FileText, label: "Facturas" },
        ].map((q) => (
          <Link key={q.href} href={q.href} className="card flex items-center gap-3 p-5 font-semibold text-navy transition hover:-translate-y-0.5">
            <q.icon className="size-5 text-pink-700" aria-hidden /> {q.label}
          </Link>
        ))}
      </div>
    </>
  );
}

export function AccountBookings() {
  const user = useCurrentUser()!;
  const bookings = useUserBookings(user);
  return (
    <>
      <PageHead title="Mis reservas" subtitle="Cambia fechas, añade extras, haz el check-in online o cancela." />
      <BookingList bookings={bookings} />
    </>
  );
}

/* ───────────── Wind Points ───────────── */

export function AccountPoints() {
  const user = useCurrentUser()!;
  const { tier } = tierFor(user.lifetimePoints);
  return (
    <>
      <PageHead title="Wind Points" subtitle="1 punto por cada euro. 100 puntos = 1 € de descuento." />
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <Card className="bg-linear-to-br from-navy to-navy-700 p-6 text-white">
          <p className="text-sm text-white/75">Saldo disponible</p>
          <p className="font-display text-5xl font-bold">{formatNumber(user.points)}</p>
          <p className="text-sm text-white/75">≈ {formatEUR(user.points / WIND_POINTS.pointsPerEuro)}</p>
          <p className="mt-4 text-sm">
            Acumulados en total: <strong>{formatNumber(user.lifetimePoints)}</strong>
          </p>
        </Card>
        <Card className="p-6">
          <TierProgress user={user} />
          <h2 className="mb-2 mt-6 text-lg text-navy">Tus beneficios {tier.name}</h2>
          <ul className="space-y-1.5 text-sm">
            {tier.benefits.map((b) => (
              <li key={b} className="flex gap-2">
                <Gift className="mt-0.5 size-4 shrink-0 text-pink-700" aria-hidden /> {b}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {WIND_POINTS.tiers.map((t) => (
          <Card key={t.id} className={`p-5 ${t.id === tier.id ? "ring-2 ring-pink" : ""}`}>
            <p className="font-display text-lg font-bold text-navy">{t.name}</p>
            <p className="text-xs text-muted">Desde {formatNumber(t.min)} puntos acumulados</p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {t.benefits.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-lg text-navy">Historial</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="pb-2 font-medium">
                  Fecha
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Concepto
                </th>
                <th scope="col" className="pb-2 text-right font-medium">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody>
              {user.pointsHistory.map((h) => (
                <tr key={h.id} className="border-t border-line">
                  <td className="py-2.5 pr-4 text-muted">{formatDateNumeric(h.date.slice(0, 10))}</td>
                  <td className="py-2.5 pr-4">{h.description}</td>
                  <td className={`py-2.5 text-right font-semibold tabular-nums ${h.points >= 0 ? "text-success" : "text-danger"}`}>
                    {h.points >= 0 ? "+" : ""}
                    {formatNumber(h.points)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ───────────── Perfil y pasajeros frecuentes ───────────── */

const emptyFP = (): Omit<FrequentPassenger, "id"> => ({ firstName: "", lastName: "", birthDate: "", docType: "DNI", docNumber: "", nationality: "Española" });

function FrequentPassengerForm({ initial, onSave, onCancel }: { initial: Omit<FrequentPassenger, "id">; onSave: (p: Omit<FrequentPassenger, "id">) => void; onCancel: () => void }) {
  const [p, setP] = useState(initial);
  const v = useValidation();
  const errors = {
    firstName: validateName(p.firstName, "El nombre"),
    lastName: validateName(p.lastName, "Los apellidos"),
    docNumber: validateDocument(p.docType, p.docNumber),
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return focusFirstInvalid(e.currentTarget);
    onSave(p);
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-2xl bg-navy-50/50 p-4 sm:grid-cols-2">
      <TextField label="Nombre" required value={p.firstName} onChange={(e) => setP({ ...p, firstName: e.target.value })} onBlur={() => v.touch("fn")} error={errors.firstName} showError={v.shouldShow("fn")} />
      <TextField label="Apellidos" required value={p.lastName} onChange={(e) => setP({ ...p, lastName: e.target.value })} onBlur={() => v.touch("ln")} error={errors.lastName} showError={v.shouldShow("ln")} />
      <TextField label="Fecha de nacimiento" type="date" value={p.birthDate} onChange={(e) => setP({ ...p, birthDate: e.target.value })} />
      <TextField label="Nacionalidad" value={p.nationality} onChange={(e) => setP({ ...p, nationality: e.target.value })} />
      <SelectField label="Documento" value={p.docType} onChange={(e) => setP({ ...p, docType: e.target.value as DocType })}>
        <option>DNI</option>
        <option>NIE</option>
        <option>Pasaporte</option>
      </SelectField>
      <TextField
        label="Número"
        required
        value={p.docNumber}
        onChange={(e) => setP({ ...p, docNumber: e.target.value.toUpperCase() })}
        onBlur={() => v.touch("doc")}
        error={errors.docNumber}
        showError={v.shouldShow("doc")}
      />
      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit">Guardar pasajero</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function AccountProfile() {
  const user = useCurrentUser()!;
  const updateUser = useApp((s) => s.updateUser);
  const saveFP = useApp((s) => s.saveFrequentPassenger);
  const removeFP = useApp((s) => s.removeFrequentPassenger);
  const [f, setF] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    birthDate: user.birthDate,
    docType: user.docType,
    docNumber: user.docNumber,
    nationality: user.nationality,
  });
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const v = useValidation();
  const errors = {
    firstName: validateName(f.firstName, "El nombre"),
    lastName: validateName(f.lastName, "Los apellidos"),
    email: validateEmail(f.email),
    phone: validatePhone(f.phone),
    docNumber: f.docNumber ? validateDocument(f.docType, f.docNumber) : null,
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    v.setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return focusFirstInvalid(e.currentTarget);
    updateUser(user.id, { ...f, email: f.email.trim().toLowerCase() });
    setSaved(true);
    announce("Perfil guardado.", 0);
  };
  const bind = (k: keyof typeof errors) => ({ onBlur: () => v.touch(k), error: errors[k], showError: v.shouldShow(k) });

  return (
    <>
      <PageHead title="Perfil y pasajeros" subtitle="Tus datos se usan para autocompletar las reservas." />
      <Card className="p-6">
        <h2 className="mb-4 text-lg text-navy">Datos personales</h2>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2" onChange={() => setSaved(false)}>
          <TextField label="Nombre" autoComplete="given-name" required value={f.firstName} onChange={(e) => setF({ ...f, firstName: e.target.value })} {...bind("firstName")} />
          <TextField label="Apellidos" autoComplete="family-name" required value={f.lastName} onChange={(e) => setF({ ...f, lastName: e.target.value })} {...bind("lastName")} />
          <TextField label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} {...bind("email")} />
          <TextField label="Teléfono" type="tel" autoComplete="tel" required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} {...bind("phone")} />
          <TextField label="Fecha de nacimiento" type="date" autoComplete="bday" value={f.birthDate} onChange={(e) => setF({ ...f, birthDate: e.target.value })} />
          <TextField label="Nacionalidad" value={f.nationality} onChange={(e) => setF({ ...f, nationality: e.target.value })} />
          <SelectField label="Tipo de documento" value={f.docType} onChange={(e) => setF({ ...f, docType: e.target.value as DocType })}>
            <option>DNI</option>
            <option>NIE</option>
            <option>Pasaporte</option>
          </SelectField>
          <TextField label="Número de documento" value={f.docNumber} onChange={(e) => setF({ ...f, docNumber: e.target.value.toUpperCase() })} {...bind("docNumber")} />
          <div className="flex items-center gap-4 sm:col-span-2">
            <Button type="submit">Guardar cambios</Button>
            {saved && (
              <p role="status" className="text-sm font-medium text-success">
                Cambios guardados
              </p>
            )}
          </div>
        </form>
      </Card>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg text-navy">Pasajeros frecuentes</h2>
          {editing !== "new" && (
            <Button size="sm" variant="secondary" onClick={() => setEditing("new")} icon={<Plus className="size-4" aria-hidden />}>
              Añadir
            </Button>
          )}
        </div>
        {editing === "new" && (
          <div className="mb-4">
            <FrequentPassengerForm
              initial={emptyFP()}
              onCancel={() => setEditing(null)}
              onSave={(p) => {
                saveFP(user.id, p);
                setEditing(null);
                announce("Pasajero añadido.", 0);
              }}
            />
          </div>
        )}
        {user.frequentPassengers.length === 0 && editing !== "new" ? (
          <p className="text-sm text-muted">Guarda a tus acompañantes habituales para reservar más rápido.</p>
        ) : (
          <ul className="space-y-3">
            {user.frequentPassengers.map((fp) => (
              <li key={fp.id}>
                {editing === fp.id ? (
                  <FrequentPassengerForm
                    initial={fp}
                    onCancel={() => setEditing(null)}
                    onSave={(p) => {
                      saveFP(user.id, { ...p, id: fp.id });
                      setEditing(null);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
                    <div>
                      <p className="font-semibold text-navy">
                        {fp.firstName} {fp.lastName}
                      </p>
                      <p className="text-sm text-muted">
                        {fp.docType} {fp.docNumber}
                        {fp.birthDate && ` · ${formatDateNumeric(fp.birthDate)}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(fp.id)}>
                        Editar<span className="visually-hidden"> a {fp.firstName}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          removeFP(user.id, fp.id);
                          announce(`${fp.firstName} eliminado.`, 0);
                        }}
                        aria-label={`Eliminar a ${fp.firstName} ${fp.lastName}`}
                        icon={<Trash2 className="size-4" aria-hidden />}
                      />
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

/* ───────────── Facturas ───────────── */

export function InvoicesTable({ bookings }: { bookings: Booking[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  if (!bookings.length) return <Card className="p-8 text-center text-muted">Aún no tienes facturas.</Card>;
  return (
    <Card className="overflow-x-auto p-6">
      <table className="w-full text-sm">
        <caption className="visually-hidden">Facturas de tus reservas</caption>
        <thead>
          <tr className="text-left text-xs text-muted">
            <th scope="col" className="pb-2 font-medium">
              Nº factura
            </th>
            <th scope="col" className="pb-2 font-medium">
              Fecha
            </th>
            <th scope="col" className="pb-2 font-medium">
              Viaje
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Importe
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              <span className="visually-hidden">Descargar</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...bookings]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((b) => (
              <tr key={b.locator} className="border-t border-line">
                <td className="py-3 pr-4 font-semibold text-navy">F-{b.locator}</td>
                <td className="py-3 pr-4 text-muted">{formatDateTime(b.createdAt)}</td>
                <td className="py-3 pr-4">
                  {AIRPORTS[b.legs[0].origin].code} → {AIRPORTS[b.legs[0].destination].code}
                  {b.legs.length > 1 && " (i/v)"}
                  {b.invoice && <span className="block text-xs text-muted">{b.invoice.companyName}</span>}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{formatEUR(b.quote.total)}</td>
                <td className="py-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={busy === b.locator}
                    onClick={async () => {
                      setBusy(b.locator);
                      try {
                        await downloadInvoice(b);
                      } finally {
                        setBusy(null);
                      }
                    }}
                    icon={<FileText className="size-4" aria-hidden />}
                  >
                    PDF<span className="visually-hidden"> de la factura F-{b.locator}</span>
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Card>
  );
}

export function AccountInvoices() {
  const user = useCurrentUser()!;
  const bookings = useUserBookings(user);
  return (
    <>
      <PageHead title="Facturas" subtitle="Descarga la factura de cada reserva en PDF." />
      <InvoicesTable bookings={bookings} />
    </>
  );
}
