'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSharedCollection } from '../../../presentation/hooks/useShare';
import { LoadingSpinner } from '../../../presentation/components/common/LoadingSpinner';
import { EmptyState } from '../../../presentation/components/common/EmptyState';

export default function SharedCollectionPage() {
  const params = useParams();
  const code = params.code as string;
  const { data: share, isLoading, error } = useSharedCollection(code);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

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
      <div className="max-w-lg mx-auto p-4 space-y-4">
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

        {share.teams.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Progreso por Selección</h3>
            <div className="space-y-2">
              {share.teams.map((team) => (
                <div key={team.teamId}>
                  <div
                    onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-lg">{team.teamFlag || '🏳️'}</span>
                    <span className="text-sm text-gray-700 flex-1 font-medium truncate">{team.teamName}</span>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${team.total > 0 ? (team.owned / team.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-14 text-right">
                      {team.owned}/{team.total}
                    </span>
                    <span className="text-gray-400 text-xs transition-transform" style={{ transform: expandedTeam === team.teamId ? 'rotate(180deg)' : 'none' }}>
                      ▾
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-center shadow-sm">
          <h3 className="text-white font-bold text-lg mb-2">¿Tú también coleccionas?</h3>
          <p className="text-blue-100 text-sm mb-4">
            Registra tus láminas, sigue tu progreso y compite con tus amigos.
          </p>
          <a
            href="/login"
            className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Comenzar ahora
          </a>
        </div>

        <div className="text-center text-xs text-gray-400">
          Creado por <a href="https://www.juancode.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Juan Muñoz</a>
        </div>
      </div>
    </div>
  );
}
