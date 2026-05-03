import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireUser } from "./_lib/supabase";

const inputSchema = z.object({
  bookingRequestId: z.string().uuid(),
  status: z.enum(["pending", "link_sent", "paid", "cancelled"]),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let token: string;
  try {
    const auth = await requireUser(req);
    token = auth.token;
  } catch (e) {
    const err = e as Error & { status?: number };
    return res.status(err.status ?? 500).json({ error: err.message });
  }

  const parsed = inputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  // Use the user's token so RLS applies (admin role enforced via policy).
  const url = process.env.SUPABASE_URL!;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const userClient = createClient<Database>(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await userClient
    .from("booking_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.bookingRequestId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
