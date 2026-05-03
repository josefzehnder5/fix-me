import { motion } from "framer-motion";
import { useState } from "react";
import { MessageCircle, Clock, MapPin, Languages } from "lucide-react";
import type { Tour } from "@/data/tours";
import { useI18n } from "@/lib/i18n";
import { useBooking } from "@/features/payment/context/BookingContext";
import { OriginPicker } from "./OriginPicker";

interface Props {
  tour: Tour;
  onOpen: (tour: Tour) => void;
  index?: number;
}

export function TourCard({ tour, onOpen, index = 0 }: Props) {
  const { lang, t } = useI18n();
  const { openBooking } = useBooking();
  const [pickerOpen, setPickerOpen] = useState(false);
  const needsOrigin = tour.tags.includes("con-vuelos");

  const handleBook = () => {
    if (needsOrigin) {
      setPickerOpen(true);
    } else {
      openBooking(tour, tour.defaultOrigin);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-[color:var(--color-card)] shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tour.heroImage}
          alt={tour.name}
          loading="lazy"
          width={1280}
          height={960}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        {tour.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[color:var(--color-gold)] px-3 py-1 text-xs font-medium text-[color:var(--color-gold-foreground)] shadow-sm">
            {tour.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight text-balance">{tour.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[color:var(--color-muted-foreground)]">
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{tour.duration}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tour.departureCities[0]}</span>
        </div>
        <p className="mt-3 line-clamp-3 text-sm text-pretty text-[color:var(--color-muted-foreground)]">{tour.hook}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tour.highlights.slice(0, 4).map((h) => (
            <span
              key={h.label}
              className="inline-flex items-center gap-1 rounded-full bg-[color:var(--color-paper-warm)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--color-ink)]"
            >
              <span>{h.icon}</span> {h.label}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[11px] uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
          Incluye
        </p>
        <ul className="mt-1 space-y-0.5 text-xs text-[color:var(--color-ink)]/80">
          {tour.includes.slice(0, 3).map((inc) => (
            <li key={inc} className="flex items-start gap-1.5">
              <span className="text-[color:var(--color-teal)]">✓</span>
              <span className="line-clamp-1">{inc}</span>
            </li>
          ))}
        </ul>

        {lang !== "es" && (
          <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-[color:var(--color-paper-warm)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
            <Languages className="h-3 w-3" /> {t("common.translatedSoon")}
          </span>
        )}
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-[color:var(--color-muted-foreground)]">{t("common.from")}</p>
            <p className="font-display text-2xl text-[color:var(--color-terracotta)]">${tour.priceFromCop.toLocaleString("es-CO")}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpen(tour)}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-paper)] px-4 py-2.5 text-sm font-medium transition hover:border-[color:var(--color-ink)] hover:bg-white"
          >
            {t("common.moreInfo")}
          </button>
          <button
            onClick={handleBook}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[color:var(--color-whatsapp)] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> {t("common.whatsapp")}
          </button>
        </div>
      </div>

      <OriginPicker
        open={pickerOpen}
        cities={tour.departureCities}
        tourName={tour.name}
        onClose={() => setPickerOpen(false)}
        onConfirm={(c) => {
          setPickerOpen(false);
          openBooking(tour, c);
        }}
      />
    </motion.article>
  );
}
