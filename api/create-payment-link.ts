import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { getSupabaseAdmin, requireAdmin } from "./_lib/supabase";
import { createWompiPaymentLink } from "./_lib/wompi";

const inputSchema = z.object({
  bookingRequestId: z.string().uuid(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await requireAdmin(req);
  } catch (e) {
    const err = e as Error & { status?: number };
    return res.status(err.status ?? 500).json({ error: err.message });
  }

  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const admin = getSupabaseAdmin();

  const { data: booking, error: bookErr } = await admin
    .from("booking_requests")
    .select("*")
    .eq("id", parsed.data.bookingRequestId)
    .maybeSingle();

  if (bookErr) {
    console.error("[create-payment-link] booking lookup failed", bookErr);
    return res.status(500).json({ error: "Failed to load booking" });
  }
  if (!booking) {
    return res.status(404).json({ error: "Booking request not found" });
  }

  if (booking.wompi_payment_url && booking.wompi_payment_link_id) {
    return res.status(200).json({
      url: booking.wompi_payment_url,
      id: booking.wompi_payment_link_id,
      reused: true,
    });
  }

  const amountInCents = booking.deposit_amount_cop * 100;

  let link;
  try {
    link = await createWompiPaymentLink({
      name: `Castle Tours · ${booking.tour_name}`,
      description: `Anticipo (${booking.deposit_percent}%) · ${booking.persons} pax · Ref ${booking.id.slice(0, 8)}`,
      amountInCents,
      reference: booking.id,
    });
  } catch (e) {
    console.error("[create-payment-link] Wompi error", e);
    return res
      .status(502)
      .json({ error: e instanceof Error ? `Wompi: ${e.message}` : "Failed to create Wompi payment link" });
  }

  const { error: updErr } = await admin
    .from("booking_requests")
    .update({
      wompi_payment_link_id: link.id,
      wompi_payment_url: link.url,
      status: "link_sent",
    })
    .eq("id", booking.id);

  if (updErr) {
    console.error("[create-payment-link] update failed", updErr);
    return res
      .status(500)
      .json({ error: "Payment link created but failed to save to booking" });
  }

  return res.status(200).json({ url: link.url, id: link.id, reused: false });
}
