import type { Metadata } from "next";
import { BRAND } from "@/config/site";
import { InfoPage, LegalNotice, Prose } from "@/components/ui/InfoPage";

export const metadata: Metadata = { title: "Aviso legal" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Aviso legal">
      <LegalNotice />
      <Prose>
        <h2>Titular del sitio web</h2>
        <p>
          En cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web es un
          prototipo académico. Datos identificativos ficticios: {BRAND.legalName}, CIF {BRAND.cif}, domicilio en {BRAND.address}. Contacto: {BRAND.email}.
        </p>
        <h2>Objeto</h2>
        <p>
          Este sitio presenta un servicio conceptual de transporte de pasajeros en dirigible entre Girona y Palma de Mallorca, desarrollado como Trabajo Fin de Máster. El
          servicio no está operativo: no se venden billetes reales ni se realizan cargos.
        </p>
        <h2>Propiedad intelectual</h2>
        <p>Los textos, ilustraciones y el código de este prototipo pertenecen a su autor. Las imágenes son marcadores de posición ilustrativos.</p>
        <h2>Responsabilidad</h2>
        <p>El titular no se responsabiliza del uso que se haga de la información de este prototipo, cuyos precios, horarios y datos técnicos son estimaciones.</p>
        <h2>Legislación aplicable</h2>
        <p>Este aviso se rige por la legislación española.</p>
      </Prose>
    </InfoPage>
  );
}