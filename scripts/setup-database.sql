-- ============================================
-- ALBUM WORLD CUP 2026 - FULL SETUP
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- 1. TABLES (001-initial-schema.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'email')),
  auth_uid TEXT UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  tournament_type TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  total_stickers INTEGER NOT NULL,
  special_stickers INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confederations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  color TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  confederation_id UUID NOT NULL REFERENCES confederations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  flag_url TEXT,
  group_stage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(album_id, code)
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER,
  photo_url TEXT,
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sticker_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  sticker_type_id UUID NOT NULL REFERENCES sticker_types(id),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary', 'holographic', 'limited')),
  image_url TEXT NOT NULL,
  image_thumbnail TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  special_attribute TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(album_id, number)
);

CREATE TABLE IF NOT EXISTS user_stickers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  quantity_owned INTEGER DEFAULT 1 CHECK (quantity_owned > 0),
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sticker_id)
);

CREATE TABLE IF NOT EXISTS sticker_duplicates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sticker_id UUID NOT NULL REFERENCES stickers(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sticker_id)
);

CREATE TABLE IF NOT EXISTS shared_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  show_duplicates BOOLEAN DEFAULT TRUE,
  show_missing BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ACCOUNTS / MULTI-TENANT (004-multi-tenant.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  invited_by UUID REFERENCES users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, user_id)
);

ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE sticker_duplicates ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE shared_collections ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- ============================================
-- 3. INDEXES (003-indexes.sql)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stickers_album_id ON stickers(album_id);
CREATE INDEX IF NOT EXISTS idx_stickers_team_id ON stickers(team_id);
CREATE INDEX IF NOT EXISTS idx_stickers_player_id ON stickers(player_id);
CREATE INDEX IF NOT EXISTS idx_stickers_rarity ON stickers(rarity);
CREATE INDEX IF NOT EXISTS idx_stickers_number ON stickers(album_id, number);
CREATE INDEX IF NOT EXISTS idx_stickers_special ON stickers(is_special) WHERE is_special = TRUE;
CREATE INDEX IF NOT EXISTS idx_stickers_album_rarity ON stickers(album_id, rarity);
CREATE INDEX IF NOT EXISTS idx_user_stickers_user_id ON user_stickers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stickers_sticker_id ON user_stickers(sticker_id);
CREATE INDEX IF NOT EXISTS idx_user_stickers_obtained ON user_stickers(user_id, obtained_at DESC);
CREATE INDEX IF NOT EXISTS idx_duplicates_user_id ON sticker_duplicates(user_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_sticker_id ON sticker_duplicates(sticker_id);
CREATE INDEX IF NOT EXISTS idx_teams_album_id ON teams(album_id);
CREATE INDEX IF NOT EXISTS idx_teams_confederation ON teams(confederation_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_name_trgm ON players USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shared_user_id ON shared_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_code ON shared_collections(share_code);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON account_members(account_id);
CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON account_members(user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_role ON account_members(role);
CREATE INDEX IF NOT EXISTS idx_user_stickers_account_id ON user_stickers(account_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_account_id ON sticker_duplicates(account_id);
CREATE INDEX IF NOT EXISTS idx_shared_account_id ON shared_collections(account_id);

-- ============================================
-- 4. TRIGGERS (003-indexes.sql + 004-multi-tenant.sql)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS albums_updated_at ON albums;
CREATE TRIGGER albums_updated_at BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS teams_updated_at ON teams;
CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS players_updated_at ON players;
CREATE TRIGGER players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS stickers_updated_at ON stickers;
CREATE TRIGGER stickers_updated_at BEFORE UPDATE ON stickers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS user_stickers_updated_at ON user_stickers;
CREATE TRIGGER user_stickers_updated_at BEFORE UPDATE ON user_stickers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS sticker_duplicates_updated_at ON sticker_duplicates;
CREATE TRIGGER sticker_duplicates_updated_at BEFORE UPDATE ON sticker_duplicates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS shared_collections_updated_at ON shared_collections;
CREATE TRIGGER shared_collections_updated_at BEFORE UPDATE ON shared_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS accounts_updated_at ON accounts;
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create personal account for new users
CREATE OR REPLACE FUNCTION create_personal_account()
RETURNS TRIGGER AS $$
DECLARE
  new_account_id UUID;
BEGIN
  INSERT INTO accounts (id, name, slug)
  VALUES (
    uuid_generate_v4(),
    COALESCE(NEW.full_name, split_part(NEW.email, '@', 1)) || '''s Album',
    'personal-' || NEW.id
  )
  RETURNING id INTO new_account_id;

  INSERT INTO account_members (account_id, user_id, role)
  VALUES (new_account_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_create_account ON users;
CREATE TRIGGER on_user_created_create_account
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_personal_account();

-- ============================================
-- 5. HELPER FUNCTIONS (003-indexes.sql)
-- ============================================

CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, ceil(random() * length(chars))::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_collection_progress(p_account_id UUID, p_album_id UUID)
RETURNS TABLE (
  total_stickers BIGINT,
  owned_stickers BIGINT,
  missing_stickers BIGINT,
  progress_percentage DECIMAL,
  total_duplicates BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id)::BIGINT as total_stickers,
    COUNT(DISTINCT us.id)::BIGINT as owned_stickers,
    (COUNT(DISTINCT s.id) - COUNT(DISTINCT us.id))::BIGINT as missing_stickers,
    ROUND(
      (COUNT(DISTINCT us.id)::DECIMAL / NULLIF(COUNT(DISTINCT s.id), 0)) * 100, 2
    ) as progress_percentage,
    COALESCE(SUM(sd.quantity), 0)::BIGINT as total_duplicates
  FROM stickers s
  LEFT JOIN user_stickers us ON s.id = us.sticker_id AND us.account_id = p_account_id
  LEFT JOIN sticker_duplicates sd ON s.id = sd.sticker_id AND sd.account_id = p_account_id
  WHERE s.album_id = p_album_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. RLS POLICIES (002-rls-policies.sql + 004)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- Users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Accounts
DROP POLICY IF EXISTS "Members can view account" ON accounts;
CREATE POLICY "Members can view account" ON accounts FOR SELECT
  USING (id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Owner can update account" ON accounts;
CREATE POLICY "Owner can update account" ON accounts FOR UPDATE
  USING (id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- Account members
DROP POLICY IF EXISTS "Members can view account members" ON account_members;
CREATE POLICY "Members can view account members" ON account_members FOR SELECT
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins can manage members" ON account_members;
CREATE POLICY "Admins can manage members" ON account_members FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
DROP POLICY IF EXISTS "Admins can update members" ON account_members;
CREATE POLICY "Admins can update members" ON account_members FOR UPDATE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));
DROP POLICY IF EXISTS "Admins can delete members" ON account_members;
CREATE POLICY "Admins can delete members" ON account_members FOR DELETE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

-- User stickers (account-scoped)
DROP POLICY IF EXISTS "Account members can view stickers" ON user_stickers;
CREATE POLICY "Account members can view stickers" ON user_stickers FOR SELECT
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Account members can insert stickers" ON user_stickers;
CREATE POLICY "Account members can insert stickers" ON user_stickers FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can update own stickers" ON user_stickers;
CREATE POLICY "Account members can update own stickers" ON user_stickers FOR UPDATE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can delete own stickers" ON user_stickers;
CREATE POLICY "Account members can delete own stickers" ON user_stickers FOR DELETE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());

-- Sticker duplicates (account-scoped)
DROP POLICY IF EXISTS "Account members can view duplicates" ON sticker_duplicates;
CREATE POLICY "Account members can view duplicates" ON sticker_duplicates FOR SELECT
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Account members can insert duplicates" ON sticker_duplicates;
CREATE POLICY "Account members can insert duplicates" ON sticker_duplicates FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can update own duplicates" ON sticker_duplicates;
CREATE POLICY "Account members can update own duplicates" ON sticker_duplicates FOR UPDATE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can delete own duplicates" ON sticker_duplicates;
CREATE POLICY "Account members can delete own duplicates" ON sticker_duplicates FOR DELETE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());

-- Shared collections (account-scoped)
DROP POLICY IF EXISTS "Anyone can view public shared collections" ON shared_collections;
CREATE POLICY "Anyone can view public shared collections" ON shared_collections FOR SELECT
  USING (is_public = TRUE);
DROP POLICY IF EXISTS "Account members can view own shared collections" ON shared_collections;
CREATE POLICY "Account members can view own shared collections" ON shared_collections FOR SELECT
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Account members can create shared collection" ON shared_collections;
CREATE POLICY "Account members can create shared collection" ON shared_collections FOR INSERT
  WITH CHECK (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can update shared collection" ON shared_collections;
CREATE POLICY "Account members can update shared collection" ON shared_collections FOR UPDATE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());
DROP POLICY IF EXISTS "Account members can delete shared collection" ON shared_collections;
CREATE POLICY "Account members can delete shared collection" ON shared_collections FOR DELETE
  USING (account_id IN (SELECT account_id FROM account_members WHERE user_id = auth.uid()) AND user_id = auth.uid());

-- Audit logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7. SEED DATA
-- ============================================

-- Sticker types
INSERT INTO sticker_types (code, name, description) VALUES
  ('player', 'Jugador', 'Lámina de jugador'),
  ('team', 'Selección', 'Lámina de selección'),
  ('stadium', 'Estadio', 'Lámina de estadio'),
  ('emblem', 'Escudo', 'Lámina de escudo'),
  ('special', 'Especial', 'Lámina especial'),
  ('action', 'Acción', 'Lámina de acción'),
  ('legend', 'Leyenda', 'Lámina de leyenda')
ON CONFLICT (code) DO NOTHING;

-- Confederations
INSERT INTO confederations (code, name, region, color) VALUES
  ('CONMEBOL', 'Sudamérica', 'América del Sur', '#10b981'),
  ('UEFA', 'Europa', 'Europa', '#3b82f6'),
  ('CONCACAF', 'Norteamérica', 'Norteamérica, Centroamérica y Caribe', '#f59e0b'),
  ('CAF', 'África', 'África', '#ef4444'),
  ('AFC', 'Asia', 'Asia', '#8b5cf6'),
  ('OFC', 'Oceanía', 'Oceanía', '#06b6d4')
ON CONFLICT (code) DO NOTHING;

-- Album
INSERT INTO albums (id, name, year, tournament_type, description, total_stickers, special_stickers, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'FIFA World Cup 2026',
  2026,
  'world_cup',
  'Álbum oficial del Mundial 2026',
  100,
  10,
  true
) ON CONFLICT (id) DO NOTHING;
