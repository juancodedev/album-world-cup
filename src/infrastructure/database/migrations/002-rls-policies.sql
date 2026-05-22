-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- User stickers policies
CREATE POLICY "Users can view own stickers"
  ON user_stickers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stickers"
  ON user_stickers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stickers"
  ON user_stickers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own stickers"
  ON user_stickers FOR DELETE
  USING (user_id = auth.uid());

-- Sticker duplicates policies
CREATE POLICY "Users can view own duplicates"
  ON sticker_duplicates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own duplicates"
  ON sticker_duplicates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own duplicates"
  ON sticker_duplicates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own duplicates"
  ON sticker_duplicates FOR DELETE
  USING (user_id = auth.uid());

-- Shared collections policies
CREATE POLICY "Anyone can view public collections"
  ON shared_collections FOR SELECT
  USING (is_public = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can create own collection"
  ON shared_collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own collection"
  ON shared_collections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own collection"
  ON shared_collections FOR DELETE
  USING (user_id = auth.uid());

-- Audit logs policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
