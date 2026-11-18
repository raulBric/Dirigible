# Dirigible · Girona ⇄ Mallorca

Prototipo funcional de una aerolínea de dirigibles entre Girona (Costa Brava) y Palma de Mallorca, desarrollado como Trabajo Fin de Máster.

> **Proyecto conceptual – servicio no operativo.** No hay backend: reservas, cuentas, pagos y emails son simulados y se guardan en el `localStorage` del navegador.

**Demo:** https://raulbric.github.io/Dirigible/

## Qué incluye

- Home, Empresas, Tarifas, Sostenibilidad, Seguridad, FAQ, Contacto y páginas legales con banner de cookies.
- Checkout en 6 pasos: búsqueda con calendario de precios, vuelos, pasajeros, asientos y extras, pago simulado (con 3-D Secure) y confirmación con `.ics` y tarjeta de embarque en PDF.
- Área de cliente: reservas (cambiar fecha, añadir extras, check-in, cancelar), Wind Points, perfil, pasajeros frecuentes y facturas.
- Simulación de cancelación por meteorología y configurador de propuestas para empresas.

## Datos de prueba

| Qué | Valor |
| --- | --- |
| Cuenta demo | `demo@dirigible.es` / `demo1234` |
| Código promocional | `LANZAMIENTO10` (−10 %) |
| Tarjeta que falla | `4000 0000 0000 0002` |
| Código 3-D Secure | cualquier código de 6 dígitos |

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # exportación estática en /out
```

La marca, los precios, los horarios y los textos se editan en [`config/site.ts`](config/site.ts).

## Stack

Next.js 16 (App Router, exportación estática) · React 19 · TypeScript · Tailwind CSS 4 · Zustand · Lucide · jsPDF · qrcode.

## Despliegue

Cada `push` a `main` publica la web en GitHub Pages mediante [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). El build usa `GITHUB_PAGES=true` para servir la web bajo `/Dirigible`.
