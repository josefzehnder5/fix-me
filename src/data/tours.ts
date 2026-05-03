// Real photos provided by Castle Tours
import imgFlamingos from "@/assets/photo-flamingos.jpg";
import imgPuntaGallinas from "@/assets/photo-punta-gallinas.jpg";
import imgCaboAtardecer from "@/assets/photo-cabo-atardecer.jpg";
import imgCaboVela from "@/assets/photo-cabo-vela.jpg";
import imgCaboSanJuan from "@/assets/photo-cabo-san-juan.jpg";
import imgPalomino from "@/assets/photo-palomino.jpg";
import imgMayapo from "@/assets/photo-mayapo.jpg";
import imgVelero from "@/assets/photo-velero.jpg";
import imgPlayaMayapo from "@/assets/photo-playa-mayapo.jpg";
import imgMacuira from "@/assets/photo-macuira.jpg";

import imgRiohacha from "@/assets/photo-riohacha.webp";
import imgSMCentro from "@/assets/photo-santamarta-centro.jpg";
import imgSMCatedral from "@/assets/photo-santamarta-catedral.jpg";

// Semantic aliases — reused where it makes sense
const puntaGallinas = imgPuntaGallinas;
const flamingos = imgFlamingos;
const caboVela = imgCaboAtardecer;        // sunset shot for the headline Cabo experiences
const caboVelaDay = imgCaboVela;          // daylight cabo rocks
const mayapo = imgMayapo;                  // colored cabins (cultural/pasadía)
const velero = imgVelero;
const tayrona = imgCaboSanJuan;            // Tayrona / Cabo San Juan
const todoIncluido = imgPuntaGallinas;     // hero-worthy shot for the package
const palomino = imgPalomino;              // jungle river / Sierra
const minca = imgPalomino;                 // jungle waterfall fits Minca/cascadas
const montesDeOca = imgPalomino;           // cascadas
const santamartaCentro = imgSMCentro;      // colorful colonial street
const santamartaCatedral = imgSMCatedral;  // white cathedral
const riohacha = imgRiohacha;              // riohacha boardwalk
const playa = imgPlayaMayapo;              // pristine Caribbean beach
const macuira = imgMacuira;                // dunes / Macuira

export type TourCategory = "guajira-aventura" | "guajira-pasadia" | "santa-marta" | "todo-incluido";
export type TourTag =
  | "pasadia" | "2-3-dias" | "4-5-dias" | "con-vuelos"
  | "la-guajira" | "santa-marta" | "tayrona" | "minca"
  | "cultural" | "aventura" | "playa" | "romantico"
  | "naturaleza" | "gastronomia" | "bienestar";

export interface ItineraryItem { day: string; time?: string; title: string; description: string; }
export interface PriceRow { pax: string; chinchorro?: string; cama?: string; camaAc?: string; }
export interface FaqItem { q: string; a: string; }

export interface Tour {
  id: number;
  slug: string;
  name: string;
  shortName?: string;
  category: TourCategory;
  duration: string;            // human-readable
  durationDays: string;        // for WA message
  priceFromCop: number;
  priceDisplay: string;        // e.g. "Desde $550.000"
  departureCities: string[];
  defaultOrigin: string;
  hook: string;
  badge?: string;
  tags: TourTag[];
  heroImage: string;
  highlights: { icon: string; label: string }[];
  includes: string[];
  notIncluded: string[];
  itinerary: ItineraryItem[];
  menu?: { options: string[]; note?: string };
  priceTable?: { columns: ("chinchorro" | "cama" | "cama-ac")[]; rows: PriceRow[]; note?: string };
  faq: FaqItem[];
  whatToBring: { icon: string; label: string }[];
  reviews?: { name: string; country: string; quote: string; rating: number }[];
  featured?: boolean;
}

const baseIncludes = [
  "Transporte 4x4 con conductor wayuu",
  "Guía local certificado",
  "Asistencia médica básica",
  "Hidratación durante el recorrido",
];

const baseFaq: FaqItem[] = [
  { q: "¿Necesito visa para venir a Colombia?", a: "Ciudadanos de la mayoría de países de Europa, América y Asia no requieren visa para estadías turísticas hasta 90 días. Te recomendamos verificar con la embajada de Colombia en tu país." },
  { q: "¿Es apto para niños?", a: "Sí, recibimos familias. Para tours de aventura en La Guajira recomendamos niños mayores de 6 años por las condiciones del terreno." },
  { q: "¿Qué pasa si llueve?", a: "Operamos en cualquier condición climática segura. En caso de fuerza mayor reprogramamos sin costo o devolvemos tu pago." },
  { q: "¿Hay señal de celular?", a: "En Riohacha y Santa Marta sí. En el desierto de La Guajira la señal es limitada o nula — parte de la magia." },
];

const baseBring = [
  { icon: "🧴", label: "Protector solar 50+" },
  { icon: "🦟", label: "Repelente de insectos" },
  { icon: "👟", label: "Zapatos cerrados y sandalias" },
  { icon: "👙", label: "Vestido de baño" },
  { icon: "🧢", label: "Sombrero o gorra" },
  { icon: "📱", label: "Funda impermeable" },
  { icon: "💵", label: "Efectivo (poco comercio acepta tarjeta)" },
];

