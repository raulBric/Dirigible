import type { Metadata } from "next";
import { BatteryCharging, Recycle, Sun, Trees, VolumeX, Wind } from "lucide-react";
import { STATS } from "@/config/site";
import { Card } from "@/components/ui/Primitives";
import { InfoPage } from "@/components/ui/InfoPage";
import { SustainabilityBars } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "Sostenibilidad",
  description: `Volar en dirigible emite ~${STATS.reduction} % menos CO₂ por pasajero que el avión: ${STATS.airshipGco2} frente a ${STATS.planeGco2} gCO₂/pkm.`,
};

const ITEMS = [
  { icon: Wind, title: "Sustentación con helio", text: "El helio mantiene la aeronave en el aire sin gastar energía. Los motores solo nos impulsan hacia delante." },
  { icon: BatteryCharging, title: "Propulsión eléctrico-híbrida", text: "Motores eléctricos con baterías y un generador de apoyo, preparados para combustibles sostenibles." },
  { icon: Sun, title: "Paneles solares", text: "La envolvente integra células fotovoltaicas flexibles que alimentan los servicios de cabina." },
  { icon: VolumeX, title: "Silencio sobre la costa", text: "Volamos bajo y despacio, con una huella acústica mínima sobre los espacios naturales de la Costa Brava." },
  { icon: Recycle, title: "Cero plásticos a bordo", text: "Vajilla reutilizable, producto de proximidad y gestión de residuos en los vertipuertos." },
  { icon: Trees, title: "Infraestructura ligera", text: "Los vertipuertos no necesitan pistas: un mástil de amarre y una terminal compacta." },
];

export default function Page() {
  return (
    <InfoPage eyebrow="Sostenibilidad" title="El viaje más limpio entre Girona y Mallorca" subtitle="Elegimos la lentitud para reducir las emisiones al mínimo. Y, de paso, disfrutar del paisaje." narrow={false}>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Card className="p-8">
          <p className="font-display text-7xl font-bold text-navy">~{STATS.reduction} %</p>
          <p className="mb-8 mt-2 text-muted">menos CO₂ por pasajero y kilómetro que un avión regional en la misma ruta.</p>
          <SustainabilityBars />
        </Card>
        <div className="space-y-4 text-lg leading-relaxed text-ink/90">
          <p>
            Un avión gasta gran parte de su energía en mantenerse en el aire. Un dirigible no: flota gracias al helio, así que toda la energía se dedica a avanzar a velocidad de crucero.
          </p>
          <p>
            Con {STATS.airshipGco2} gCO₂ por pasajero-kilómetro frente a {STATS.planeGco2} del avión, cada viaje Girona – Palma ahorra unos 30 kg de CO₂ por persona.
          </p>
          <p className="text-sm text-muted">Cifras estimadas del estudio de viabilidad del proyecto. Servicio conceptual no operativo.</p>
        </div>
      </div>
      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <li key={it.title}>
            <Card className="h-full p-6">
              <it.icon className="size-8 text-success" aria-hidden />
              <h2 className="mt-4 text-lg text-navy">{it.title}</h2>
              <p className="mt-2 text-sm text-muted">{it.text}</p>
            </Card>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}
