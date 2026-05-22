-- ============================================
-- MULTI-TENANT: ACCOUNTS & MEMBERSHIPS
-- ============================================

-- 1. ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACCOUNT MEMBERS TABLE
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

-- 3. ADD account_id TO EXISTING TABLES
ALTER TABLE user_stickers ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE sticker_duplicates ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
ALTER TABLE shared_collections ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

-- Make account_id NOT NULL after adding the column
-- (first backfill existing data, then add NOT NULL constraint)
-- For existing data, create a default account per user
DO $$
DECLARE
  user_rec RECORD;
  account_id UUID;
BEGIN
  FOR user_rec IN SELECT id, email FROM users WHERE deleted_at IS NULL LOOP
    -- Create a personal account for each existing user
    INSERT INTO accounts (id, name, slug)
    VALUES (
      uuid_generate_v4(),
      COALESCE(
        (SELECT full_name FROM users WHERE id = user_rec.id),
        split_part(user_rec.email, '@', 1)
      ) || '''s Album',
      'personal-' || user_rec.id
    )
    RETURNING id INTO account_id;

    -- Add user as owner
    INSERT INTO account_members (account_id, user_id, role)
    VALUES (account_id, user_rec.id, 'owner');

    -- Assign existing data to this account
    UPDATE user_stickers SET account_id = account_id WHERE user_id = user_rec.id AND account_id IS NULL;
    UPDATE sticker_duplicates SET account_id = account_id WHERE user_id = user_rec.id AND account_id IS NULL;
    UPDATE shared_collections SET account_id = account_id WHERE user_id = user_rec.id AND account_id IS NULL;
  END LOOP;
END $$;

-- Now make account_id NOT NULL
ALTER TABLE user_stickers ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE sticker_duplicates ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE shared_collections ALTER COLUMN account_id SET NOT NULL;

-- 4. RLS POLICIES
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;

-- Accounts: members can view, only owner/admin can update
CREATE POLICY "Members can view account"
  ON accounts FOR SELECT
  USING (
    id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can update account"
  ON accounts FOR UPDATE
  USING (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Account members: view own memberships, admins can manage
CREATE POLICY "Members can view account members"
  ON account_members FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage members"
  ON account_members FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can update members"
  ON account_members FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can delete members"
  ON account_members FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Update existing RLS policies for user_stickers, sticker_duplicates, shared_collections
-- to check account membership instead of direct user_id match

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own stickers" ON user_stickers;
DROP POLICY IF EXISTS "Users can insert own stickers" ON user_stickers;
DROP POLICY IF EXISTS "Users can update own stickers" ON user_stickers;
DROP POLICY IF EXISTS "Users can delete own stickers" ON user_stickers;
DROP POLICY IF EXISTS "Users can view own duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Users can insert own duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Users can update own duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Users can delete own duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Users can create own collection" ON shared_collections;
DROP POLICY IF EXISTS "Users can update own collection" ON shared_collections;
DROP POLICY IF EXISTS "Users can delete own collection" ON shared_collections;

-- User stickers: account-scoped
CREATE POLICY "Account members can view stickers"
  ON user_stickers FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account members can insert stickers"
  ON user_stickers FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update own stickers"
  ON user_stickers FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete own stickers"
  ON user_stickers FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Sticker duplicates: account-scoped
CREATE POLICY "Account members can view duplicates"
  ON sticker_duplicates FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account members can insert duplicates"
  ON sticker_duplicates FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update own duplicates"
  ON sticker_duplicates FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete own duplicates"
  ON sticker_duplicates FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Shared collections: account-scoped
CREATE POLICY "Anyone can view public shared collections"
  ON shared_collections FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Account members can view own shared collections"
  ON shared_collections FOR SELECT
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Account members can create shared collection"
  ON shared_collections FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update shared collection"
  ON shared_collections FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete shared collection"
  ON shared_collections FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON account_members(account_id);
CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON account_members(user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_role ON account_members(role);
CREATE INDEX IF NOT EXISTS idx_user_stickers_account_id ON user_stickers(account_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_account_id ON sticker_duplicates(account_id);
CREATE INDEX IF NOT EXISTS idx_shared_account_id ON shared_collections(account_id);

-- 6. TRIGGERS
CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. FUNCTION: Auto-create personal account for new users
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

-- 8. Update get_collection_progress to support account_id
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
