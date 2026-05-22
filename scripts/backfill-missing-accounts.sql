-- Backfill: Create public.users records for existing auth.users that don't have one
INSERT INTO public.users (email, full_name, auth_provider, auth_uid)
SELECT
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  COALESCE(au.raw_app_meta_data->>'provider', 'email'),
  au.id
FROM auth.users au
WHERE au.id::text NOT IN (SELECT auth_uid FROM public.users WHERE auth_uid IS NOT NULL)
ON CONFLICT (auth_uid) DO NOTHING;
