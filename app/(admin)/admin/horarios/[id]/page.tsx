import { adminDb } from '@/lib/firebase/admin';
import { type HorarioOperario, type Operario, TIPOS_HORAS } from '@/lib/types';
import { actualizarHorario } from '@/lib/actions/operarios';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar horario — Admin' };

async function getOperarios(): Promise<Pick<Operario, 'id' | 'nombre' | 'apellidos'>[]> {
  const snap = await adminDb.collection('operarios').where('activo', '==', true).orderBy('apellidos').get();
  return snap.docs.map(d => ({ id: d.id, nombre: d.data().nombre, apellidos: d.data().apellidos }));
}

export default async function EditarHorarioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { editado?: string };
}) {
  const [snap, operarios] = await Promise.all([
    adminDb.collection('horarios').doc(params.id).get(),
    getOperarios(),
  ]);

  if (!snap.exists) notFound();

  const h = { id: snap.id, ...snap.data() } as HorarioOperario;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/horarios" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Editar horario
        </h1>
        {searchParams.editado && (
          <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Guardado</span>
        )}
      </div>

      <form action={actualizarHorario.bind(null, h.id)} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div>
            <label className="form-label">Operario *</label>
            <select name="operarioId" required className="form-input" defaultValue={h.operarioId}>
              {operarios.map(o => (
                <option key={o.id} value={o.id}>{o.apellidos}, {o.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Fecha *</label>
            <input name="fecha" type="date" required className="form-input" defaultValue={h.fecha} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Hora de entrada *</label>
              <input name="horarioInicio" type="time" required className="form-input" defaultValue={h.horarioInicio} />
            </div>
            <div>
              <label className="form-label">Hora de salida *</label>
              <input name="horarioFin" type="time" required className="form-input" defaultValue={h.horarioFin} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Tipo de horas *</label>
              <select name="tipoHoras" required className="form-input" defaultValue={h.tipoHoras}>
                {Object.entries(TIPOS_HORAS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Horas extras</label>
              <input name="horasExtras" type="number" min="0" step="0.5" className="form-input" defaultValue={h.horasExtras ?? 0} />
            </div>
          </div>

          <div>
            <label className="form-label">Notas</label>
            <textarea name="notas" rows={2} className="form-input" defaultValue={h.notas ?? ''} placeholder="Observaciones..." style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href="/admin/horarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
