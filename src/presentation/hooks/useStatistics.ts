'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '../../di/container';
import { Progress } from '../../domain/value-objects/progress.vo';

export function useStatistics(accountId: string, albumId: string) {
  const statsService = container.getStatisticsService();

  const progressQuery = useQuery<Progress>({
    queryKey: ['progress', accountId, albumId],
    queryFn: () => statsService.getUserProgress(accountId, albumId),
    enabled: !!accountId && !!albumId,
  });

  const teamProgressQuery = useQuery<Record<string, Progress>>({
    queryKey: ['team-progress', accountId, albumId],
    queryFn: () => statsService.getTeamProgress(accountId, albumId),
    enabled: !!accountId && !!albumId,
  });

  return {
    progress: progressQuery.data ?? null,
    teamProgress: teamProgressQuery.data ?? {},
    isLoading: progressQuery.isLoading,
  };
}
