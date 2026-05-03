import type { Tour } from "@/data/tours";

/**
 * Returns the deposit percentage for a tour.
 * - 40% if the tour is "All-Inclusive" (todo-incluido)
 * - 15% otherwise
 */
export function getDepositPercent(tour: Tour): number {
  if (tour.category === "todo-incluido") return 40;
  return 15;
}

export function calcAmounts(tour: Tour, persons: number) {
  const total = tour.priceFromCop * persons;
  const percent = getDepositPercent(tour);
  const deposit = Math.round((total * percent) / 100);
  return { total, percent, deposit };
}

export const COP = (n: number) => `$${n.toLocaleString("es-CO")} COP`;

export type SupportedLang = "es" | "en";

export function normalizeLang(lang: string): SupportedLang {
  return lang === "en" ? "en" : "es"; // default Spanish for non-supported customer-message langs
}

/** Build the post-payment confirmation WhatsApp message (admin sends manually after webhook). */
export function buildConfirmationMessage(opts: {
  lang: SupportedLang;
  tourName: string;
  date?: string | null;
  transactionId: string;
  customerName: string;
}) {
  if (opts.lang === "en") {
    return `✅ Hi ${opts.customerName}! Castle Tours here.

Payment received. Your tour *${opts.tourName}*${opts.date ? ` on ${opts.date}` : ""} is now *guaranteed*.

Booking ref: ${opts.transactionId}

Thank you for booking with Castle Tours. We'll be in touch shortly with the final details.`;
  }
  return `✅ ¡Hola ${opts.customerName}! Castle Tours aquí.

Pago recibido. Tu tour *${opts.tourName}*${opts.date ? ` del ${opts.date}` : ""} ahora está *garantizado*.

Número de reserva: ${opts.transactionId}

Gracias por reservar con Castle Tours. Te contactamos pronto con los detalles finales.`;
}

/** Build the WhatsApp message that delivers the Wompi payment link to the customer. */
export function buildPaymentLinkMessage(opts: {
  lang: SupportedLang;
  tourName: string;
  persons: number;
  date?: string | null;
  depositAmount: number;
  depositPercent: number;
  totalAmount: number;
  paymentUrl: string;
}) {
  if (opts.lang === "en") {
    return `Hi! Castle Tours here 👋

Here's your secure payment link to confirm your booking:

🎯 Tour: *${opts.tourName}*
👥 Persons: ${opts.persons}
${opts.date ? `📅 Date: ${opts.date}\n` : ""}💰 Total: ${COP(opts.totalAmount)}
💳 Deposit (${opts.depositPercent}%): ${COP(opts.depositAmount)}

🔗 Pay securely with Wompi:
${opts.paymentUrl}

⚠️ Your booking will be confirmed automatically once payment is received.`;
  }
  return `¡Hola! Castle Tours aquí 👋

Aquí tienes tu enlace seguro de pago para confirmar tu reserva:

🎯 Tour: *${opts.tourName}*
👥 Personas: ${opts.persons}
${opts.date ? `📅 Fecha: ${opts.date}\n` : ""}💰 Total: ${COP(opts.totalAmount)}
💳 Anticipo (${opts.depositPercent}%): ${COP(opts.depositAmount)}

🔗 Paga seguro con Wompi:
${opts.paymentUrl}

⚠️ Tu reserva se confirma automáticamente al recibir el pago.`;
}
