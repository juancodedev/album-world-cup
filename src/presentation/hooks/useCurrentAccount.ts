'use client';

import { useQuery } from '@tanstack/react-query';
import { container } from '../../di/container';

export function useCurrentAccount(userId?: string) {
  const getUserAccountsUseCase = container.getGetUserAccountsUseCase();

  return useQuery({
    queryKey: ['user-accounts', userId],
    queryFn: () => getUserAccountsUseCase.execute(userId!),
    enabled: !!userId,
    select: (accounts) => accounts[0] || null,
  });
}
