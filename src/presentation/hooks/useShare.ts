'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { ShareCollectionDTO } from '../../application/dtos/share-collection.dto';

export function useShare(userId?: string) {
  const queryClient = useQueryClient();
  const shareService = container.getShareService();

  const generateCodeMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return shareService.generateCode(userId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['share-code', userId], data);
    },
  });

  return {
    shareCode: generateCodeMutation.data ?? null,
    generateCode: generateCodeMutation.mutate,
    isGenerating: generateCodeMutation.isPending,
  };
}

export function useSharedCollection(code: string) {
  const shareService = container.getShareService();

  return useQuery<ShareCollectionDTO>({
    queryKey: ['shared-collection', code],
    queryFn: () => shareService.getSharedCollection(code),
    enabled: !!code,
    retry: false,
  });
}
