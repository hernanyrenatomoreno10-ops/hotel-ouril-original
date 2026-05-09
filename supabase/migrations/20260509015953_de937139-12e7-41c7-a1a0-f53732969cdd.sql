
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'restaurant', 'housekeeping', 'guest');

-- user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Door access logs
CREATE TABLE public.door_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  room_number TEXT,
  method TEXT NOT NULL DEFAULT 'nfc',
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.door_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own door insert" ON public.door_access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own door select" ON public.door_access_logs
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Menu availability + updated_at
ALTER TABLE public.gastronomy_items ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.gastronomy_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE POLICY "staff update menu" ON public.gastronomy_items
  FOR UPDATE USING (public.has_role(auth.uid(), 'restaurant') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'restaurant') OR public.has_role(auth.uid(), 'admin'));

-- Orders: room number + updated_at + staff policies
ALTER TABLE public.gastronomy_orders ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE public.gastronomy_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE POLICY "staff read all orders" ON public.gastronomy_orders
  FOR SELECT USING (public.has_role(auth.uid(), 'restaurant') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff update orders" ON public.gastronomy_orders
  FOR UPDATE USING (public.has_role(auth.uid(), 'restaurant') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'restaurant') OR public.has_role(auth.uid(), 'admin'));

-- Service requests: room + updated_at + housekeeping staff policies
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS room_number TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE POLICY "staff read all svc" ON public.service_requests
  FOR SELECT USING (public.has_role(auth.uid(), 'housekeeping') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "staff update svc" ON public.service_requests
  FOR UPDATE USING (public.has_role(auth.uid(), 'housekeeping') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'housekeeping') OR public.has_role(auth.uid(), 'admin'));

-- Admin can read all bookings (BI)
CREATE POLICY "admin read all bookings" ON public.bookings
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastronomy_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.door_access_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gastronomy_items;
