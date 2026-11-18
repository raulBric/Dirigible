import type { Metadata } from "next";
import { BadgeCheck, CloudSun, Radar, ShieldCheck, Stethoscope, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/Primitives";
import { InfoPage } from "@/components/ui/InfoPage";

export const metadata: Metadata = {
  title: "Seguridad",
  description: "Helio no inflamable, aeronave certificada y tripulación profesional. Así garantizamos tu seguridad a bordo.",
};

const ITEMS = [
  { icon: ShieldCheck, title: "Helio, no hidrógeno", text: "El helio es un gas inerte: no arde ni explota. Las celdas de gas están compartimentadas para que una fuga en una no afecte al resto." },
  { icon: BadgeCheck, title: "Aeronave certificada", text: "La aeronave cumple la normativa europea de aeronavegabilidad y pasa revisiones de mantenimiento programadas e inspecciones diarias." },
  { icon: UsersRound, title: "Tripulación profesional", text: "Dos pilotos con licencia específica para aeróstatos y tripulación de cabina formada en evacuación, primeros auxilios y atención a PMR." },
  { icon: CloudSun, title: "Meteorología primero", text: "Solo volamos con condiciones adecuadas. Si cancelamos, puedes cambiar de fecha gratis o recibir el reembolso íntegro." },
  { icon: Radar, title: "Control y seguimiento", text: "Vuelo coordinado con los servicios de tránsito aéreo y seguimiento en tiempo real desde el centro de operaciones." },
  { icon: Stethoscope, title: "Cabina presurizada natural", text: "A 300 m de altura no hace falta presurizar: sin cambios bruscos de presión ni oídos taponados." },
];

export default function Page() {
  return (
    <InfoPage eyebrow="Seguridad y confianza" title="Tu seguridad, nuestra prioridad" subtitle="Los dirigibles modernos no tienen nada que ver con los de hace un siglo." narrow={false}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <li key={it.title}>
            <Card className="h-full p-6">
              <it.icon className="size-8 text-pink-700" aria-hidden />
              <h2 className="mt-4 text-lg text-navy">{it.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
            </Card>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}
