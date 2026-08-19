'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { Cliente } from '@/lib/types';

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre:    '',
    apellidos: '',
    email:     '',
    telefono:  '',
    username:  '',
    password:  '',
    password2: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.username.trim()) {
      setError('El nombre de usuario es obligatorio.');
      return;
    }
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 1. Comprobar que el username no está en uso
      const usernameLower = form.username.trim().toLowerCase();
      const snap = await getDocs(query(collection(db, 'clientes'), where('usernameLower', '==', usernameLower)));
      if (!snap.empty) {
        setError('Ese nombre de usuario ya está en uso. Elige otro.');
        setLoading(false);
        return;
      }

      // 2. Crear usuario en Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const { user }   = credential;

      // 3. Actualizar displayName
      await updateProfile(user, {
        displayName: `${form.nombre} ${form.apellidos}`.trim(),
      });

      // 4. Crear perfil en Firestore
      const clienteData: Omit<Cliente, 'createdAt' | 'updatedAt'> = {
        uid:          user.uid,
        nombre:       form.nombre.trim(),
        apellidos:    form.apellidos.trim(),
        email:        form.email.toLowerCase().trim(),
        telefono:     form.telefono.trim(),
        username:     form.username.trim(),
        usernameLower,
        alergias:     [],
        rol:          'cliente',
        activo:       true,
      };

      await setDoc(doc(db, 'clientes', user.uid), {
        ...clienteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Crear cookie de sesión
      const idToken = await user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error('Error al crear sesión');

      router.push('/mi-cuenta');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setError('Ya existe una cuenta con ese email. Inicia sesión.');
      } else if (msg.includes('invalid-email')) {
        setError('El email no es válido.');
      } else if (msg.includes('weak-password')) {
        setError('La contraseña es demasiado débil.');
      } else {
        setError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              <span className="gradient-text">Señas Gómez</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '6px' }}>
            Crea tu cuenta
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            Haz pedidos y accede a tus facturas
          </p>
        </div>

        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit} noValidate>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label" htmlFor="nombre">Nombre *</label>
                <input id="nombre" type="text" className="form-input" value={form.nombre} onChange={setField('nombre')} placeholder="Juan" required autoComplete="given-name" />
              </div>
              <div>
                <label className="form-label" htmlFor="apellidos">Apellidos *</label>
                <input id="apellidos" type="text" className="form-input" value={form.apellidos} onChange={setField('apellidos')} placeholder="García López" required autoComplete="family-name" />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="email">Email *</label>
              <input id="email" type="email" className="form-input" value={form.email} onChange={setField('email')} placeholder="tu@email.com" required autoComplete="email" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="telefono">Teléfono</label>
              <input id="telefono" type="tel" className="form-input" value={form.telefono} onChange={setField('telefono')} placeholder="+34 600 000 000" autoComplete="tel" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="username">Nombre de usuario *</label>
              <input id="username" type="text" className="form-input" value={form.username} onChange={setField('username')} placeholder="tu_usuario" required autoComplete="username" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label" htmlFor="password">Contraseña *</label>
                <input id="password" type="password" className="form-input" value={form.password} onChange={setField('password')} placeholder="Mínimo 8 caracteres" required autoComplete="new-password" />
              </div>
              <div>
                <label className="form-label" htmlFor="password2">Confirmar *</label>
                <input id="password2" type="password" className="form-input" value={form.password2} onChange={setField('password2')} placeholder="Repite la contraseña" required autoComplete="new-password" />
              </div>
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

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 12a9 9 0 11-6.22-8.56"/>
                  </svg>
                  Creando cuenta...
                </>
              ) : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/login" style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
            ¿Ya tienes cuenta? <span style={{ color: 'var(--color-primary)' }}>Inicia sesión</span>
          </Link>
          <Link href="/" style={{ color: 'var(--color-text-4)', fontSize: '0.8rem' }}>
            ← Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  );
}
