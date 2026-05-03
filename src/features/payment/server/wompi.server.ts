/**
 * Wompi API helpers — server-only.
 * Docs: https://docs.wompi.co/docs/colombia/enlaces-de-pago/
 *
 * Sandbox base: https://sandbox.wompi.co/v1
 * Production base: https://production.wompi.co/v1
 */

export type WompiEnv = "sandbox" | "production";

function wompiBase(env: WompiEnv) {
  return env === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

function getEnv(): WompiEnv {
  const v = process.env.WOMPI_ENV;
  return v === "production" ? "production" : "sandbox";
}

function getPrivateKey(): string {
  const k = process.env.WOMPI_PRIVATE_KEY;
  if (!k) throw new Error("Missing WOMPI_PRIVATE_KEY env var");
  return k;
}

export function getEventsSecret(): string {
  const k = process.env.WOMPI_EVENTS_KEY;
  if (!k) throw new Error("Missing WOMPI_EVENTS_KEY env var");
  return k;
}

export interface CreatePaymentLinkInput {
  name: string;            // shown on the Wompi page
  description: string;     // shown on the Wompi page
  amountInCents: number;   // deposit in cents (COP has no decimals → x100)
  currency?: "COP";
  expiresAt?: string;      // ISO string
  /** Identifier we attach so the webhook can match back to our booking_requests row */
  reference: string;
  collectShipping?: boolean;
  redirectUrl?: string;
}

export interface WompiPaymentLink {
  id: string;
  /** Public URL to share with the customer */
  url: string;
}

export async function createWompiPaymentLink(input: CreatePaymentLinkInput): Promise<WompiPaymentLink> {
  const base = wompiBase(getEnv());
  const body = {
    name: input.name.slice(0, 60),
    description: input.description.slice(0, 240),
    single_use: true,
    collect_shipping: input.collectShipping ?? false,
    currency: input.currency ?? "COP",
    amount_in_cents: input.amountInCents,
    expires_at: input.expiresAt,
    redirect_url: input.redirectUrl,
    // Wompi exposes this back on the webhook as `transaction.payment_link_id` and on payment_links as id.
    // Reference goes into `customer_data` not metadata; we mirror it in `name` for UI clarity.
  };

  const res = await fetch(`${base}/payment_links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPrivateKey()}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("[wompi] create payment link failed", res.status, text);
    throw new Error(`Wompi API error ${res.status}: ${text.slice(0, 500)}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Wompi returned non-JSON response: ${text.slice(0, 200)}`);
  }

  const data = (json as { data?: { id?: string } }).data;
  if (!data?.id) {
    throw new Error(`Wompi response missing data.id: ${text.slice(0, 200)}`);
  }

  // Public checkout URL
  const checkoutHost =
    getEnv() === "production" ? "https://checkout.wompi.co" : "https://checkout.wompi.co";
  return {
    id: data.id,
    url: `${checkoutHost}/l/${data.id}`,
  };
}
