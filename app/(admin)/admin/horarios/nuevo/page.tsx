import { adminDb } from '@/lib/firebase/admin';
import { type Operario, TIPOS_HORAS } from '@/lib/types';
import { crearHorario } from '@/lib/actions/operarios';
import Link from 'next/link';

export const metadata = { title: 'Nuevo horario — Admin' };

async function getOperarios(): Promise<Pick<Operario, 'id' | 'nombre' | 'apellidos'>[]> {
  const snap = await adminDb.collection('operarios').where('activo', '==', true).orderBy('apellidos').get();
  return snap.docs.map(d => ({ id: d.id, nombre: d.data().nombre, apellidos: d.data().apellidos }));
}

export default async function NuevoHorarioPage() {
  const operarios = await getOperarios();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/horarios" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nuevo horario</h1>
      </div>

      <form action={crearHorario} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <HorarioFormFields operarios={operarios} defaultFecha={today} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Añadir horario</button>
          <Link href="/admin/horarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}

export function HorarioFormFields({
  operarios,
  defaultFecha,
  defaultValues,
}: {
  operarios: Pick<Operario, 'id' | 'nombre' | 'apellidos'>[];
  defaultFecha?: string;
  defaultValues?: Record<string, string | number>;
}) {
  const v = defaultValues ?? {};

  return (
    <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      <div>
        <label className="form-label">Operario *</label>
        <select name="operarioId" required className="form-input" defaultValue={v.operarioId as string ?? ''}>
          <option value="">Seleccionar operario...</option>
          {operarios.map(o => (
            <option key={o.id} value={o.id}>{o.apellidos}, {o.nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Fecha *</label>
        <input name="fecha" type="date" required className="form-input" defaultValue={v.fecha as string ?? defaultFecha ?? ''} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label className="form-label">Hora de entrada *</label>
          <input name="horarioInicio" type="time" required className="form-input" defaultValue={v.horarioInicio as string ?? ''} />
        </div>
        <div>
          <label className="form-label">Hora de salida *</label>
          <input name="horarioFin" type="time" required className="form-input" defaultValue={v.horarioFin as string ?? ''} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label className="form-label">Tipo de horas *</label>
          <select name="tipoHoras" required className="form-input" defaultValue={v.tipoHoras as string ?? 'ordinarias'}>
            {Object.entries(TIPOS_HORAS).map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Horas extras</label>
          <input name="horasExtras" type="number" min="0" step="0.5" className="form-input" defaultValue={v.horasExtras as string ?? '0'} placeholder="0" />
        </div>
      </div>

      <div>
        <label className="form-label">Notas</label>
        <textarea name="notas" rows={2} className="form-input" defaultValue={v.notas as string ?? ''} placeholder="Observaciones..." style={{ resize: 'vertical' }} />
      </div>
    </div>
  );
}
