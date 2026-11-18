import type { Metadata } from "next";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { Container, SectionTitle } from "@/components/ui/Primitives";
import { ProposalConfigurator } from "@/components/b2b/ProposalConfigurator";

export const metadata: Metadata = {
  title: "Solicitar propuesta para empresas",
  description: "Configura tu evento a bordo: zona privada o vuelo chárter, fechas, invitados y extras, con estimación de precio en tiempo real.",
};

export default function Page() {
  return (
    <div className="bg-pastel-soft flex-1 py-12">
      <Container>
        <SectionTitle as="h1" align="left" eyebrow="Empresas" title="Configura tu propuesta" subtitle="Cuéntanos tu evento y te enviaremos una propuesta a medida." />
        <ClientOnly>
          <ProposalConfigurator />
        </ClientOnly>
      </Container>
    </div>
  );
}
