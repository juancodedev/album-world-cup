'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di/container';
import { ExchangeOffer } from '../../domain/entities/exchange-offer.entity';

export function usePendingExchangeOffers(userId?: string) {
  const exchangeService = container.getExchangeService();
  const queryKey = ['exchange-offers', 'pending', userId];

  const query = useQuery<ExchangeOffer[]>({
    queryKey,
    queryFn: () => exchangeService.getPendingOffers(userId),
    enabled: true,
    refetchInterval: 30_000, // poll every 30s
  });

  return {
    offers: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUserExchangeOffers(userId?: string) {
  const exchangeService = container.getExchangeService();

  return useQuery<ExchangeOffer[]>({
    queryKey: ['exchange-offers', 'user', userId],
    queryFn: () => exchangeService.getUserOffers(userId!),
    enabled: !!userId,
  });
}

export function useCreateExchangeOffer() {
  const queryClient = useQueryClient();
  const exchangeService = container.getExchangeService();

  return useMutation({
    mutationFn: (input: {
      fromUserId: string;
      fromAccountId: string;
      offeredStickerId: string;
      requestedStickerId?: string;
      message?: string;
    }) => exchangeService.createOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-offers'] });
    },
  });
}

export function useAcceptExchangeOffer() {
  const queryClient = useQueryClient();
  const exchangeService = container.getExchangeService();

  return useMutation({
    mutationFn: (input: {
      offerId: string;
      acceptedByUserId: string;
      acceptedByAccountId: string;
    }) => exchangeService.acceptOffer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-offers'] });
      // Also invalidate collection data since stickers moved
      queryClient.invalidateQueries({ queryKey: ['collection'] });
      queryClient.invalidateQueries({ queryKey: ['collection-stats'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useCancelExchangeOffer() {
  const queryClient = useQueryClient();
  const exchangeService = container.getExchangeService();

  return useMutation({
    mutationFn: ({ offerId, userId }: { offerId: string; userId: string }) =>
      exchangeService.cancelOffer(offerId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-offers'] });
    },
  });
}
