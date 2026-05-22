-- ============================================
-- ALBUM WORLD CUP 2026 - Admin Seed Redesign
-- ============================================
-- Adds: categories table, sticker player fields, nullable confederation_id

-- Create categories table (mantenedor for sticker categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make confederation_id nullable in teams
ALTER TABLE teams ALTER COLUMN confederation_id DROP NOT NULL;

-- Add manual code column to stickers
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS code TEXT;

-- Add category_id FK to stickers
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Add player detail columns to stickers
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_nombre TEXT;
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_apellido TEXT;
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_fecha_nacimiento TEXT;
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_estatura NUMERIC(5,1);
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_peso NUMERIC(5,1);
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_club_actual TEXT;
ALTER TABLE stickers ADD COLUMN IF NOT EXISTS player_pais_club TEXT;

-- Create index on sticker code for faster lookups
CREATE INDEX IF NOT EXISTS idx_stickers_code ON stickers(code);
CREATE INDEX IF NOT EXISTS idx_stickers_category_id ON stickers(category_id);
