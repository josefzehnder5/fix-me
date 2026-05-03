import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createWompiPaymentLink } from "./wompi.server";

const createLinkInput = z.object({
  bookingRequestId: z.string().uuid(),
});

/**
 * Admin-only: generate a Wompi payment link for a booking_request and persist it.
 * Returns the URL so the admin can copy it / open WhatsApp manually.
 */
export const createPaymentLinkForBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createLinkInput.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify caller is admin (extra check on top of RLS).
    const { data: roleCheck, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleErr) {
      console.error("[createPaymentLink] role check failed", roleErr);
      throw new Error("Authorization check failed");
    }
    if (!roleCheck) {
      throw new Error("Forbidden: admin role required");
    }

    // Load booking
    const { data: booking, error: bookErr } = await supabaseAdmin
      .from("booking_requests")
      .select("*")
      .eq("id", data.bookingRequestId)
      .maybeSingle();

    if (bookErr) {
      console.error("[createPaymentLink] booking lookup failed", bookErr);
      throw new Error("Failed to load booking");
    }
    if (!booking) throw new Error("Booking request not found");

    // If already has a payment link, return it instead of creating a duplicate
    if (booking.wompi_payment_url && booking.wompi_payment_link_id) {
      return {
        url: booking.wompi_payment_url,
        id: booking.wompi_payment_link_id,
        reused: true as const,
      };
    }

    // amount_in_cents — COP has no decimals, but Wompi uses cents (x100)
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
      console.error("[createPaymentLink] Wompi error", e);
      throw new Error(
        e instanceof Error ? `Wompi: ${e.message}` : "Failed to create Wompi payment link"
      );
    }

    const { error: updErr } = await supabaseAdmin
      .from("booking_requests")
      .update({
        wompi_payment_link_id: link.id,
        wompi_payment_url: link.url,
        status: "link_sent",
      })
      .eq("id", booking.id);

    if (updErr) {
      console.error("[createPaymentLink] update failed", updErr);
      throw new Error("Payment link created but failed to save to booking");
    }

    return { url: link.url, id: link.id, reused: false as const };
  });

const updateStatusInput = z.object({
  bookingRequestId: z.string().uuid(),
  status: z.enum(["pending", "link_sent", "paid", "cancelled"]),
});

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateStatusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("booking_requests")
      .update({ status: data.status })
      .eq("id", data.bookingRequestId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
