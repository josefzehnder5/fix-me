import { supabase } from "@/integrations/supabase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };
  const res = await fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg =
      (json && typeof json === "object" && "error" in json && typeof (json as { error: unknown }).error === "string"
        ? (json as { error: string }).error
        : null) || text || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

export interface CreatePaymentLinkResult {
  url: string;
  id: string;
  reused: boolean;
}

export function createPaymentLinkForBooking(bookingRequestId: string) {
  return postJson<CreatePaymentLinkResult>("/api/create-payment-link", { bookingRequestId });
}

export function updateBookingStatus(
  bookingRequestId: string,
  status: "pending" | "link_sent" | "paid" | "cancelled"
) {
  return postJson<{ ok: true }>("/api/update-booking-status", { bookingRequestId, status });
}
