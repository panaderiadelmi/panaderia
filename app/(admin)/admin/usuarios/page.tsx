import { adminDb } from '@/lib/firebase/admin';
import { ROLES_ADMIN, ROLES_CONFIG, type Rol } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Usuarios privilegiados — Admin' };

async function getUsuariosAdmin() {
  const snap = await adminDb.collection('clientes')
    .where('rol', 'in', ROLES_ADMIN)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as {
    id: string; nombre: string; apellidos: string;
    email: string; rol: Rol; activo: boolean;
  });
}

export default async function UsuariosPage({ searchParams }: { searchParams: { creado?: string } }) {
  const usuarios = await getUsuariosAdmin();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Usuarios privilegiados</h1>
          <p style={{ color: 'var(--color-text-4)', fontSize: '0.85rem', marginTop: '4px' }}>
            Cuentas con acceso al panel de administración.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.creado && (
            <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
              ✓ Usuario creado
            </span>
          )}
          <Link href="/admin/usuarios/nuevo" className="btn-primary">+ Nuevo usuario</Link>
        </div>
      </div>

      {usuarios.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay usuarios privilegiados todavía.
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nombre', 'Email', 'Rol', 'Estado'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const rolCfg = ROLES_CONFIG[u.rol];
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                      {u.nombre} {u.apellidos}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-3)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge" style={{
                        background: `${rolCfg.color}18`,
                        border: `1px solid ${rolCfg.color}40`,
                        color: rolCfg.color,
                      }}>
                        {rolCfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="badge" style={{
                        background: u.activo ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                        border: `1px solid ${u.activo ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        color: u.activo ? 'var(--color-success)' : 'var(--color-error)',
                      }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
