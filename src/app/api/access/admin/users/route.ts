import { NextRequest, NextResponse } from 'next/server';
import { createServerSideClient, createServiceRoleClient } from '../../../../../infrastructure/database/supabase.server';
import { SUPABASE_TABLES } from '../../../../../infrastructure/database/supabase.config';

const ADMIN_EMAIL = 'cl.jmunoz@gmail.com';

export async function GET() {
  const supabase = await createServerSideClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser?.email || authUser.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: 'config_error' }, { status: 500 });
  }

  const { data: users } = await admin
    .from(SUPABASE_TABLES.users)
    .select('id, email, full_name, access_status, trial_started_at, trial_ends_at, created_at')
    .order('created_at', { ascending: false });

  const { data: logs } = await admin
    .from(SUPABASE_TABLES.accessLogs)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  return NextResponse.json({ users: users || [], logs: logs || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSideClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser?.email || authUser.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: 'config_error' }, { status: 500 });
  }

  const body = await request.json();
  const { userId, action, notes, trialEndsAt } = body;

  if (!userId || !action || !['enable', 'disable'].includes(action)) {
    return NextResponse.json({ error: 'userId and action (enable|disable) required' }, { status: 400 });
  }

  const newStatus = action === 'enable' ? 'active' : 'disabled';
  const logReason = action === 'enable' ? 'admin_enabled' : 'admin_disabled';
  const updateData: Record<string, string> = { access_status: newStatus };

  if (action === 'enable' && trialEndsAt) {
    updateData.trial_ends_at = new Date(trialEndsAt).toISOString();
  }

  await admin.from(SUPABASE_TABLES.users).update(updateData).eq('id', userId);
  await admin.from(SUPABASE_TABLES.accessLogs).insert({
    user_id: userId,
    action: action === 'enable' ? 'enabled' : 'disabled',
    reason: logReason,
    notes: notes || null,
    created_by: authUser.id,
  });

  return NextResponse.json({ success: true });
}
