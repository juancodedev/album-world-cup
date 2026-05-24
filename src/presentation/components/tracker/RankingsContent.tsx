'use client';

import { RankingScreen } from './RankingScreen';
import { DashboardLayout } from '../../layouts/DashboardLayout';

interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface RankingEntry {
  userId: string;
  name: string;
  avatar: string;
  owned: number;
  total: number;
  percentage: number;
}

interface RankingsContentProps {
  data: RankingEntry[];
  currentUserId: string | null;
  user: AppUser | null;
}

export function RankingsContent({ data, currentUserId, user }: RankingsContentProps) {
  const content = (
    <div className="max-w-3xl mx-auto">
      <RankingScreen data={data} currentUserId={currentUserId} />
    </div>
  );

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}
