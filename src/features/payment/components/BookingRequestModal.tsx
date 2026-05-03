import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import type { Tour } from "@/data/tours";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { calcAmounts, COP, normalizeLang } from "@/features/payment/lib/payment";
import { buildWaLink, bookingRequestMessage } from "@/lib/whatsapp";

interface Props {
  tour: Tour | null;
  origin?: string;
  onClose: () => void;
}

const schema = z.object({
  name: z.string().trim().min(2, "Tu nombre").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(30)
    .regex(/^[+\d\s().-]+$/, "Solo números y +"),
  email: z.string().trim().email("Email inválido").max(255).optional().or(z.literal("")),
  persons: z.coerce.number().int().min(1).max(50),
  date: z.string().trim().max(100).optional().or(z.literal("")),
});

export function BookingRequestModal({ tour, origin, onClose }: Props) {
  const { lang, userName } = useI18n();
  const [name, setName] = useState(userName ?? "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [persons, setPersons] = useState("2");
  const [date, setDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tour) {
      document.body.style.overflow = "hidden";
      setName(userName ?? "");
      setError(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [tour, userName]);

  if (!tour) return null;

  const personsNum = Math.max(1, Number(persons) || 1);
  const { total, percent, deposit } = calcAmounts(tour, personsNum);
  const isEN = lang === "en";

  const t = (es: string, en: string) => (isEN ? en : es);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ name, phone, email, persons, date });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setSubmitting(true);
    try {
      const insertLang = normalizeLang(lang);
      const { data, error: insErr } = await supabase
        .from("booking_requests")
        .insert({
          tour_id: tour.id,
          tour_name: tour.name,
          customer_name: parsed.data.name,
          customer_phone: parsed.data.phone,
          customer_email: parsed.data.email || null,
          persons: parsed.data.persons,
          desired_date: parsed.data.date || null,
          origin: origin ?? tour.defaultOrigin,
          language: insertLang,
          deposit_percent: percent,
          total_price_cop: total,
          deposit_amount_cop: deposit,
        })
        .select("id")
        .single();

      if (insErr || !data) {
        console.error("Booking insert failed", insErr);
        setError(insErr?.message ?? "No se pudo guardar la solicitud");
        setSubmitting(false);
        return;
      }

      const waMsg = bookingRequestMessage({
        tourName: tour.name,
        duration: tour.durationDays,
        pax: parsed.data.persons,
        date: parsed.data.date || undefined,
        origin: origin ?? tour.defaultOrigin,
        depositAmount: deposit,
        depositPercent: percent,
        totalAmount: total,
        name: parsed.data.name,
        requestId: data.id,
      });

      window.open(buildWaLink(waMsg), "_blank", "noopener");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {tour && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-t-3xl bg-[color:var(--color-paper)] p-6 shadow-2xl md:rounded-3xl md:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="small-caps text-[color:var(--color-terracotta)]">
              {t("Solicitud de reserva", "Booking request")}
            </p>
            <h2 className="mt-1 font-display text-2xl leading-tight text-balance">{tour.name}</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--color-ink)]">
                  {t("Nombre completo", "Full name")} *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--color-ink)]">
                  {t("WhatsApp (con código país)", "WhatsApp (with country code)")} *
                </label>
                <input
                  required
                  inputMode="tel"
                  placeholder="+57 300 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[color:var(--color-ink)]">
                    {t("Personas", "Persons")} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[color:var(--color-ink)]">
                    {t("Fecha aprox.", "Approx. date")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("ej. 15 dic", "e.g. Dec 15")}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[color:var(--color-ink)]">
                  {t("Email (opcional)", "Email (optional)")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-white px-3 py-2.5 text-sm focus:border-[color:var(--color-ink)] focus:outline-none"
                />
              </div>

              <div className="rounded-2xl bg-[color:var(--color-paper-warm)] p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[color:var(--color-muted-foreground)]">
                    {t("Total estimado", "Estimated total")}
                  </span>
                  <span className="font-display text-lg text-[color:var(--color-ink)]">
                    {COP(total)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[color:var(--color-muted-foreground)]">
                    {t(`Anticipo (${percent}%)`, `Deposit (${percent}%)`)}
                  </span>
                  <span className="font-display text-lg text-[color:var(--color-terracotta)]">
                    {COP(deposit)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[color:var(--color-muted-foreground)]">
                  {t(
                    "⚠️ La reserva se confirma solo después del pago del anticipo vía Wompi. Te enviaremos el enlace de pago por WhatsApp.",
                    "⚠️ Booking is confirmed only after deposit payment via Wompi. We'll send the payment link via WhatsApp."
                  )}
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
                {t("Enviar solicitud por WhatsApp", "Send request via WhatsApp")}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
