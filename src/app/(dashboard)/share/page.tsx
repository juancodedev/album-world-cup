'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useShare } from '../../../presentation/hooks/useShare';
import { useCurrentAccount } from '../../../presentation/hooks/useCurrentAccount';
import { ShareModal } from '../../../presentation/components/share/ShareModal';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';

export default function SharePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const { data: defaultAccount } = useCurrentAccount(user?.id);
  const { shareCode, generateCode, isGenerating } = useShare(defaultAccount?.id, user?.id);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div>Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-lg">
        <h1 className="text-xl font-bold text-gray-900">Compartir</h1>

        <div className="bg-white rounded-xl border p-6 text-center space-y-4">
          <div className="text-4xl">📤</div>
          <h2 className="font-semibold text-gray-900">Comparte tu progreso</h2>
          <p className="text-sm text-gray-500">
            Genera un enlace único para compartir tu colección con amigos y familiares
          </p>

          <ShareModal
            shareCode={shareCode?.shareCode || null}
            onGenerate={() => generateCode()}
            isGenerating={isGenerating}
          />

          {shareCode && (
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-blue-800 mb-2">Tu colección es:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>{shareCode.isPublic ? '✓ Pública' : '✓ Privada'}</li>
                <li>{shareCode.showDuplicates ? '✓ Mostrar repetidas' : '✗ Ocultar repetidas'}</li>
                <li>{shareCode.showMissing ? '✓ Mostrar faltantes' : '✗ Ocultar faltantes'}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
