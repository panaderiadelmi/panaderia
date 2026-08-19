'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import type { Cliente } from '@/lib/types';

type FieldState = 'idle' | 'valid' | 'invalid' | 'checking';
interface FieldStatus { state: FieldState; msg: string; }

const IDLE: FieldStatus = { state: 'idle',  msg: '' };
const OK:   FieldStatus = { state: 'valid', msg: '' };

function borderColor(s: FieldState) {
  if (s === 'valid')   return '#22c55e';
  if (s === 'invalid') return '#f87171';
  return 'var(--color-border)';
}

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPhone(v: string) {
  const digits = v.replace(/[\s\-().]/g, '');
  if (v.trim().startsWith('+')) return digits.length >= 9;
  return /^[6789]\d{8}$/.test(digits);
}

type FormKeys = 'nombre' | 'apellidos' | 'email' | 'telefono' | 'username' | 'password' | 'password2';

export default function RegistroPage() {
  const router = useRouter();

  const [form, setForm] = useState<Record<FormKeys, string>>({
    nombre: '', apellidos: '', email: '', telefono: '',
    username: '', password: '', password2: '',
  });

  const [status, setStatus] = useState<Record<FormKeys, FieldStatus>>({
    nombre: IDLE, apellidos: IDLE, email: IDLE, telefono: IDLE,
    username: IDLE, password: IDLE, password2: IDLE,
  });

  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading]         = useState(false);

  function setField(field: FormKeys) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setStatus(prev => ({ ...prev, [field]: IDLE }));
    };
  }

  function validateNombre(v: string): FieldStatus {
    if (!v.trim())          return { state: 'invalid', msg: 'El nombre es obligatorio.' };
    if (v.trim().length < 2) return { state: 'invalid', msg: 'Mínimo 2 caracteres.' };
    return OK;
  }

  function validateApellidos(v: string): FieldStatus {
    if (!v.trim())          return { state: 'invalid', msg: 'Los apellidos son obligatorios.' };
    if (v.trim().length < 2) return { state: 'invalid', msg: 'Mínimo 2 caracteres.' };
    return OK;
  }

  function validatePhone(v: string): FieldStatus {
    if (!v.trim())       return { state: 'invalid', msg: 'El teléfono es obligatorio.' };
    if (!isValidPhone(v)) return { state: 'invalid', msg: 'Teléfono no válido. Ej: 612 345 678 o +34 612 345 678' };
    return OK;
  }

  function validatePassword(v: string): FieldStatus {
    if (!v)          return { state: 'invalid', msg: 'La contraseña es obligatoria.' };
    if (v.length < 8) return { state: 'invalid', msg: 'Mínimo 8 caracteres.' };
    return OK;
  }

  function validatePassword2(v: string, pass: string): FieldStatus {
    if (!v)       return { state: 'invalid', msg: 'Confirma la contraseña.' };
    if (v !== pass) return { state: 'invalid', msg: 'Las contraseñas no coinciden.' };
    return OK;
  }

  async function checkEmail(v: string): Promise<FieldStatus> {
    if (!v.trim())      return { state: 'invalid', msg: 'El email es obligatorio.' };
    if (!isValidEmail(v)) return { state: 'invalid', msg: 'Email no válido.' };
    const snap = await getDocs(query(collection(db, 'clientes'), where('email', '==', v.toLowerCase().trim())));
    if (!snap.empty)    return { state: 'invalid', msg: 'Ya existe una cuenta con ese email.' };
    return OK;
  }

  async function checkUsername(v: string): Promise<FieldStatus> {
    if (!v.trim()) return { state: 'invalid', msg: 'El nombre de usuario es obligatorio.' };
    const snap = await getDocs(query(collection(db, 'clientes'), where('usernameLower', '==', v.trim().toLowerCase())));
    if (!snap.empty) return { state: 'invalid', msg: 'Ese nombre de usuario ya está en uso. Elige otro.' };
    return OK;
  }

  async function handleBlur(field: FormKeys) {
    const v = form[field];
    let result: FieldStatus;

    if (field === 'nombre')    { result = validateNombre(v); }
    else if (field === 'apellidos') { result = validateApellidos(v); }
    else if (field === 'telefono')  { result = validatePhone(v); }
    else if (field === 'password')  { result = validatePassword(v); }
    else if (field === 'password2') { result = validatePassword2(v, form.password); }
    else if (field === 'email') {
      setStatus(prev => ({ ...prev, email: { state: 'checking', msg: '' } }));
      result = await checkEmail(v);
    } else {
      setStatus(prev => ({ ...prev, username: { state: 'checking', msg: '' } }));
      result = await checkUsername(v);
    }

    setStatus(prev => ({ ...prev, [field]: result }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError('');

    const syncResults: Partial<Record<FormKeys, FieldStatus>> = {
      nombre:    validateNombre(form.nombre),
      apellidos: validateApellidos(form.apellidos),
      telefono:  validatePhone(form.telefono),
      password:  validatePassword(form.password),
      password2: validatePassword2(form.password2, form.password),
      email:     { state: 'checking', msg: '' },
      username:  { state: 'checking', msg: '' },
    };
    setStatus(prev => ({ ...prev, ...syncResults }));

    const syncInvalid = (['nombre', 'apellidos', 'telefono', 'password', 'password2'] as FormKeys[])
      .some(k => syncResults[k]?.state === 'invalid');

    const [nEmail, nUsername] = await Promise.all([checkEmail(form.email), checkUsername(form.username)]);
    setStatus(prev => ({ ...prev, email: nEmail, username: nUsername }));

    if (syncInvalid || nEmail.state === 'invalid' || nUsername.state === 'invalid') return;

    setLoading(true);
    try {
      const usernameLower = form.username.trim().toLowerCase();
      const credential    = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const { user }      = credential;

      await updateProfile(user, { displayName: `${form.nombre} ${form.apellidos}`.trim() });

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

      const idToken = await user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error('Error al crear sesión');

      router.push('/mi-cuenta');
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('email-already-in-use')) {
        setStatus(prev => ({ ...prev, email: { state: 'invalid', msg: 'Ya existe una cuenta con ese email.' } }));
      } else if (msg.includes('weak-password')) {
        setStatus(prev => ({ ...prev, password: { state: 'invalid', msg: 'La contraseña es demasiado débil.' } }));
      } else {
        setSubmitError('No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  function inputStyle(field: FormKeys): React.CSSProperties {
    return { borderColor: borderColor(status[field].state) };
  }

  function ErrMsg({ field }: { field: FormKeys }) {
    const s = status[field];
    if (s.state === 'checking') return <p style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginTop: '4px' }}>Verificando...</p>;
    if (s.state === 'invalid')  return <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>{s.msg}</p>;
    if (s.state === 'valid' && (field === 'email' || field === 'username'))
      return <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '4px' }}>
        {field === 'username' ? 'Nombre de usuario disponible' : 'Email válido'}
      </p>;
    return null;
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
                <input id="nombre" type="text" className="form-input"
                  value={form.nombre} onChange={setField('nombre')} onBlur={() => handleBlur('nombre')}
                  placeholder="María" required autoComplete="given-name" style={inputStyle('nombre')} />
                <ErrMsg field="nombre" />
              </div>
              <div>
                <label className="form-label" htmlFor="apellidos">Apellidos *</label>
                <input id="apellidos" type="text" className="form-input"
                  value={form.apellidos} onChange={setField('apellidos')} onBlur={() => handleBlur('apellidos')}
                  placeholder="García López" required autoComplete="family-name" style={inputStyle('apellidos')} />
                <ErrMsg field="apellidos" />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="email">Email *</label>
              <input id="email" type="email" className="form-input"
                value={form.email} onChange={setField('email')} onBlur={() => handleBlur('email')}
                placeholder="nombre@ejemplo.com" required autoComplete="email" style={inputStyle('email')} />
              <ErrMsg field="email" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="telefono">Teléfono *</label>
              <input id="telefono" type="tel" className="form-input"
                value={form.telefono} onChange={setField('telefono')} onBlur={() => handleBlur('telefono')}
                placeholder="612 345 678" required autoComplete="tel" style={inputStyle('telefono')} />
              <ErrMsg field="telefono" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="username">Nombre de usuario *</label>
              <input id="username" type="text" className="form-input"
                value={form.username} onChange={setField('username')} onBlur={() => handleBlur('username')}
                placeholder="maria_garcia" required autoComplete="username" style={inputStyle('username')} />
              <ErrMsg field="username" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label" htmlFor="password">Contraseña *</label>
                <input id="password" type="password" className="form-input"
                  value={form.password} onChange={setField('password')} onBlur={() => handleBlur('password')}
                  placeholder="Mínimo 8 caracteres" required autoComplete="new-password" style={inputStyle('password')} />
                <ErrMsg field="password" />
              </div>
              <div>
                <label className="form-label" htmlFor="password2">Confirmar *</label>
                <input id="password2" type="password" className="form-input"
                  value={form.password2} onChange={setField('password2')} onBlur={() => handleBlur('password2')}
                  placeholder="Repite la contraseña" required autoComplete="new-password" style={inputStyle('password2')} />
                <ErrMsg field="password2" />
              </div>
            </div>

            {submitError && (
              <div role="alert" style={{
                padding: '12px 16px', marginBottom: '20px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem',
              }}>
                {submitError}
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
