'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-4">Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-lg">
        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName || 'Usuario'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Cuenta</h3>
          <Button variant="destructive" onClick={signOut} className="w-full">
            Cerrar sesión
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
