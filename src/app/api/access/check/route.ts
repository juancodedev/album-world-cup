import { NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../../infrastructure/database/supabase.config';

const ADMIN_EMAIL = 'cl.jmunoz@gmail.com';

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    return NextResponse.json({ access: false }, { status: 401 });
  }

  if (authUser.email === ADMIN_EMAIL) {
    return NextResponse.json({ access: true, status: 'active' });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ access: false, reason: 'config_error' });
  }

  let { data: user } = await admin
    .from(SUPABASE_TABLES.users)
    .select('id, access_status, trial_started_at, trial_ends_at')
    .eq('auth_uid', authUser.id)
    .maybeSingle();

  if (!user && authUser.email) {
    const { data: emailUser } = await admin
      .from(SUPABASE_TABLES.users)
      .select('id, access_status, trial_started_at, trial_ends_at')
      .eq('email', authUser.email)
      .maybeSingle();

    if (emailUser) {
      await admin.from(SUPABASE_TABLES.users)
        .update({ auth_uid: authUser.id })
        .eq('id', emailUser.id);
      user = emailUser;
    }
  }

  if (!user) {
    return NextResponse.json({ access: false, reason: 'user_not_found' });
  }

  const now = new Date().toISOString();

  if (user.access_status === 'trial' && !user.trial_started_at) {
    const trialStart = now;
    const trialEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    await admin.from(SUPABASE_TABLES.users).update({
      trial_started_at: trialStart,
      trial_ends_at: trialEnd,
      access_status: 'trial',
    }).eq('id', user.id);

    await admin.from(SUPABASE_TABLES.accessLogs).insert({
      user_id: user.id,
      action: 'enabled',
      reason: 'trial_started',
      created_by: user.id,
    });

    return NextResponse.json({ access: true, status: 'trial', trial_ends_at: trialEnd, remainingDays: 10 });
  }

  if (user.access_status === 'trial') {
    if (user.trial_ends_at && user.trial_ends_at < now) {
      await admin.from(SUPABASE_TABLES.users).update({ access_status: 'expired' }).eq('id', user.id);
      await admin.from(SUPABASE_TABLES.accessLogs).insert({
        user_id: user.id,
        action: 'disabled',
        reason: 'trial_expired',
        created_by: user.id,
      });
      return NextResponse.json({ access: false, reason: 'trial_expired' });
    }
    const remainingDays = user.trial_ends_at
      ? Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 10;
    return NextResponse.json({ access: true, status: 'trial', remainingDays });
  }

  if (user.access_status === 'expired' || user.access_status === 'disabled') {
    return NextResponse.json({ access: false, reason: user.access_status });
  }

  return NextResponse.json({ access: true, status: user.access_status });
}
