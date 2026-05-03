import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEventsSecret } from "@/features/payment/server/wompi.server";

/**
 * Wompi sends `transaction.updated` events with a signature constructed from
 * concatenating values referenced by `signature.properties` + the timestamp
 * + the events secret, hashed with SHA-256.
 *
 * Docs: https://docs.wompi.co/docs/colombia/eventos/
 */

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
  signature?: {
    properties?: string[];
    checksum?: string;
  };
  timestamp?: number;
  sent_at?: string;
  // Wompi may also send a top-level event id; if absent we synthesize one.
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

export const Route = createFileRoute("/api/public/wompi-webhook")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ ok: true, hint: "POST Wompi events here" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      POST: async ({ request }) => {
        const text = await request.text();
        let body: WompiEventBody;
        try {
          body = JSON.parse(text);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        if (!verifySignature(body)) {
          console.warn("[wompi-webhook] invalid signature", { event: body.event });
          return new Response("Invalid signature", { status: 401 });
        }

        const tx = body.data?.transaction;
        if (!tx?.id) {
          return new Response("Missing transaction", { status: 400 });
        }

        // Idempotency: use transaction.id + timestamp as event key.
        const eventKey = `${tx.id}:${body.timestamp ?? "0"}`;

        const { data: existing } = await supabaseAdmin
          .from("wompi_events")
          .select("event_id")
          .eq("event_id", eventKey)
          .maybeSingle();

        if (existing) {
          return new Response("ok (duplicate ignored)", { status: 200 });
        }

        const insertRow = {
          event_id: eventKey,
          transaction_id: tx.id,
          status: tx.status ?? null,
          payload: body as unknown as import("@/integrations/supabase/types").Json,
        };
        await supabaseAdmin.from("wompi_events").insert(insertRow);

        if (tx.status === "APPROVED" && tx.payment_link_id) {
          const { error: updErr } = await supabaseAdmin
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

        return new Response("ok", { status: 200 });
      },
    },
  },
});
