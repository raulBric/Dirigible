import type { Metadata } from "next";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { AccessPage } from "@/components/account/GuestAccess";
import { Skeleton } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Iniciar sesión o registrarse",
  description: "Accede a tu cuenta para gestionar reservas y acumular Wind Points.",
};

export default function Page() {
  return (
    <div className="bg-pastel-soft flex-1">
      <div className="mx-auto w-full max-w-md px-4 py-14">
        <h1 className="mb-2 text-3xl text-navy">
          <span className="brush">Bienvenido a bordo</span>
        </h1>
        <p className="mb-8 mt-4 text-muted">Inicia sesión o crea tu cuenta para reservar más rápido y acumular Wind Points.</p>
        <ClientOnly fallback={<Skeleton className="h-96 w-full" />}>
          <AccessPage />
        </ClientOnly>
      </div>
    </div>
  );
}