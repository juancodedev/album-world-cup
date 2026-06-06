'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { StickerDTO } from '../../application/dtos/sticker.dto';
import { CollectionStatsDTO } from '../../application/dtos/collection-stats.dto';
import { applyOptimisticDuplicate, showMutationToast } from './collection-mutations';

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

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['collection', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['collection-stats', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['progress', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['team-progress', accountId, albumId] });
    queryClient.invalidateQueries({ queryKey: ['sticker-detail'] });
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
      invalidateAll();
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
      invalidateAll();
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
      invalidateAll();
    },
  });

  const removeDuplicateMutation = useMutation({
    mutationFn: ({ stickerId, userId, quantity }: { stickerId: string; userId: string; quantity?: number }) =>
      collectionService.removeDuplicateCount({ accountId, userId, stickerId, quantity }),
    onSettled: (_data, error) => {
      showMutationToast(error, 'removeDuplicate');
      invalidateAll();
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
