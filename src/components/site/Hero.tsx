import { motion } from "framer-motion";
import heroImg from "@/assets/photo-cabo-atardecer.jpg";
import logo from "@/assets/castle-tours-logo.png";
import { buildWaLink, genericMessage } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";
import { useT, useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Hero() {
  const t = useT();
  const { userName } = useI18n();
  void userName;
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Cabo de la Vela al atardecer en La Guajira, Colombia"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="grain absolute inset-0" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-12 md:pt-8">
        <div className="flex items-center gap-3 text-white">
          <img src={logo} alt="Castle Tours" className="h-11 w-auto drop-shadow-lg md:h-14" />
          <span className="hidden h-5 w-px bg-white/40 md:block" />
          <span className="hidden small-caps text-white/80 md:inline">desde 2018</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher variant="hero" />
          <a
            href={buildWaLink(genericMessage(userName))}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md ring-1 ring-white/30 transition hover:bg-white/20 md:inline-flex"
          >
            <MessageCircle className="h-4 w-4" /> +57 315 624 1569
          </a>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-80px)] max-w-6xl flex-col justify-end px-6 pb-20 md:pb-28 md:px-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="small-caps text-[color:var(--color-gold)] mb-4"
        >
          {t("hero.eyebrow")}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-balance text-5xl leading-[0.95] text-white md:text-7xl lg:text-[5.5rem]"
        >
          {t("hero.title.a")} <em className="italic">{t("hero.title.b")}</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 max-w-xl text-pretty text-lg text-white/90 md:text-xl"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#quick-finder"
            className="group inline-flex items-center justify-center rounded-full bg-[color:var(--color-terracotta)] px-7 py-4 text-base font-medium text-[color:var(--color-terracotta-foreground)] shadow-[var(--shadow-lift)] transition hover:scale-[1.02] hover:brightness-110"
          >
            {t("hero.cta.find")}
            <span className="ml-2 transition group-hover:translate-x-1">→</span>
          </a>
          <a
            href={buildWaLink(genericMessage(userName))}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] px-7 py-4 text-base font-medium text-[color:var(--color-whatsapp-foreground)] shadow-[var(--shadow-lift)] transition hover:scale-[1.02] hover:brightness-110"
          >
            <MessageCircle className="h-5 w-5" /> {t("hero.cta.whatsapp")}
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap gap-2 text-sm text-white/85"
        >
          {[t("hero.proof.travelers"), t("hero.proof.local"), t("hero.proof.reply")].map((p) => (
            <span key={p} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <span className="text-[color:var(--color-gold)]">✓</span> {p}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
