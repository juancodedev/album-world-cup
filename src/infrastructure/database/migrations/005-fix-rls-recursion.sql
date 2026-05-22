-- 005-fix-rls-recursion.sql
-- Fix PostgREST error 42P17 (infinite recursion in RLS policies)
-- The policies on account_members self-reference account_members, causing recursion
-- Solution: use a SECURITY DEFINER function that bypasses RLS to get user's account IDs

-- Create function to get user account IDs without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_account_ids_for_user()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id FROM account_members WHERE user_id = auth.uid();
$$;

-- Fix accounts policies
DROP POLICY IF EXISTS "Members can view account" ON accounts;
CREATE POLICY "Members can view account"
  ON accounts FOR SELECT
  USING (id IN (SELECT public.get_account_ids_for_user()));

DROP POLICY IF EXISTS "Owner can update account" ON accounts;
CREATE POLICY "Owner can update account"
  ON accounts FOR UPDATE
  USING (
    id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Fix account_members policies (these were the ones causing recursion)
DROP POLICY IF EXISTS "Members can view account members" ON account_members;
CREATE POLICY "Members can view account members"
  ON account_members FOR SELECT
  USING (account_id IN (SELECT public.get_account_ids_for_user()));

DROP POLICY IF EXISTS "Admins can manage members" ON account_members;
CREATE POLICY "Admins can manage members"
  ON account_members FOR INSERT
  WITH CHECK (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update members" ON account_members;
CREATE POLICY "Admins can update members"
  ON account_members FOR UPDATE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete members" ON account_members;
CREATE POLICY "Admins can delete members"
  ON account_members FOR DELETE
  USING (
    account_id IN (
      SELECT account_id FROM account_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Fix user_stickers policies
DROP POLICY IF EXISTS "Account members can view stickers" ON user_stickers;
DROP POLICY IF EXISTS "Account members can insert stickers" ON user_stickers;
DROP POLICY IF EXISTS "Account members can update own stickers" ON user_stickers;
DROP POLICY IF EXISTS "Account members can delete own stickers" ON user_stickers;

CREATE POLICY "Account members can view stickers"
  ON user_stickers FOR SELECT
  USING (account_id IN (SELECT public.get_account_ids_for_user()));

CREATE POLICY "Account members can insert stickers"
  ON user_stickers FOR INSERT
  WITH CHECK (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update own stickers"
  ON user_stickers FOR UPDATE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete own stickers"
  ON user_stickers FOR DELETE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

-- Fix sticker_duplicates policies
DROP POLICY IF EXISTS "Account members can view duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Account members can insert duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Account members can update own duplicates" ON sticker_duplicates;
DROP POLICY IF EXISTS "Account members can delete own duplicates" ON sticker_duplicates;

CREATE POLICY "Account members can view duplicates"
  ON sticker_duplicates FOR SELECT
  USING (account_id IN (SELECT public.get_account_ids_for_user()));

CREATE POLICY "Account members can insert duplicates"
  ON sticker_duplicates FOR INSERT
  WITH CHECK (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update own duplicates"
  ON sticker_duplicates FOR UPDATE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete own duplicates"
  ON sticker_duplicates FOR DELETE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

-- Fix shared_collections policies
DROP POLICY IF EXISTS "Anyone can view public shared collections" ON shared_collections;
DROP POLICY IF EXISTS "Account members can view own shared collections" ON shared_collections;
DROP POLICY IF EXISTS "Account members can create shared collection" ON shared_collections;
DROP POLICY IF EXISTS "Account members can update shared collection" ON shared_collections;
DROP POLICY IF EXISTS "Account members can delete shared collection" ON shared_collections;

CREATE POLICY "Anyone can view public shared collections"
  ON shared_collections FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Account members can view own shared collections"
  ON shared_collections FOR SELECT
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
  );

CREATE POLICY "Account members can create shared collection"
  ON shared_collections FOR INSERT
  WITH CHECK (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can update shared collection"
  ON shared_collections FOR UPDATE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );

CREATE POLICY "Account members can delete shared collection"
  ON shared_collections FOR DELETE
  USING (
    account_id IN (SELECT public.get_account_ids_for_user())
    AND user_id = auth.uid()
  );
