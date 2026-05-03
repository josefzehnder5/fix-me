import { motion } from "framer-motion";

const TESTIMONIALS = [
  { name: "Camila R.", country: "🇲🇽 Ciudad de México", tour: "Punta Gallinas 3 días", quote: "Las dunas de Taroa cayendo al mar es la imagen más impactante que he visto en mi vida. Castle nos cuidó cada detalle, hasta los snacks en el camino." },
  { name: "Lukas B.", country: "🇩🇪 Berlin", tour: "Cabo de la Vela + Flamingos", quote: "Authentic, no tourist filter. The wayuu family welcomed us like their own. The sunset at Cabo is something I'll remember forever." },
  { name: "Sofía L.", country: "🇦🇷 Buenos Aires", tour: "Velero Bahía Concha", quote: "Llegué buscando playa y me llevé cultura, comida, atardeceres y amigos. El velero al sunset fue la cereza del pastel. ¡Volvería mañana!" },
];

export function Testimonials() {
  return (
    <section className="bg-[color:var(--color-paper-warm)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="small-caps text-[color:var(--color-teal)]">Testimonios</p>
          <h2 className="mt-2 font-display text-4xl text-balance md:text-5xl">Lo que dicen nuestros viajeros</h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-3xl bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <span className="text-2xl text-[color:var(--color-gold)]">★★★★★</span>
              <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-balance">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 border-t border-[color:var(--color-border)] pt-4">
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">{t.country} · {t.tour}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
