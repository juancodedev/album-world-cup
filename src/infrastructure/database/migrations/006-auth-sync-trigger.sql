-- 006-auth-sync-trigger.sql
-- Automatically create user in public.users when a new auth.users row is created
-- This ensures every signed-up user gets a personal account

-- Function to sync auth user to public users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (email, full_name, avatar_url, auth_provider, auth_uid)
  VALUES (
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

-- Trigger on auth.users (runs after every signup)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
