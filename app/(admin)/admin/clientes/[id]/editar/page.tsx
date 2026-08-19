import { adminDb } from '@/lib/firebase/admin';
import { editarCliente } from '@/lib/actions/clientes';
import type { Cliente } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar cliente — Admin' };

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('clientes').doc(params.id).get();
  if (!snap.exists) notFound();

  const c = { uid: snap.id, ...snap.data() } as Cliente;

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/clientes" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Editar cliente
        </h1>
      </div>

      <form action={editarCliente.bind(null, c.uid)} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Datos personales
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Nombre *</label>
              <input name="nombre" required className="form-input" defaultValue={c.nombre} />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input name="apellidos" required className="form-input" defaultValue={c.apellidos} />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" disabled className="form-input" value={c.email} style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <input name="telefono" type="tel" className="form-input" defaultValue={c.telefono ?? ''} placeholder="+34 600 000 000" />
          </div>
          <div>
            <label className="form-label">Nombre de usuario</label>
            <input name="username" type="text" className="form-input" defaultValue={c.username ?? ''} placeholder="nombre_usuario" />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Estado
          </h2>
          <div>
            <label className="form-label">Estado de la cuenta</label>
            <select name="activo" className="form-input" defaultValue={c.activo ? 'true' : 'false'}>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href="/admin/clientes" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
