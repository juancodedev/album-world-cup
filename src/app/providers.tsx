'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '../presentation/providers/QueryClientProvider';
import { AuthProvider } from '../presentation/providers/AuthProvider';
import { Toaster } from '../components/ui/sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
