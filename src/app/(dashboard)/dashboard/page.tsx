'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { useStatistics } from '../../../presentation/hooks/useStatistics';
import { useCollection } from '../../../presentation/hooks/useCollection';
import { DashboardHero } from '../../../presentation/components/dashboard/DashboardHero';
import { RecentStickers } from '../../../presentation/components/dashboard/RecentStickers';
import { CollectionStats } from '../../../presentation/components/collection/CollectionStats';
import { DashboardLayout } from '../../../presentation/layouts/DashboardLayout';
import { DashboardSkeleton } from '../../../presentation/components/common/SkeletonLoader';
import { EmptyState } from '../../../presentation/components/common/EmptyState';

const DEFAULT_ALBUM_ID = '00000000-0000-0000-0000-000000000001';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const userId = user?.id || '';
  const { progress } = useStatistics(userId, DEFAULT_ALBUM_ID);
  const { stats, isLoading } = useCollection(userId, DEFAULT_ALBUM_ID);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="⚠️"
          title="Error al cargar"
          description={error}
          action={{ label: 'Intentar de nuevo', onClick: () => setError(null) }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHero
          userName={user.fullName}
          total={progress?.total || 0}
          owned={progress?.owned || 0}
          duplicates={progress?.duplicates || 0}
          missing={progress?.missing || 0}
        />

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {stats && <CollectionStats stats={stats} />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
