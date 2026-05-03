import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tours, type Tour } from "@/data/tours";
import { buildWaLink, quizMessage } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n";
import { MessageCircle, Sparkles } from "lucide-react";
import { OriginPicker } from "./OriginPicker";

const STEPS = [
  {
    key: "days",
    title: "¿Cuántos días tienes?",
    options: [
      { label: "Solo un día (Pasadía)", value: "pasadia" },
      { label: "2–3 días", value: "2-3" },
      { label: "4–5 días con todo incluido", value: "4-5" },
      { label: "Todavía no sé", value: "any" },
    ],
  },
  {
    key: "interest",
    title: "¿Qué te emociona más?",
    options: [
      { label: "🦩 Flamingos rosados", value: "flamingos" },
      { label: "🏜️ Desierto y Cabo de la Vela", value: "desert" },
      { label: "🌊 Playas paradisíacas", value: "beach" },
      { label: "🛶 Aventura y naturaleza", value: "adventure" },
      { label: "🎭 Cultura Wayuu", value: "culture" },
      { label: "☕ Café y gastronomía", value: "food" },
      { label: "🌅 Algo romántico", value: "romantic" },
    ],
  },
  {
    key: "pax",
    title: "¿Cuántos viajan?",
    options: [
      { label: "Solo yo", value: "1" },
      { label: "2 personas", value: "2" },
      { label: "3–4 personas", value: "3-4" },
      { label: "5+ personas / grupo", value: "5+" },
    ],
  },
] as const;

function recommend(answers: Record<string, string>): Tour[] {
  const { days, interest } = answers;
  let pool = [...tours];

  if (days === "pasadia") pool = pool.filter((t) => t.tags.includes("pasadia"));
  else if (days === "2-3") pool = pool.filter((t) => t.tags.includes("2-3-dias"));
  else if (days === "4-5") pool = pool.filter((t) => t.tags.includes("4-5-dias") || t.tags.includes("con-vuelos"));

  const interestMap: Record<string, (t: Tour) => boolean> = {
    flamingos: (t) => /flaming/i.test(t.name) || t.highlights.some((h) => /flaming/i.test(h.label)),
    desert: (t) => t.tags.includes("la-guajira") && t.tags.includes("aventura"),
    beach: (t) => t.tags.includes("playa"),
    adventure: (t) => t.tags.includes("aventura"),
    culture: (t) => t.tags.includes("cultural"),
    food: (t) => t.tags.includes("gastronomia"),
    romantic: (t) => t.tags.includes("romantico"),
  };

  if (interest && interestMap[interest]) {
    const filtered = pool.filter(interestMap[interest]);
    if (filtered.length) pool = filtered;
  }

  return pool.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)).slice(0, 3);
}

const paxLabel = (p: string) =>
  p === "1" ? "1 persona" : p === "2" ? "2 personas" : p === "3-4" ? "3–4 personas" : "5+ personas";

const daysLabel = (d: string) =>
  d === "pasadia" ? "1 día" : d === "2-3" ? "2–3 días" : d === "4-5" ? "4–5 días" : "Por definir";

interface QuickFinderProps {
  onOpen?: (tour: Tour) => void;
}

export function QuickFinder({ onOpen }: QuickFinderProps = {}) {
  const { userName } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState<Tour[] | null>(null);
  const [pickerTour, setPickerTour] = useState<Tour | null>(null);

  const handlePick = (key: string, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setMatching(true);
      setTimeout(() => {
        setResults(recommend(next));
        setMatching(false);
      }, 1500);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <section id="quick-finder" className="relative bg-[color:var(--color-paper-warm)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="small-caps text-[color:var(--color-terracotta)]">Quick finder</p>
          <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">Encuentra tu tour ideal</h2>
          <p className="mt-4 text-pretty text-base text-[color:var(--color-muted-foreground)] md:text-lg">
            3 toques. Sin escribir nada. Te conectamos con un asesor por WhatsApp.
          </p>
        </div>

        <div className="mt-12 rounded-3xl bg-[color:var(--color-card)] p-6 shadow-[var(--shadow-card)] md:p-10">
          {!results && !matching && (
            <>
              {/* progress */}
              <div className="mb-8 flex items-center justify-center gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === step ? "w-10 bg-[color:var(--color-terracotta)]" : i < step ? "w-6 bg-[color:var(--color-teal)]" : "w-6 bg-[color:var(--color-border)]"}`}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-[color:var(--color-muted-foreground)]">Paso {step + 1} de {STEPS.length}</p>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="mt-6 text-center font-display text-2xl md:text-3xl">{STEPS[step].title}</h3>
                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    {STEPS[step].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handlePick(STEPS[step].key, opt.value)}
                        className="group rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)] px-5 py-5 text-left text-base font-medium transition hover:-translate-y-0.5 hover:border-[color:var(--color-terracotta)] hover:bg-white hover:shadow-[var(--shadow-soft)]"
                      >
                        <span className="block">{opt.label}</span>
                        <span className="mt-1 inline-block text-sm text-[color:var(--color-muted-foreground)] opacity-0 transition group-hover:opacity-100">Tocar para continuar →</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
              {step > 0 && (
                <div className="mt-6 text-center">
                  <button onClick={() => setStep(step - 1)} className="text-sm text-[color:var(--color-muted-foreground)] underline-offset-4 hover:underline">
                    ← Atrás
                  </button>
                </div>
              )}
            </>
          )}

          {matching && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-12 w-12 text-[color:var(--color-terracotta)]" />
              </motion.div>
              <p className="mt-6 font-display text-xl">Buscando tu match perfecto…</p>
            </div>
          )}

          {results && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-center font-display text-2xl md:text-3xl">Tus tours recomendados</h3>
              <p className="mt-2 text-center text-sm text-[color:var(--color-muted-foreground)]">
                Toca para reservar por WhatsApp. Respuesta en menos de 5 min.
              </p>
              <div className="mt-8 space-y-4">
                {results.map((t) => (
                  <div key={t.id} className="flex flex-col gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-paper)] p-4 sm:flex-row sm:items-center">
                    <img src={t.heroImage} alt="" loading="lazy" className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-32" />
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight">{t.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{t.duration} · {t.priceDisplay}</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      {onOpen && (
                        <button
                          onClick={() => onOpen(t)}
                          className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm font-medium transition hover:border-[color:var(--color-ink)]"
                        >
                          Más info
                        </button>
                      )}
                      {t.tags.includes("con-vuelos") ? (
                        <button
                          onClick={() => setPickerTour(t)}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                        >
                          <MessageCircle className="h-4 w-4" /> Reservar por WhatsApp
                        </button>
                      ) : (
                        <a
                          href={buildWaLink(quizMessage({ tourName: t.name, days: daysLabel(answers.days), pax: paxLabel(answers.pax), origin: t.defaultOrigin, name: userName }))}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                        >
                          <MessageCircle className="h-4 w-4" /> Reservar por WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button onClick={reset} className="text-sm text-[color:var(--color-muted-foreground)] underline-offset-4 hover:underline">Empezar de nuevo</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <OriginPicker
        open={!!pickerTour}
        cities={pickerTour?.departureCities ?? []}
        tourName={pickerTour?.name ?? ""}
        onClose={() => setPickerTour(null)}
        onConfirm={(c) => {
          if (!pickerTour) return;
          window.open(
            buildWaLink(quizMessage({ tourName: pickerTour.name, days: daysLabel(answers.days), pax: paxLabel(answers.pax), origin: c, name: userName })),
            "_blank",
            "noopener"
          );
          setPickerTour(null);
        }}
      />
    </section>
  );
}
