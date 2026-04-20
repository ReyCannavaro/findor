-- ============================================================
-- FINDOR — Full Database Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- untuk full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'waiting_payment',
  'dp_verified',
  'completed',
  'rejected',
  'cancelled'
);

CREATE TYPE availability_status AS ENUM ('available', 'full', 'off');

CREATE TYPE user_role AS ENUM ('user', 'vendor', 'admin');

-- ============================================================
-- TABLE: user_profiles
-- ============================================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  phone         TEXT,
  role          user_role NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TABLE: vendor_profiles
-- ============================================================

CREATE TABLE vendor_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  store_name        TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  category          TEXT NOT NULL,
  description       TEXT,
  whatsapp_number   TEXT NOT NULL,
  city              TEXT NOT NULL,
  address           TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  ktp_url           TEXT,
  selfie_url        TEXT,
  is_verified       BOOLEAN NOT NULL DEFAULT false,
  is_active         BOOLEAN NOT NULL DEFAULT false,
  rating_avg        NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GIN index untuk full-text search
CREATE INDEX idx_vendor_store_name_trgm ON vendor_profiles USING GIN (store_name gin_trgm_ops);
CREATE INDEX idx_vendor_city ON vendor_profiles(city);
CREATE INDEX idx_vendor_category ON vendor_profiles(category);
CREATE INDEX idx_vendor_rating ON vendor_profiles(rating_avg DESC);
CREATE INDEX idx_vendor_verified_active ON vendor_profiles(is_verified, is_active);

-- ============================================================
-- TABLE: services
-- ============================================================

CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id   UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  price_min   INTEGER NOT NULL CHECK (price_min > 0),
  price_max   INTEGER CHECK (price_max IS NULL OR price_max >= price_min),
  unit        TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_services_vendor ON services(vendor_id);
CREATE INDEX idx_services_price ON services(price_min, price_max);

-- ============================================================
-- TABLE: bookings
-- ============================================================

CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id         UUID NOT NULL REFERENCES vendor_profiles(id),
  user_id           UUID NOT NULL REFERENCES user_profiles(id),
  service_id        UUID NOT NULL REFERENCES services(id),
  event_date        DATE NOT NULL,
  event_name        VARCHAR(100) NOT NULL,
  event_location    TEXT NOT NULL,
  setup_time        TIME,
  notes             TEXT CHECK (char_length(notes) <= 500),
  status            booking_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  dp_proof_url      TEXT,
  dp_verified_at    TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- BR-BOOK-04: alasan tolak wajib jika rejected
  CONSTRAINT chk_rejection_reason CHECK (
    status != 'rejected' OR rejection_reason IS NOT NULL
  )
);

CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);

-- ============================================================
-- TABLE: reviews
-- ============================================================

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id), -- BR-BOOK-10: 1 review per booking
  vendor_id   UUID NOT NULL REFERENCES vendor_profiles(id),
  user_id     UUID NOT NULL REFERENCES user_profiles(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT CHECK (char_length(comment) <= 300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_vendor ON reviews(vendor_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- DB Trigger: update rating_avg & review_count di vendor_profiles
CREATE OR REPLACE FUNCTION update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendor_profiles SET
    rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE vendor_id = NEW.vendor_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE vendor_id = NEW.vendor_id),
    updated_at   = now()
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_vendor_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

-- ============================================================
-- TABLE: availability_blocks
-- ============================================================

CREATE TABLE availability_blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id   UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      availability_status NOT NULL DEFAULT 'available',
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (vendor_id, date) -- satu record per vendor per tanggal
);

CREATE INDEX idx_availability_vendor_date ON availability_blocks(vendor_id, date);

-- ============================================================
-- TABLE: bookmarks
-- ============================================================

CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vendor_id   UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, vendor_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Jalankan di Supabase Dashboard > Storage, atau via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-docs', 'vendor-docs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('booking-proofs', 'booking-proofs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vendor-portfolio', 'vendor-portfolio', true);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- vendor_profiles (publik bisa lihat vendor aktif & terverifikasi)
CREATE POLICY "Public can view active verified vendors" ON vendor_profiles
  FOR SELECT USING (is_active = true AND is_verified = true);
CREATE POLICY "Vendor can view own profile" ON vendor_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Vendor can update own profile" ON vendor_profiles
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User can create vendor profile" ON vendor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- services (publik bisa lihat service dari vendor aktif)
CREATE POLICY "Public can view active services" ON services
  FOR SELECT USING (
    is_active = true AND
    EXISTS (SELECT 1 FROM vendor_profiles v WHERE v.id = vendor_id AND v.is_active = true AND v.is_verified = true)
  );
CREATE POLICY "Vendor can manage own services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM vendor_profiles v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

-- bookings
CREATE POLICY "User can view own bookings" ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Vendor can view own received bookings" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM vendor_profiles v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );
CREATE POLICY "User can create booking" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User can cancel own pending booking" ON bookings
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Vendor can update own received bookings" ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM vendor_profiles v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

-- reviews (publik bisa baca)
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "User can create review for completed booking" ON reviews
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid() AND b.status = 'completed'
    )
  );
CREATE POLICY "User can update own review within 24h" ON reviews
  FOR UPDATE USING (
    user_id = auth.uid() AND
    created_at > now() - INTERVAL '24 hours'
  );

-- availability_blocks (publik bisa baca)
CREATE POLICY "Public can view availability" ON availability_blocks FOR SELECT USING (true);
CREATE POLICY "Vendor can manage own availability" ON availability_blocks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM vendor_profiles v WHERE v.id = vendor_id AND v.user_id = auth.uid())
  );

-- bookmarks
CREATE POLICY "User can manage own bookmarks" ON bookmarks
  FOR ALL USING (user_id = auth.uid());
