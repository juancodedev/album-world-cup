-- 008-backfill-auth-users.sql
-- Backfill missing auth.users entries into public.users and ensure trigger is in place

-- Create or replace the sync function (uses email prefix as fallback name)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, auth_provider, auth_uid)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.id
  )
  ON CONFLICT (auth_uid) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- Backfill: insert any auth.users that don't yet have a public.users row
INSERT INTO public.users (id, email, full_name, avatar_url, auth_provider, auth_uid)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  COALESCE(au.raw_app_meta_data->>'provider', 'email'),
  au.id
FROM auth.users au
LEFT JOIN public.users pu ON pu.auth_uid = au.id::text
WHERE pu.id IS NULL;
