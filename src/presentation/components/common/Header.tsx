'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';

export function Header() {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AW</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">Album World 2026</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 leading-tight">{displayName}</p>
                <p className="text-[10px] text-gray-400">Coleccionista</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
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
