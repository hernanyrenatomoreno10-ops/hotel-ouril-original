-- ==============================================================================
-- MINDELO LUXURY HUB - SUPABASE SCHEMA & RLS
-- Run this in the Supabase SQL Editor
-- ==============================================================================

-- 1. Criação das Tabelas
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Reference to auth.users
  room_number TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  place TEXT NOT NULL,
  price TEXT NOT NULL,
  rating NUMERIC NOT NULL,
  tag TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  specialty TEXT NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience_reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_id UUID REFERENCES experiences(id),
  title TEXT,
  place TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  user_id UUID NOT NULL,
  temperature INTEGER DEFAULT 22,
  blinds_level INTEGER DEFAULT 50,
  lights_level INTEGER DEFAULT 80,
  ac_power BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_reservations ENABLE ROW LEVEL SECURITY;
-- A tabela experiences é pública para leitura, então não precisa de RLS restrito para SELECT.

-- 3. Políticas de RLS (Para o usuário 'Alessandro' ver apenas os seus dados)
-- Assumindo que auth.uid() retorna o ID do usuário logado.

-- Bookings (Estadias do hotel e Digital Key)
CREATE POLICY "Usuários podem ver suas próprias reservas" 
ON bookings FOR SELECT 
USING (auth.uid() = user_id);

-- Medical Appointments
CREATE POLICY "Usuários podem ver suas próprias consultas" 
ON medical_appointments FOR SELECT 
USING (auth.uid() = user_id);

-- Experience Reservations
CREATE POLICY "Usuários podem ver suas reservas de experiências" 
ON experience_reservations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar reservas de experiências" 
ON experience_reservations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 4. Função Mock para Webhook de Push Notification
-- ==============================================================================
-- Se o status de experience_reservations mudar para 'confirmed', você pode configurar
-- um Database Webhook no Supabase que chama uma Edge Function, ou usar um trigger:

CREATE OR REPLACE FUNCTION notify_experience_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Aqui entraria a chamada para uma Edge Function do Supabase via pg_net
    -- ex: select net.http_post('url-da-edge-function', jsonb_build_object('user_id', NEW.user_id, 'exp_id', NEW.experience_id));
    RAISE NOTICE 'Webhook Acionado para push notification: Experiência Confirmada';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_experience_confirmed
AFTER UPDATE ON experience_reservations
FOR EACH ROW EXECUTE FUNCTION notify_experience_confirmed();

-- 5. Service Requests (AI Actionable)
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios pedidos de serviço" 
ON service_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar pedidos de serviço" 
ON service_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);
