-- Backfill: Create personal accounts for existing users without one
DO $$
DECLARE
  user_rec RECORD;
  new_account_id UUID;
BEGIN
  FOR user_rec IN
    SELECT u.id, u.email, u.full_name
    FROM users u
    WHERE u.deleted_at IS NULL
    AND u.id NOT IN (
      SELECT user_id FROM account_members WHERE role = 'owner'
    )
  LOOP
    INSERT INTO accounts (id, name, slug)
    VALUES (
      gen_random_uuid(),
      COALESCE(user_rec.full_name, split_part(user_rec.email, '@', 1)) || '''s Album',
      'personal-' || user_rec.id
    )
    RETURNING id INTO new_account_id;

    INSERT INTO account_members (account_id, user_id, role)
    VALUES (new_account_id, user_rec.id, 'owner');
  END LOOP;
END $$;
