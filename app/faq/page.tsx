import type { Metadata } from "next";
import Link from "next/link";
import { FAQS } from "@/config/site";
import { InfoPage } from "@/components/ui/InfoPage";
import { FaqList } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Duración del vuelo, equipaje, niños, meteorología, Wind Points y más.",
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <InfoPage eyebrow="Ayuda" title="Preguntas frecuentes">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <FaqList />
      <p className="mt-10 text-center text-muted">
        ¿No encuentras tu respuesta?{" "}
        <Link href="/contacto" className="font-semibold text-navy underline underline-offset-4">
          Escríbenos
        </Link>
      </p>
    </InfoPage>
  );
}
