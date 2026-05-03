-- Lock down has_role: only allow internal usage by policies (postgres role)
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Explicit deny-all policies for wompi_events (only service role bypasses RLS)
CREATE POLICY "Deny all client access to wompi_events"
  ON public.wompi_events FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);