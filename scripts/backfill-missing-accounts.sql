-- Backfill: Create public.users records for existing auth.users that don't have one
-- Uses auth.users.id as public.users.id so account_members.user_id is consistent
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
WHERE au.id::text NOT IN (SELECT auth_uid FROM public.users WHERE auth_uid IS NOT NULL)
ON CONFLICT (id) DO NOTHING;
