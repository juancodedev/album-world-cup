'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';
import { CollectionStatsDTO } from '../../application/dtos/collection-stats.dto';

export function useCollection(userId: string, albumId: string) {
  const queryClient = useQueryClient();
  const collectionService = container.getCollectionService();

  const collectionQuery = useQuery<StickerDTO[]>({
    queryKey: ['collection', userId, albumId],
    queryFn: () => collectionService.getUserCollection(userId, albumId),
    enabled: !!userId && !!albumId,
  });

  const statsQuery = useQuery<CollectionStatsDTO>({
    queryKey: ['collection-stats', userId, albumId],
    queryFn: () => collectionService.getStats(userId, albumId),
    enabled: !!userId && !!albumId,
  });

  const addStickerMutation = useMutation({
    mutationFn: (stickerId: string) =>
      collectionService.addStickerToCollection({ userId, stickerId, albumId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', userId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', userId, albumId] });
    },
  });

  const incrementDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, quantity }: { stickerId: string; quantity?: number }) =>
      collectionService.incrementDuplicateCount({ userId, stickerId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', userId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', userId, albumId] });
    },
  });

  const removeDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, quantity }: { stickerId: string; quantity?: number }) =>
      collectionService.removeDuplicateCount({ userId, stickerId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', userId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', userId, albumId] });
    },
  });

  return {
    collection: collectionQuery.data ?? [],
    stats: statsQuery.data ?? null,
    isLoading: collectionQuery.isLoading || statsQuery.isLoading,
    error: collectionQuery.error || statsQuery.error,
    addSticker: addStickerMutation.mutate,
    incrementDuplicate: incrementDuplicateMutation.mutate,
    removeDuplicate: removeDuplicateMutation.mutate,
    isAdding: addStickerMutation.isPending,
  };
}
