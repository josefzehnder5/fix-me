import { useMemo, useState, forwardRef } from "react";
import { tours, type Tour, type TourTag, type TourCategory } from "@/data/tours";
import { TourCard } from "./TourCard";

const FILTER_GROUPS: { label: string; tags: { label: string; tag: TourTag }[] }[] = [
  {
    label: "Duración",
    tags: [
      { label: "Pasadía", tag: "pasadia" },
      { label: "2–3 días", tag: "2-3-dias" },
      { label: "4–5 días", tag: "4-5-dias" },
      { label: "Con vuelos", tag: "con-vuelos" },
    ],
  },
  {
    label: "Destino",
    tags: [
      { label: "La Guajira", tag: "la-guajira" },
      { label: "Santa Marta", tag: "santa-marta" },
      { label: "Tayrona", tag: "tayrona" },
      { label: "Minca", tag: "minca" },
    ],
  },
  {
    label: "Estilo",
    tags: [
      { label: "Cultural", tag: "cultural" },
      { label: "Aventura", tag: "aventura" },
      { label: "Playa", tag: "playa" },
      { label: "Romántico", tag: "romantico" },
    ],
  },
];

const CAT_TO_TAGS: Partial<Record<TourCategory, TourTag[]>> = {
  "guajira-aventura": ["la-guajira", "aventura"],
  "guajira-pasadia": ["la-guajira", "pasadia"],
  "santa-marta": ["santa-marta"],
  "todo-incluido": ["con-vuelos"],
};

interface Props { onOpen: (t: Tour) => void; presetCategory?: TourCategory | null; }

type Sort = "recommended" | "price-asc" | "price-desc" | "duration";

export const TourGrid = forwardRef<HTMLDivElement, Props>(function TourGrid({ onOpen, presetCategory }, ref) {
  const [active, setActive] = useState<Set<TourTag>>(new Set());
  const [sort, setSort] = useState<Sort>("recommended");

  // Apply preset
  useMemo(() => {
    if (presetCategory) {
      const t = CAT_TO_TAGS[presetCategory];
      if (t) setActive(new Set(t));
    }
  }, [presetCategory]);

  const toggle = (tag: TourTag) =>
    setActive((s) => {
      const n = new Set(s);
      n.has(tag) ? n.delete(tag) : n.add(tag);
      return n;
    });

  const filtered = useMemo(() => {
    let list = tours.filter((t) => {
      if (active.size === 0) return true;
      // Group AND across groups, OR within
      return FILTER_GROUPS.every((g) => {
        const groupActive = g.tags.filter((x) => active.has(x.tag));
        if (groupActive.length === 0) return true;
        return groupActive.some((x) => t.tags.includes(x.tag));
      });
    });
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.priceFromCop - b.priceFromCop); break;
      case "price-desc": list = [...list].sort((a, b) => b.priceFromCop - a.priceFromCop); break;
      case "duration": list = [...list].sort((a, b) => a.priceFromCop - b.priceFromCop); break;
    }
    return list;
  }, [active, sort]);

  return (
    <section ref={ref} id="tours" className="bg-[color:var(--color-paper-warm)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="small-caps text-[color:var(--color-teal)]">Catálogo completo</p>
            <h2 className="mt-2 font-display text-4xl text-balance md:text-5xl">Todos los tours</h2>
          </div>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">{filtered.length} de {tours.length} tours</p>
        </div>

        {/* Filters */}
        <div className="mt-10 space-y-4">
          {FILTER_GROUPS.map((g) => (
            <div key={g.label} className="flex flex-wrap items-center gap-2">
              <span className="small-caps text-[color:var(--color-muted-foreground)] mr-2">{g.label}</span>
              {g.tags.map((x) => {
                const isActive = active.has(x.tag);
                return (
                  <button
                    key={x.tag}
                    onClick={() => toggle(x.tag)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-[color:var(--color-ink)] text-white"
                        : "bg-white text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper)]"
                    }`}
                  >
                    {x.label}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {active.size > 0 && (
              <button onClick={() => setActive(new Set())} className="text-sm text-[color:var(--color-muted-foreground)] underline-offset-4 hover:underline">
                Limpiar filtros
              </button>
            )}
            <div className="ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none"
              >
                <option value="recommended">Recomendados</option>
                <option value="price-asc">Precio ↑</option>
                <option value="price-desc">Precio ↓</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => <TourCard key={t.id} tour={t} onOpen={onOpen} index={i} />)}
        </div>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-[color:var(--color-muted-foreground)]">No hay tours con esos filtros. Prueba a quitar alguno.</p>
        )}
      </div>
    </section>
  );
});
