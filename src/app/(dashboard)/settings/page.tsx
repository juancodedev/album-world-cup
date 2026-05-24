'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Check, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut, refetch } = useAuth();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.fullName) setName(user.fullName);
  }, [user?.fullName]);

  const needsSetup = !!user && !user.fullName;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: trimmed }),
      });

      if (!res.ok) throw new Error();

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await refetch();
    } catch {
      alert('Error al guardar el nombre. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
  };

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
        {needsSetup && (
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center space-y-4">
            <div className="text-3xl">👋</div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                ¡Bienvenido! Antes de empezar, dinos tu nombre
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Así aparecerás en el ranking y tus amigos podrán identificarte.
              </p>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-gray-900">Configuración</h1>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tu nombre"
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={60}
              autoFocus={needsSetup}
            />
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="h-10 px-4"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                'Guardar'
              )}
            </Button>
          </div>
        </div>
        {user.email === 'cl.jmunoz@gmail.com' && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Administración</h3>
            <a
              href="/admin/users"
              className="flex items-center gap-2 w-full h-10 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
            >
              Gestión de Usuarios
            </a>
          </div>
        )}
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
