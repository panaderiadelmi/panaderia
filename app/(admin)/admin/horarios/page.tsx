import { adminDb } from '@/lib/firebase/admin';
import { type HorarioOperario, type Operario, TIPOS_HORAS } from '@/lib/types';
import { eliminarHorario } from '@/lib/actions/operarios';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PrintButton } from '@/components/admin/PrintButton';
import Link from 'next/link';

export const metadata = { title: 'Horarios — Admin' };

function horasEntreTiempos(inicio: string, fin: string): number {
  const [hI, mI] = inicio.split(':').map(Number);
  const [hF, mF] = fin.split(':').map(Number);
  const mins = hF * 60 + mF - (hI * 60 + mI);
  return Math.max(0, mins / 60);
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function getData(operarioId?: string, desde?: string, hasta?: string) {
  const [horariosSnap, operariosSnap] = await Promise.all([
    adminDb.collection('horarios').orderBy('fecha', 'desc').limit(500).get(),
    adminDb.collection('operarios').orderBy('apellidos').get(),
  ]);

  let horarios = horariosSnap.docs.map(d => ({ id: d.id, ...d.data() }) as HorarioOperario);
  const operarios = operariosSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Operario);

  if (operarioId) horarios = horarios.filter(h => h.operarioId === operarioId);
  if (desde)      horarios = horarios.filter(h => h.fecha >= desde);
  if (hasta)      horarios = horarios.filter(h => h.fecha <= hasta);

  return { horarios, operarios };
}

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: {
    creado?: string; editado?: string; eliminado?: string;
    operarioId?: string; desde?: string; hasta?: string;
  };
}) {
  const { operarioId, desde, hasta } = searchParams;
  const { horarios, operarios } = await getData(operarioId, desde, hasta);

  const totalTrabajadas = horarios.reduce((s, h) => s + horasEntreTiempos(h.horarioInicio, h.horarioFin), 0);
  const totalExtras     = horarios.reduce((s, h) => s + (h.horasExtras || 0), 0);
  const totalNormales   = Math.max(0, totalTrabajadas - totalExtras);

  const hayFiltro = operarioId || desde || hasta;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Horarios</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{horarios.length} registros{hayFiltro ? ' (filtrado)' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.creado    && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario añadido</span>}
          {searchParams.editado   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario actualizado</span>}
          {searchParams.eliminado && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario eliminado</span>}
          <PrintButton />
          <Link href="/admin/horarios/nuevo" className="btn-primary">+ Nuevo horario</Link>
        </div>
      </div>

      {/* Barra de filtros */}
      <form method="GET" className="glass-card no-print" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Operario</label>
          <select name="operarioId" className="form-input" defaultValue={operarioId ?? ''} style={{ minWidth: '180px' }}>
            <option value="">Todos los operarios</option>
            {operarios.map(o => (
              <option key={o.id} value={o.id}>{o.nombre} {o.apellidos}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Desde</label>
          <input name="desde" type="date" className="form-input" defaultValue={desde ?? ''} />
        </div>
        <div>
          <label className="form-label">Hasta</label>
          <input name="hasta" type="date" className="form-input" defaultValue={hasta ?? ''} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>Filtrar</button>
          {hayFiltro && (
            <Link href="/admin/horarios" className="btn-ghost" style={{ padding: '9px 18px', fontSize: '0.85rem' }}>Limpiar</Link>
          )}
        </div>
      </form>

      {/* Resumen de totales */}
      {horarios.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Horas trabajadas</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>{totalTrabajadas.toFixed(1)}h</p>
          </div>
          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Horas normales</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#38BDF8' }}>{totalNormales.toFixed(1)}h</p>
          </div>
          <div className="glass-card" style={{ padding: '18px 22px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Horas extras</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{totalExtras.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {/* Título de impresión */}
      {hayFiltro && (
        <div className="print-only" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)' }}>
            {operarioId && operarios.find(o => o.id === operarioId) && (
              <>Operario: <strong>{operarios.find(o => o.id === operarioId)!.nombre} {operarios.find(o => o.id === operarioId)!.apellidos}</strong> · </>
            )}
            {desde && <>Desde: <strong>{formatFecha(desde)}</strong> · </>}
            {hasta && <>Hasta: <strong>{formatFecha(hasta)}</strong></>}
          </p>
        </div>
      )}

      {horarios.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay registros{hayFiltro ? ' para este filtro' : ''}.{' '}
          {!hayFiltro && <Link href="/admin/horarios/nuevo" className="btn-ghost">Añadir el primero →</Link>}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Operario', 'Fecha', 'Entrada', 'Salida', 'H. Totales', 'Tipo horas', 'H. Extras', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map(h => {
                const hTrab = horasEntreTiempos(h.horarioInicio, h.horarioFin);
                return (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>
                      {h.operarioNombre}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontSize: '0.83rem' }}>
                      {formatFecha(h.fecha)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {h.horarioInicio}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                      {h.horarioFin}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      {hTrab.toFixed(1)}h
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
                    <td style={{ padding: '12px 16px' }} className="no-print">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link href={`/admin/horarios/${h.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                          Editar
                        </Link>
                        <DeleteButton
                          action={eliminarHorario.bind(null, h.id)}
                          mensaje={`¿Eliminar el horario de ${h.operarioNombre} del ${formatFecha(h.fecha)}?`}
                          className="btn-ghost"
                          style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                <td colSpan={4} style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-3)', textTransform: 'uppercase' }}>
                  Totales
                </td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-1)' }}>
                  {totalTrabajadas.toFixed(1)}h
                </td>
                <td />
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  +{totalExtras.toFixed(1)}h
                </td>
                <td className="no-print" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
