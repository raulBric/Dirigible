import type { Metadata } from "next";
import { Briefcase, Check, Gem, HandPlatter, Lock, Megaphone, Plane, Presentation, Trophy } from "lucide-react";
import { B2B, BRAND } from "@/config/site";
import { formatEUR } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Container, ImagePlaceholder, SectionTitle } from "@/components/ui/Primitives";
import zonaPrivadaImg from "@/assets/images/zona-privada.webp";

export const metadata: Metadata = {
  title: "Empresas y eventos",
  description: "Comidas de negocios, incentivos y presentaciones a bordo de un dirigible: zona privada para 12 personas o vuelo chárter completo de 50 plazas.",
};

const USE_CASES = [
  { icon: HandPlatter, title: "Comidas de negocios", text: "Cierra acuerdos con vistas al Mediterráneo y un menú del Empordà servido a bordo." },
  { icon: Briefcase, title: "Atención a clientes", text: "Sorprende a tus mejores clientes con una experiencia que recordarán y contarán." },
  { icon: Trophy, title: "Incentivos", text: "Premia a tu equipo con un viaje único: 2 h 15 min de calma, gastronomía y paisaje." },
  { icon: Presentation, title: "Presentaciones y eventos", text: "Lanza tu producto a 300 m de altura, con branding a bordo y pantallas en cabina." },
];

export default function EmpresasPage() {
  return (
    <>
      <section className="bg-pastel py-16 sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              as="h1"
              align="left"
              eyebrow="Empresas"
              title="Eventos que despegan"
              subtitle={`Convierte un desplazamiento en el mejor momento del año. ${BRAND.name} pone a tu disposición una zona privada o el dirigible completo.`}
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/empresas/propuesta" size="lg">
                Configura tu propuesta
              </ButtonLink>
              <ButtonLink href="/contacto" size="lg" variant="secondary">
                Hablar con ventas
              </ButtonLink>
            </div>
          </div>
          <ImagePlaceholder
            alt="Sala de reuniones en la zona privada del dirigible: mesa de madera con portátiles y butacas de piel junto a grandes ventanales sobre la costa"
            src={zonaPrivadaImg}
            sizes="(min-width: 1024px) 50vw, 100vw"
            preload
            icon={Megaphone}
            tone="lilac"
            className="h-72 rounded-[32px] shadow-[var(--shadow-lift)] sm:h-96"
            label="Zona privada a bordo"
          />
        </Container>
      </section>

      <section aria-labelledby="casos" className="py-20">
        <Container>
          <SectionTitle id="casos" eyebrow="Casos de uso" title="Para cada ocasión" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <li key={u.title}>
                <Card className="h-full p-6 transition hover:-translate-y-1">
                  <u.icon className="size-8 text-pink-700" aria-hidden />
                  <h3 className="mt-4 text-lg text-navy">{u.title}</h3>
                  <p className="mt-2 text-sm text-muted">{u.text}</p>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="formatos" className="bg-pastel-soft py-20">
        <Container>
          <SectionTitle id="formatos" eyebrow="Formatos" title="Zona privada o chárter completo" />
          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                ["privada", Gem, ["Salón reservado a popa con ventanales propios", `Hasta ${B2B.formats.privada.maxGuests} personas`, "Servicio de cabina dedicado", "Se suman los billetes de los invitados"]],
                ["charter", Plane, [`Las ${B2B.formats.charter.maxGuests} plazas para tu grupo`, "Menú incluido para todos", "Horario a medida", "Branding y pantallas a bordo opcionales"]],
              ] as const
            ).map(([k, Icon, perks]) => {
              const f = B2B.formats[k];
              return (
                <Card key={k} className={`p-8 ${k === "charter" ? "bg-linear-to-br from-navy to-navy-700 text-white" : ""}`}>
                  <Icon className={`size-10 ${k === "charter" ? "text-amber" : "text-pink-700"}`} aria-hidden />
                  <h3 className={`mt-4 text-2xl ${k === "charter" ? "text-white" : "text-navy"}`}>{f.label}</h3>
                  <p className="mt-1 font-display text-3xl font-bold">
                    {k === "privada" ? "+" : ""}
                    {formatEUR(f.pricePerLeg)}
                    <span className="text-base font-normal opacity-80"> / trayecto</span>
                  </p>
                  <ul className="mt-6 space-y-2">
                    {perks.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
            <Lock className="size-4" aria-hidden /> La zona privada no está disponible para reservas particulares.
          </p>
        </Container>
      </section>

      <section aria-labelledby="como-funciona" className="py-20">
        <Container className="max-w-4xl">
          <SectionTitle id="como-funciona" eyebrow="Cómo funciona" title="Tu propuesta en 4 pasos" />
          <ol className="grid gap-4 sm:grid-cols-4">
            {["Tipo de evento", "Formato", "Fechas, invitados y extras", "Datos de la empresa"].map((s, i) => (
              <li key={s} className="card p-5 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-full bg-pink text-lg font-bold text-navy-700">{i + 1}</span>
                <p className="mt-3 font-semibold text-navy">{s}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-muted">Verás una estimación en tiempo real y un gestor comercial te contactará en 24 h.</p>
          <div className="mt-6 text-center">
            <ButtonLink href="/empresas/propuesta" size="lg" variant="accent">
              Solicitar propuesta
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
