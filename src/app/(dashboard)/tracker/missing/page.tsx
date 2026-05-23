'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { useTracker } from '../../../../presentation/hooks/useTracker';
import { MissingListScreen } from '../../../../presentation/components/tracker/MissingListScreen';
import { DashboardLayout } from '../../../../presentation/layouts/DashboardLayout';

export default function MissingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading, addSticker, ownedSet } = useTracker();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  const handleToggle = (stickerId: string) => {
    if (!ownedSet.has(stickerId)) {
      addSticker(stickerId);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {isLoading || !data ? (
          <div className="space-y-4">
            <div className="h-12 rounded-2xl shimmer" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <MissingListScreen
            groups={data.groups}
            specials={data.specials}
            ownedSet={ownedSet}
            onToggle={handleToggle}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
