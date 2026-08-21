import { adminDb } from '@/lib/firebase/admin';
import { type Operario, TIPOS_AUSENCIA, TIPOS_AUSENCIA_NUEVOS } from '@/lib/types';
import { crearAusencia } from '@/lib/actions/operarios';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Nueva incidencia — Admin' };

export default async function NuevaAusenciaPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('operarios').doc(params.id).get();
  if (!snap.exists) notFound();

  const o = { id: snap.id, ...snap.data() } as Operario;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href={`/admin/operarios/${o.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nueva incidencia</h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '2px' }}>
            {o.nombre} {o.apellidos}
          </p>
        </div>
      </div>

      <form action={crearAusencia.bind(null, o.id)} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label className="form-label">Tipo de incidencia *</label>
            <select name="tipo" required className="form-input">
              {TIPOS_AUSENCIA_NUEVOS.map(k => (
                <option key={k} value={k}>{TIPOS_AUSENCIA[k].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Desde *</label>
              <input name="desde" type="date" required className="form-input" />
            </div>
            <div>
              <label className="form-label">Hasta *</label>
              <input name="hasta" type="date" required className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label">Notas</label>
            <textarea name="notas" rows={3} className="form-input" placeholder="Motivo, observaciones..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Guardar incidencia</button>
          <Link href={`/admin/operarios/${o.id}`} className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
