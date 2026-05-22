-- Create categories table (mantenedor for sticker categories)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Admin can manage categories (the server client uses service_role)
CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

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
