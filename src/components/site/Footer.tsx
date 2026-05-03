import { WHATSAPP_DISPLAY, buildWaLink, genericMessage } from "@/lib/whatsapp";
import { MessageCircle, Mail, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/castle-tours-logo.png";
import { useT, useI18n } from "@/lib/i18n";

export function Footer() {
  const t = useT();
  const { userName } = useI18n();
  return (
    <footer className="bg-[color:var(--color-ink)] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src={logo} alt="Castle Tours" className="h-14 w-auto" />
            <p className="mt-3 text-sm text-white/70">{t("footer.tagline")}</p>
            <p className="mt-6 max-w-sm text-sm text-pretty text-white/70">
              {t("footer.about")}
            </p>
          </div>
          <div>
            <p className="small-caps text-[color:var(--color-gold)]">{t("footer.contact")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href={buildWaLink(genericMessage(userName))} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-[color:var(--color-gold)]">
                  <MessageCircle className="h-4 w-4" /> {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a href="mailto:info@castletours.com.co" className="inline-flex items-center gap-2 hover:text-[color:var(--color-gold)]">
                  <Mail className="h-4 w-4" /> info@castletours.com.co
                </a>
              </li>
              <li className="text-white/60">NIT: 901296332-9</li>
            </ul>
          </div>
          <div>
            <p className="small-caps text-[color:var(--color-gold)]">{t("footer.payment")}</p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>Bancolombia</li>
              <li>Davivienda</li>
              <li>Tarjeta de crédito</li>
              <li>Efectivo / transferencia</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Castle Tours · {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <Link to="/admin/payments" className="inline-flex items-center gap-1 hover:text-[color:var(--color-gold)]">
              <Lock className="h-3 w-3" /> Admin
            </Link>
            <p>Made by Josef Ignaz Zehnder 🇨🇭</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
