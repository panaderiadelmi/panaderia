import { adminDb } from '@/lib/firebase/admin';
import { type Operario, CATEGORIAS_OPERARIO, TIPOS_CONTRATO } from '@/lib/types';
import { actualizarOperario } from '@/lib/actions/operarios';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar operario — Admin' };

export default async function EditarOperarioPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { editado?: string };
}) {
  const snap = await adminDb.collection('operarios').doc(params.id).get();
  if (!snap.exists) notFound();

  const o = { id: snap.id, ...snap.data() } as Operario;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/operarios" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {o.nombre} {o.apellidos}
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '2px' }}>
            {CATEGORIAS_OPERARIO[o.categoria] ?? o.categoria}
          </p>
        </div>
        {searchParams.editado && (
          <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Guardado</span>
        )}
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

        {/* Notas */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Notas internas
          </h2>
          <textarea name="notas" rows={3} className="form-input" defaultValue={o.notas ?? ''} placeholder="Observaciones, permisos especiales..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href="/admin/operarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
