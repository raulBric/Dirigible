import type { Metadata } from "next";
import { InfoPage, LegalNotice, Prose } from "@/components/ui/InfoPage";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { CookiePreferences } from "@/components/layout/CookieBanner";
import { Card } from "@/components/ui/Primitives";

export const metadata: Metadata = { title: "Política de cookies" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Política de cookies">
      <LegalNotice />
      <Prose>
        <h2>Qué usamos</h2>
        <p>
          Este prototipo no instala cookies de terceros. Usa almacenamiento local técnico del navegador, necesario para que funcione, con estas claves:
        </p>
        <ul>
          <li>
            <strong>dirigible-reserva</strong>: tu reserva en curso, para que puedas volver atrás sin perder datos.
          </li>
          <li>
            <strong>dirigible-app</strong>: cuentas de demostración, reservas, solicitudes de empresa y tu preferencia de cookies.
          </li>
        </ul>
        <h2>Cookies analíticas y de marketing</h2>
        <p>En un servicio real podríamos usarlas para medir el uso del sitio y personalizar ofertas, siempre con tu consentimiento previo. En esta demo no se carga ninguna.</p>
      </Prose>
      <Card className="mt-8 p-6 sm:p-8">
        <h2 className="mb-5 text-xl text-navy">Tus preferencias</h2>
        <ClientOnly fallback={<div className="skeleton h-48" />}>
          <CookiePreferences />
        </ClientOnly>
      </Card>
    </InfoPage>
  );
}