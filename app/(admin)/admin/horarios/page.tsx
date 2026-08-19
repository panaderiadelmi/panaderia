import { adminDb } from '@/lib/firebase/admin';
import { type HorarioOperario, TIPOS_HORAS } from '@/lib/types';
import { eliminarHorario } from '@/lib/actions/operarios';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

export const metadata = { title: 'Horarios — Admin' };

async function getHorarios(): Promise<HorarioOperario[]> {
  const snap = await adminDb.collection('horarios').orderBy('fecha', 'desc').limit(200).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as HorarioOperario);
}

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: { creado?: string; editado?: string; eliminado?: string };
}) {
  const horarios = await getHorarios();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Horarios</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{horarios.length} registros</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.creado    && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario añadido</span>}
          {searchParams.editado   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario actualizado</span>}
          {searchParams.eliminado && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario eliminado</span>}
          <Link href="/admin/horarios/nuevo" className="btn-primary">+ Nuevo horario</Link>
        </div>
      </div>

      {horarios.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay registros de horarios.{' '}
          <Link href="/admin/horarios/nuevo" className="btn-ghost">Añadir el primero →</Link>
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Operario', 'Fecha', 'Entrada', 'Salida', 'Tipo horas', 'H. Extras', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                    {h.operarioNombre}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontSize: '0.83rem' }}>
                    {h.fecha}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {h.horarioInicio}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {h.horarioFin}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge" style={{
                      background: h.tipoHoras === 'ordinarias'
                        ? 'rgba(56,189,248,0.1)'
                        : h.tipoHoras === 'nocturnas'
                          ? 'rgba(167,139,250,0.1)'
                          : 'rgba(245,158,11,0.1)',
                      border: `1px solid ${h.tipoHoras === 'ordinarias' ? 'rgba(56,189,248,0.3)' : h.tipoHoras === 'nocturnas' ? 'rgba(167,139,250,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      color: h.tipoHoras === 'ordinarias' ? '#38BDF8' : h.tipoHoras === 'nocturnas' ? '#A78BFA' : 'var(--color-primary)',
                    }}>
                      {TIPOS_HORAS[h.tipoHoras] ?? h.tipoHoras}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: h.horasExtras > 0 ? 'var(--color-primary)' : 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: h.horasExtras > 0 ? 700 : 400 }}>
                    {h.horasExtras > 0 ? `+${h.horasExtras}h` : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link href={`/admin/horarios/${h.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                        Editar
                      </Link>
                      <DeleteButton
                        action={eliminarHorario.bind(null, h.id)}
                        mensaje={`¿Eliminar el horario de ${h.operarioNombre} del ${h.fecha}?`}
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
