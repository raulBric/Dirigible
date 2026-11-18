import type { MetadataRoute } from "next";
import { BRAND } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Prototipo académico: no se indexa
  return { rules: { userAgent: "*", disallow: "/" }, sitemap: `${BRAND.siteUrl}/sitemap.xml` };
}