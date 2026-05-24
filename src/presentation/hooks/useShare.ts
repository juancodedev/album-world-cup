'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { ShareCollectionDTO } from '../../application/dtos/share-collection.dto';

export function useShare(accountId?: string, userId?: string) {
  const queryClient = useQueryClient();
  const shareService = container.getShareService();

  const generateCodeMutation = useMutation({
    mutationFn: () => {
      if (!accountId || !userId) throw new Error('Not authenticated');
      return shareService.generateCode(accountId, userId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['share-code', accountId], data);
    },
  });

  return {
    shareCode: generateCodeMutation.data ?? null,
    generateCode: generateCodeMutation.mutate,
    isGenerating: generateCodeMutation.isPending,
  };
}

export function useSharedCollection(code: string) {
  return useQuery<ShareCollectionDTO>({
    queryKey: ['shared-collection', code],
    queryFn: async () => {
      const res = await fetch(`/api/share?code=${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error('Not found');
      const json = await res.json();
      return json.data;
    },
    enabled: !!code,
    retry: false,
  });
}
