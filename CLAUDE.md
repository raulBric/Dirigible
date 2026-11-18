@AGENTS.md

# Dirigible – Aerolínea de dirigibles Girona ⇄ Mallorca

Aplicación web completa, moderna y responsive, en español (es-ES), para una aerolínea de dirigibles que opera la ruta **Girona (Costa Brava) ⇄ Mallorca (Palma)**.

Es un **prototipo funcional para un Trabajo Fin de Máster**: el servicio no existe.
- El pago es **SIMULADO**: nunca conectar pasarelas reales.
- El pie de página incluye siempre el aviso **"Proyecto conceptual – servicio no operativo"**.
- Todos los datos se guardan en estado local / localStorage (**sin backend**). Pagos y emails simulados.

## Stack técnico (decisiones del proyecto)

- **Next.js 16 (App Router)** + React 19 + TypeScript + Tailwind CSS 4. Las páginas se implementan con el enrutado por carpetas de `app/` (sustituye a React Router de la especificación original).
- Antes de escribir código de Next.js, consultar la guía correspondiente en `node_modules/next/dist/docs/` (ver AGENTS.md): esta versión tiene cambios incompatibles.
- **Estado global de la reserva**: Zustand (con `persist` sobre localStorage) o Context. Los componentes que lean localStorage deben ser Client Components y evitar desajustes de hidratación.
- **Configuración centralizada**: textos, nombre de marca, precios, tarifas, horarios y extras en un único archivo de configuración (p. ej. `config/site.ts`). El nombre de la marca es el placeholder `[NOMBRE DE LA MARCA]`, editable solo ahí.
- **Datos de vuelos**: generados por una función mock a partir de las reglas de temporada y horarios (determinista por fecha para que la ocupación sea estable).
- Mobile-first y accesible (**WCAG AA**, navegación por teclado, etiquetas en formularios), con SEO básico (metadata de Next por página).
- Componentes reutilizables.
- **Despliegue en GitHub Pages** (https://raulbric.github.io/Dirigible/): `next.config.ts` usa `output: "export"`, `trailingSlash` y `basePath: "/Dirigible"` solo cuando `GITHUB_PAGES=true`. Por eso **no** se puede usar nada que requiera servidor (route handlers dinámicos, Server Actions, cookies, rewrites, optimización de imágenes, `cacheComponents`). `robots.txt` y `sitemap.xml` son archivos estáticos en `public/`. Enlaces internos siempre con `next/link` o `router.push` para respetar el `basePath`.
- Para HTML/CSS/JS de cliente (diálogos, formularios, validación, accesibilidad, rendimiento…), usar la skill `modern-web-guidance`.

## Marca y tono

- Nombre: `[NOMBRE DE LA MARCA]` (placeholder editable en el archivo de configuración).
- Posicionamiento: **"el viaje es la experiencia"**. No competimos en velocidad ni en precio con el avión: vistas panorámicas, calma, espacio, gastronomía a bordo y cero emisiones.
- Tono: cercano, elegante e inspirador.

## Estilo visual

- Fondos con degradados pastel suaves (amarillo → rosa → lila); tarjetas blancas con esquinas de 24px, sombras suaves y mucho aire.
- Títulos en Poppins/Montserrat 700, con un subrayado de pincel de color bajo cada título de sección; cuerpo de texto en Inter.
- Acento principal azul marino `#1F3864`; secundarios rosa `#F472B6` y ámbar `#F59E0B`.
- Iconos Lucide, micro-animaciones sutiles y skeleton loaders. Imágenes como placeholders con `alt` descriptivo.

## Páginas públicas

1. **Home**: hero a pantalla completa (dirigible sobre la Costa Brava al atardecer), titular "Girona – Mallorca, el viaje es el destino", buscador de vuelos en tarjeta flotante, y secciones de:
   - La experiencia (ventanales, cabina «Lounge», gastronomía, embarque sin colas)
   - La ruta (mapa Girona → Palma, ~260 km, ~2 h 15 min)
   - Sostenibilidad (10,8 frente a 124,7 gCO2/pkm del avión, ~91 % menos)
   - Seguridad y confianza (helio no inflamable, aeronave certificada, tripulación profesional)
   - Wind Points, testimonios y FAQ.
2. **Empresas**: casos de uso (comidas de negocios, atención a clientes, incentivos, presentaciones y eventos), opciones de Zona privada y Vuelo chárter completo, y el flujo de solicitud de propuesta (ver Flujo B2B).
3. **Tarifas, Sostenibilidad, Seguridad, FAQ, Contacto, Aviso legal, Privacidad, Cookies** (banner de consentimiento) y **Condiciones de transporte**.

## Proceso de compra (checkout multipaso)

Barra de progreso visible con 6 pasos; se puede volver atrás sin perder datos. Resumen de la reserva siempre visible (sidebar en escritorio, panel desplegable fijo abajo en móvil) con el precio total actualizado en tiempo real.

### Paso 1 · Búsqueda
- Solo ida / ida y vuelta, origen ⇄ destino (Girona, Mallorca), fechas en calendario, y adultos, niños de 2 a 11 años y bebés menores de 2.
- El calendario muestra el precio "desde" de cada día con colores por temporada. Los días sin operación aparecen deshabilitados: en temporada baja solo se opera 4 días por semana.

### Paso 2 · Selección de vuelo
- Lista de vuelos del día: hora de salida y llegada, duración, plazas disponibles (capacidad 50) y precio.
- Horarios:
  - Temporada **alta** (jun–sep): 4 vuelos diarios (08:00, 11:00, 14:00, 17:00 alternando sentido).
  - Temporada **media** (abr, may, oct) y **baja** (nov–mar): 2 vuelos diarios.
- Tarifas por trayecto, IVA incluido: alta **179 €**, media **149 €**, baja **129 €**. Niños **−25 %**; bebés gratis sin asiento.
- Precio dinámico simulado: **−10 %** si se reserva con más de 60 días de antelación y **+15 %** si el vuelo supera el 80 % de ocupación. Etiquetas "Últimas plazas" y "Mejor precio".
- Aviso informativo: "Los vuelos en dirigible dependen de la meteorología. Si se cancela, cambias de fecha gratis o te devolvemos el importe."

### Paso 3 · Datos de los pasajeros
- Por pasajero: nombre, apellidos, fecha de nacimiento, tipo y número de documento y nacionalidad.
- Datos de contacto del titular: email y teléfono.
- Casillas: "Necesito asistencia (movilidad reducida)" y "Viajo por trabajo (quiero factura)", que despliega los campos de razón social, NIF y dirección fiscal.
- Opción de iniciar sesión para autocompletar y acumular Wind Points.
- Validación en tiempo real con mensajes claros.

### Paso 4 · Asientos y extras
- Mapa visual de la cabina «Lounge» (50 butacas) con asientos junto a ventanal (**+15 €**), estándar (incluido) y ocupados. La zona privada aparece bloqueada para clientes particulares.
- Extras:
  - Menú gastronómico (**+35 €/pax**, con tarjetas de 3 menús, opción vegetariana y alérgenos)
  - Equipaje facturado adicional (**+20 €**)
  - Seguro de cancelación flexible (**+12 €/pax**)
  - Aparcamiento en vertipuerto (**+8 €/día**)
  - Lanzadera a Palma centro (**+6 €/pax**)
- Canje de Wind Points (**100 puntos = 1 €**) y campo de código promocional (`LANZAMIENTO10` → **−10 %**).

### Paso 5 · Revisión y pago
- Desglose completo: billetes por pasajero y tramo, extras, descuentos, IVA y total.
- Casillas obligatorias de aceptación de las condiciones de transporte y de la política de privacidad.
- Métodos de pago SIMULADOS: tarjeta (formulario con validación de formato y paso 3-D Secure simulado), Bizum, PayPal y Apple Pay / Google Pay (botones demo).
- Estados de pago: procesando (spinner), éxito y error ("Pago rechazado", con opción de reintentar). La tarjeta de prueba `4000 0000 0000 0002` siempre falla.

### Paso 6 · Confirmación
- Localizador de 6 caracteres, resumen del viaje, botón "Añadir al calendario" (.ics) y "Descargar tarjeta de embarque" en PDF con código QR, puerta y hora de embarque (cierre 30 min antes).
- Vista previa del email de confirmación.
- Wind Points ganados (1 punto por cada euro gastado).
- Recomendaciones: cómo llegar al vertipuerto y qué llevar.

## Área de cliente

- Registro e inicio de sesión (simulado), perfil y pasajeros frecuentes guardados.
- **Mis reservas**: próximas y pasadas, con acciones de:
  - Ver
  - Cambiar fecha (muestra la diferencia de precio)
  - Añadir extras
  - Check-in online (desde 48 h antes; genera la tarjeta de embarque)
  - Cancelar (con el reembolso calculado según la política)
- Gestión sin cuenta: acceso con localizador y apellido.
- **Wind Points**: saldo, historial y 3 niveles (**Brisa, Viento, Tramontana**) con barra de progreso y beneficios.
- Facturas descargables.

## Flujo de cancelación por meteorología

- Simula una alerta en "Mis reservas" del tipo "Tu vuelo ha sido cancelado por condiciones meteorológicas".
- El cliente elige entre cambio de fecha gratuito (calendario con disponibilidad) o reembolso íntegro, y recibe una confirmación inmediata.

## Flujo Empresas (B2B)

Configurador de propuesta en 4 pasos:
1. Tipo de evento: comida o cena de negocios, atención a clientes, incentivo, presentación de producto u otro.
2. Formato: **Zona privada** (+1.200 €/trayecto más billetes, hasta 12 personas) o **Vuelo chárter completo** (9.500 €/trayecto, 50 plazas, menú incluido).
3. Fecha preferida y alternativa, nº de invitados, menú a medida, branding a bordo y traslados.
4. Datos de la empresa y del contacto.

Muestra una estimación de precio en tiempo real y un botón "Solicitar propuesta". Al enviarlo, aparece una confirmación ("Un gestor comercial te contactará en 24 h") con la propuesta resumida en PDF.
