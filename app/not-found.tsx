import { ButtonLink } from "@/components/ui/Button";
import { AirshipIcon } from "@/components/layout/Logo";

export default function NotFound() {
  return (
    <div className="bg-pastel flex flex-1 items-center justify-center px-4 py-24 text-center">
      <div>
        <AirshipIcon className="mx-auto h-20 w-32 animate-float" />
        <h1 className="mt-6 text-4xl text-navy">
          <span className="brush">Nos hemos desviado</span>
        </h1>
        <p className="mt-6 text-muted">La página que buscas no existe o ha cambiado de ruta.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Volver al inicio</ButtonLink>
          <ButtonLink href="/reservar" variant="secondary">
            Reservar vuelo
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}