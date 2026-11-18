import type { MetadataRoute } from "next";
import { BRAND } from "@/config/site";

const ROUTES = ["", "/reservar", "/tarifas", "/empresas", "/empresas/propuesta", "/sostenibilidad", "/seguridad", "/faq", "/contacto", "/gestionar-reserva", "/aviso-legal", "/privacidad", "/cookies", "/condiciones-de-transporte"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: `${BRAND.siteUrl}${r}`, changeFrequency: "monthly", priority: r === "" ? 1 : 0.6 }));
}