import type { Metadata } from "next";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata: Metadata = {
  title: "Reservar vuelo",
  description: "Reserva tu vuelo en dirigible entre Girona y Mallorca en 6 pasos: fechas, vuelo, pasajeros, asientos y extras, pago y confirmación.",
};

export default function ReservarPage() {
  return (
    <ClientOnly>
      <BookingFlow />
    </ClientOnly>
  );
}
