'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';

export interface AccessState {
  allowed: boolean;
  loading: boolean;
  status?: string;
  remainingDays?: number;
  reason?: string;
}

export function useAccessGuard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>({ allowed: false, loading: true });
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !user) return;
    if (initiatedRef.current) return;
    initiatedRef.current = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    fetch('/api/access/check', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.access) {
          setAccess({ allowed: true, loading: false, status: data.status, remainingDays: data.remainingDays });
        } else {
          setAccess({ allowed: false, loading: false, reason: data.reason });
          router.replace('/expired');
        }
      })
      .catch(() => {
        setAccess({ allowed: true, loading: false, status: 'active' });
      })
      .finally(() => clearTimeout(timeout));
  }, [user, authLoading, router]);

  return access;
}
