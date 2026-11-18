import type { ReactNode } from "react";
import { Container, SectionTitle } from "./Primitives";

export function InfoPage({ eyebrow, title, subtitle, children, narrow = true }: { eyebrow?: string; title: string; subtitle?: ReactNode; children: ReactNode; narrow?: boolean }) {
  return (
    <>
      <div className="bg-pastel py-14 sm:py-20">
        <Container className={narrow ? "max-w-4xl" : ""}>
          <SectionTitle as="h1" align="left" eyebrow={eyebrow} title={title} subtitle={subtitle} />
        </Container>
      </div>
      <Container className={`py-14 ${narrow ? "max-w-4xl" : ""}`}>{children}</Container>
    </>
  );
}

/** Estilos de texto largo (páginas legales) sin depender de plugins. */
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="card p-6 leading-relaxed text-ink/90 sm:p-10 [&_a]:text-navy [&_a]:underline [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-navy [&_h2:first-child]:mt-0 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:text-navy [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}

export function LegalNotice() {
  return (
    <p className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
      Proyecto conceptual – servicio no operativo. Este texto es un modelo con fines académicos y no constituye un documento legal vinculante.
    </p>
  );
}
