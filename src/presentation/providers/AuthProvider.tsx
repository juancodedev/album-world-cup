'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { getAuthAdapter, AuthSession } from '../../infrastructure/auth/supabase-auth.adapter';

interface AuthContextType extends AuthSession {
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isLoading: true,
  });
  const adapterRef = useRef<ReturnType<typeof getAuthAdapter> | null>(null);

  const getAdapter = () => {
    if (!adapterRef.current) {
      adapterRef.current = getAuthAdapter();
    }
    return adapterRef.current;
  };

  useEffect(() => {
    const adapter = getAdapter();
    const unsubscribe = adapter.onAuthStateChange((newSession) => {
      setSession(newSession);
    });

    adapter.getSession().then((s) => setSession(s));

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...session,
    signInWithGoogle: () => getAdapter().signInWithGoogle(),
    signInWithMagicLink: (email: string) => getAdapter().signInWithMagicLink(email),
    signInWithEmail: (email: string, password: string) => getAdapter().signInWithEmail(email, password),
    signUp: (email: string, password: string) => getAdapter().signUp(email, password),
    signOut: () => getAdapter().signOut(),
    refetch: async () => {
      const s = await getAdapter().getSession();
      setSession(s);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
