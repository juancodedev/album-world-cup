'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';
import { CollectionStatsDTO } from '../../application/dtos/collection-stats.dto';
import { applyOptimisticDuplicate, applyOptimisticRemoveDuplicate, showMutationToast } from './collection-mutations';

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

  /**
   * Invalidate only aggregate/derived queries after a mutation.
   * The `onMutate` handler already updates the collection cache optimistically,
   * so we skip invalidating it — avoids a full refetch of all 1005 stickers.
   * `sticker-detail` is unrelated to single toggles.
   */
  const invalidateDerived = () => {
    queryClient.invalidateQueries({ queryKey: ['collection-stats', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['progress', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['team-progress', accountId, albumId] });
  };

  const addStickerMutation = useMutation({
    mutationFn: ({ stickerId, userId }: { stickerId: string; userId: string }) =>
      collectionService.addStickerToCollection({ accountId, userId, stickerId, albumId }),
    onMutate: async ({ stickerId }) => {
      await queryClient.cancelQueries({ queryKey: ['collection', accountId, albumId] });
      const previous = queryClient.getQueryData<StickerDTO[]>(['collection', accountId, albumId]);
      queryClient.setQueryData<StickerDTO[]>(['collection', accountId, albumId], (old) =>
        old?.map(s => s.id === stickerId ? { ...s, state: 'obtained' as const } : s)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['collection', accountId, albumId], context.previous);
      }
    },
    onSettled: (_data, error) => {
      showMutationToast(error, 'addSticker');
      invalidateDerived();
    },
  });

  const removeStickerMutation = useMutation({
    mutationFn: ({ stickerId, userId }: { stickerId: string; userId: string }) =>
      collectionService.removeStickerFromCollection({ accountId, userId, stickerId }),
    onMutate: async ({ stickerId }) => {
      await queryClient.cancelQueries({ queryKey: ['collection', accountId, albumId] });
      const previous = queryClient.getQueryData<StickerDTO[]>(['collection', accountId, albumId]);
      queryClient.setQueryData<StickerDTO[]>(['collection', accountId, albumId], (old) =>
        old?.map(s => s.id === stickerId ? { ...s, state: 'missing' as const } : s)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['collection', accountId, albumId], context.previous);
      }
    },
    onSettled: (_data, error) => {
      showMutationToast(error, 'removeSticker');
      invalidateDerived();
    },
  });

  const incrementDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, userId, quantity }: { stickerId: string; userId: string; quantity?: number }) =>
      collectionService.incrementDuplicateCount({ accountId, userId, stickerId, quantity }),
    onMutate: async ({ stickerId }) => {
      await queryClient.cancelQueries({ queryKey: ['collection', accountId, albumId] });
      const previous = queryClient.getQueryData<StickerDTO[]>(['collection', accountId, albumId]);
      queryClient.setQueryData<StickerDTO[]>(['collection', accountId, albumId], (old) =>
        old ? applyOptimisticDuplicate(old, stickerId) : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['collection', accountId, albumId], context.previous);
      }
    },
    onSettled: (_data, error) => {
      showMutationToast(error, 'incrementDuplicate');
      invalidateDerived();
    },
  });

  const removeDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, userId, quantity }: { stickerId: string; userId: string; quantity?: number }) =>
      collectionService.removeDuplicateCount({ accountId, userId, stickerId, quantity }),
    onMutate: async ({ stickerId }) => {
      await queryClient.cancelQueries({ queryKey: ['collection', accountId, albumId] });
      const previous = queryClient.getQueryData<StickerDTO[]>(['collection', accountId, albumId]);
      queryClient.setQueryData<StickerDTO[]>(['collection', accountId, albumId], (old) =>
        old ? applyOptimisticRemoveDuplicate(old, stickerId) : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['collection', accountId, albumId], context.previous);
      }
    },
    onSettled: (_data, error) => {
      showMutationToast(error, 'removeDuplicate');
      invalidateDerived();
    },
  });

  return {
    collection: collectionQuery.data ?? [],
    stats: statsQuery.data ?? null,
    isLoading: collectionQuery.isLoading || statsQuery.isLoading,
    error: collectionQuery.error || statsQuery.error,
    addSticker: addStickerMutation.mutate,
    addStickerAsync: addStickerMutation.mutateAsync,
    removeSticker: removeStickerMutation.mutate,
    incrementDuplicate: incrementDuplicateMutation.mutate,
    removeDuplicate: removeDuplicateMutation.mutate,
    isAdding: addStickerMutation.isPending,
  };
}
