-- Roles enum + table (security best practice: separate roles table)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Booking requests
CREATE TYPE public.booking_status AS ENUM ('pending', 'link_sent', 'paid', 'cancelled');

CREATE TABLE public.booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id INTEGER NOT NULL,
  tour_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  persons INTEGER NOT NULL DEFAULT 1,
  desired_date TEXT,
  origin TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  deposit_percent INTEGER NOT NULL DEFAULT 15,
  total_price_cop BIGINT NOT NULL,
  deposit_amount_cop BIGINT NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  wompi_payment_link_id TEXT,
  wompi_payment_url TEXT,
  wompi_transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous) can create a booking request
CREATE POLICY "Anyone can create booking requests"
  ON public.booking_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read / update / delete
CREATE POLICY "Admins can view all booking requests"
  ON public.booking_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update booking requests"
  ON public.booking_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete booking requests"
  ON public.booking_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON public.booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_booking_requests_status ON public.booking_requests(status);
CREATE INDEX idx_booking_requests_created ON public.booking_requests(created_at DESC);
CREATE INDEX idx_booking_requests_wompi_tx ON public.booking_requests(wompi_transaction_id);

-- Wompi webhook idempotency table (server-only access)
CREATE TABLE public.wompi_events (
  event_id TEXT PRIMARY KEY,
  transaction_id TEXT,
  status TEXT,
  payload JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wompi_events ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Server uses service role.