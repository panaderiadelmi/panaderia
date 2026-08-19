import { adminDb } from '@/lib/firebase/admin';
import type { Cliente } from '@/lib/types';
import { eliminarCliente } from '@/lib/actions/clientes';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { PrintButton } from '@/components/admin/PrintButton';
import Link from 'next/link';

export const metadata = { title: 'Clientes — Admin' };

async function getClientes(): Promise<Cliente[]> {
  const snap = await adminDb.collection('clientes').orderBy('createdAt', 'desc').limit(200).get();
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }) as Cliente);
}

async function contarPedidos(clienteId: string): Promise<number> {
  const snap = await adminDb.collection('pedidos').where('clienteId', '==', clienteId).count().get();
  return snap.data().count;
}

export default async function AdminClientesPage({ searchParams }: { searchParams: { editado?: string; eliminado?: string } }) {
  const clientes = await getClientes();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Clientes</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{clientes.length} clientes registrados</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchParams.editado   && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Cliente actualizado</span>}
          {searchParams.eliminado && <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>✓ Cliente eliminado</span>}
          <PrintButton />
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          Aún no hay clientes registrados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Cabecera */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 130px 120px 80px auto', gap: '16px', padding: '8px 20px', fontSize: '0.72rem', color: 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <span>Nombre</span>
            <span>Email</span>
            <span>Usuario</span>
            <span>Teléfono</span>
            <span>Rol</span>
            <span></span>
          </div>

          {clientes.map(c => (
            <div key={c.uid} className="glass-card" style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr 180px 130px 120px 80px auto', gap: '16px', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {c.nombre} {c.apellidos}
                </p>
                {!c.activo && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-error)' }}>Inactivo</span>
                )}
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.email}
              </span>
              <span style={{ fontSize: '0.82rem', color: c.username ? 'var(--color-text-2)' : 'var(--color-text-4)', fontFamily: c.username ? 'var(--font-display)' : undefined }}>
                {c.username || '—'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                {c.telefono || '—'}
              </span>
              <span className="badge" style={{
                background: c.rol === 'administrador' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${c.rol === 'administrador' ? 'rgba(245,158,11,0.3)' : 'var(--color-border)'}`,
                color: c.rol === 'administrador' ? 'var(--color-primary)' : 'var(--color-text-3)',
              }}>
                {c.rol === 'administrador' ? '👑 Admin' : 'Cliente'}
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Link href={`/admin/clientes/${c.uid}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>Ver</Link>
                <Link href={`/admin/clientes/${c.uid}/editar`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 10px' }}>Editar</Link>
                <DeleteButton
                  action={eliminarCliente.bind(null, c.uid)}
                  mensaje={`¿Eliminar a ${c.nombre} ${c.apellidos}? Esta acción no se puede deshacer.`}
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'var(--color-error)', borderColor: 'rgba(248,113,113,0.3)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
