/**
 * Configuración centralizada: marca, textos, precios, horarios y extras.
 * Cambia aquí el nombre de la marca y cualquier tarifa: el resto de la app lo lee de este archivo.
 */

export const BRAND = {
  name: "[NOMBRE DE LA MARCA]",
  tagline: "El viaje es la experiencia",
  heroTitle: "Girona – Mallorca, el viaje es el destino",
  heroSubtitle:
    "Cruza el Mediterráneo a bordo de un dirigible: ventanales panorámicos, calma, gastronomía a bordo y cero emisiones.",
  email: "hola@ejemplo-dirigible.es",
  businessEmail: "empresas@ejemplo-dirigible.es",
  phone: "+34 900 000 000",
  address: "Vertipuerto Girona – Costa Brava, 17000 Girona",
  legalName: "[NOMBRE DE LA MARCA] Air Cruises, S.L. (ficticia)",
  cif: "B00000000",
  siteUrl: "https://ejemplo-dirigible.es",
  disclaimer: "Proyecto conceptual – servicio no operativo",
  year: 2026,
} as const;

export const NAV_LINKS = [
  { href: "/reservar", label: "Reservar" },
  { href: "/tarifas", label: "Tarifas" },
  { href: "/empresas", label: "Empresas" },
  { href: "/sostenibilidad", label: "Sostenibilidad" },
  { href: "/seguridad", label: "Seguridad" },
  { href: "/faq", label: "FAQ" },
] as const;

export const FOOTER_LINKS = {
  viaja: [
    { href: "/reservar", label: "Reservar vuelo" },
    { href: "/gestionar-reserva", label: "Gestionar reserva" },
    { href: "/tarifas", label: "Tarifas" },
    { href: "/mi-cuenta/wind-points", label: "Wind Points" },
  ],
  empresa: [
    { href: "/empresas", label: "Empresas y eventos" },
    { href: "/sostenibilidad", label: "Sostenibilidad" },
    { href: "/seguridad", label: "Seguridad" },
    { href: "/contacto", label: "Contacto" },
  ],
  legal: [
    { href: "/aviso-legal", label: "Aviso legal" },
    { href: "/privacidad", label: "Privacidad" },
    { href: "/cookies", label: "Cookies" },
    { href: "/condiciones-de-transporte", label: "Condiciones de transporte" },
  ],
} as const;

/* ───────────── Ruta y aeronave ───────────── */

export type AirportId = "girona" | "mallorca";

export const AIRPORTS: Record<AirportId, { id: AirportId; city: string; name: string; code: string; region: string }> = {
  girona: { id: "girona", city: "Girona", name: "Vertipuerto Girona – Costa Brava", code: "GRO", region: "Costa Brava" },
  mallorca: { id: "mallorca", city: "Mallorca", name: "Vertipuerto Palma de Mallorca", code: "PMI", region: "Palma" },
};

export const ROUTE = {
  distanceKm: 260,
  durationMin: 135,
  durationLabel: "~2 h 15 min",
  capacity: 50,
  cruiseAltitudeM: 300,
  cruiseSpeedKmh: 115,
} as const;

/* ───────────── Temporadas, horarios y tarifas ───────────── */

export type Season = "alta" | "media" | "baja";

export const SEASONS: Record<Season, { label: string; months: number[]; fare: number; color: string; description: string }> = {
  alta: { label: "Temporada alta", months: [6, 7, 8, 9], fare: 179, color: "#F472B6", description: "Junio a septiembre · 4 vuelos diarios" },
  media: { label: "Temporada media", months: [4, 5, 10], fare: 149, color: "#F59E0B", description: "Abril, mayo y octubre · 2 vuelos diarios" },
  baja: { label: "Temporada baja", months: [11, 12, 1, 2, 3], fare: 129, color: "#7C9CD6", description: "Noviembre a marzo · 2 vuelos diarios, 4 días por semana" },
};

/** Horarios: la aeronave alterna sentido en cada vuelo. */
export const SCHEDULES: Record<Season, { time: string; from: AirportId }[]> = {
  alta: [
    { time: "08:00", from: "girona" },
    { time: "11:00", from: "mallorca" },
    { time: "14:00", from: "girona" },
    { time: "17:00", from: "mallorca" },
  ],
  media: [
    { time: "09:30", from: "girona" },
    { time: "15:00", from: "mallorca" },
  ],
  baja: [
    { time: "09:30", from: "girona" },
    { time: "15:00", from: "mallorca" },
  ],
};

