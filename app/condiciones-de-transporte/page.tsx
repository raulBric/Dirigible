import type { Metadata } from "next";
import { CANCELLATION_POLICY, EXTRAS, PRICING } from "@/config/site";
import { InfoPage, LegalNotice, Prose } from "@/components/ui/InfoPage";

export const metadata: Metadata = { title: "Condiciones de transporte" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Condiciones de transporte">
      <LegalNotice />
      <Prose>
        <h2>1. Reserva y billete</h2>
        <p>
          El contrato de transporte se formaliza al confirmar el pago. Recibirás un localizador de 6 caracteres. Los precios incluyen el IVA ({PRICING.vatRate * 100} %).
          Máximo {PRICING.maxPassengers} pasajeros con asiento por reserva.
        </p>
        <h2>2. Pasajeros</h2>
        <ul>
          <li>Adultos: 12 años o más.</li>
          <li>Niños de 2 a 11 años: descuento del {PRICING.childDiscount * 100} %. Deben viajar acompañados de un adulto.</li>
          <li>Bebés menores de 2 años: gratis, sin asiento, en brazos de un adulto (máximo uno por adulto).</li>
          <li>Pasajeros con movilidad reducida: asistencia gratuita si se solicita en la reserva.</li>
        </ul>
        <h2>3. Embarque</h2>
        <p>
          El check-in online abre {CANCELLATION_POLICY.checkInOpensHours} h antes de la salida. El embarque empieza {CANCELLATION_POLICY.boardingStartsMin} minutos antes y
          cierra {CANCELLATION_POLICY.boardingClosesMin} minutos antes de la salida. Es obligatorio presentar un documento de identidad válido.
        </p>
        <h2>4. Equipaje</h2>
        <p>
          Incluido: una maleta de cabina de hasta 10 kg y un bolso. {EXTRAS.bag.label}: {EXTRAS.bag.price} € {EXTRAS.bag.unit}, hasta 23 kg.
        </p>
        <h2>5. Cancelación por el pasajero</h2>
        <ul>
          {CANCELLATION_POLICY.tiers.map((t) => (
            <li key={t.label}>{t.label}</li>
          ))}
          <li>{CANCELLATION_POLICY.insuranceLabel}.</li>
        </ul>
        <h2>6. Meteorología y cancelación por la compañía</h2>
        <p>
          Los vuelos en dirigible dependen de la meteorología. Si cancelamos un vuelo por condiciones meteorológicas o técnicas, el pasajero puede elegir entre el cambio de
          fecha gratuito (sujeto a disponibilidad) o el reembolso íntegro del importe pagado.
        </p>
        <h2>7. Cambios de fecha</h2>
        <p>Puedes cambiar la fecha desde «Mis reservas» pagando la diferencia de tarifa si la hubiera. Si la nueva tarifa es inferior, se reembolsa la diferencia.</p>
        <h2>8. Wind Points</h2>
        <p>Se acumula 1 punto por cada euro pagado. 100 puntos equivalen a 1 € de descuento. Los puntos de una reserva cancelada se anulan.</p>
      </Prose>
    </InfoPage>
  );
}
