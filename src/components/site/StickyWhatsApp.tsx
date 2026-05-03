import { MessageCircle } from "lucide-react";
import { buildWaLink, genericMessage } from "@/lib/whatsapp";
import { useI18n } from "@/lib/i18n";

export function StickyWhatsApp() {
  const { userName } = useI18n();
  return (
    <a
      href={buildWaLink(genericMessage(userName))}
      target="_blank"
      rel="noopener"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-whatsapp)] text-white shadow-2xl animate-[pulse-soft_2.4s_ease-in-out_infinite] md:bottom-6 md:right-6 md:h-16 md:w-16"
    >
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
    </a>
  );
}
