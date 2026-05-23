'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { RankingScreen } from '../../../../presentation/components/tracker/RankingScreen';
import { DashboardLayout } from '../../../../presentation/layouts/DashboardLayout';

interface RankingEntry {
  userId: string;
  name: string;
  avatar: string;
  owned: number;
  total: number;
  percentage: number;
}

export default function RankingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      fetch('/api/ranking')
        .then(res => res.json())
        .then(json => {
          setData(json.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 rounded-2xl shimmer" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <RankingScreen data={data} currentUserId={user.id} />
        )}
      </div>
    </DashboardLayout>
  );
}
