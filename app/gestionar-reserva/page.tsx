import type { Metadata } from "next";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { ManageBooking } from "@/components/account/GuestAccess";
import { Container, SectionTitle, Skeleton } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Gestionar reserva",
  description: "Consulta y gestiona tu reserva sin cuenta con el localizador y el apellido.",
};

export default function Page() {
  return (
    <div className="bg-pastel-soft flex-1 py-14">
      <Container className="max-w-4xl">
        <SectionTitle
          as="h1"
          align="left"
          eyebrow="Sin cuenta"
          title="Gestiona tu reserva"
          subtitle="Introduce el localizador de 6 caracteres y el apellido de uno de los pasajeros."
        />
        <ClientOnly fallback={<Skeleton className="h-40 w-full" />}>
          <ManageBooking />
        </ClientOnly>
      </Container>
    </div>
  );
}