const baseReviews = [
  { name: "Camila R.", country: "🇲🇽 México", quote: "El mejor tour que hemos hecho en Colombia. Castle nos cuidó cada detalle.", rating: 5 },
  { name: "Lukas B.", country: "🇩🇪 Alemania", quote: "Auténtico, sin filtros turísticos. Punta Gallinas es de otro planeta.", rating: 5 },
  { name: "Sofía L.", country: "🇦🇷 Argentina", quote: "Los flamingos rosados, la cultura wayuu, la comida... volvería mañana.", rating: 5 },
];

export const tours: Tour[] = [
  {
    id: 1, slug: "inmersion-mayapo-flamingos",
    name: "Inmersión Cultural: Mayapo, Flamingos & Ranchería",
    category: "guajira-pasadia", duration: "2 días / 1 noche", durationDays: "2 días",
    priceFromCop: 550000, priceDisplay: "Desde $550.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Dos días entre flamingos rosados, playas vírgenes y la cosmovisión wayuu en una ranchería auténtica.",
    badge: "Bestseller", tags: ["2-3-dias", "la-guajira", "cultural", "playa"],
    heroImage: mayapo, featured: true,
    highlights: [
      { icon: "🦩", label: "Flamingos rosados" },
      { icon: "🏖️", label: "Playas de Mayapo" },
      { icon: "🎭", label: "Ranchería wayuu" },
      { icon: "🌅", label: "Atardecer en el desierto" },
    ],
    includes: [...baseIncludes, "1 noche en chinchorro o cama", "3 comidas típicas", "Visita a ranchería con familia wayuu"],
    notIncluded: ["Bebidas alcohólicas", "Propinas", "Souvenirs y artesanías"],
    itinerary: [
      { day: "Día 1", time: "07:00", title: "Salida desde Riohacha", description: "Recogida en tu hotel y camino al santuario de los flamingos rosados en Camarones. Avistamiento en bote artesanal con guía local." },
      { day: "Día 1", time: "13:00", title: "Almuerzo + Playas de Mayapo", description: "Almuerzo típico frente al mar y tarde de playa en arenas blancas y aguas cristalinas." },
      { day: "Día 1", time: "18:00", title: "Llegada a la ranchería", description: "Bienvenida wayuu, cena tradicional y noche bajo las estrellas en chinchorro." },
      { day: "Día 2", time: "07:00", title: "Inmersión cultural", description: "Desayuno, taller de tejido de mochilas, conversación con el palabrero wayuu y regreso a Riohacha al mediodía." },
    ],
    menu: { options: ["Pescado", "Chivo", "Pollo", "Arroz de camarón", "Vegetariano ✓"], note: "Platos como langosta tienen costo adicional." },
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 2, slug: "punta-gallinas-3-dias",
    name: "Punta Gallinas — La Mejor Experiencia",
    category: "guajira-aventura", duration: "3 días / 2 noches", durationDays: "3 días",
    priceFromCop: 830000, priceDisplay: "Desde $830.000",
    departureCities: ["Riohacha", "Santa Marta (+$60–80k)"], defaultOrigin: "Riohacha",
    hook: "El punto más al norte de Sudamérica. Dunas que caen al mar Caribe, Cabo de la Vela y el silencio absoluto del desierto.",
    badge: "Bestseller", tags: ["2-3-dias", "la-guajira", "aventura", "cultural"],
    heroImage: puntaGallinas, featured: true,
    highlights: [
      { icon: "🏜️", label: "Dunas de Taroa" },
      { icon: "🌊", label: "Bahía Hondita" },
      { icon: "🌅", label: "Sunset Cabo de la Vela" },
      { icon: "🏕️", label: "Chinchorro wayuu" },
      { icon: "🦩", label: "Flamingos en Bahía Hondita" },
      { icon: "🚙", label: "4x4 todo terreno" },
    ],
    includes: [...baseIncludes, "2 noches alojamiento", "Todas las comidas (5)", "Lancha en Bahía Hondita"],
    notIncluded: ["Bebidas alcohólicas", "Langosta (extra)", "Propinas"],
    itinerary: [
      { day: "Día 1", time: "05:00", title: "Riohacha → Cabo de la Vela", description: "Salida temprano. Visita al Pilón de Azúcar, Ojo del Agua y atardecer mágico en el Faro de Cabo de la Vela." },
      { day: "Día 2", time: "05:00", title: "Cabo → Punta Gallinas", description: "Cruce por el desierto en 4x4. Bahía Hondita, faro de Punta Gallinas y las espectaculares Dunas de Taroa donde la arena cae al mar." },
      { day: "Día 3", time: "06:00", title: "Regreso a Riohacha", description: "Desayuno, últimas vistas y regreso por el desierto con paradas fotográficas." },
    ],
    priceTable: {
      columns: ["chinchorro", "cama", "cama-ac"],
      rows: [
        { pax: "2", chinchorro: "$1.180.000", cama: "$1.290.000", camaAc: "$1.420.000" },
        { pax: "3-4", chinchorro: "$950.000", cama: "$1.050.000", camaAc: "$1.180.000" },
        { pax: "5-6", chinchorro: "$830.000", cama: "$920.000", camaAc: "$1.050.000" },
      ],
      note: "Reserva con 15%. Pago restante en efectivo, transferencia o tarjeta."
    },
    menu: { options: ["Pescado fresco", "Chivo guisado", "Carne de res", "Arroz de camarón", "Vegetariano ✓"], note: "Langosta disponible con costo adicional." },
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 3, slug: "atardecer-cabo-vela",
    name: "Atardecer Cabo de la Vela",
    category: "guajira-aventura", duration: "2 días / 1 noche", durationDays: "2 días",
    priceFromCop: 550000, priceDisplay: "Desde $550.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "El sunset más famoso del Caribe colombiano. Faro, Pilón de Azúcar y noche bajo las estrellas wayuu.",
    badge: "Top sunset", tags: ["2-3-dias", "la-guajira", "aventura"],
    heroImage: caboVela, featured: true,
    highlights: [
      { icon: "🌅", label: "Sunset del Faro" },
      { icon: "🏜️", label: "Pilón de Azúcar" },
      { icon: "🏕️", label: "Chinchorro o cama" },
      { icon: "🦞", label: "Mariscos frescos" },
    ],
    includes: [...baseIncludes, "1 noche alojamiento", "3 comidas"],
    notIncluded: ["Bebidas alcohólicas", "Langosta extra", "Propinas"],
    itinerary: [
      { day: "Día 1", time: "07:00", title: "Riohacha → Cabo de la Vela", description: "Recorrido en 4x4 por Manaure y las salinas. Llegada a Cabo, almuerzo, Pilón de Azúcar y atardecer en el Faro." },
      { day: "Día 2", time: "06:00", title: "Ojo del Agua + regreso", description: "Amanecer, baño en Ojo del Agua, desayuno y regreso a Riohacha al mediodía." },
    ],
    priceTable: {
      columns: ["chinchorro", "cama", "cama-ac"],
      rows: [{ pax: "Por persona", chinchorro: "$550.000", cama: "$590.000", camaAc: "$640.000" }],
    },
    menu: { options: ["Pescado", "Chivo", "Pollo", "Vegetariano ✓"] },
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 4, slug: "palomino-tubing-hospedaje",
    name: "Palomino — Tubing & Hospedaje",
    category: "santa-marta", duration: "2 días / 1 noche", durationDays: "2 días",
    priceFromCop: 410000, priceDisplay: "Desde $410.000",
    departureCities: ["Riohacha", "Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Donde la Sierra Nevada baja al mar. Tubing en río cristalino y hospedaje frente a la playa.",
    tags: ["2-3-dias", "santa-marta", "aventura", "naturaleza"],
    heroImage: palomino,
    highlights: [
      { icon: "🛶", label: "Tubing en el río" },
      { icon: "🏖️", label: "Playa Palomino" },
      { icon: "🌴", label: "Sierra Nevada" },
      { icon: "🌅", label: "Atardecer en hamaca" },
    ],
    includes: [...baseIncludes, "1 noche hospedaje", "Desayuno", "Tubing con guía"],
    notIncluded: ["Almuerzos y cenas", "Bebidas", "Otros tours"],
    itinerary: [
      { day: "Día 1", title: "Llegada y tarde libre", description: "Traslado a Palomino, check-in en hospedaje frente al mar y tarde libre en la playa." },
      { day: "Día 2", title: "Tubing + regreso", description: "Caminata corta, descenso del río en flotador y regreso al pueblo. Almuerzo libre y traslado." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 5, slug: "nazaret-macuira-punta-gallinas",
    name: "Nazaret + Macuira + Punta Gallinas",
    category: "guajira-aventura", duration: "4 días / 3 noches", durationDays: "4 días",
    priceFromCop: 1160000, priceDisplay: "Desde $1.160.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "La expedición premium: Serranía de la Macuira, oasis en pleno desierto y la Alta Guajira más profunda.",
    badge: "Premium", tags: ["4-5-dias", "la-guajira", "aventura", "naturaleza"],
    heroImage: macuira,
    highlights: [
      { icon: "🌳", label: "Macuira - bosque en el desierto" },
      { icon: "🏜️", label: "Punta Gallinas" },
      { icon: "🏕️", label: "Comunidad Nazaret" },
      { icon: "🚙", label: "Expedición 4x4" },
    ],
    includes: [...baseIncludes, "3 noches alojamiento", "Todas las comidas", "Permisos comunitarios"],
    notIncluded: ["Bebidas alcohólicas", "Langosta extra", "Propinas"],
    itinerary: [
      { day: "Día 1", title: "Riohacha → Cabo de la Vela", description: "Travesía por Manaure y noche en Cabo." },
      { day: "Día 2", title: "Cabo → Nazaret", description: "Atravesamos la Alta Guajira hasta el pueblo de Nazaret, en las faldas de la Serranía de la Macuira." },
      { day: "Día 3", title: "Macuira + Punta Gallinas", description: "Caminata al oasis Shipana, luego Punta Gallinas y Dunas de Taroa." },
      { day: "Día 4", title: "Regreso a Riohacha", description: "Bahía Hondita y regreso." },
    ],
    priceTable: {
      columns: ["chinchorro", "cama", "cama-ac"],
      rows: [
        { pax: "1 PAX", chinchorro: "$2.900.000", cama: "$3.350.000", camaAc: "$3.700.000" },
        { pax: "2 PAX", chinchorro: "$1.850.000", cama: "$2.100.000", camaAc: "$2.350.000" },
        { pax: "4 PAX", chinchorro: "$1.380.000", cama: "$1.560.000", camaAc: "$1.750.000" },
        { pax: "6 PAX", chinchorro: "$1.160.000", cama: "$1.290.000", camaAc: "$1.450.000" },
      ],
      note: "Tour exclusivo. Reserva con 30%."
    },
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 6, slug: "santa-marta-guajira-todo-incluido-5",
    name: "Santa Marta + Guajira Todo Incluido (con vuelos)",
    category: "todo-incluido", duration: "5 días / 4 noches", durationDays: "5 días",
    priceFromCop: 2184000, priceDisplay: "Desde $2.184.000",
    departureCities: ["Bogotá", "Medellín", "Cali", "Cúcuta", "Bucaramanga", "Neiva", "Pereira", "Armenia", "Pasto", "Villavicencio", "Barrancabermeja"],
    defaultOrigin: "Bogotá",
    hook: "Vuelos, hoteles, traslados y los mejores tours de la región. El paquete completo, sin preocuparte por nada.",
    badge: "Todo Incluido", tags: ["4-5-dias", "con-vuelos", "la-guajira", "santa-marta", "playa"],
    heroImage: todoIncluido, featured: true,
    highlights: [
      { icon: "✈️", label: "Vuelos incluidos" },
      { icon: "🏨", label: "4 noches hotel" },
      { icon: "🚐", label: "Todos los traslados" },
      { icon: "🎯", label: "Tours principales" },
      { icon: "🍽️", label: "Desayunos diarios" },
      { icon: "💬", label: "Asesor 24/7" },
    ],
    includes: ["Vuelo ida y regreso", "4 noches hotel 4★", "Desayunos", "Tour Punta Gallinas o Cabo", "Tour Tayrona o Velero", "Todos los traslados", "Asistencia médica viaje", "Guía bilingüe"],
    notIncluded: ["Almuerzos y cenas no especificadas", "Bebidas alcohólicas", "Propinas", "Gastos personales"],
    itinerary: [
      { day: "Día 1", title: "Llegada Santa Marta", description: "Recogida en aeropuerto, check-in y city tour panorámico." },
      { day: "Día 2", title: "Tayrona o Velero", description: "Día de playa: Cabo San Juan o velero a Bahía Concha." },
      { day: "Día 3", title: "Santa Marta → Cabo de la Vela", description: "Traslado a La Guajira, atardecer en el Faro." },
      { day: "Día 4", title: "Punta Gallinas", description: "Día completo en Dunas de Taroa y Bahía Hondita." },
      { day: "Día 5", title: "Regreso", description: "Desayuno, traslado al aeropuerto y vuelo de regreso." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 7, slug: "punta-gallinas-todo-incluido-4",
    name: "Punta Gallinas Todo Incluido 4 días (con vuelos)",
    category: "todo-incluido", duration: "4 días", durationDays: "4 días",
    priceFromCop: 1980000, priceDisplay: "Desde $1.980.000",
    departureCities: ["Bogotá", "Medellín", "Cali", "Bucaramanga", "Pereira", "Otras"], defaultOrigin: "Bogotá",
    hook: "Vuelos + Punta Gallinas completo. La Guajira al ritmo justo.", badge: "Todo Incluido",
    tags: ["4-5-dias", "con-vuelos", "la-guajira", "aventura"],
    heroImage: todoIncluido,
    highlights: [{ icon: "✈️", label: "Vuelos" }, { icon: "🏜️", label: "Punta Gallinas" }, { icon: "🌅", label: "Cabo de la Vela" }, { icon: "🏨", label: "Alojamiento" }],
    includes: ["Vuelo ida y regreso", "3 noches alojamiento", "Comidas en La Guajira", "Tour completo Punta Gallinas", "Traslados"],
    notIncluded: ["Bebidas alcohólicas", "Propinas"],
    itinerary: [
      { day: "Día 1", title: "Llegada → Cabo", description: "Vuelo, recogida y traslado a Cabo de la Vela." },
      { day: "Día 2", title: "Cabo → Punta Gallinas", description: "Cruce del desierto, Bahía Hondita y dunas." },
      { day: "Día 3", title: "Gallinas → Riohacha", description: "Últimas vistas y regreso." },
      { day: "Día 4", title: "Regreso", description: "Vuelo de regreso a tu ciudad." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 8, slug: "punta-gallinas-todo-incluido-5",
    name: "Punta Gallinas Todo Incluido 5 días (con vuelos)",
    category: "todo-incluido", duration: "5 días", durationDays: "5 días",
    priceFromCop: 2390000, priceDisplay: "Desde $2.390.000",
    departureCities: ["Bogotá", "Medellín", "Cali", "Bucaramanga", "Otras"], defaultOrigin: "Bogotá",
    hook: "Versión extendida: La Guajira con tiempo para respirar el desierto.", badge: "Todo Incluido",
    tags: ["4-5-dias", "con-vuelos", "la-guajira", "aventura", "cultural"],
    heroImage: todoIncluido,
    highlights: [{ icon: "✈️", label: "Vuelos" }, { icon: "🏜️", label: "Punta Gallinas" }, { icon: "🦩", label: "Flamingos" }, { icon: "🎭", label: "Wayuu" }],
    includes: ["Vuelo ida y regreso", "4 noches alojamiento", "Comidas", "Tour Punta Gallinas + Flamingos", "Traslados"],
    notIncluded: ["Bebidas alcohólicas", "Propinas"],
    itinerary: [
      { day: "Día 1", title: "Llegada Riohacha", description: "Vuelo y noche en Riohacha." },
      { day: "Día 2", title: "Flamingos + Mayapo", description: "Avistamiento y playas." },
      { day: "Día 3", title: "Cabo de la Vela", description: "Sunset en el Faro." },
      { day: "Día 4", title: "Punta Gallinas", description: "Bahía Hondita y dunas." },
      { day: "Día 5", title: "Regreso", description: "Vuelo a casa." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 9, slug: "cabo-vela-todo-incluido-4",
    name: "Cabo de la Vela Todo Incluido 4 días (con vuelos)",
    category: "todo-incluido", duration: "4 días", durationDays: "4 días",
    priceFromCop: 1850000, priceDisplay: "Desde $1.850.000",
    departureCities: ["Bogotá", "Medellín", "Cali", "Otras"], defaultOrigin: "Bogotá",
    hook: "El paquete relax: Cabo de la Vela y sus atardeceres con vuelos incluidos.", badge: "Todo Incluido",
    tags: ["4-5-dias", "con-vuelos", "la-guajira", "aventura", "romantico"],
    heroImage: caboVela,
    highlights: [{ icon: "✈️", label: "Vuelos" }, { icon: "🌅", label: "Sunset Faro" }, { icon: "🏜️", label: "Pilón" }, { icon: "🏨", label: "Alojamiento" }],
    includes: ["Vuelo ida y regreso", "3 noches", "Comidas en Cabo", "Tour completo", "Traslados"],
    notIncluded: ["Bebidas alcohólicas", "Propinas"],
    itinerary: [
      { day: "Día 1", title: "Llegada", description: "Vuelo y traslado a Cabo." },
      { day: "Día 2", title: "Día Cabo completo", description: "Pilón, Ojo del Agua, sunset Faro." },
      { day: "Día 3", title: "Cabo → Riohacha", description: "Manaure y salinas, regreso." },
      { day: "Día 4", title: "Regreso", description: "Vuelo a casa." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 10, slug: "cabo-san-juan-tayrona",
    name: "Cabo San Juan — Tayrona Trekking",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 200000, priceDisplay: "Desde $200.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Trekking por el Parque Tayrona hasta la postal más famosa del Caribe colombiano.",
    badge: "Top Tayrona", tags: ["pasadia", "tayrona", "santa-marta", "aventura", "playa"],
    heroImage: tayrona,
    highlights: [{ icon: "🥾", label: "Trekking jungla" }, { icon: "🏖️", label: "Cabo San Juan" }, { icon: "🐠", label: "Snorkel" }, { icon: "🌴", label: "Selva tropical" }],
    includes: [...baseIncludes, "Entrada al parque", "Almuerzo típico", "Snorkel"],
    notIncluded: ["Bebidas extra", "Propinas"],
    itinerary: [
      { day: "Día 1", time: "06:30", title: "Salida Santa Marta", description: "Recogida y traslado a Zaino, entrada al parque." },
      { day: "Día 1", time: "08:30", title: "Trekking", description: "2h por la selva hasta Cabo San Juan." },
      { day: "Día 1", time: "12:00", title: "Playa + almuerzo", description: "Tiempo libre, snorkel y almuerzo." },
      { day: "Día 1", time: "17:00", title: "Regreso", description: "Trekking de regreso o lancha (extra)." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 11, slug: "velero-bahia-concha",
    name: "Velero Bahía Concha",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 230000, priceDisplay: "Desde $230.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Día completo navegando hasta una de las bahías más bellas del Tayrona. Snorkel, almuerzo a bordo y silencio.",
    badge: "Romántico", tags: ["pasadia", "santa-marta", "tayrona", "playa", "romantico"],
    heroImage: velero, featured: true,
    highlights: [{ icon: "⛵", label: "Velero" }, { icon: "🐠", label: "Snorkel" }, { icon: "🍽️", label: "Almuerzo abordo" }, { icon: "🏖️", label: "Bahía Concha" }],
    includes: [...baseIncludes, "Velero con tripulación", "Almuerzo", "Snorkel"],
    notIncluded: ["Bebidas alcohólicas", "Propinas"],
    itinerary: [
      { day: "Día 1", time: "09:00", title: "Embarque Marina", description: "Recibimiento y briefing de seguridad." },
      { day: "Día 1", time: "10:00", title: "Navegación + snorkel", description: "Ruta a Bahía Concha con paradas para snorkel." },
      { day: "Día 1", time: "13:00", title: "Almuerzo + playa", description: "Almuerzo a bordo y tiempo en la bahía." },
      { day: "Día 1", time: "17:00", title: "Regreso", description: "Navegación de vuelta al atardecer." },
    ],
    priceTable: { columns: ["chinchorro"], rows: [{ pax: "Temp. baja", chinchorro: "$230.000" }, { pax: "Temp. alta", chinchorro: "$250.000" }] },
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 12, slug: "atardecer-velero",
    name: "Atardecer en Velero",
    category: "santa-marta", duration: "3 horas", durationDays: "3 horas",
    priceFromCop: 190000, priceDisplay: "Desde $190.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "El sunset del Caribe desde el agua. 3 horas, copa de bienvenida y un atardecer que no olvidarás.",
    badge: "Romántico", tags: ["pasadia", "santa-marta", "romantico"],
    heroImage: velero,
    highlights: [{ icon: "🌅", label: "Sunset" }, { icon: "🥂", label: "Copa de bienvenida" }, { icon: "⛵", label: "Velero" }],
    includes: ["Velero con capitán", "Copa de bienvenida", "Snacks"],
    notIncluded: ["Cena", "Bebidas alcohólicas extras"],
    itinerary: [
      { day: "Tarde", time: "16:30", title: "Embarque", description: "Salida desde la marina." },
      { day: "Tarde", time: "18:00", title: "Atardecer", description: "Punto perfecto para fotografiar el sunset." },
      { day: "Tarde", time: "19:30", title: "Regreso", description: "Vuelta a marina." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 13, slug: "city-tour-santa-marta",
    name: "City Tour Santa Marta",
    category: "santa-marta", duration: "4 horas", durationDays: "4 horas",
    priceFromCop: 160000, priceDisplay: "Desde $160.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Centro histórico, Quinta de San Pedro Alejandrino y la Catedral. Santa Marta a profundidad.",
    tags: ["pasadia", "santa-marta", "cultural"],
    heroImage: santamartaCatedral,
    highlights: [{ icon: "🏛️", label: "Quinta Bolívar" }, { icon: "⛪", label: "Catedral" }, { icon: "🎨", label: "Centro histórico" }],
    includes: [...baseIncludes, "Entradas a museos", "Guía bilingüe"],
    notIncluded: ["Almuerzo", "Bebidas"],
    itinerary: [
      { day: "Mañana", title: "Centro histórico + Catedral", description: "Recorrido por las plazas, malecón y Catedral." },
      { day: "Mañana", title: "Quinta de San Pedro Alejandrino", description: "Lugar donde murió Simón Bolívar." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 14, slug: "city-tour-panoramico",
    name: "City Tour Panorámico Santa Marta",
    category: "santa-marta", duration: "3 horas", durationDays: "3 horas",
    priceFromCop: 120000, priceDisplay: "Desde $120.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Versión rápida: los miradores y postales esenciales de Santa Marta.",
    tags: ["pasadia", "santa-marta", "cultural"],
    heroImage: santamartaCentro,
    highlights: [{ icon: "📸", label: "Miradores" }, { icon: "🏖️", label: "Bahía" }, { icon: "🌆", label: "Centro" }],
    includes: ["Transporte", "Guía"],
    notIncluded: ["Entradas a museos", "Comidas"],
    itinerary: [{ day: "Mañana o tarde", title: "Recorrido panorámico", description: "Bahía, malecón, mirador y centro histórico desde el bus." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 15, slug: "playa-blanca-acuario",
    name: "Playa Blanca + Acuario",
    category: "santa-marta", duration: "Medio día", durationDays: "½ día",
    priceFromCop: 170000, priceDisplay: "Desde $170.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Día familiar: acuario del Rodadero y playa blanca con aguas claras.",
    tags: ["pasadia", "santa-marta", "playa"],
    heroImage: playa,
    highlights: [{ icon: "🐠", label: "Acuario" }, { icon: "🏖️", label: "Playa Blanca" }, { icon: "👨‍👩‍👧", label: "Familiar" }],
    includes: ["Lancha", "Entrada acuario", "Guía"],
    notIncluded: ["Almuerzo", "Bebidas"],
    itinerary: [{ day: "Mañana", title: "Salida Rodadero", description: "Lancha al acuario, show de delfines y traslado a Playa Blanca." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 16, slug: "neguanje-playa-cristal",
    name: "Neguanje + Playa Cristal (Tayrona)",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 230000, priceDisplay: "Desde $230.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Las dos playas más cristalinas del Tayrona en un solo día. Snorkel y almuerzo incluido.",
    tags: ["pasadia", "tayrona", "santa-marta", "playa"],
    heroImage: tayrona,
    highlights: [{ icon: "💎", label: "Playa Cristal" }, { icon: "🐠", label: "Snorkel" }, { icon: "🏖️", label: "Neguanje" }],
    includes: [...baseIncludes, "Entrada parque", "Lancha", "Almuerzo"],
    notIncluded: ["Bebidas extra"],
    itinerary: [
      { day: "Día 1", time: "07:30", title: "Salida", description: "Traslado a Neguanje." },
      { day: "Día 1", time: "10:00", title: "Playa Cristal", description: "Lancha y snorkel." },
      { day: "Día 1", time: "13:00", title: "Almuerzo + playa", description: "Almuerzo y tarde libre." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 17, slug: "hacienda-victoria-cafe",
    name: "Hacienda La Victoria — Café & Cerveza",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 210000, priceDisplay: "Desde $210.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Hacienda cafetera centenaria en plena Sierra Nevada. Café de origen y cerveza artesanal Nevada.",
    tags: ["pasadia", "minca", "santa-marta", "gastronomia", "cultural"],
    heroImage: minca,
    highlights: [{ icon: "☕", label: "Tour de café" }, { icon: "🍺", label: "Cerveza Nevada" }, { icon: "🏔️", label: "Sierra Nevada" }],
    includes: [...baseIncludes, "Tour de café", "Degustación"],
    notIncluded: ["Almuerzo", "Compras"],
    itinerary: [
      { day: "Día 1", time: "08:00", title: "Salida a Minca", description: "Subida por la Sierra Nevada." },
      { day: "Día 1", time: "10:30", title: "Tour de café", description: "Recorrido por la hacienda y degustación." },
      { day: "Día 1", time: "14:00", title: "Cerveza Nevada", description: "Visita a la cervecería artesanal." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 18, slug: "minca-extrema-moto",
    name: "Minca Extrema — Tour en Moto",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 170000, priceDisplay: "Desde $170.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Cascadas, miradores y senderos imposibles de hacer en carro. Adrenalina pura en la Sierra.",
    badge: "Aventura", tags: ["pasadia", "minca", "santa-marta", "aventura"],
    heroImage: minca,
    highlights: [{ icon: "🏍️", label: "Moto guiada" }, { icon: "💦", label: "Cascadas Marinka" }, { icon: "👁️", label: "Mirador" }],
    includes: ["Moto + casco", "Guía piloto", "Entradas"],
    notIncluded: ["Almuerzo", "Seguro extremo"],
    itinerary: [{ day: "Día 1", title: "Ruta moto", description: "Marinka, Pozo Azul, mirador y regreso." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 19, slug: "termales-cantar-tierra",
    name: "Termales — Cantar de la Tierra",
    category: "santa-marta", duration: "Medio día", durationDays: "½ día",
    priceFromCop: 260000, priceDisplay: "Desde $260.000",
    departureCities: ["Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Aguas termales naturales, ritual de barro y desconexión total a 1h de Santa Marta.",
    tags: ["pasadia", "santa-marta", "bienestar"],
    heroImage: montesDeOca,
    highlights: [{ icon: "♨️", label: "Termales" }, { icon: "🧖", label: "Barro mineral" }, { icon: "🌿", label: "Naturaleza" }],
    includes: ["Transporte", "Entrada", "Guía"],
    notIncluded: ["Almuerzo", "Masajes extra"],
    itinerary: [{ day: "Medio día", title: "Termales", description: "Traslado, ritual de barro y termales." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 20, slug: "palomino-tubing-pasadia",
    name: "Palomino — Tubing (Pasadía)",
    category: "santa-marta", duration: "1 día", durationDays: "1 día",
    priceFromCop: 260000, priceDisplay: "Desde $260.000",
    departureCities: ["Riohacha", "Santa Marta"], defaultOrigin: "Santa Marta",
    hook: "Descenso del río Palomino en flotador. Donde la Sierra Nevada se encuentra con el mar.",
    tags: ["pasadia", "santa-marta", "aventura"],
    heroImage: palomino,
    highlights: [{ icon: "🛶", label: "Tubing río" }, { icon: "🏖️", label: "Playa" }],
    includes: [...baseIncludes, "Tubing", "Almuerzo"],
    notIncluded: ["Bebidas alcohólicas"],
    itinerary: [{ day: "Día 1", title: "Tubing + playa", description: "Caminata, descenso y tarde de playa." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 21, slug: "montes-de-oca",
    name: "Montes de Oca — Cascadas",
    category: "guajira-pasadia", duration: "1 día", durationDays: "1 día",
    priceFromCop: 360000, priceDisplay: "Desde $360.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "La Guajira que pocos conocen: cascadas, selva tropical y piscinas naturales. Mínimo 3 personas.",
    tags: ["pasadia", "la-guajira", "naturaleza", "aventura"],
    heroImage: minca,
    highlights: [{ icon: "💦", label: "Cascadas" }, { icon: "🌳", label: "Selva" }, { icon: "🏊", label: "Piscinas naturales" }],
    includes: [...baseIncludes, "Almuerzo", "Guía local"],
    notIncluded: ["Bebidas extra"],
    itinerary: [{ day: "Día 1", title: "Cascadas Montes de Oca", description: "Trekking corto y cascadas." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 22, slug: "playas-mayapo",
    name: "Playas de Mayapo",
    category: "guajira-pasadia", duration: "1 día", durationDays: "1 día",
    priceFromCop: 190000, priceDisplay: "Desde $190.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Playas vírgenes, almuerzo de mariscos y kitesurf opcional.",
    tags: ["pasadia", "la-guajira", "playa"],
    heroImage: playa,
    highlights: [{ icon: "🏖️", label: "Playas vírgenes" }, { icon: "🏄", label: "Kitesurf opcional" }, { icon: "🦐", label: "Mariscos" }],
    includes: [...baseIncludes, "Almuerzo típico"],
    notIncluded: ["Kitesurf", "Bebidas"],
    itinerary: [{ day: "Día 1", title: "Día en Mayapo", description: "Playa, almuerzo y regreso." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 23, slug: "cabo-vela-pasadia",
    name: "Cabo de la Vela — Pasadía",
    category: "guajira-pasadia", duration: "1 día", durationDays: "1 día",
    priceFromCop: 260000, priceDisplay: "Desde $260.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Cabo en versión express: Pilón, Faro y vuelta el mismo día.",
    tags: ["pasadia", "la-guajira", "aventura"],
    heroImage: caboVelaDay,
    highlights: [{ icon: "🌅", label: "Faro" }, { icon: "🏜️", label: "Pilón de Azúcar" }],
    includes: [...baseIncludes, "Almuerzo"],
    notIncluded: ["Bebidas alcohólicas"],
    itinerary: [{ day: "Día 1", title: "Cabo en 1 día", description: "Salida 5am, recorrido completo y regreso noche." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 24, slug: "rancheria-wayuu",
    name: "Ranchería Wayuu",
    category: "guajira-pasadia", duration: "Medio día", durationDays: "½ día",
    priceFromCop: 190000, priceDisplay: "Desde $190.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Conoce de cerca la cultura wayuu: tejidos, cosmovisión y comida tradicional. Combo desde $60k.",
    tags: ["pasadia", "la-guajira", "cultural"],
    heroImage: mayapo,
    highlights: [{ icon: "🎭", label: "Cultura wayuu" }, { icon: "🧶", label: "Tejido mochila" }, { icon: "🍲", label: "Comida típica" }],
    includes: ["Visita a ranchería", "Charla con palabrero", "Refrigerio"],
    notIncluded: ["Almuerzo (combo +$60k)", "Souvenirs"],
    itinerary: [{ day: "Medio día", title: "Visita ranchería", description: "Bienvenida, taller, conversación y refrigerio." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 25, slug: "city-tour-riohacha",
    name: "City Tour Riohacha",
    category: "guajira-pasadia", duration: "Medio día", durationDays: "½ día",
    priceFromCop: 70000, priceDisplay: "Desde $70.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Malecón, mercado wayuu y los rincones imperdibles de Riohacha.",
    tags: ["pasadia", "la-guajira", "cultural"],
    heroImage: riohacha,
    highlights: [{ icon: "🏖️", label: "Malecón" }, { icon: "🛍️", label: "Mercado wayuu" }, { icon: "🏛️", label: "Centro" }],
    includes: ["Transporte", "Guía"],
    notIncluded: ["Compras", "Comidas"],
    itinerary: [{ day: "Medio día", title: "Riohacha esencial", description: "Tour por la ciudad." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 26, slug: "ruta-vallenata",
    name: "Ruta Vallenata",
    category: "guajira-pasadia", duration: "1 día", durationDays: "1 día",
    priceFromCop: 260000, priceDisplay: "Desde $260.000",
    departureCities: ["Riohacha"], defaultOrigin: "Riohacha",
    hook: "Por la tierra del vallenato: Villanueva, Urumita y la cuna de los grandes compositores. Mínimo 3 PAX.",
    tags: ["pasadia", "la-guajira", "cultural"],
    heroImage: riohacha,
    highlights: [{ icon: "🎵", label: "Música vallenata" }, { icon: "🎶", label: "Casas compositores" }, { icon: "🍴", label: "Almuerzo típico" }],
    includes: [...baseIncludes, "Almuerzo", "Show vallenato"],
    notIncluded: ["Bebidas alcohólicas"],
    itinerary: [{ day: "Día 1", title: "Ruta vallenata", description: "Villanueva, Urumita y casas de los compositores." }],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
  {
    id: 27, slug: "avistamiento-flamingos",
    name: "Avistamiento Flamingos Rosados",
    category: "guajira-pasadia", duration: "1 día", durationDays: "1 día",
    priceFromCop: 230000, priceDisplay: "Desde $230.000",
    departureCities: ["Riohacha", "Palomino (+)", "Santa Marta (+)"], defaultOrigin: "Riohacha",
    hook: "Cientos de flamingos rosados en su santuario natural. Recorrido en bote artesanal con guía local.",
    badge: "Bestseller", tags: ["pasadia", "la-guajira", "naturaleza"],
    heroImage: flamingos, featured: true,
    highlights: [{ icon: "🦩", label: "Flamingos rosados" }, { icon: "🛶", label: "Bote artesanal" }, { icon: "📸", label: "Fotografía" }],
    includes: [...baseIncludes, "Bote", "Guía local"],
    notIncluded: ["Almuerzo", "Bebidas"],
    itinerary: [
      { day: "Día 1", time: "07:00", title: "Salida Riohacha", description: "Traslado al santuario en Camarones." },
      { day: "Día 1", time: "09:00", title: "Avistamiento", description: "Recorrido en bote por la ciénaga." },
      { day: "Día 1", time: "13:00", title: "Regreso", description: "Vuelta a Riohacha." },
    ],
    faq: baseFaq, whatToBring: baseBring, reviews: baseReviews,
  },
];

export const featuredTours = tours.filter((t) => t.featured).slice(0, 6);

export const categories = [
  {
    key: "guajira-aventura" as TourCategory,
    icon: "📍",
    title: "La Guajira — Alta Aventura",
    description: "Cabo de la Vela, Punta Gallinas, Nazaret. El desierto en toda su escala.",
    image: puntaGallinas,
  },
  {
    key: "guajira-pasadia" as TourCategory,
    icon: "☀️",
    title: "Pasadías La Guajira",
    description: "Flamingos, Mayapo, Cabo en 1 día y cultura Wayuu.",
    image: flamingos,
  },
  {
    key: "santa-marta" as TourCategory,
    icon: "🌴",
    title: "Santa Marta & Tayrona",
    description: "Cabo San Juan, Neguanje, velero, Minca.",
    image: tayrona,
  },
  {
    key: "todo-incluido" as TourCategory,
    icon: "✈️",
    title: "Todo Incluido con Vuelos",
    description: "4–5 días desde Bogotá, Medellín y más ciudades.",
    image: todoIncluido,
  },
];
