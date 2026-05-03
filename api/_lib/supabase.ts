import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types.js";

let _admin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  }
  _admin = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _admin;
}

/** Verifies the Bearer token in the Authorization header and returns the user id. */
export async function requireUser(req: { headers: Record<string, string | string[] | undefined> }) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY env vars");

  const raw = req.headers["authorization"] ?? req.headers["Authorization" as keyof typeof req.headers];
  const authHeader = Array.isArray(raw) ? raw[0] : raw;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const e = new Error("Unauthorized: missing Bearer token");
    (e as Error & { status?: number }).status = 401;
    throw e;
  }
  const token = authHeader.slice("Bearer ".length);
  const client = createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    const e = new Error("Unauthorized: invalid token");
    (e as Error & { status?: number }).status = 401;
    throw e;
  }
  return { userId: data.user.id, token };
}

export async function requireAdmin(req: {
  headers: Record<string, string | string[] | undefined>;
}) {
  const { userId, token } = await requireUser(req);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) {
    throw new Error("Authorization check failed");
  }
  if (!data) {
    const e = new Error("Forbidden: admin role required");
    (e as Error & { status?: number }).status = 403;
    throw e;
  }
  return { userId, token };
}
