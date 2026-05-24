'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../presentation/providers/AuthProvider';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const { signInWithEmail, signUp, resetPassword, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, [mode]);

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
    if (mode !== 'forgot') {
      if (!password) { setError('Ingresa tu contraseña'); return false; }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return false; }
    }
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
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error);
        } else {
          toast.success('Revisa tu correo para restablecer la contraseña.');
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                ref={emailRef}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="h-12 pl-10 pr-3 text-base"
                autoComplete={mode === 'register' ? 'email' : mode === 'forgot' ? 'email' : 'username'}
              />
            </div>

            {mode !== 'forgot' && (
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
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('forgot'); setError(''); setPassword(''); }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors -mt-2"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={!email || (mode !== 'forgot' && !password) || isLoading}
              className="w-full h-12 text-base gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'register' ? (
                <><ArrowRight className="w-5 h-5" /> Crear cuenta</>
              ) : mode === 'forgot' ? (
                <><ArrowRight className="w-5 h-5" /> Enviar enlace</>
              ) : (
                <><ArrowRight className="w-5 h-5" /> Iniciar sesión</>
              )}
            </Button>

            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a inicio de sesión
              </button>
            ) : (
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
            )}
          </form>
        </div>

        <p className="text-center text-xs text-white/60 mt-6 animate-fade-in">
          Al continuar, aceptas nuestros términos y condiciones
        </p>
      </div>
    </div>
  );
}
