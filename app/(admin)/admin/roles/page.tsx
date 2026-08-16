import { adminDb } from '@/lib/firebase/admin';
import { guardarPermisos, PERMISOS, PERMISOS_DEFAULT } from '@/lib/actions/roles';
import { ROLES_CONFIG } from '@/lib/types';

export const metadata = { title: 'Roles y permisos — Admin' };

const ROLES_TABLA = ['administrador', 'developer', 'propietario', 'cliente'] as const;

async function getPermisos(): Promise<Record<string, string[]>> {
  const snap = await adminDb.collection('configuracion').doc('roles').get();
  if (!snap.exists) return PERMISOS_DEFAULT;
  const data = snap.data()!;
  return Object.fromEntries(
    ROLES_TABLA.map(r => [r, (data[r]?.permisos as string[]) ?? PERMISOS_DEFAULT[r]])
  );
}

export default async function RolesPage({ searchParams }: { searchParams: { guardado?: string } }) {
  const permisos = await getPermisos();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Roles y permisos</h1>
          <p style={{ color: 'var(--color-text-4)', fontSize: '0.85rem', marginTop: '4px' }}>
            Marca qué secciones puede ver cada rol. Los cambios se aplican en el próximo inicio de sesión.
          </p>
        </div>
        {searchParams.guardado && (
          <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>
            ✓ Permisos guardados
          </span>
        )}
      </div>

      <form action={guardarPermisos}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-3)', width: '40%' }}>
                  Sección / Permiso
                </th>
                {ROLES_TABLA.map(rol => (
                  <th key={rol} style={{
                    textAlign: 'center', padding: '12px 16px',
                    borderBottom: '2px solid var(--color-border)',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: ROLES_CONFIG[rol].color,
                  }}>
                    {ROLES_CONFIG[rol].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISOS.map((permiso, idx) => (
                <tr key={permiso.key} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-1)' }}>{permiso.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginTop: '2px' }}>{permiso.desc}</div>
                  </td>
                  {ROLES_TABLA.map(rol => (
                    <td key={rol} style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <input
                        type="checkbox"
                        name={`perm__${rol}__${permiso.key}`}
                        defaultChecked={permisos[rol]?.includes(permiso.key) ?? false}
                        style={{ width: '18px', height: '18px', accentColor: ROLES_CONFIG[rol].color, cursor: 'pointer' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button type="submit" className="btn-primary">Guardar permisos</button>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)' }}>
            Los permisos del rol "Cliente" son los del área pública de la tienda y no afectan al panel de administración.
          </span>
        </div>
      </form>
    </>
  );
}
