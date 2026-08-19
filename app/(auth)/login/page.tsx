'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '/mi-cuenta';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const snap = await getDocs(query(collection(db, 'clientes'), where('usernameLower', '==', username.trim().toLowerCase())));
      if (snap.empty) {
        setError('El usuario no existe. Revisa el nombre o regístrate.');
        setLoading(false);
        return;
      }
      const email = snap.docs[0].data().email as string;
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error('Error al iniciar sesión');

      window.location.href = redirect;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Usuario o contraseña incorrectos.');
      } else if (msg.includes('too-many-requests')) {
        setError('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.');
      } else {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <Image src="/images/logo.jpg" alt="Delmi Soriano — Panadería" width={80} height={80} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '6px' }}>
            Accede a tu cuenta
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            Gestiona tus pedidos y facturas
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="username">Nombre de usuario</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="tu_usuario"
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div role="alert" style={{
                padding: '12px 16px',
                background: 'rgba(248,113,113,0.08)',
                border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 12a9 9 0 11-6.22-8.56"/>
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/registro" style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            ¿No tienes cuenta? <span style={{ color: 'var(--color-primary)' }}>Regístrate</span>
          </Link>
          <Link href="/" style={{ color: 'var(--color-text-4)', fontSize: '0.8rem' }}>
            ← Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
