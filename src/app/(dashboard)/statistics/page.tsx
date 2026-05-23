'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useStatistics } from '../../../presentation/hooks/useStatistics';
import { useCollection } from '../../../presentation/hooks/useCollection';
import { useCurrentAccount } from '../../../presentation/hooks/useCurrentAccount';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { CollectionStats } from '../../../presentation/components/collection/CollectionStats';
import { ProgressCard } from '../../../presentation/components/dashboard/ProgressCard';
import { DashboardSkeleton } from '../../../presentation/components/common/SkeletonLoader';
import { EmptyState } from '../../../presentation/components/common/EmptyState';

const DEFAULT_ALBUM_ID = '00000000-0000-0000-0000-000000000001';

export default function StatisticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const { data: defaultAccount } = useCurrentAccount(user?.id);
  const accountId = defaultAccount?.id || '';
  const { progress, teamProgress } = useStatistics(accountId, DEFAULT_ALBUM_ID);
  const { stats, isLoading } = useCollection(accountId, DEFAULT_ALBUM_ID);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Estadísticas</h1>

        {isLoading ? (
          <DashboardSkeleton />
        ) : !progress ? (
          <EmptyState
            icon="📊"
            title="Sin datos aún"
            description="Comienza a agregar láminas a tu colección para ver estadísticas"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ProgressCard
                title="Completado"
                percentage={progress.percentage}
                current={progress.owned}
                total={progress.total}
                icon="🏆"
                color="green"
              />
              <ProgressCard
                title="Obtenidas"
                percentage={Math.round((progress.owned / progress.total) * 100)}
                current={progress.owned}
                total={progress.total}
                icon="✓"
                color="blue"
              />
              <ProgressCard
                title="Faltantes"
                percentage={Math.round((progress.missing / progress.total) * 100)}
                current={progress.missing}
                total={progress.total}
                icon="✗"
                color="amber"
              />
              <ProgressCard
                title="Repetidas"
                percentage={Math.min(100, progress.duplicates * 10)}
                current={progress.duplicates}
                total={Math.max(1, progress.duplicates)}
                icon="🔄"
                color="purple"
              />
            </div>

            {stats && <CollectionStats stats={stats} />}

            {teamProgress.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Progreso detallado por selección
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {teamProgress.map(tp => (
                    <div key={tp.teamId} className="bg-white rounded-xl border p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{tp.teamFlag || '🏳️'}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{tp.teamName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{tp.teamCode}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-gray-900">{tp.percentage}%</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1 mb-1.5">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${tp.percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {tp.owned}/{tp.total} stickers
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
