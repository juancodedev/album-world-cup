'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSharedCollection } from '../../../presentation/hooks/useShare';
import { LoadingSpinner } from '../../../presentation/components/common/LoadingSpinner';
import { EmptyState } from '../../../presentation/components/common/EmptyState';
import { FLAG_EMOJI } from '../../../shared/constants/flags.constants';

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

        {share.showDuplicates && share.teams.some(t => t.stickers.some(s => s.duplicateCount > 0)) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Repetidas</h3>
            <p className="text-sm text-gray-600">
              {share.teams.reduce((sum, t) => sum + t.stickers.reduce((a, s) => a + s.duplicateCount, 0), 0)} stickers repetidos
            </p>
          </div>
        )}

        {share.teams.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Progreso por Selección</h3>
            <div className="space-y-2">
              {share.teams.map((team) => (
                <div key={team.teamId} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div
                    onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <span className="text-lg">{FLAG_EMOJI[team.teamCode] || team.teamFlag || '🏳️'}</span>
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
                  {expandedTeam === team.teamId && (
                    <div className="px-3 pb-3 border-t border-gray-100">
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 pt-3">
                        {team.stickers.map((s) => {
                          const stickerCode = `${team.teamCode}${s.position}`;
                          const dupCount = share.showDuplicates ? s.duplicateCount : 0;
                          return (
                            <div
                              key={s.number}
                              className={`
                                aspect-[3/4] rounded text-[9px] font-bold flex flex-col items-center justify-center relative
                                ${s.owned
                                  ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-sm'
                                  : 'bg-gray-100 border border-dashed border-gray-200 text-gray-400'
                                }
                              `}
                            >
                              <span>{s.owned ? '✓' : stickerCode}</span>
                              {dupCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[7px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow">
                                  {dupCount}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

      </div>
    </div>
  );
}
