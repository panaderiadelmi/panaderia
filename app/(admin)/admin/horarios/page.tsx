import { adminDb } from '@/lib/firebase/admin';
import { type HorarioOperario, type Operario, type Ausencia, TIPOS_HORAS, TIPOS_AUSENCIA } from '@/lib/types';
import { eliminarHorario } from '@/lib/actions/operarios';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PrintButton } from '@/components/admin/PrintButton';
import Link from 'next/link';

export const metadata = { title: 'Horarios — Admin' };

function horasEntreTiempos(inicio: string, fin: string): number {
  const [hI, mI] = inicio.split(':').map(Number);
  const [hF, mF] = fin.split(':').map(Number);
  return Math.max(0, (hF * 60 + mF - hI * 60 - mI) / 60);
}

function diasEntreFechas(desde: string, hasta: string): number {
  const d1 = new Date(desde), d2 = new Date(hasta);
  return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
}

function formatFecha(iso: string) {
  if (!iso) return '—';
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

  let ausencias: Ausencia[] = [];
  if (operarioId) {
    const ausSnap = await adminDb.collection('ausencias').where('operarioId', '==', operarioId).get();
    ausencias = ausSnap.docs
      .map(d => ({ id: d.id, ...d.data() }) as Ausencia)
      .sort((a, b) => b.desde.localeCompare(a.desde));
  }

  if (operarioId) horarios = horarios.filter(h => h.operarioId === operarioId);
  if (desde) {
    horarios  = horarios.filter(h => h.fecha >= desde);
    ausencias = ausencias.filter(a => a.hasta >= desde);
  }
  if (hasta) {
    horarios  = horarios.filter(h => h.fecha <= hasta);
    ausencias = ausencias.filter(a => a.desde <= hasta);
  }

  return { horarios, operarios, ausencias };
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
  const { horarios, operarios, ausencias } = await getData(operarioId, desde, hasta);

  const totalTrabajadas = horarios.reduce((s, h) => s + horasEntreTiempos(h.horarioInicio, h.horarioFin), 0);
  const totalExtras     = horarios.reduce((s, h) => s + (h.horasExtras || 0), 0);
  const totalNormales   = Math.max(0, totalTrabajadas - totalExtras);

  const hayFiltro = operarioId || desde || hasta;
  const operarioSel = operarios.find(o => o.id === operarioId);

  // Resumen de días de ausencia por tipo
  const resumenAusencias = ausencias.reduce<Record<string, number>>((acc, a) => {
    const dias = diasEntreFechas(a.desde, a.hasta);
    acc[a.tipo] = (acc[a.tipo] || 0) + dias;
    return acc;
  }, {});

  // Combinamos horarios y ausencias en una línea de tiempo ordenada
  type FilaHorario  = { tipo: 'horario';  fecha: string; data: HorarioOperario };
  type FilaAusencia = { tipo: 'ausencia'; fecha: string; data: Ausencia };
  type Fila = FilaHorario | FilaAusencia;

  const filas: Fila[] = [
    ...horarios.map(h => ({ tipo: 'horario'  as const, fecha: h.fecha,   data: h })),
    ...ausencias.map(a => ({ tipo: 'ausencia' as const, fecha: a.desde,   data: a })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Horarios e incidencias</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>
            {horarios.length} jornadas · {ausencias.length} incidencias{hayFiltro ? ' (filtrado)' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.creado    && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario añadido</span>}
          {searchParams.editado   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Horario actualizado</span>}
          {searchParams.eliminado && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Eliminado</span>}
          <PrintButton />
          <Link href="/admin/horarios/nuevo" className="btn-primary">+ Nueva jornada</Link>
        </div>
      </div>

      {/* Barra de filtros */}
      <form method="GET" className="glass-card no-print" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label">Operario</label>
          <select name="operarioId" className="form-input" defaultValue={operarioId ?? ''} style={{ minWidth: '200px' }}>
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
        {operarioSel ? (
          <Link
            href={`/admin/operarios/${operarioSel.id}/ausencias/nueva`}
            className="btn-ghost no-print"
            style={{ padding: '9px 18px', fontSize: '0.85rem', marginLeft: 'auto' }}
          >
            + Registrar incidencia
          </Link>
        ) : (
          <span
            className="btn-ghost no-print"
            title="Selecciona un operario para registrar una incidencia"
            style={{ padding: '9px 18px', fontSize: '0.85rem', marginLeft: 'auto', opacity: 0.4, cursor: 'default' }}
          >
            + Registrar incidencia
          </span>
        )}
      </form>

      {/* Cabecera de impresión */}
      {hayFiltro && (
        <div className="print-only" style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--color-text-3)' }}>
          {operarioSel && <><strong>{operarioSel.nombre} {operarioSel.apellidos}</strong> · </>}
          {desde && <>Desde: {formatFecha(desde)} </>}
          {hasta && <>Hasta: {formatFecha(hasta)}</>}
        </div>
      )}

      {/* Tarjetas de resumen — horas */}
      {horarios.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Horas trabajadas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>{totalTrabajadas.toFixed(1)}h</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Horas normales</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#38BDF8' }}>{totalNormales.toFixed(1)}h</p>
          </div>
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Horas extras</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>{totalExtras.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {/* Tarjetas de resumen — incidencias */}
      {ausencias.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          {Object.entries(resumenAusencias).map(([tipo, dias]) => {
            const cfg = TIPOS_AUSENCIA[tipo as keyof typeof TIPOS_AUSENCIA] ?? TIPOS_AUSENCIA.otro;
            return (
              <div key={tipo} className="glass-card" style={{
                padding: '12px 18px',
                border: `1px solid ${cfg.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <span style={{ fontSize: '0.75rem', color: cfg.color, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{cfg.label}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: cfg.color }}>{dias}d</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabla combinada */}
      {filas.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay registros{hayFiltro ? ' para este filtro' : ''}.{' '}
          {!hayFiltro && <Link href="/admin/horarios/nuevo" className="btn-ghost">Añadir el primero →</Link>}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Operario', 'Concepto', 'Fecha / Período', 'Detalle', 'Días / Horas', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map(fila => {
                if (fila.tipo === 'horario') {
                  const h = fila.data;
                  const hTrab = horasEntreTiempos(h.horarioInicio, h.horarioFin);
                  return (
                    <tr key={`h-${h.id}`} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>{h.operarioNombre}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span className="badge" style={{
                          background: h.tipoHoras === 'ordinarias' ? 'rgba(56,189,248,0.1)' : h.tipoHoras === 'nocturnas' ? 'rgba(167,139,250,0.1)' : 'rgba(245,158,11,0.1)',
                          border: `1px solid ${h.tipoHoras === 'ordinarias' ? 'rgba(56,189,248,0.3)' : h.tipoHoras === 'nocturnas' ? 'rgba(167,139,250,0.3)' : 'rgba(245,158,11,0.3)'}`,
                          color: h.tipoHoras === 'ordinarias' ? '#38BDF8' : h.tipoHoras === 'nocturnas' ? '#A78BFA' : 'var(--color-primary)',
                        }}>
                          {TIPOS_HORAS[h.tipoHoras] ?? h.tipoHoras}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                        {formatFecha(h.fecha)}
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                        {h.horarioInicio} → {h.horarioFin}
                        {h.horasExtras > 0 && <span style={{ color: 'var(--color-primary)', marginLeft: '8px', fontWeight: 700 }}>+{h.horasExtras}h ext.</span>}
                      </td>
                      <td style={{ padding: '11px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-1)' }}>
                        {hTrab.toFixed(1)}h
                      </td>
                      <td style={{ padding: '11px 16px' }} className="no-print">
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Link href={`/admin/horarios/${h.id}`} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '5px 10px' }}>Editar</Link>
                          <DeleteButton
                            action={eliminarHorario.bind(null, h.id)}
                            mensaje={`¿Eliminar la jornada de ${h.operarioNombre} del ${formatFecha(h.fecha)}?`}
                            className="btn-ghost"
                            style={{ fontSize: '0.72rem', padding: '5px 10px', color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  const a = fila.data;
                  const cfg = TIPOS_AUSENCIA[a.tipo] ?? TIPOS_AUSENCIA.otro;
                  const dias = diasEntreFechas(a.desde, a.hasta);
                  return (
                    <tr key={`a-${a.id}`} style={{ borderBottom: '1px solid var(--color-border)', background: `${cfg.color}08` }}>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--color-text-1)' }}>{a.operarioNombre}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span className="badge" style={{ background: `${cfg.color}1a`, border: `1px solid ${cfg.border}`, color: cfg.color, whiteSpace: 'nowrap' }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                        {formatFecha(a.desde)} → {formatFecha(a.hasta)}
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--color-text-4)', fontSize: '0.8rem' }}>
                        {a.notas || '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: cfg.color }}>
                        {dias}d
                      </td>
                      <td style={{ padding: '11px 16px' }} className="no-print">
                        <Link
                          href={`/admin/operarios/${a.operarioId}/ausencias/${a.id}`}
                          className="btn-ghost"
                          style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
            {horarios.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan={3} style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-text-3)', textTransform: 'uppercase' }}>
                    Totales jornadas
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-1)', fontSize: '0.85rem' }}>
                    {horarios.length} jornadas · {totalExtras > 0 ? `+${totalExtras.toFixed(1)}h extras` : 'sin extras'}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text-1)' }}>
                    {totalTrabajadas.toFixed(1)}h
                  </td>
                  <td className="no-print" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </>
  );
}
