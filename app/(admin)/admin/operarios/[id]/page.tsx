import { adminDb } from '@/lib/firebase/admin';
import { type Operario, type Ausencia, type ConfiguracionEmpresa, CATEGORIAS_OPERARIO, TIPOS_CONTRATO, TIPOS_AUSENCIA } from '@/lib/types';
import { actualizarOperario, eliminarAusencia } from '@/lib/actions/operarios';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PrintButton } from '@/components/admin/PrintButton';
import { PrintHeader } from '@/components/admin/PrintHeader';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar operario — Admin' };

function formatFecha(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function diasEntreFechas(desde: string, hasta: string): number {
  const d1 = new Date(desde);
  const d2 = new Date(hasta);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1);
}

export default async function EditarOperarioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { editado?: string; ausencia?: string };
}) {
  const [snap, ausenciasSnap, cfgSnap] = await Promise.all([
    adminDb.collection('operarios').doc(params.id).get(),
    adminDb.collection('ausencias').where('operarioId', '==', params.id).get(),
    adminDb.collection('configuracion').doc('empresa').get(),
  ]);
  const cfg = (cfgSnap.data() ?? {}) as Partial<ConfiguracionEmpresa>;

  if (!snap.exists) notFound();

  const o = { id: snap.id, ...snap.data() } as Operario;
  const ausencias = ausenciasSnap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Ausencia)
    .sort((a, b) => b.desde.localeCompare(a.desde));

  const horasMensuales = o.jornadaHorasDiarias && o.jornadaDiasMensuales
    ? Math.round(o.jornadaHorasDiarias * o.jornadaDiasMensuales * 10) / 10
    : o.horasSemanales
      ? Math.round(o.horasSemanales * 52 / 12 * 10) / 10
      : null;
  const horasAnuales = o.horasSemanales ? Math.round(o.horasSemanales * 52 * 10) / 10 : null;

  return (
    <>
      <PrintHeader cfg={cfg} titulo={`Ficha operario: ${o.nombre} ${o.apellidos}`} />
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/admin/operarios" className="btn-ghost no-print" style={{ fontSize: '0.75rem' }}>← Volver</Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {o.nombre} {o.apellidos}
            </h1>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '2px' }}>
              {CATEGORIAS_OPERARIO[o.categoria] ?? o.categoria}
            </p>
          </div>
          {(searchParams.editado) && (
            <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Guardado</span>
          )}
          {searchParams.ausencia === 'creada'    && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Incidencia añadida</span>}
          {searchParams.ausencia === 'editada'   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Incidencia actualizada</span>}
          {searchParams.ausencia === 'eliminada' && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Incidencia eliminada</span>}
        </div>
        <PrintButton />
      </div>

      <form action={actualizarOperario.bind(null, o.id)} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Datos personales */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Datos personales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Nombre *</label>
              <input name="nombre" required className="form-input" defaultValue={o.nombre} />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input name="apellidos" required className="form-input" defaultValue={o.apellidos} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Fecha de nacimiento</label>
              <input name="fechaNacimiento" type="date" className="form-input" defaultValue={o.fechaNacimiento ?? ''} />
            </div>
            <div>
              <label className="form-label">Teléfono</label>
              <input name="telefono" type="tel" className="form-input" defaultValue={o.telefono ?? ''} placeholder="+34 600 000 000" />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" defaultValue={o.email ?? ''} />
          </div>
        </div>

        {/* Datos laborales */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Datos laborales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Categoría / Puesto *</label>
              <select name="categoria" required className="form-input" defaultValue={o.categoria}>
                {Object.entries(CATEGORIAS_OPERARIO).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Tipo de contrato *</label>
              <select name="tipoContrato" required className="form-input" defaultValue={o.tipoContrato}>
                {Object.entries(TIPOS_CONTRATO).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Fecha de inicio (contrato)</label>
            <input name="fechaInicio" type="date" className="form-input" defaultValue={o.fechaInicio ?? ''} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Nº Seguridad Social</label>
              <input name="nss" className="form-input" defaultValue={o.nss ?? ''} placeholder="XXXXXXXXXX/XX" />
            </div>
            <div>
              <label className="form-label">Número de cuenta (IBAN)</label>
              <input name="numeroCuenta" className="form-input" defaultValue={o.numeroCuenta ?? ''} placeholder="ES00 0000 0000 0000 0000 0000" />
            </div>
          </div>
        </div>

        {/* Estado */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estado
          </h2>
          <div>
            <label className="form-label">Estado del operario</label>
            <select name="activo" className="form-input" defaultValue={o.activo ? 'true' : 'false'}>
              <option value="true">Activo</option>
              <option value="false">Inactivo / Baja</option>
            </select>
          </div>
        </div>

        {/* Jornada contratada */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Jornada contratada
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Horas semanales</label>
              <input name="horasSemanales" type="number" step="0.5" min="0" max="40" className="form-input" defaultValue={o.horasSemanales ?? ''} placeholder="40" />
            </div>
            <div>
              <label className="form-label">Días por semana</label>
              <input name="jornadaDiasSemanales" type="number" step="1" min="1" max="7" className="form-input" defaultValue={o.jornadaDiasSemanales ?? ''} placeholder="5" />
            </div>
            <div>
              <label className="form-label">Días por mes</label>
              <input name="jornadaDiasMensuales" type="number" step="1" min="1" max="31" className="form-input" defaultValue={o.jornadaDiasMensuales ?? ''} placeholder="22" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Hora entrada habitual</label>
              <input name="jornadaEntrada" type="time" className="form-input" defaultValue={o.jornadaEntrada ?? ''} />
            </div>
            <div>
              <label className="form-label">Hora salida habitual</label>
              <input name="jornadaSalida" type="time" className="form-input" defaultValue={o.jornadaSalida ?? ''} />
            </div>
            <div>
              <label className="form-label">Horas diarias</label>
              <input name="jornadaHorasDiarias" type="number" step="0.5" min="0" max="24" className="form-input" defaultValue={o.jornadaHorasDiarias ?? ''} placeholder="8" />
            </div>
          </div>
          {(horasMensuales || horasAnuales) && (
            <div style={{ display: 'flex', gap: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
              {horasMensuales && <span>Horas/mes estimadas: <strong style={{ color: 'var(--color-text-1)' }}>{horasMensuales} h</strong></span>}
              {horasAnuales  && <span>Horas/año estimadas: <strong style={{ color: 'var(--color-text-1)' }}>{horasAnuales} h</strong></span>}
            </div>
          )}
        </div>

        {/* Notas */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Notas internas
          </h2>
          <textarea name="notas" rows={3} className="form-input" defaultValue={o.notas ?? ''} placeholder="Observaciones, permisos especiales..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href="/admin/operarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>

      {/* Incidencias laborales */}
      <div style={{ maxWidth: '640px', marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-1)' }}>
            Incidencias laborales
          </h2>
          <Link
            href={`/admin/operarios/${o.id}/ausencias/nueva`}
            className="btn-primary no-print"
            style={{ fontSize: '0.8rem', padding: '8px 14px' }}
          >
            + Añadir
          </Link>
        </div>

        {ausencias.length === 0 ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-4)', fontSize: '0.9rem' }}>
            Sin incidencias registradas.
          </div>
        ) : (
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Tipo', 'Desde', 'Hasta', 'Días', 'Notas', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ausencias.map(a => {
                  const cfg = TIPOS_AUSENCIA[a.tipo] ?? TIPOS_AUSENCIA.otro;
                  const dias = diasEntreFechas(a.desde, a.hasta);
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <span className="badge" style={{
                          background: `${cfg.color}1a`,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.color,
                          whiteSpace: 'nowrap',
                        }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                        {formatFecha(a.desde)}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>
                        {formatFecha(a.hasta)}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                        {dias}d
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-4)', fontSize: '0.8rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.notas || '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }} className="no-print">
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Link href={`/admin/operarios/${o.id}/ausencias/${a.id}`} className="btn-ghost" style={{ fontSize: '0.72rem', padding: '5px 10px' }}>
                            Editar
                          </Link>
                          <DeleteButton
                            action={eliminarAusencia.bind(null, a.id, o.id)}
                            mensaje={`¿Eliminar esta incidencia (${cfg.label})?`}
                            className="btn-ghost"
                            style={{ fontSize: '0.72rem', padding: '5px 10px', color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
