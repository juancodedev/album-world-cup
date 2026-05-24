-- 009-subscription-access.sql
-- Add trial/subscription columns to users + access audit log

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS access_status TEXT NOT NULL DEFAULT 'trial'
  CHECK (access_status IN ('trial', 'active', 'expired', 'disabled'));

CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('enabled', 'disabled')),
  reason TEXT NOT NULL CHECK (reason IN ('trial_started', 'trial_expired', 'admin_enabled', 'admin_disabled', 'payment_received')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at DESC);
