import type { Metadata } from "next";
import { Briefcase, Clock, Mail, MapPin, Phone } from "lucide-react";
import { AIRPORTS, BRAND } from "@/config/site";
import { Card } from "@/components/ui/Primitives";
import { InfoPage } from "@/components/ui/InfoPage";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos o llámanos para cualquier consulta sobre reservas, empresas o Wind Points.",
};

export default function Page() {
  return (
    <InfoPage eyebrow="Contacto" title="Hablemos" subtitle="Estamos aquí para ayudarte a planificar tu viaje." narrow={false}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: BRAND.email },
            { icon: Briefcase, label: "Empresas", value: BRAND.businessEmail },
            { icon: Phone, label: "Teléfono", value: BRAND.phone },
            { icon: Clock, label: "Horario", value: "Todos los días, de 8:00 a 20:00" },
          ].map((c) => (
            <Card key={c.label} className="flex items-center gap-4 p-5">
              <c.icon className="size-6 text-pink-700" aria-hidden />
              <div>
                <p className="text-sm text-muted">{c.label}</p>
                <p className="font-semibold text-navy">{c.value}</p>
              </div>
            </Card>
          ))}
          {Object.values(AIRPORTS).map((a) => (
            <Card key={a.id} className="flex items-center gap-4 p-5">
              <MapPin className="size-6 text-pink-700" aria-hidden />
              <div>
                <p className="text-sm text-muted">{a.code}</p>
                <p className="font-semibold text-navy">{a.name}</p>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6 sm:p-8">
          <h2 className="mb-5 text-xl text-navy">Envíanos un mensaje</h2>
          <ClientOnly fallback={<div className="skeleton h-80" />}>
            <ContactForm />
          </ClientOnly>
        </Card>
      </div>
    </InfoPage>
  );
}
