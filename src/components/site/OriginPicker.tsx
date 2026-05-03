import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plane, X, MessageCircle, Check } from "lucide-react";

interface Props {
  open: boolean;
  cities: string[];
  tourName: string;
  onClose: () => void;
  onConfirm: (city: string) => void;
}

export function OriginPicker({ open, cities, tourName, onClose, onConfirm }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    if (open) setPicked(cities[0] ?? null);
  }, [open, cities]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[150] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-[color:var(--color-paper)] p-6 shadow-2xl md:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-[color:var(--color-paper-warm)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-paper-warm)] px-3 py-1 text-xs text-[color:var(--color-terracotta)]">
              <Plane className="h-3.5 w-3.5" /> Vuelos incluidos
            </div>
            <h3 className="mt-3 font-display text-2xl text-balance md:text-3xl">¿Desde qué ciudad vuelas?</h3>
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              Para <span className="font-medium text-[color:var(--color-ink)]">{tourName}</span>. Elige tu ciudad de salida y continuamos por WhatsApp.
            </p>

            <div className="mt-6 grid max-h-[40vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {cities.map((c) => {
                const active = c === picked;
                return (
                  <button
                    key={c}
                    onClick={() => setPicked(c)}
                    className={`relative rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "border-[color:var(--color-terracotta)] bg-white text-[color:var(--color-ink)] shadow-sm"
                        : "border-[color:var(--color-border)] bg-white/60 hover:border-[color:var(--color-ink)]/40 hover:bg-white"
                    }`}
                  >
                    {c}
                    {active && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => picked && onConfirm(picked)}
              disabled={!picked}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MessageCircle className="h-5 w-5" /> Continuar por WhatsApp
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
