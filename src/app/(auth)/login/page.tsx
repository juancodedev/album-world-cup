'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'register';
type TabId = 'google' | 'email';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signUp, user } = useAuth();
  const [tab, setTab] = useState<TabId>('google');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab === 'email' && emailRef.current) {
      emailRef.current.focus();
    }
  }, [tab]);

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/tracker');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const validate = () => {
    if (!email) { setError('Ingresa tu correo electrónico'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Correo electrónico inválido'); return false; }
    if (!password) { setError('Ingresa tu contraseña'); return false; }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return false; }
    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error);
        } else {
          toast.success('Cuenta creada. Revisa tu correo para confirmar.');
          setMode('login');
        }
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos');
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirma tu correo antes de iniciar sesión');
      } else {
        setError(msg || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm ring-1 ring-white/30">
            <span className="text-white text-2xl font-bold">AW</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Album World Cup</h1>
          <p className="text-white/80 text-sm mt-1">Mundial 2026</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-black/10 animate-slide-up">
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => { setTab('google'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'google'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email
            </button>
          </div>

          <div className="transition-opacity duration-200">
            {tab === 'google' ? (
              <div className="space-y-4 animate-fade-in">
                <Button
                  onClick={() => signInWithGoogle()}
                  className="w-full h-12 text-base gap-3"
                  variant="outline"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                    O
                  </span>
                </div>

                <Button
                  onClick={() => { setTab('email'); setMode('login'); }}
                  variant="outline"
                  className="w-full h-12 text-base gap-2 text-gray-600"
                >
                  <Mail className="w-5 h-5" />
                  Continuar con Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    ref={emailRef}
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="h-12 pl-10 pr-3 text-base"
                    autoComplete={mode === 'register' ? 'email' : 'username'}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="h-12 pl-10 pr-10 text-base"
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={!email || !password || isLoading}
                  className="w-full h-12 text-base gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : mode === 'register' ? (
                    <><ArrowRight className="w-5 h-5" /> Crear cuenta</>
                  ) : (
                    <><ArrowRight className="w-5 h-5" /> Iniciar sesión</>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setPassword(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {mode === 'login'
                    ? '¿No tienes cuenta? Regístrate'
                    : '¿Ya tienes cuenta? Inicia sesión'
                  }
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/60 mt-6 animate-fade-in">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}
