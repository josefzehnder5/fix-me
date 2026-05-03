export type WompiEnv = "sandbox" | "production";

function wompiBase(env: WompiEnv) {
  return env === "production"
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

export function getWompiEnv(): WompiEnv {
  return process.env.WOMPI_ENV === "production" ? "production" : "sandbox";
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
  name: string;
  description: string;
  amountInCents: number;
  currency?: "COP";
  expiresAt?: string;
  reference: string;
  collectShipping?: boolean;
  redirectUrl?: string;
}

export interface WompiPaymentLink {
  id: string;
  url: string;
}

export async function createWompiPaymentLink(
  input: CreatePaymentLinkInput
): Promise<WompiPaymentLink> {
  const env = getWompiEnv();
  const base = wompiBase(env);
  const body = {
    name: input.name.slice(0, 60),
    description: input.description.slice(0, 240),
    single_use: true,
    collect_shipping: input.collectShipping ?? false,
    currency: input.currency ?? "COP",
    amount_in_cents: input.amountInCents,
    expires_at: input.expiresAt,
    redirect_url: input.redirectUrl,
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
  return {
    id: data.id,
    url: `https://checkout.wompi.co/l/${data.id}`,
  };
}
