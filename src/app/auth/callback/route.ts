import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient } from '../../../infrastructure/database/supabase.server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.user) {
      const user = data.session.user;
      const email = user.email || '';
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      const authProvider = user.app_metadata?.provider === 'google' ? 'google' : 'email';

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('auth_uid', user.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email,
          full_name: fullName,
          avatar_url: avatarUrl || null,
          auth_provider: authProvider,
          auth_uid: user.id,
        }).maybeSingle();

        if (insertError) {
          console.error('Failed to create user in public.users:', insertError.message);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
