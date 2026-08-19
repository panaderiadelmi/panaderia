'use client';

import { useState, type FormEvent } from 'react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export function CambiarPassword({ email }: { email: string }) {
  const [tab, setTab] = useState<'actual' | 'email'>('actual');

  const [actual,  setActual]  = useState('');
  const [nueva,   setNueva]   = useState('');
  const [nueva2,  setNueva2]  = useState('');
  const [errorA,  setErrorA]  = useState('');
  const [okA,     setOkA]     = useState(false);
  const [loadingA,setLoadingA]= useState(false);

  const [errorB,  setErrorB]  = useState('');
  const [okB,     setOkB]     = useState(false);
  const [loadingB,setLoadingB]= useState(false);

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setErrorA(''); setOkA(false);
    if (nueva.length < 8) { setErrorA('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (nueva !== nueva2)  { setErrorA('Las contraseñas no coinciden.'); return; }
    setLoadingA(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('no-user');
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, actual));
      await updatePassword(user, nueva);
      setOkA(true);
      setActual(''); setNueva(''); setNueva2('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorA('La contraseña actual es incorrecta.');
      } else {
        setErrorA('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
      }
    } finally {
      setLoadingA(false);
    }
  }

  async function handleSendEmail() {
    setErrorB(''); setOkB(false); setLoadingB(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setOkB(true);
    } catch {
      setErrorB('No se pudo enviar el correo. Inténtalo de nuevo.');
    } finally {
      setLoadingB(false);
    }
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.15s',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#000' : 'var(--color-text-3)',
  });

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Cambiar contraseña
      </h2>

      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-card)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
        <button type="button" style={tabBtn(tab === 'actual')} onClick={() => setTab('actual')}>Con contraseña actual</button>
        <button type="button" style={tabBtn(tab === 'email')}  onClick={() => setTab('email')}>Por email</button>
      </div>

      {tab === 'actual' && (
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">Contraseña actual</label>
            <input type="password" className="form-input" value={actual} onChange={e => setActual(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <div>
            <label className="form-label">Nueva contraseña</label>
            <input type="password" className="form-input" value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Mínimo 8 caracteres" required autoComplete="new-password" />
          </div>
          <div>
            <label className="form-label">Confirmar nueva contraseña</label>
            <input type="password" className="form-input" value={nueva2} onChange={e => setNueva2(e.target.value)} placeholder="Repite la nueva contraseña" required autoComplete="new-password" />
          </div>
          {errorA && <p style={{ fontSize: '0.82rem', color: '#f87171', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{errorA}</p>}
          {okA    && <p style={{ fontSize: '0.82rem', color: '#22c55e', fontFamily: 'var(--font-display)', fontWeight: 600 }}>✓ Contraseña cambiada correctamente</p>}
          <button type="submit" className="btn-primary" disabled={loadingA} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
            {loadingA ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      )}

      {tab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)', lineHeight: 1.6 }}>
            Te enviaremos un enlace a <strong style={{ color: 'var(--color-text-1)' }}>{email}</strong> para restablecer tu contraseña.
          </p>
          {!okB && (
            <button type="button" className="btn-primary" disabled={loadingB} onClick={handleSendEmail} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {loadingB ? 'Enviando...' : 'Enviar enlace por email'}
            </button>
          )}
          {errorB && <p style={{ fontSize: '0.82rem', color: '#f87171', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{errorB}</p>}
          {okB    && <p style={{ fontSize: '0.82rem', color: '#22c55e', fontFamily: 'var(--font-display)', fontWeight: 600 }}>✓ Correo enviado. Revisa tu bandeja de entrada.</p>}
        </div>
      )}
    </div>
  );
}
