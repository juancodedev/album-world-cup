'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '../../di/container';
import { Progress } from '../../domain/value-objects/progress.vo';

export function useStatistics(userId: string, albumId: string) {
  const statsService = container.getStatisticsService();

  const progressQuery = useQuery<Progress>({
    queryKey: ['progress', userId, albumId],
    queryFn: () => statsService.getUserProgress(userId, albumId),
    enabled: !!userId && !!albumId,
  });

  const teamProgressQuery = useQuery<Record<string, Progress>>({
    queryKey: ['team-progress', userId, albumId],
    queryFn: () => statsService.getTeamProgress(userId, albumId),
    enabled: !!userId && !!albumId,
  });

  return {
    progress: progressQuery.data ?? null,
    teamProgress: teamProgressQuery.data ?? {},
    isLoading: progressQuery.isLoading,
  };
}
