import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "./_lib/supabase";
import { getEventsSecret } from "./_lib/wompi";
import type { Database } from "@/integrations/supabase/types";

interface WompiEventBody {
  event?: string;
  data?: {
    transaction?: {
      id?: string;
      status?: string;
      amount_in_cents?: number;
      payment_link_id?: string | null;
      reference?: string;
    };
  };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
  sent_at?: string;
  id?: string;
}

function getNested(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function verifySignature(body: WompiEventBody): boolean {
  const props = body.signature?.properties;
  const checksum = body.signature?.checksum;
  const timestamp = body.timestamp;
  if (!props || !checksum || !timestamp) return false;

  let secret: string;
  try {
    secret = getEventsSecret();
  } catch {
    return false;
  }

  const concatenated =
    props.map((p) => String(getNested(body.data, p) ?? "")).join("") +
    String(timestamp) +
    secret;

  const expected = createHash("sha256").update(concatenated).digest("hex");
  return expected.toLowerCase() === checksum.toLowerCase();
}

export const config = { api: { bodyParser: false } };

async function readRawBody(req: VercelRequest): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, hint: "POST Wompi events here" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body: WompiEventBody;
  try {
    const raw = await readRawBody(req);
    body = JSON.parse(raw);
  } catch {
    return res.status(400).send("Invalid JSON");
  }

  if (!verifySignature(body)) {
    console.warn("[wompi-webhook] invalid signature", { event: body.event });
    return res.status(401).send("Invalid signature");
  }

  const tx = body.data?.transaction;
  if (!tx?.id) {
    return res.status(400).send("Missing transaction");
  }

  const eventKey = `${tx.id}:${body.timestamp ?? "0"}`;
  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("wompi_events")
    .select("event_id")
    .eq("event_id", eventKey)
    .maybeSingle();

  if (existing) {
    return res.status(200).send("ok (duplicate ignored)");
  }

  const insertRow = {
    event_id: eventKey,
    transaction_id: tx.id,
    status: tx.status ?? null,
    payload: body as unknown as Database["public"]["Tables"]["wompi_events"]["Insert"]["payload"],
  };
  await admin.from("wompi_events").insert(insertRow);

  if (tx.status === "APPROVED" && tx.payment_link_id) {
    const { error: updErr } = await admin
      .from("booking_requests")
      .update({
        status: "paid",
        wompi_transaction_id: tx.id,
        paid_at: new Date().toISOString(),
      })
      .eq("wompi_payment_link_id", tx.payment_link_id);

    if (updErr) {
      console.error("[wompi-webhook] failed to mark booking paid", updErr);
    }
  }

  return res.status(200).send("ok");
}
