export const WHATSAPP_PHONE = "573156241569";
export const WHATSAPP_DISPLAY = "+57 315 624 1569";

export function buildWaLink(message: string) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Build a wa.me link to a specific customer phone (digits only). */
export function buildWaLinkToCustomer(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function greeting(name?: string) {
  return name && name.trim()
    ? `¡Hola Castle Tours! 👋 Soy *${name.trim()}*.`
    : `¡Hola Castle Tours! 👋`;
}

const PAYMENT_NOTICE = `⚠️ IMPORTANTE: La reserva se confirma solo después del pago. Por favor envíame el enlace de pago Wompi.`;

export function genericMessage(name?: string) {
  return `${greeting(name)} Vi su web y me gustaría info sobre los tours disponibles.`;
}

export function tourInquiryMessage(opts: {
  tourName: string;
  duration?: string;
  pax?: string;
  origin?: string;
  priceCop?: number;
  name?: string;
}) {
  const price = opts.priceCop
    ? `\n💰 Precio referencia: $${opts.priceCop.toLocaleString("es-CO")} COP por persona`
    : "";
  return `${greeting(opts.name)}
Estoy interesado en reservar:

🎯 Tour: *${opts.tourName}*
📅 Duración: ${opts.duration ?? "(por confirmar)"}
👥 Personas: ${opts.pax ?? "(por confirmar)"}
📍 Salida desde: ${opts.origin ?? "(por confirmar)"}${price}

${PAYMENT_NOTICE}

¡Gracias!`;
}

export function quizMessage(opts: {
  tourName: string;
  days: string;
  pax: string;
  origin?: string;
  name?: string;
}) {
  return `${greeting(opts.name)}
Quiero reservar el tour: *${opts.tourName}*
Duración: ${opts.days}
Personas: ${opts.pax}
Salida desde: ${opts.origin ?? "Riohacha"}
Fecha aproximada: aún por definir

${PAYMENT_NOTICE}

¿Hay disponibilidad?`;
}

export function doubtsMessage(tourName: string, name?: string) {
  return `${greeting(name)} Estoy viendo el tour *${tourName}* y tengo algunas preguntas antes de reservar. ¿Me puedes ayudar?`;
}

/** Used after the booking form is submitted — references the lead id stored in DB. */
export function bookingRequestMessage(opts: {
  tourName: string;
  duration?: string;
  pax: number;
  date?: string;
  origin?: string;
  depositAmount: number;
  depositPercent: number;
  totalAmount: number;
  name: string;
  requestId: string;
}) {
  return `${greeting(opts.name)}
Acabo de enviar una solicitud de reserva desde la web:

🎯 Tour: *${opts.tourName}*
📅 Duración: ${opts.duration ?? "(por confirmar)"}
👥 Personas: ${opts.pax}
${opts.date ? `🗓️ Fecha deseada: ${opts.date}\n` : ""}📍 Salida: ${opts.origin ?? "(por confirmar)"}
💰 Total estimado: $${opts.totalAmount.toLocaleString("es-CO")} COP
💳 Anticipo (${opts.depositPercent}%): $${opts.depositAmount.toLocaleString("es-CO")} COP

📋 Ref. solicitud: ${opts.requestId.slice(0, 8)}

${PAYMENT_NOTICE}

¡Gracias!`;
}
