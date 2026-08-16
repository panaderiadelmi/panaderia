import { crearUsuarioPrivilegiado } from '@/lib/actions/roles';
import Link from 'next/link';

export const metadata = { title: 'Nuevo usuario privilegiado — Admin' };

const ROLES_OPCIONES = [
  { value: 'administrador', label: 'Administrador — Acceso completo' },
  { value: 'developer',     label: 'Developer — Acceso completo + técnico' },
  { value: 'propietario',   label: 'Propietario — Acceso de negocio' },
];

export default function NuevoUsuarioPage() {
  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/usuarios" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nuevo usuario privilegiado</h1>
      </div>

      <form action={crearUsuarioPrivilegiado} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Datos personales
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Nombre *</label>
              <input name="nombre" required className="form-input" placeholder="Juan" />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input name="apellidos" required className="form-input" placeholder="García" />
            </div>
          </div>

          <div>
            <label className="form-label">Email *</label>
            <input name="email" type="email" required className="form-input" placeholder="usuario@email.com" />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Acceso
          </h2>

          <div>
            <label className="form-label">Contraseña * (mínimo 8 caracteres)</label>
            <input name="password" type="password" required minLength={8} className="form-input" placeholder="••••••••" autoComplete="new-password" />
          </div>

          <div>
            <label className="form-label">Rol *</label>
            <select name="rol" required className="form-input">
              {ROLES_OPCIONES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginTop: '6px', display: 'block' }}>
              Los permisos de cada rol se configuran en la página de Roles.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Crear usuario</button>
          <Link href="/admin/usuarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
