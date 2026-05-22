-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Stickers indexes
CREATE INDEX idx_stickers_album_id ON stickers(album_id);
CREATE INDEX idx_stickers_team_id ON stickers(team_id);
CREATE INDEX idx_stickers_player_id ON stickers(player_id);
CREATE INDEX idx_stickers_rarity ON stickers(rarity);
CREATE INDEX idx_stickers_number ON stickers(album_id, number);
CREATE INDEX idx_stickers_special ON stickers(is_special) WHERE is_special = TRUE;
CREATE INDEX idx_stickers_album_rarity ON stickers(album_id, rarity);

-- User stickers indexes
CREATE INDEX idx_user_stickers_user_id ON user_stickers(user_id);
CREATE INDEX idx_user_stickers_sticker_id ON user_stickers(sticker_id);
CREATE INDEX idx_user_stickers_obtained ON user_stickers(user_id, obtained_at DESC);

-- Duplicates indexes
CREATE INDEX idx_duplicates_user_id ON sticker_duplicates(user_id);
CREATE INDEX idx_duplicates_sticker_id ON sticker_duplicates(sticker_id);

-- Teams indexes
CREATE INDEX idx_teams_album_id ON teams(album_id);
CREATE INDEX idx_teams_confederation ON teams(confederation_id);

-- Players indexes
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_players_name_trgm ON players USING GIN (name gin_trgm_ops);

-- Shared collections indexes
CREATE INDEX idx_shared_user_id ON shared_collections(user_id);
CREATE INDEX idx_shared_code ON shared_collections(share_code);

-- Audit logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER albums_updated_at BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER stickers_updated_at BEFORE UPDATE ON stickers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_stickers_updated_at BEFORE UPDATE ON user_stickers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sticker_duplicates_updated_at BEFORE UPDATE ON sticker_duplicates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER shared_collections_updated_at BEFORE UPDATE ON shared_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
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

CREATE OR REPLACE FUNCTION get_collection_progress(p_user_id UUID, p_album_id UUID)
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
  LEFT JOIN user_stickers us ON s.id = us.sticker_id AND us.user_id = p_user_id
  LEFT JOIN sticker_duplicates sd ON s.id = sd.sticker_id AND sd.user_id = p_user_id
  WHERE s.album_id = p_album_id;
END;
$$ LANGUAGE plpgsql;
