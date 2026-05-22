'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';
import { CollectionStatsDTO } from '../../application/dtos/collection-stats.dto';

export function useCollection(accountId: string, albumId: string) {
  const queryClient = useQueryClient();
  const collectionService = container.getCollectionService();

  const collectionQuery = useQuery<StickerDTO[]>({
    queryKey: ['collection', accountId, albumId],
    queryFn: () => collectionService.getUserCollection(accountId, albumId),
    enabled: !!accountId && !!albumId,
  });

  const statsQuery = useQuery<CollectionStatsDTO>({
    queryKey: ['collection-stats', accountId, albumId],
    queryFn: () => collectionService.getStats(accountId, albumId),
    enabled: !!accountId && !!albumId,
  });

  const addStickerMutation = useMutation({
    mutationFn: ({ stickerId, userId }: { stickerId: string; userId: string }) =>
      collectionService.addStickerToCollection({ accountId, userId, stickerId, albumId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', accountId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', accountId, albumId] });
    },
  });

  const incrementDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, userId, quantity }: { stickerId: string; userId: string; quantity?: number }) =>
      collectionService.incrementDuplicateCount({ accountId, userId, stickerId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', accountId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', accountId, albumId] });
    },
  });

  const removeDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, userId, quantity }: { stickerId: string; userId: string; quantity?: number }) =>
      collectionService.removeDuplicateCount({ accountId, userId, stickerId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', accountId, albumId] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats', accountId, albumId] });
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
