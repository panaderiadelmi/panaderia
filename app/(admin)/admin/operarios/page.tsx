import { adminDb } from '@/lib/firebase/admin';
import { type Operario, CATEGORIAS_OPERARIO, TIPOS_CONTRATO } from '@/lib/types';
import { eliminarOperario } from '@/lib/actions/operarios';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PrintButton } from '@/components/admin/PrintButton';
import Link from 'next/link';

export const metadata = { title: 'Operarios — Admin' };

async function getOperarios(): Promise<Operario[]> {
  const snap = await adminDb.collection('operarios').orderBy('apellidos').get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Operario);
}

export default async function OperariosPage({
  searchParams,
}: {
  searchParams: { creado?: string; editado?: string; eliminado?: string };
}) {
  const operarios = await getOperarios();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Operarios</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{operarios.length} operarios registrados</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.creado    && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Operario creado</span>}
          {searchParams.editado   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Operario actualizado</span>}
          {searchParams.eliminado && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Operario eliminado</span>}
          <PrintButton />
          <Link href="/admin/operarios/nuevo" className="btn-primary">+ Nuevo operario</Link>
        </div>
      </div>

      {operarios.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay operarios registrados.{' '}
          <Link href="/admin/operarios/nuevo" className="btn-ghost">Añadir el primero →</Link>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Nombre', 'Puesto', 'Teléfono', 'Email', 'Contrato', 'Estado', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operarios.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                    {o.nombre} {o.apellidos}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-3)' }}>
                    {CATEGORIAS_OPERARIO[o.categoria] ?? o.categoria}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-3)' }}>{o.telefono || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{o.email || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-3)', fontSize: '0.8rem' }}>
                    {TIPOS_CONTRATO[o.tipoContrato] ?? o.tipoContrato}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge" style={{
                      background: o.activo ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                      border: `1px solid ${o.activo ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                      color: o.activo ? 'var(--color-success)' : 'var(--color-error)',
                    }}>
                      {o.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link href={`/admin/operarios/${o.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                        Ver / Editar
                      </Link>
                      <DeleteButton
                        action={eliminarOperario.bind(null, o.id)}
                        mensaje={`¿Eliminar a ${o.nombre} ${o.apellidos}? Esta acción no se puede deshacer.`}
                        className="btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
