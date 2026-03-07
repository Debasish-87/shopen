-- migrations/001_initial_schema.sql
-- Run this file against your PostgreSQL database to create the schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ADMINS TABLE ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
    id         SERIAL PRIMARY KEY,
    username   VARCHAR(100) UNIQUE NOT NULL,
    password   TEXT NOT NULL,                  -- bcrypt hash
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SHOPS TABLE ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    category   VARCHAR(50)  NOT NULL CHECK (category IN ('Food', 'Medical', 'Café')),
    subcat     VARCHAR(100) NOT NULL,
    icon       VARCHAR(10)  NOT NULL DEFAULT '🏪',
    address    TEXT         NOT NULL DEFAULT '',
    phone      VARCHAR(30)  NOT NULL DEFAULT '',
    hours      VARCHAR(100) NOT NULL DEFAULT '',
    is_open    BOOLEAN      NOT NULL DEFAULT TRUE,
    description TEXT        NOT NULL DEFAULT '',
    photo_url  TEXT         NOT NULL DEFAULT '',
    map_query  TEXT         NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at
    BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_shops_category ON shops (category);
CREATE INDEX IF NOT EXISTS idx_shops_is_open  ON shops (is_open);
CREATE INDEX IF NOT EXISTS idx_shops_name     ON shops (name);

-- ─── SEED DATA ────────────────────────────────────────────────────────────────
-- Admin: password is bcrypt of "admin123"
INSERT INTO admins (username, password) VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
) ON CONFLICT (username) DO NOTHING;

-- Sample shops
INSERT INTO shops (name, category, subcat, icon, address, phone, hours, is_open, description, map_query) VALUES
('Spice Garden',      'Food',    'Restaurant',  '🍛', '12 MG Road, Bhubaneswar',       '+91 98765 43210', '11 AM–10 PM', true,  'Authentic North Indian cuisine with a warm family atmosphere. Famous for butter chicken and fresh naan.', 'Spice+Garden+MG+Road+Bhubaneswar'),
('Golden Bites',      'Food',    'Fast Food',   '🍔', '45 Saheed Nagar, Bhubaneswar',  '+91 87654 32109', '10 AM–11 PM', true,  'Quick burgers, rolls and loaded fries. Best fast food in the neighbourhood since 2018.', 'Saheed+Nagar+Bhubaneswar'),
('Sweet Nest Bakery', 'Food',    'Bakery',      '🥐', '8 Janpath, Bhubaneswar',         '+91 76543 21098', '7 AM–9 PM',   false, 'Freshly baked bread, cakes and pastries every morning. Custom birthday cakes on order.', 'Janpath+Bhubaneswar'),
('Street Tadka',      'Food',    'Street Food', '🌮', '22 Unit-4 Market, Bhubaneswar',  '+91 65432 10987', '5 PM–12 AM',  false, 'Famous chaat, pani puri and local street delights. Best evening snack spot in town.', 'Unit+4+Market+Bhubaneswar'),
('LifeCare Pharmacy', 'Medical', 'Pharmacy',    '💊', '33 Kharvel Nagar, Bhubaneswar',  '+91 54321 09876', '8 AM–10 PM',  true,  'Licensed pharmacy stocking all major medicines, health products and supplements.', 'Kharvel+Nagar+Bhubaneswar'),
('Sunrise Clinic',    'Medical', 'Clinic',      '🏥', '77 Nayapalli, Bhubaneswar',      '+91 43210 98765', '9 AM–7 PM',   true,  'General physician and specialist consultations. Modern OPD with full diagnostic lab support.', 'Nayapalli+Bhubaneswar'),
('QuickDiag Lab',     'Medical', 'Diagnostics', '🔬', '5 Patia Square, Bhubaneswar',    '+91 32109 87654', '7 AM–8 PM',   false, 'Comprehensive blood tests, X-Ray, ECG and more. Digital reports within hours.', 'Patia+Bhubaneswar'),
('Brew & Bloom',      'Café',    'Coffee',      '☕', '14 Jaydev Vihar, Bhubaneswar',   '+91 21098 76543', '8 AM–9 PM',   true,  'Specialty single-origin coffee, pour-overs and espresso drinks in a cozy aesthetic space.', 'Jaydev+Vihar+Bhubaneswar'),
('Sip & Sit Tea',     'Café',    'Tea House',   '🍵', '3 IRC Village, Bhubaneswar',     '+91 10987 65432', '7 AM–8 PM',   true,  'Premium Darjeeling, Assam and herbal teas. Quiet nooks, board games and free Wi-Fi.', 'IRC+Village+Bhubaneswar'),
('Chill Sip Bar',     'Café',    'Juice Bar',   '🥤', '60 Acharya Vihar, Bhubaneswar',  '+91 99887 76655', '9 AM–9 PM',   false, 'Fresh cold-pressed juices and smoothie bowls made to order.', 'Acharya+Vihar+Bhubaneswar')
ON CONFLICT DO NOTHING;
