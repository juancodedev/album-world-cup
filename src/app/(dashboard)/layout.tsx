import { redirect } from 'next/navigation';
import { createServerSideClient } from '../../infrastructure/database/supabase.server';

export const dynamic = 'force-dynamic';

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return children;
}
