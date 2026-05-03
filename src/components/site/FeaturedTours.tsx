import { motion } from "framer-motion";
import type { Tour } from "@/data/tours";
import { TourCard } from "./TourCard";

interface Props { tours: Tour[]; onOpen: (t: Tour) => void; }

export function FeaturedTours({ tours, onOpen }: Props) {
  return (
    <section className="bg-[color:var(--color-paper)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="small-caps text-[color:var(--color-terracotta)]">Nuestros bestsellers</p>
            <h2 className="mt-2 font-display text-4xl text-balance md:text-5xl">Tours destacados</h2>
          </div>
          <p className="max-w-md text-[color:var(--color-muted-foreground)]">
            Los favoritos de nuestros viajeros. Más de 500 reseñas combinadas.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((t, i) => (
            <TourCard key={t.id} tour={t} onOpen={onOpen} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
