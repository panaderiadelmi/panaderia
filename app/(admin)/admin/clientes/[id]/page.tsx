import { adminDb } from '@/lib/firebase/admin';
import { ESTADOS_PEDIDO, type Cliente, type Pedido } from '@/lib/types';
import { guardarNotaAdminCliente } from '@/lib/actions/perfil';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Ficha de cliente — Admin' };

export default async function AdminClienteDetallePage({ params }: { params: { id: string } }) {
  const [clienteSnap, pedidosSnap] = await Promise.all([
    adminDb.collection('clientes').doc(params.id).get(),
    adminDb.collection('pedidos').where('clienteId', '==', params.id).orderBy('createdAt', 'desc').limit(20).get(),
  ]);

  if (!clienteSnap.exists) notFound();

  const cliente = { uid: clienteSnap.id, ...clienteSnap.data() } as Cliente;
  const pedidos = pedidosSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Pedido);

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/clientes" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            {cliente.nombre} {cliente.apellidos}
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '2px' }}>{cliente.email}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

        {/* Pedidos */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '14px' }}>
            Historial de pedidos ({pedidos.length})
          </h2>
          {pedidos.length === 0 ? (
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-4)' }}>
              Sin pedidos aún.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pedidos.map(p => {
                const est = ESTADOS_PEDIDO[p.estado];
                return (
                  <div key={p.id} className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', minWidth: '120px' }}>#{p.numero}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', flex: 1 }}>
                      {p.franjaRecogida?.fecha ?? '—'}
                    </span>
                    <span className="badge" style={{ background: `${est.color}18`, border: `1px solid ${est.color}40`, color: est.color }}>
                      {est.emoji} {est.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {p.totalConIVA.toFixed(2)} €
                    </span>
                    <Link href={`/admin/pedidos/${p.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>Ver →</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Datos + notas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Datos personales
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <Row label="Teléfono" value={cliente.telefono || '—'} />
              <Row label="Rol" value={cliente.rol} />
              {cliente.alergias?.length > 0 && (
                <Row label="Alergias" value={cliente.alergias.join(', ')} />
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nota interna
            </h2>
            <form action={guardarNotaAdminCliente.bind(null, cliente.uid)}>
              <textarea
                name="notasAdmin"
                defaultValue={cliente.notasAdmin ?? ''}
                rows={4}
                placeholder="Notas internas sobre este cliente..."
                className="form-input"
                style={{ resize: 'vertical' }}
              />
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-secondary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <span style={{ color: 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.78rem', minWidth: '80px' }}>{label}</span>
      <span style={{ color: 'var(--color-text-2)' }}>{value}</span>
    </div>
  );
}
