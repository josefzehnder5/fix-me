import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n, LANGUAGES, type LangCode } from "@/lib/i18n";
import { Check, ChevronDown } from "lucide-react";

interface Props {
  variant?: "footer" | "hero";
}

export function LanguageSwitcher({ variant = "hero" }: Props) {
  const { lang, setLang, t } = useI18n();
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isHero = variant === "hero";

  // Position panel relative to button (portal => no clipping by parents)
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const update = () => {
      const r = btnRef.current!.getBoundingClientRect();
      setCoords({
        top: r.bottom + 8,
        right: Math.max(8, window.innerWidth - r.right),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Outside click + escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handlePick = (code: LangCode) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("footer.language")}
        aria-expanded={open}
        className={
          isHero
            ? "inline-flex items-center gap-1.5 rounded-full bg-white/15 pl-2 pr-2.5 py-1.5 text-white shadow-md ring-1 ring-white/40 backdrop-blur-md transition hover:bg-white/25 active:scale-95"
            : "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 pl-2 pr-2.5 py-1.5 text-white transition hover:border-white/30 active:scale-95"
        }
      >
        <span aria-hidden className="text-xl leading-none">{current.flag}</span>
        <span className="text-xs font-medium uppercase tracking-wider">{current.code}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div
              ref={panelRef}
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }}
              className="w-64 origin-top-right overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl ring-1 ring-black/5"
            >
              <div className="border-b border-black/5 px-4 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-muted-foreground)]">
                  {t("footer.language")}
                </p>
              </div>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {LANGUAGES.map((l) => {
                  const active = l.code === lang;
                  return (
                    <li key={l.code}>
                      <button
                        type="button"
                        onClick={() => handlePick(l.code as LangCode)}
                        role="option"
                        aria-selected={active}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition hover:bg-[color:var(--color-paper-warm)] ${
                          active ? "bg-[color:var(--color-paper-warm)]" : ""
                        }`}
                      >
                        <span className="text-2xl leading-none">{l.flag}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate font-medium text-[color:var(--color-ink)]">{l.name}</span>
                          <span className="block truncate text-[11px] text-[color:var(--color-muted-foreground)]">{l.english}</span>
                        </span>
                        {active && <Check className="h-4 w-4 shrink-0 text-[color:var(--color-terracotta)]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
