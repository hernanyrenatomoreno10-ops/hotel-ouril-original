
-- ============= HOTELS (rede Ouril, multi-tenant) =============
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  country text NOT NULL DEFAULT 'Cabo Verde',
  brand_color text DEFAULT '#32CD32',
  lat numeric,
  lng numeric,
  tourist_tax_per_night numeric DEFAULT 2.75,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hotels readable" ON public.hotels FOR SELECT USING (true);

INSERT INTO public.hotels (slug, name, city, brand_color, lat, lng, tourist_tax_per_night)
VALUES ('ouril-mindelo', 'Ouril Mindelo Hotel', 'Mindelo', '#32CD32', 16.8836, -24.9956, 2.75);

-- ============= BOOKINGS =============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  hotel_name text,
  room_name text DEFAULT 'Suite Atlântica',
  room_number text DEFAULT '412',
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  check_out_date date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '4 days'),
  nightly_rate numeric DEFAULT 310,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings select" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bookings insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bookings update" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- ============= GASTRONOMY ITEMS (menu Ouril, público) =============
CREATE TABLE public.gastronomy_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text DEFAULT 'Pratos Principais',
  price_eur numeric NOT NULL,
  price_cve numeric NOT NULL,
  image_url text,
  popular boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gastronomy_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu readable" ON public.gastronomy_items FOR SELECT USING (true);

INSERT INTO public.gastronomy_items (hotel_id, name, description, category, price_eur, price_cve, popular, image_url)
SELECT id, n, d, c, eur, cve, p, img FROM public.hotels h,
(VALUES
  ('Polvo à Lagareiro Ouril', 'Polvo grelhado com batata a murro, alho dourado e azeite de Trás-os-Montes.', 'Pratos Principais', 32, 3527, true,  'https://images.unsplash.com/photo-1559742811-82410b451b9b?q=80&w=800&auto=format&fit=crop'),
  ('Catchupa Rica do Chef',   'A nossa releitura premium do prato nacional com enchidos artesanais.',         'Pratos Principais', 24, 2645, true,  'https://images.unsplash.com/photo-1512058560366-cd2427ff064f?q=80&w=800&auto=format&fit=crop'),
  ('Lagosta do Porto Grande', 'Lagosta fresca grelhada, manteiga de ervas, arroz de coco.',                   'Pratos Principais', 48, 5290, false, 'https://images.unsplash.com/photo-1625944525200-7c5e3d7b6f3c?q=80&w=800&auto=format&fit=crop'),
  ('Carpaccio de Atum',       'Atum rabilho com citrinos da ilha e pimenta da terra.',                        'Entradas',          18, 1984, false, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'),
  ('Cocktail Porto Grande',   'Rum de Cabo Verde, lima, hortelã, água de coco.',                              'Bar',               9,  993,  true,  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop'),
  ('Vinho Manuel Lopes Reserva', 'Tinto cabo-verdiano de Chã das Caldeiras, Fogo.',                          'Vinhos',            38, 4189, false, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop')
) AS items(n, d, c, eur, cve, p, img)
WHERE h.slug = 'ouril-mindelo';

-- ============= EXPERIENCES =============
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  title text NOT NULL,
  place text NOT NULL,
  price_eur numeric NOT NULL DEFAULT 45,
  rating numeric DEFAULT 4.8,
  tag text DEFAULT 'Cultura',
  image_url text,
  is_internal boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences readable" ON public.experiences FOR SELECT USING (true);

INSERT INTO public.experiences (hotel_id, title, place, price_eur, rating, tag, is_internal, image_url)
SELECT id, t, p, pr, r, tg, intl, img FROM public.hotels h,
(VALUES
  ('Massagem Ouril SPA',          'Ouril SPA · 60min',      85, 5.0, 'Premium',  true,  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop'),
  ('Jantar com Morna ao vivo',    'Ouril Lounge · 20h',     72, 4.9, 'Cultura',  true,  'https://images.unsplash.com/photo-1514525253344-f8565359c997?q=80&w=800&auto=format&fit=crop'),
  ('Travessia para Santo Antão',  'Porto Novo · dia',      185, 4.9, 'Natureza', false, 'https://images.unsplash.com/photo-1694263595508-3f5ef5808779?q=80&w=800&auto=format&fit=crop'),
  ('Aluguer privado de veleiro',  'Marina Mindelo · 4h',   420, 5.0, 'Premium',  false, 'https://images.unsplash.com/photo-1500627964684-141351970a7f?q=80&w=800&auto=format&fit=crop')
) AS exps(t, p, pr, r, tg, intl, img)
WHERE h.slug = 'ouril-mindelo';

-- ============= EXPERIENCE RESERVATIONS =============
CREATE TABLE public.experience_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE SET NULL,
  title text NOT NULL,
  place text,
  price_eur numeric DEFAULT 45,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.experience_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exp select" ON public.experience_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own exp insert" ON public.experience_reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= GASTRONOMY ORDERS =============
CREATE TABLE public.gastronomy_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE SET NULL,
  item_id uuid REFERENCES public.gastronomy_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gastronomy_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gastro select" ON public.gastronomy_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own gastro insert" ON public.gastronomy_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= MEDICAL APPOINTMENTS =============
CREATE TABLE public.medical_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  specialty text NOT NULL,
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own med select" ON public.medical_appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own med insert" ON public.medical_appointments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= SERVICE REQUESTS =============
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own svc select" ON public.service_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own svc insert" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= ROOM SETTINGS =============
CREATE TABLE public.room_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  temperature numeric,
  blinds_level int,
  lights_level int,
  ac_power boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.room_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own room select" ON public.room_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own room insert" ON public.room_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============= AUTO BOOKING ON SIGNUP =============
CREATE OR REPLACE FUNCTION public.handle_new_guest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.bookings (user_id, hotel_id, hotel_name)
  SELECT NEW.id, h.id, h.name
  FROM public.hotels h
  WHERE h.slug = 'ouril-mindelo';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_ouril
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_guest();
