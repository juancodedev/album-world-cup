'use client';

import { ReactNode } from 'react';
import { useAccessGuard } from '../hooks/useAccessGuard';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { BottomNav } from '../components/common/BottomNav';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Countdown } from '../components/common/Countdown';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { allowed, loading, status, remainingDays } = useAccessGuard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!allowed) return null;

  return (
    <div className="bg-gray-50">
      <Header accessStatus={status} remainingDays={remainingDays} />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="md:hidden px-4 pt-3 pb-0">
            <Countdown />
          </div>
          <main className="pb-20 md:pb-8 px-4 py-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
