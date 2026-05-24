'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../presentation/providers/AuthProvider';
import { RankingsContent } from '../../../../presentation/components/tracker/RankingsContent';

interface RankingEntry {
  userId: string;
  name: string;
  avatar: string;
  owned: number;
  total: number;
  percentage: number;
}

interface RankingResponse {
  data: RankingEntry[];
  currentUserId: string | null;
}

export default function RankingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [response, setResponse] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetch('/api/ranking')
        .then(res => res.json())
        .then(json => {
          setResponse(json);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-full max-w-xl px-4">
          <div className="h-12 rounded-2xl shimmer" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <RankingsContent
      data={response?.data || []}
      currentUserId={response?.currentUserId || null}
      user={user}
    />
  );
}
