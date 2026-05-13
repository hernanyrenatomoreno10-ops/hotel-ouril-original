-- ============================================================
-- OURIL SUPER APP — PRODUCTION DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. SEED THE 4 OURIL HOTELS
-- ============================================================
INSERT INTO hotels (id, name, city, country, primary_color, tourist_tax_per_night)
VALUES
  ('hotel-mindelo',  'Ouril Mindelo',  'Mindelo',     'Cabo Verde', '#c9a96e', 2.75),
  ('hotel-julia',    'Ouril Julia',    'São Vicente',  'Cabo Verde', '#6e9ec9', 2.75),
  ('hotel-agueda',   'Ouril Agueda',   'Santa Maria',  'Cabo Verde', '#9ec96e', 2.75),
  ('hotel-pontao',   'Ouril Pontão',   'Praia',        'Cabo Verde', '#c96e9e', 2.75)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      city = EXCLUDED.city,
      primary_color = EXCLUDED.primary_color;


-- 2. ROW LEVEL SECURITY — Enable on all tables
-- ============================================================
ALTER TABLE gastronomy_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastronomy_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences             ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_settings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                ENABLE ROW LEVEL SECURITY;


-- 3. HELPER — Get current user's hotel_id from metadata
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_hotel_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'hotel_id',
    auth.jwt() -> 'app_metadata' ->> 'hotel_id'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- 4. RLS POLICIES — gastronomy_items
-- ============================================================
-- Guests can read items from their hotel
CREATE POLICY "guests_read_gastronomy_items"
  ON gastronomy_items FOR SELECT
  USING (hotel_id = get_my_hotel_id() OR hotel_id IS NULL);

-- Staff (admin/restaurant role) can manage items for their hotel
CREATE POLICY "staff_manage_gastronomy_items"
  ON gastronomy_items FOR ALL
  USING (
    hotel_id = get_my_hotel_id() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'restaurant')
    )
  );


-- 5. RLS POLICIES — gastronomy_orders
-- ============================================================
-- Guests see only their own orders
CREATE POLICY "guests_read_own_orders"
  ON gastronomy_orders FOR SELECT
  USING (user_id = auth.uid());

-- Guests can insert orders for their hotel
CREATE POLICY "guests_insert_orders"
  ON gastronomy_orders FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    hotel_id = get_my_hotel_id()
  );

-- Staff can read/update all orders for their hotel
CREATE POLICY "staff_manage_orders"
  ON gastronomy_orders FOR ALL
  USING (
    hotel_id = get_my_hotel_id() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'restaurant')
    )
  );


-- 6. RLS POLICIES — service_requests
-- ============================================================
CREATE POLICY "guests_insert_service_requests"
  ON service_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    hotel_id = get_my_hotel_id()
  );

CREATE POLICY "guests_read_own_requests"
  ON service_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "staff_manage_service_requests"
  ON service_requests FOR ALL
  USING (
    hotel_id = get_my_hotel_id() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'housekeeping', 'restaurant')
    )
  );


-- 7. RLS POLICIES — experiences & reservations
-- ============================================================
CREATE POLICY "guests_read_experiences"
  ON experiences FOR SELECT
  USING (hotel_id = get_my_hotel_id() OR hotel_id IS NULL);

CREATE POLICY "guests_insert_reservations"
  ON experience_reservations FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    hotel_id = get_my_hotel_id()
  );

CREATE POLICY "guests_read_own_reservations"
  ON experience_reservations FOR SELECT
  USING (user_id = auth.uid());


-- 8. RLS POLICIES — room_settings
-- ============================================================
CREATE POLICY "guests_manage_own_room"
  ON room_settings FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "staff_read_all_rooms"
  ON room_settings FOR SELECT
  USING (
    hotel_id = get_my_hotel_id() AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'housekeeping')
    )
  );


-- 9. PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gastronomy_items_hotel     ON gastronomy_items (hotel_id);
CREATE INDEX IF NOT EXISTS idx_gastronomy_orders_hotel    ON gastronomy_orders (hotel_id);
CREATE INDEX IF NOT EXISTS idx_experiences_hotel          ON experiences (hotel_id);
CREATE INDEX IF NOT EXISTS idx_exp_reservations_hotel     ON experience_reservations (hotel_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_hotel     ON service_requests (hotel_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status    ON service_requests (status, hotel_id);
CREATE INDEX IF NOT EXISTS idx_room_settings_hotel        ON room_settings (hotel_id);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
-- Next step: In Supabase Auth settings, add hotel_id to
-- user_metadata on signup via the Login page (already done
-- in app code via options.data.hotel_id)
-- ============================================================
