import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSideClient } from '../../infrastructure/database/supabase.server';
import { isFiguritasAppEnabled } from '../../config/figuritas-app';

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'cl.jmunoz@gmail.com';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.email !== ADMIN_EMAIL) {
    redirect('/tracker');
  }

  const figuritasEnabled = isFiguritasAppEnabled();

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
          <div className="flex items-center gap-2 ml-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                figuritasEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  figuritasEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              Figuritas App: {figuritasEnabled ? 'ACTIVO' : 'INACTIVO'}
            </span>
            <Link href="/tracker" className="text-sm text-gray-400 hover:text-gray-600">
              ← Volver
            </Link>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
