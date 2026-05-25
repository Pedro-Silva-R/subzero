/**
 * Login.tsx — Pantalla de inicio de sesión (PREPARADA, NO ACTIVA)
 *
 * Para activar, conectar en App.tsx:
 *   if (!user && !isLoading) return <Login />;
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
    }
    setIsLoading(false);
  };

  return (
    <main
      className="min-h-screen bg-background text-foreground flex items-center justify-center px-4"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Título */}
        <div className="mb-8 text-center">
          <h1 className="mb-2">SubZero</h1>
          <p className="text-sm text-foreground/60">
            {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border-[3px] border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-bold">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-bold">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full border-2 border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive font-mono">
                {error}
              </p>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground px-6 py-4 border-[3px] border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all font-bold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading
                ? 'Procesando...'
                : mode === 'login'
                ? 'Iniciar sesión'
                : 'Crear cuenta'}
            </button>

            {/* Toggle modo */}
            <p className="text-center text-sm text-foreground/60">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
