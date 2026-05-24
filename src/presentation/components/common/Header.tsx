'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';

interface HeaderProps {
  accessStatus?: string;
  remainingDays?: number;
}

export function Header({ accessStatus, remainingDays }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ fullName?: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => setProfile(d.user))
      .catch(() => {});
  }, [user]);

  const displayName = profile?.fullName || user?.fullName || user?.email || '';
  const displayAvatar = profile?.avatarUrl || user?.avatarUrl || '';
  const isTrial = accessStatus === 'trial' && remainingDays !== undefined;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/tracker" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">AW</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">Album World 2026</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isTrial && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {remainingDays} {remainingDays === 1 ? 'día' : 'días'} restantes
            </span>
          )}
          {user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
                <p className="text-[10px] text-gray-400">Coleccionista</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Salir
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm">Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
