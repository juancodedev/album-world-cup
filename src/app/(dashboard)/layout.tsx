import { redirect } from 'next/navigation';
import { createServerSideClient } from '../../infrastructure/database/supabase.server';
import { ToasterProvider } from './ToasterProvider';

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

  return (
    <>
      {children}
      <ToasterProvider />
    </>
  );
}
