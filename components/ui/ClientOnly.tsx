"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { PageSkeleton } from "./Primitives";

const subscribe = () => () => {};

/** true solo en el navegador tras la hidratación (los datos viven en localStorage). */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Renderiza los hijos solo en cliente. Evita leer localStorage o la fecha actual durante el
 * prerender (Cache Components) y muestra un skeleton mientras tanto.
 */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const hydrated = useHydrated();
  return <>{hydrated ? children : (fallback ?? <PageSkeleton />)}</>;
}