/** Días de operación en temporada baja (0 = domingo … 6 = sábado): jueves a domingo. */
export const LOW_SEASON_WEEKDAYS = [4, 5, 6, 0];

export const PRICING = {
  childDiscount: 0.25, // niños 2–11 años: −25 %
  infantPrice: 0, // bebés < 2 años: gratis sin asiento
  advanceDays: 60,
  advanceDiscount: 0.1, // −10 % si se reserva con más de 60 días
  highDemandThreshold: 0.8,
  highDemandSurcharge: 0.15, // +15 % si ocupación > 80 %
  lastSeatsThreshold: 8,
  vatRate: 0.1, // IVA transporte de viajeros (incluido en todos los precios)
  bookingHorizonDays: 365,
  maxPassengers: 9,
} as const;

export const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  LANZAMIENTO10: { discount: 0.1, label: "Código de lanzamiento (−10 %)" },
};

/* ───────────── Asientos y extras ───────────── */

export const SEATING = {
  rows: 10,
  /** Disposición 1-3-1 de la cabina «Lounge»: A y E junto a ventanal. */
  letters: ["A", "B", "C", "D", "E"] as const,
  windowLetters: ["A", "E"] as const,
  windowPrice: 15,
  privateZoneSeats: 12,
} as const;

export const EXTRAS = {
  menu: { label: "Menú gastronómico", price: 35, unit: "por pasajero y trayecto" },
  bag: { label: "Equipaje facturado adicional", price: 20, unit: "por maleta y trayecto" },
  insurance: { label: "Seguro de cancelación flexible", price: 12, unit: "por pasajero" },
  parking: { label: "Aparcamiento en vertipuerto", price: 8, unit: "por día" },
  shuttle: { label: "Lanzadera a Palma centro", price: 6, unit: "por pasajero" },
} as const;

export const MENUS = [
  {
    id: "empordanes",
    name: "Menú Empordà",
    description: "Coca de recapte, suquet de peix de roca y crema catalana.",
    vegetarian: false,
    allergens: ["Gluten", "Pescado", "Huevo", "Lácteos"],
  },
  {
    id: "balear",
    name: "Menú Balear",
    description: "Tumbet, porcella con hierbas de la Serra de Tramuntana y ensaïmada.",
    vegetarian: false,
    allergens: ["Gluten", "Huevo", "Lácteos", "Sulfitos"],
  },
  {
    id: "huerta",
    name: "Menú Huerta (vegetariano)",
    description: "Escalivada con romesco, arroz de verduras de temporada y fruta con aceite de oliva.",
    vegetarian: true,
    allergens: ["Frutos de cáscara", "Sésamo"],
  },
] as const;

export type MenuId = (typeof MENUS)[number]["id"];

/* ───────────── Wind Points ───────────── */

export const WIND_POINTS = {
  earnPerEuro: 1,
  pointsPerEuro: 100, // 100 puntos = 1 €
  tiers: [
    {
      id: "brisa",
      name: "Brisa",
      min: 0,
      benefits: ["1 punto por cada euro", "Ofertas exclusivas por email", "Check-in online prioritario"],
    },
    {
      id: "viento",
      name: "Viento",
      min: 2000,
      benefits: ["Todo lo de Brisa", "+10 % de puntos en cada vuelo", "Elección de asiento junto a ventanal gratis", "Embarque prioritario"],
    },
    {
      id: "tramontana",
      name: "Tramontana",
      min: 5000,
      benefits: ["Todo lo de Viento", "Copa de cava de bienvenida", "Cambios de fecha sin diferencia de tarifa (1/año)", "Acceso a la terraza del vertipuerto"],
    },
  ],
} as const;

/* ───────────── Política de cancelación ───────────── */

