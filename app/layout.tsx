import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AppBootstrap } from "@/components/layout/AppBootstrap";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["600", "700"], display: "swap" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: `${BRAND.name} · Vuelos en dirigible Girona – Mallorca`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Vuela entre Girona (Costa Brava) y Palma de Mallorca en dirigible: vistas panorámicas, gastronomía a bordo y un 91 % menos de emisiones que el avión. Proyecto conceptual.",
  keywords: ["dirigible", "Girona", "Mallorca", "Palma", "Costa Brava", "viaje sostenible", "vuelo panorámico"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: BRAND.name,
    title: `${BRAND.name} · Girona – Mallorca en dirigible`,
    description: "El viaje es el destino. Vistas panorámicas, calma y cero emisiones.",
  },
  robots: { index: false, follow: false }, // prototipo: no indexar
};

export const viewport: Viewport = {
  themeColor: "#1F3864",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-ES" className={`${poppins.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="visually-hidden fixed left-3 top-3 z-[60] rounded-full bg-navy px-4 py-2 font-semibold text-white focus:not-sr-only"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
        <CookieBanner />
        <AppBootstrap />
        <div id="live-region" aria-live="polite" className="visually-hidden" />
      </body>
    </html>
  );
}
