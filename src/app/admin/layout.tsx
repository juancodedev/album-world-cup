import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSideClient } from '../../infrastructure/database/supabase.server';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'cl.jmunoz@gmail.com';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-6">
          <Link href="/admin/seed" className="font-bold text-indigo-600">
            Admin Panel
          </Link>
          <Link href="/admin/albums" className="text-sm text-gray-600 hover:text-gray-900">
            Álbumes
          </Link>
          <Link href="/admin/seed" className="text-sm text-gray-600 hover:text-gray-900">
            Láminas
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 ml-auto">
            ← Volver al dashboard
          </Link>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
