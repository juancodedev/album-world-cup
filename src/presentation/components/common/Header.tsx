'use client';

import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';

export function Header() {
  const { user, signOut } = useAuth();

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
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl || ''} alt={user.fullName || ''} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
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
