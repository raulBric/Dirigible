import type { Metadata } from "next";
import { BRAND } from "@/config/site";
import { InfoPage, LegalNotice, Prose } from "@/components/ui/InfoPage";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Política de privacidad">
      <LegalNotice />
      <Prose>
        <h2>Dónde se guardan tus datos</h2>
        <p>
          Este prototipo no tiene servidor: todos los datos que introduces (reservas, perfil, pasajeros frecuentes y preferencias) se guardan únicamente en el
          almacenamiento local (localStorage) de tu navegador. No se envían a ningún sitio. Puedes borrarlos en cualquier momento borrando los datos del sitio en tu navegador.
        </p>
        <h2>Responsable del tratamiento (modelo)</h2>
        <p>
          {BRAND.legalName}. Contacto del delegado de protección de datos: {BRAND.email}.
        </p>
        <h2>Finalidades (en un servicio real)</h2>
        <ul>
          <li>Gestionar tu reserva y el transporte contratado (ejecución del contrato).</li>
          <li>Enviarte avisos operativos, como cancelaciones por meteorología (interés legítimo).</li>
          <li>Gestionar el programa Wind Points si te registras (consentimiento).</li>
          <li>Emitir facturas y cumplir obligaciones legales (obligación legal).</li>
        </ul>
        <h2>Tus derechos</h2>
        <p>
          Conforme al Reglamento (UE) 2016/679 (RGPD) y a la LOPDGDD, puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad,
          y reclamar ante la Agencia Española de Protección de Datos.
        </p>
        <h2>Datos de pago</h2>
        <p>Los datos de tarjeta introducidos en la demo no se almacenan en ningún lugar: solo se validan en tu navegador para simular el pago.</p>
      </Prose>
    </InfoPage>
  );
}