export const CANCELLATION_POLICY = {
  /** Reembolso según días de antelación, sin seguro. */
  tiers: [
    { minDays: 30, refund: 0.8, label: "Más de 30 días antes: 80 %" },
    { minDays: 7, refund: 0.5, label: "Entre 7 y 30 días antes: 50 %" },
    { minDays: 0, refund: 0, label: "Menos de 7 días antes: sin reembolso" },
  ],
  insuranceRefund: 1,
  insuranceLabel: "Con seguro de cancelación flexible: 100 % hasta 24 h antes",
  insuranceMinHours: 24,
  checkInOpensHours: 48,
  boardingClosesMin: 30,
  boardingStartsMin: 50,
} as const;

/* ───────────── Empresas (B2B) ───────────── */

export const B2B = {
  eventTypes: [
    { id: "comida", label: "Comida o cena de negocios" },
    { id: "clientes", label: "Atención a clientes" },
    { id: "incentivo", label: "Incentivo para equipos" },
    { id: "presentacion", label: "Presentación de producto" },
    { id: "otro", label: "Otro" },
  ],
  formats: {
    privada: {
      label: "Zona privada",
      pricePerLeg: 1200,
      maxGuests: 12,
      description: "Salón reservado a popa con ventanales propios, hasta 12 personas. Se suman los billetes de los invitados.",
    },
    charter: {
      label: "Vuelo chárter completo",
      pricePerLeg: 9500,
      maxGuests: 50,
      description: "La aeronave entera para tu evento: 50 plazas, menú incluido y horario a medida.",
    },
  },
  extras: {
    customMenu: { label: "Menú a medida", pricePerGuest: 25 },
    branding: { label: "Branding a bordo", price: 450 },
    transfers: { label: "Traslados al vertipuerto", pricePerGuest: 15 },
  },
} as const;

/* ───────────── Contenido ───────────── */

export const STATS = {
  airshipGco2: 10.8,
  planeGco2: 124.7,
  reduction: 91,
} as const;

export const TESTIMONIALS = [
  {
    name: "Laura M.",
    city: "Barcelona",
    text: "Fue la primera vez que el trayecto se convirtió en lo mejor del viaje. Ver la Costa Brava desde el ventanal mientras comíamos fue mágico.",
    rating: 5,
  },
  {
    name: "Jordi P.",
    city: "Girona",
    text: "Sin colas, sin prisas y con un silencio increíble. Llegué a Palma más descansado que nunca.",
    rating: 5,
  },
  {
    name: "Anna & Marc",
    city: "Palma",
    text: "Lo reservamos para nuestro aniversario y repetiremos. El menú balear, de diez.",
    rating: 5,
  },
] as const;

export const FAQS = [
  {
    q: "¿Cuánto dura el trayecto entre Girona y Mallorca?",
    a: "Unas 2 h 15 min para recorrer ~260 km. No competimos en velocidad: el viaje forma parte de la experiencia.",
  },
  {
    q: "¿Es seguro volar en dirigible?",
    a: "Sí. Nuestra aeronave usa helio, un gas no inflamable, está certificada por la autoridad aeronáutica y la opera una tripulación profesional con formación específica.",
  },
  {
    q: "¿Qué pasa si hace mal tiempo?",
    a: "Los vuelos en dirigible dependen de la meteorología. Si cancelamos un vuelo, puedes cambiar de fecha gratis o recibir el reembolso íntegro.",
  },
  {
    q: "¿Con cuánta antelación debo llegar al vertipuerto?",
    a: "Recomendamos llegar 1 hora antes. El embarque cierra 30 minutos antes de la salida. No hay controles largos ni colas.",
  },
  {
    q: "¿Cuánto equipaje puedo llevar?",
    a: "Incluimos una maleta de cabina de hasta 10 kg y un bolso. Puedes añadir equipaje facturado por 20 € por trayecto.",
  },
  {
    q: "¿Viajan niños y bebés?",
    a: "Sí. Los niños de 2 a 11 años tienen un 25 % de descuento y los bebés menores de 2 años viajan gratis en brazos de un adulto.",
  },
  {
    q: "¿Qué son los Wind Points?",
    a: "Nuestro programa de fidelización: ganas 1 punto por cada euro y puedes canjearlos (100 puntos = 1 €). Hay tres niveles: Brisa, Viento y Tramontana.",
  },
  {
    q: "¿Puedo reservar para un evento de empresa?",
    a: "Sí, ofrecemos zona privada para hasta 12 personas y vuelos chárter completos de 50 plazas. Solicita tu propuesta en la sección Empresas.",
  },
] as const;
