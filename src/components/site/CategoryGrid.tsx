import { motion } from "framer-motion";
import { categories, type TourCategory } from "@/data/tours";

interface Props { onPick: (cat: TourCategory) => void; }

export function CategoryGrid({ onPick }: Props) {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="small-caps text-[color:var(--color-teal)]">Estilos de viaje</p>
            <h2 className="mt-2 font-display text-4xl text-balance md:text-5xl">Explora por estilo</h2>
          </div>
          <p className="max-w-md text-[color:var(--color-muted-foreground)]">
            Cuatro mundos distintos en el mismo viaje. Toca uno para ver tours filtrados.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <motion.button
              key={c.key}
              onClick={() => onPick(c.key)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative h-80 overflow-hidden rounded-3xl text-left shadow-[var(--shadow-card)]"
            >
              <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-6 text-white">
                <span className="text-3xl">{c.icon}</span>
                <h3 className="mt-3 font-display text-2xl leading-tight">{c.title}</h3>
                <p className="mt-2 text-sm text-white/85">{c.description}</p>
                <span className="mt-4 inline-flex w-fit items-center gap-1 text-sm text-[color:var(--color-gold)]">
                  Ver tours <span className="transition group-hover:translate-x-1">→</span>
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
