import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, MessageCircle, Check, Clock, MapPin } from "lucide-react";
import type { Tour } from "@/data/tours";
import { buildWaLink, doubtsMessage } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n";
import { useBooking } from "@/features/payment/context/BookingContext";
import { OriginPicker } from "./OriginPicker";

interface Props { tour: Tour | null; onClose: () => void; }

const SECTIONS = [
  { key: "itinerario", icon: "📅", title: "Itinerario día por día" },
  { key: "incluye", icon: "✅", title: "Qué incluye / no incluye" },
  { key: "menu", icon: "🍽️", title: "Menú y opciones gastronómicas" },
  { key: "precios", icon: "💰", title: "Precios y opciones de alojamiento" },
  { key: "faq", icon: "❓", title: "Preguntas frecuentes" },
  { key: "llevar", icon: "🎒", title: "Qué llevar" },
] as const;

export function TourModal({ tour, onClose }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const { userName } = useI18n();
  const { openBooking } = useBooking();
  const needsOrigin = !!tour && tour.tags.includes("con-vuelos");

  const handleBook = () => {
    if (!tour) return;
    if (needsOrigin) setPickerOpen(true);
    else {
      openBooking(tour, tour.defaultOrigin);
      onClose();
    }
  };

  useEffect(() => {
    if (tour) {
      document.body.style.overflow = "hidden";
      setOpen(new Set());
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [tour]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggle = (k: string) => {
    setOpen((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  return (
    <AnimatePresence>
      {tour && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-x-0 bottom-0 top-0 mx-auto max-w-[1100px] overflow-hidden bg-[color:var(--color-paper)] md:inset-4 md:top-[5vh] md:bottom-[5vh] md:rounded-3xl md:shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid h-full md:grid-cols-[40%_60%]">
              {/* Image column */}
              <div className="relative h-72 md:h-full">
                <img src={tour.heroImage} alt={tour.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-transparent" />
                {tour.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-[color:var(--color-gold)] px-3 py-1 text-xs font-medium text-[color:var(--color-gold-foreground)]">
                    {tour.badge}
                  </span>
                )}
              </div>

              {/* Content column */}
              <div className="relative flex h-full flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 pb-32 pt-8 md:px-8 md:pt-10">
                  <p className="small-caps text-[color:var(--color-terracotta)]">{tour.duration}</p>
                  <h2 className="mt-2 font-display text-3xl leading-tight text-balance md:text-4xl">{tour.name}</h2>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[color:var(--color-muted-foreground)]">
                    <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{tour.duration}</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{tour.departureCities.join(", ")}</span>
                  </div>

                  <p className="mt-4 text-base text-pretty leading-relaxed text-[color:var(--color-muted-foreground)]">{tour.hook}</p>

                  <div className="mt-5 inline-flex items-baseline gap-2">
                    <span className="text-xs text-[color:var(--color-muted-foreground)]">Desde</span>
                    <span className="font-display text-3xl text-[color:var(--color-terracotta)]">${tour.priceFromCop.toLocaleString("es-CO")}</span>
                    <span className="text-xs text-[color:var(--color-muted-foreground)]">COP / persona</span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs">
                    {["Transporte", "Almuerzo", "Guía", "Asistencia"].map((b) => (
                      <span key={b} className="rounded-full bg-[color:var(--color-paper-warm)] px-3 py-1.5 text-[color:var(--color-ink)]">{b}</span>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tour.highlights.map((h) => (
                      <div key={h.label} className="rounded-2xl border border-[color:var(--color-border)] bg-white p-3 text-center">
                        <div className="text-2xl">{h.icon}</div>
                        <p className="mt-1 text-xs font-medium leading-tight">{h.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Accordions */}
                  <div className="mt-8 space-y-2">
                    {SECTIONS.map((s) => {
                      const isOpen = open.has(s.key);
                      // Skip menu / precios if data missing
                      if (s.key === "menu" && !tour.menu) return null;
                      if (s.key === "precios" && !tour.priceTable) return null;

                      return (
                        <div key={s.key} className={`overflow-hidden rounded-2xl border border-[color:var(--color-border)] transition ${isOpen ? "bg-white" : "bg-[color:var(--color-paper-warm)]/40"}`}>
                          <button
                            onClick={() => toggle(s.key)}
                            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                          >
                            <span className="flex items-center gap-3 font-medium">
                              <span className="text-lg">{s.icon}</span>{s.title}
                            </span>
                            <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              >
                                <div className="px-4 pb-5 pt-1 text-sm">
                                  <SectionContent section={s.key} tour={tour} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Doubts banner */}
                  <div className="mt-8 rounded-3xl bg-[color:var(--color-paper-warm)] p-6 text-center">
                    <p className="font-display text-xl text-balance">¿Sigues con dudas sobre este tour?</p>
                    <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">Un asesor humano te responde en menos de 5 minutos.</p>
                    <a
                      href={buildWaLink(doubtsMessage(tour.name, userName))}
                      target="_blank"
                      rel="noopener"
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                    >
                      <MessageCircle className="h-4 w-4" /> Pregunta por WhatsApp
                    </a>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="absolute inset-x-0 bottom-0 border-t border-[color:var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur md:px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted-foreground)]">Desde</p>
                      <p className="font-display text-xl text-[color:var(--color-terracotta)] leading-none">${tour.priceFromCop.toLocaleString("es-CO")}</p>
                    </div>
                    <button
                      onClick={handleBook}
                      className="ml-auto inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                    >
                      <MessageCircle className="h-5 w-5" /> Reservar por WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          <OriginPicker
            open={pickerOpen}
            cities={tour.departureCities}
            tourName={tour.name}
            onClose={() => setPickerOpen(false)}
            onConfirm={(c) => {
              setPickerOpen(false);
              openBooking(tour, c);
              onClose();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionContent({ section, tour }: { section: string; tour: Tour }) {
  switch (section) {
    case "itinerario":
      return (
        <ol className="space-y-4">
          {tour.itinerary.map((it, i) => (
            <li key={i} className="relative flex gap-4 pl-2">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-terracotta)] text-xs font-medium text-white">{i + 1}</span>
                {i < tour.itinerary.length - 1 && <span className="mt-1 w-px flex-1 bg-[color:var(--color-border)]" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium">{it.day}</span>
                  {it.time && <span className="rounded-full bg-[color:var(--color-paper-warm)] px-2 py-0.5 text-xs text-[color:var(--color-ink)]">{it.time}</span>}
                </div>
                <p className="mt-1 font-display text-base">{it.title}</p>
                <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{it.description}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "incluye":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-teal)]">Incluye</p>
            <ul className="space-y-1.5">
              {tour.includes.map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-teal)]" /> {x}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">No incluye</p>
            <ul className="space-y-1.5">
              {tour.notIncluded.map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm text-[color:var(--color-muted-foreground)]"><X className="mt-0.5 h-4 w-4 shrink-0" /> {x}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    case "menu":
      if (!tour.menu) return null;
      return (
        <>
          <div className="flex flex-wrap gap-2">
            {tour.menu.options.map((o) => (
              <span key={o} className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1.5 text-sm">{o}</span>
            ))}
          </div>
          {tour.menu.note && (
            <p className="mt-3 rounded-xl bg-[color:var(--color-paper-warm)] p-3 text-xs text-[color:var(--color-muted-foreground)]">💡 {tour.menu.note}</p>
          )}
        </>
      );
    case "precios":
      if (!tour.priceTable) return null;
      const cols = tour.priceTable.columns;
      return (
        <>
          <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[color:var(--color-paper-warm)]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">PAX</th>
                  {cols.includes("chinchorro") && <th className="px-3 py-2 text-left font-medium">Chinchorro</th>}
                  {cols.includes("cama") && <th className="px-3 py-2 text-left font-medium">Cama</th>}
                  {cols.includes("cama-ac") && <th className="px-3 py-2 text-left font-medium">Cama + A/C</th>}
                </tr>
              </thead>
              <tbody>
                {tour.priceTable.rows.map((r, i) => (
                  <tr key={i} className="border-t border-[color:var(--color-border)]">
                    <td className="px-3 py-2 font-medium">{r.pax}</td>
                    {cols.includes("chinchorro") && <td className="px-3 py-2">{r.chinchorro ?? "—"}</td>}
                    {cols.includes("cama") && <td className="px-3 py-2">{r.cama ?? "—"}</td>}
                    {cols.includes("cama-ac") && <td className="px-3 py-2">{r.camaAc ?? "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tour.priceTable.note && (
            <p className="mt-3 rounded-xl bg-[color:var(--color-paper-warm)] p-3 text-xs text-[color:var(--color-muted-foreground)]">💡 {tour.priceTable.note}</p>
          )}
        </>
      );
    case "faq":
      return (
        <div className="space-y-2">
          {tour.faq.map((f, i) => (
            <details key={i} className="group rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                <span className="flex items-center justify-between gap-2">
                  {f.q}
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </span>
              </summary>
              <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">{f.a}</p>
            </details>
          ))}
        </div>
      );
    case "llevar":
      return (
        <ul className="grid grid-cols-2 gap-2">
          {tour.whatToBring.map((b) => (
            <li key={b.label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
              <span className="text-lg">{b.icon}</span> {b.label}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
