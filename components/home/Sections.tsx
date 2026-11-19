import Link from "next/link";
import {
  Award,
  BadgeCheck,
  ChefHat,
  ChevronDown,
  Clock,
  DoorOpen,
  Eye,
  Gauge,
  HeartHandshake,
  Leaf,
  MapPinned,
  Mountain,
  Quote,
  ShieldCheck,
  Sofa,
  Star,
  UsersRound,
  Wind,
} from "lucide-react";
import { AIRPORTS, FAQS, ROUTE, STATS, TESTIMONIALS, WIND_POINTS } from "@/config/site";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Container, ImagePlaceholder, SectionTitle } from "@/components/ui/Primitives";
import { RouteMap } from "./Illustrations";
import ventanalesImg from "@/assets/images/ventanales-panoramicos.webp";
import espaciosImg from "@/assets/images/espacios-compartidos.webp";
import gastronomiaImg from "@/assets/images/gastronomia.webp";
import embarqueImg from "@/assets/images/embarque.webp";

export function ExperienceSection() {
  const items = [
    { icon: Eye, title: "Ventanales panorámicos", text: "Cristaleras del suelo al techo para ver el Mediterráneo a 300 metros de altura, sin vibraciones ni ruido.", alt: "Cabina del dirigible con butacas color crema y grandes ventanales que muestran los acantilados y calas de la Costa Brava", tone: "sea" as const, src: ventanalesImg },
    { icon: Sofa, title: "Cabina «Lounge»", text: "50 butacas amplias en disposición 1-3-1, mesas compartidas y espacio para levantarte y pasear.", alt: "Zona social de la cabina Lounge: una familia contempla la costa junto a la barandilla del ventanal mientras otros pasajeros conversan en mesas altas", tone: "lilac" as const, src: espaciosImg },
    { icon: ChefHat, title: "Gastronomía a bordo", text: "Menús de producto local del Empordà y de Mallorca, con opción vegetariana y vinos de la tierra.", alt: "Mesa junto al ventanal con pa amb tomàquet, jamón, quesos, sobrasada con miel, aceitunas, fruta y una copa de vino blanco, con la Costa Brava al fondo", tone: "amber" as const, src: gastronomiaImg },
    { icon: DoorOpen, title: "Embarque sin colas", text: "Llega 1 hora antes, deja tu equipaje y sube a bordo. Sin controles interminables ni puertas lejanas.", alt: "Una familia con maletas camina desde la terminal del vertipuerto hacia el dirigible amarrado al mástil, recibida por la tripulación entre colinas verdes", tone: "sunset" as const, src: embarqueImg },
  ];
  return (
    <section aria-labelledby="experiencia" className="py-20 sm:py-24">
      <Container>
        <SectionTitle id="experiencia" eyebrow="La experiencia" title="Un viaje que no quieres que termine" subtitle="Volamos despacio a propósito: para que mires, respires y disfrutes del trayecto." />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <li key={it.title} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <ImagePlaceholder alt={it.alt} icon={it.icon} tone={it.tone} src={it.src} className="h-40 transition duration-500 group-hover:scale-105" />
                <div className="p-6">
                  <h3 className="text-lg text-navy">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{it.text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function RouteSection() {
  const facts = [
    { icon: MapPinned, label: "Distancia", value: `~${ROUTE.distanceKm} km` },
    { icon: Clock, label: "Duración", value: ROUTE.durationLabel },
    { icon: Mountain, label: "Altitud de crucero", value: `${ROUTE.cruiseAltitudeM} m` },
    { icon: Gauge, label: "Velocidad", value: `${ROUTE.cruiseSpeedKmh} km/h` },
  ];
  return (
    <section aria-labelledby="ruta" className="bg-pastel-soft py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionTitle
            id="ruta"
            align="left"
            eyebrow="La ruta"
            title={`${AIRPORTS.girona.city} → ${AIRPORTS.mallorca.region}`}
            subtitle="Despegamos sobre los acantilados de la Costa Brava, dejamos atrás las islas Medes y cruzamos el Mediterráneo hasta la bahía de Palma, con la Serra de Tramuntana en el horizonte."
          />
          <dl className="grid grid-cols-2 gap-4">
            {facts.map((f) => (
              <Card key={f.label} className="p-5">
                <f.icon className="size-6 text-pink-700" aria-hidden />
                <dt className="mt-3 text-sm text-muted">{f.label}</dt>
                <dd className="font-display text-2xl font-bold text-navy">{f.value}</dd>
              </Card>
            ))}
          </dl>
          <ButtonLink href="/reservar" className="mt-8">
            Ver horarios y precios
          </ButtonLink>
        </div>
        <Card className="p-4 sm:p-6">
          <RouteMap />
        </Card>
      </Container>
    </section>
  );
}

export function SustainabilityBars() {
  const max = STATS.planeGco2;
  return (
    <div className="space-y-5" role="group" aria-label="Comparativa de emisiones por pasajero y kilómetro">
      {[
        { label: "Dirigible", value: STATS.airshipGco2, color: "bg-linear-to-r from-emerald-400 to-teal-500" },
        { label: "Avión (trayecto equivalente)", value: STATS.planeGco2, color: "bg-linear-to-r from-gray-400 to-gray-500" },
      ].map((b) => (
        <div key={b.label}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium">{b.label}</span>
            <span className="font-semibold tabular-nums text-navy">{b.value.toLocaleString("es-ES")} gCO₂/pkm</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/70" aria-hidden>
            <div className={`h-full rounded-full ${b.color}`} style={{ width: `${(b.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SustainabilitySection() {
  return (
    <section aria-labelledby="sostenibilidad" className="py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <Card className="bg-linear-to-br from-emerald-50 via-white to-lilac-50 p-8">
          <p className="font-display text-6xl font-bold text-navy sm:text-7xl">
            ~{STATS.reduction} %<span className="sr-only"> menos emisiones</span>
          </p>
          <p className="mb-8 mt-2 text-muted">menos emisiones de CO₂ por pasajero que el avión en la misma ruta</p>
          <SustainabilityBars />
          <p className="mt-6 text-xs text-muted">Estimación conceptual basada en propulsión eléctrico-híbrida y sustentación por helio. Fuente: estudio de viabilidad del TFM.</p>
        </Card>
        <div>
          <SectionTitle
            id="sostenibilidad"
            align="left"
            eyebrow="Sostenibilidad"
            title="Volar sin dejar huella"
            subtitle="El helio nos mantiene en el aire sin quemar combustible para sustentarnos. Los motores solo empujan: por eso consumimos una fracción de lo que necesita un avión."
          />
          <ul className="space-y-3">
            {["Propulsión eléctrico-híbrida y paneles solares en la envolvente", "Sin estelas de condensación ni ruido sobre la costa", "Vertipuertos compactos, sin pistas ni grandes infraestructuras"].map((t) => (
              <li key={t} className="flex gap-3">
                <Leaf className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/sostenibilidad" className="mt-6 inline-block font-semibold text-navy underline underline-offset-4">
            Descubre nuestro compromiso
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function SafetySection() {
  const items = [
    { icon: ShieldCheck, title: "Helio no inflamable", text: "Usamos helio, un gas inerte que no arde. Nada que ver con los dirigibles de hidrógeno de hace un siglo." },
    { icon: BadgeCheck, title: "Aeronave certificada", text: "Diseño y operación bajo la normativa europea de aeronavegabilidad y mantenimiento continuo." },
    { icon: UsersRound, title: "Tripulación profesional", text: "Pilotos con licencia específica para aeróstatos y tripulación de cabina formada en seguridad y atención." },
  ];
  return (
    <section aria-labelledby="seguridad" className="bg-navy py-20 text-white sm:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber">Seguridad y confianza</p>
          <h2 id="seguridad" className="text-3xl sm:text-4xl">
            <span className="brush">Tranquilidad desde el despegue</span>
          </h2>
        </div>
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="rounded-[24px] bg-white/8 p-7 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/12">
              <it.icon className="size-9 text-amber" aria-hidden />
              <h3 className="mt-4 text-xl">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{it.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link href="/seguridad" className="font-semibold text-white underline underline-offset-4">
            Más sobre seguridad
          </Link>
        </p>
      </Container>
    </section>
  );
}

export function WindPointsSection() {
  return (
    <section aria-labelledby="wind-points" className="py-20 sm:py-24">
      <Container>
        <SectionTitle id="wind-points" eyebrow="Programa de fidelización" title="Wind Points" subtitle="Gana 1 punto por cada euro y canjéalos en tus próximos vuelos: 100 puntos = 1 €." />
        <ol className="grid gap-6 md:grid-cols-3">
          {WIND_POINTS.tiers.map((t, i) => (
            <li key={t.id}>
              <Card className={`h-full p-7 ${i === 2 ? "bg-linear-to-br from-navy to-navy-700 text-white" : ""}`}>
                <div className="flex items-center justify-between">
                  <Wind className={`size-8 ${i === 2 ? "text-amber" : "text-pink-700"}`} aria-hidden />
                  <span className={`text-xs font-semibold ${i === 2 ? "text-white/70" : "text-muted"}`}>{t.min === 0 ? "Desde el registro" : `Desde ${t.min.toLocaleString("es-ES")} puntos`}</span>
                </div>
                <h3 className={`mt-4 text-2xl ${i === 2 ? "text-white" : "text-navy"}`}>{t.name}</h3>
                <ul className={`mt-4 space-y-2 text-sm ${i === 2 ? "text-white/85" : "text-muted"}`}>
                  {t.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Award className="mt-0.5 size-4 shrink-0" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <ButtonLink href="/acceso" variant="accent">
            Únete y gana 250 puntos
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonios" className="bg-pastel py-20 sm:py-24">
      <Container>
        <SectionTitle id="testimonios" eyebrow="Testimonios" title="Lo que cuentan nuestros viajeros" />
        <ul className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <Card className="flex h-full flex-col p-7">
                <Quote className="size-8 text-pink" aria-hidden />
                <blockquote className="mt-3 flex-1 leading-relaxed text-ink">«{t.text}»</blockquote>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-sm">
                    <strong className="text-navy">{t.name}</strong> <span className="text-muted">· {t.city}</span>
                  </p>
                  <p className="flex" aria-label={`${t.rating} de 5 estrellas`}>
                    {Array.from({ length: t.rating }, (_, i) => (
                      <Star key={i} className="size-4 fill-amber text-amber" aria-hidden />
                    ))}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted">Testimonios ficticios con fines ilustrativos.</p>
      </Container>
    </section>
  );
}

export function FaqList({ limit }: { limit?: number }) {
  const list = limit ? FAQS.slice(0, limit) : FAQS;
  return (
    <div className="space-y-3">
      {list.map((f) => (
        <details key={f.q} className="group card overflow-hidden px-6 py-1 open:pb-5" name="faq">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-navy [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <p className="leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="faq" className="py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionTitle id="faq" eyebrow="Preguntas frecuentes" title="Todo lo que quieres saber" />
        <FaqList limit={6} />
        <p className="mt-8 text-center">
          <Link href="/faq" className="font-semibold text-navy underline underline-offset-4">
            Ver todas las preguntas
          </Link>
        </p>
      </Container>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="pb-20">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] bg-linear-to-r from-navy via-[#3b3f8c] to-pink px-8 py-14 text-center text-white sm:px-16">
          <HeartHandshake className="mx-auto size-10 text-amber" aria-hidden />
          <h2 className="mt-4 text-3xl sm:text-4xl">¿Lo celebras con tu equipo?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Zona privada para 12 personas o el dirigible entero para tu evento: comidas de negocios, incentivos y presentaciones a 300 m de altura.</p>
          <ButtonLink href="/empresas" variant="secondary" className="mt-8">
            Soluciones para empresas
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
