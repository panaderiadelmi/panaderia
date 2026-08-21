import { adminDb } from '@/lib/firebase/admin';
import { type Operario, type Ausencia, TIPOS_AUSENCIA } from '@/lib/types';
import { actualizarAusencia } from '@/lib/actions/operarios';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar incidencia — Admin' };

export default async function EditarAusenciaPage({
  params,
}: {
  params: { id: string; ausenciaId: string };
}) {
  const [opSnap, ausSnap] = await Promise.all([
    adminDb.collection('operarios').doc(params.id).get(),
    adminDb.collection('ausencias').doc(params.ausenciaId).get(),
  ]);

  if (!opSnap.exists || !ausSnap.exists) notFound();

  const o = { id: opSnap.id, ...opSnap.data() } as Operario;
  const a = { id: ausSnap.id, ...ausSnap.data() } as Ausencia;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/admin/operarios/${o.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Editar incidencia</h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '2px' }}>
            {o.nombre} {o.apellidos}
          </p>
        </div>
      </div>

      <form action={actualizarAusencia.bind(null, a.id, o.id)} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label className="form-label">Tipo de incidencia *</label>
            <select name="tipo" required className="form-input" defaultValue={a.tipo}>
              {Object.entries(TIPOS_AUSENCIA).map(([k, cfg]) => (
                <option key={k} value={k}>{cfg.label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Desde *</label>
              <input name="desde" type="date" required className="form-input" defaultValue={a.desde} />
            </div>
            <div>
              <label className="form-label">Hasta *</label>
              <input name="hasta" type="date" required className="form-input" defaultValue={a.hasta} />
            </div>
          </div>

          <div>
            <label className="form-label">Notas</label>
            <textarea name="notas" rows={3} className="form-input" defaultValue={a.notas ?? ''} placeholder="Motivo, observaciones..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href={`/admin/operarios/${o.id}`} className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
