import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { Check, Sparkles } from "lucide-react";

export function LanguageModal() {
  const { needsModal, lang, setLang, dismissModal, t, modalStep, goToNameStep, setUserName } = useI18n();
  const [name, setName] = useState("");

  const handlePickLang = (code: typeof LANGUAGES[number]["code"]) => {
    setLang(code);
    goToNameStep();
  };

  const handleSubmitName = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.trim()) setUserName(name);
    dismissModal();
  };

  return (
    <AnimatePresence>
      {needsModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl rounded-3xl bg-[color:var(--color-paper)] p-8 shadow-2xl md:p-10"
          >
            <p className="small-caps text-[color:var(--color-terracotta)]">Castle Tours</p>

            <AnimatePresence mode="wait">
              {modalStep === "lang" ? (
                <motion.div
                  key="lang-step"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 id="lang-modal-title" className="mt-2 font-display text-3xl text-balance md:text-4xl">
                    {t("lang.modal.title")}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-[color:var(--color-muted-foreground)] md:text-base">
                    {t("lang.modal.subtitle")}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
                    {LANGUAGES.map((l) => {
                      const isActive = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          onClick={() => handlePickLang(l.code)}
                          className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md ${
                            isActive
                              ? "border-[color:var(--color-ink)] bg-white shadow-md"
                              : "border-[color:var(--color-border)] bg-white/60 hover:border-[color:var(--color-ink)]/40 hover:bg-white"
                          }`}
                          aria-pressed={isActive}
                        >
                          <span className="text-3xl leading-none">{l.flag}</span>
                          <span className="font-display text-base leading-tight">{l.name}</span>
                          <span className="text-[11px] text-[color:var(--color-muted-foreground)]">{l.english}</span>
                          {isActive && (
                            <span className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-ink)] text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-6 text-xs text-[color:var(--color-muted-foreground)]">{t("lang.modal.note")}</p>
                </motion.div>
              ) : (
                <motion.form
                  key="name-step"
                  onSubmit={handleSubmitName}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-paper-warm)] px-3 py-1 text-xs text-[color:var(--color-terracotta)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {LANGUAGES.find((l) => l.code === lang)?.flag} {LANGUAGES.find((l) => l.code === lang)?.name}
                  </div>
                  <h2 className="mt-3 font-display text-3xl text-balance md:text-4xl">
                    {t("name.modal.title")}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-[color:var(--color-muted-foreground)] md:text-base">
                    {t("name.modal.subtitle")}
                  </p>

                  <div className="mt-8">
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("name.modal.placeholder")}
                      className="w-full rounded-2xl border border-[color:var(--color-border)] bg-white px-5 py-4 font-display text-2xl text-[color:var(--color-ink)] outline-none transition focus:border-[color:var(--color-terracotta)] focus:ring-2 focus:ring-[color:var(--color-terracotta)]/20"
                    />
                  </div>

                  <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={dismissModal}
                      className="rounded-full px-5 py-2.5 text-sm text-[color:var(--color-muted-foreground)] underline-offset-4 hover:underline"
                    >
                      {t("name.modal.skip")}
                    </button>
                    <button
                      type="submit"
                      disabled={!name.trim()}
                      className="rounded-full bg-[color:var(--color-terracotta)] px-7 py-3 text-sm font-medium text-[color:var(--color-terracotta-foreground)] shadow-[var(--shadow-lift)] transition hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {t("name.modal.continue")}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
