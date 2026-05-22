'use client';

import { useParams } from 'next/navigation';
import { useSharedCollection } from '../../../presentation/hooks/useShare';
import { LoadingSpinner } from '../../../presentation/components/common/LoadingSpinner';
import { EmptyState } from '../../../presentation/components/common/EmptyState';

export default function SharedCollectionPage() {
  const params = useParams();
  const code = params.code as string;
  const { data: share, isLoading, error } = useSharedCollection(code);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <EmptyState
          icon="🔗"
          title="Colección no encontrada"
          description="El enlace no es válido o ha expirado"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">AW</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{share.userName}</h1>
          <p className="text-sm text-gray-500">Colección del Mundial 2026</p>
        </div>

        {share.stats && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Progreso</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{share.stats.percentage}%</p>
                <p className="text-xs text-gray-500">Completado</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{share.stats.owned}</p>
                <p className="text-xs text-gray-500">Obtenidas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{share.stats.missing}</p>
                <p className="text-xs text-gray-500">Faltantes</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400">
          Creado con Album World Cup 2026
        </div>
      </div>
    </div>
  );
}
