CREATE TABLE IF NOT EXISTS public.hotel_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid,
  key text NOT NULL UNIQUE,
  title text,
  description text,
  price_eur numeric,
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hotel_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content readable" ON public.hotel_content FOR SELECT USING (true);
CREATE POLICY "staff insert content" ON public.hotel_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'restaurant'));
CREATE POLICY "staff update content" ON public.hotel_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'restaurant'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'restaurant'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.hotel_content;
ALTER TABLE public.hotel_content REPLICA IDENTITY FULL;

INSERT INTO public.hotel_content (key, title, description, price_eur, image_url)
VALUES
  ('dish_of_the_day', 'Polvo à Lagareiro', 'Polvo grelhado com batatas ao murro e azeite virgem extra.', 28, NULL),
  ('featured_image', 'Destaque', 'Imagem de destaque do hotel', NULL, NULL)
ON CONFLICT (key) DO NOTHING;