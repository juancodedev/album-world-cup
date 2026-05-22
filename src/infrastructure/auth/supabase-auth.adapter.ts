import { createClient } from '../database/supabase.client';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;
  isLoading: boolean;
}

export class SupabaseAuthAdapter {
  private client: ReturnType<typeof createClient> | null = null;

  private getClient(): ReturnType<typeof createClient> {
    if (!this.client) {
      this.client = createClient();
    }
    return this.client!;
  }

  async signInWithGoogle(): Promise<void> {
    const { error } = await this.getClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (error) throw error;
  }

  async signInWithMagicLink(email: string): Promise<void> {
    const { error } = await this.getClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    if (error) throw error;
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await this.getClient().auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async signUp(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.getClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    return { error: error?.message || null };
  }

  async signOut(): Promise<void> {
    const { error } = await this.getClient().auth.signOut();
    if (error) throw error;
  }

  async getSession(): Promise<AuthSession> {
    const { data: { session }, error } = await this.getClient().auth.getSession();

    if (error || !session) {
      return { user: null, isLoading: false };
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email || '',
        fullName: session.user.user_metadata?.full_name,
        avatarUrl: session.user.user_metadata?.avatar_url,
      },
      isLoading: false,
    };
  }

  onAuthStateChange(callback: (session: AuthSession) => void): () => void {
    const { data: { subscription } } = this.getClient().auth.onAuthStateChange(
      async (_event: string, session: any) => {
        if (session) {
          callback({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name,
              avatarUrl: session.user.user_metadata?.avatar_url,
            },
            isLoading: false,
          });
        } else {
          callback({ user: null, isLoading: false });
        }
      },
    );

    return () => subscription.unsubscribe();
  }
}

// Singleton, but lazy init
let adapter: SupabaseAuthAdapter | null = null;
export function getAuthAdapter(): SupabaseAuthAdapter {
  if (!adapter) {
    adapter = new SupabaseAuthAdapter();
  }
  return adapter;
}
