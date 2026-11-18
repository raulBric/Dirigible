import type { NextConfig } from "next";

/** En GitHub Pages la web vive en /Dirigible; en local, en la raíz. */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/Dirigible" : "";

const nextConfig: NextConfig = {
  // Sin cacheComponents/partialPrefetching: el prerender parcial no es compatible con output "export".
  // Exportación estática (HTML en /out): la app no necesita servidor
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
