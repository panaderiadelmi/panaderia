import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/firebase/auth';
import { ESTADOS_PEDIDO, type Pedido, type EstadoPedido } from '@/lib/types';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Detalle de pedido' };

const TIMELINE: EstadoPedido[] = ['pendiente', 'confirmado', 'elaborando', 'listo', 'recogido'];

export default async function PedidoDetallePage({ params }: { params: { id: string } }) {
  const sesion = await getSession();
  if (!sesion) redirect('/login');

  const snap = await adminDb.collection('pedidos').doc(params.id).get();
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  if (pedido.clienteId !== sesion.uid) notFound();

  const estadoActual = ESTADOS_PEDIDO[pedido.estado];
  const idxActual = TIMELINE.indexOf(pedido.estado);

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/mi-cuenta" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Mis pedidos</Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Pedido #{pedido.numero}
          </h1>
        </div>
        <span className="badge" style={{ marginLeft: 'auto', background: `${estadoActual.color}18`, border: `1px solid ${estadoActual.color}40`, color: estadoActual.color, fontSize: '0.8rem', padding: '6px 14px' }}>
          {estadoActual.emoji} {estadoActual.label}
        </span>
      </div>

      {/* Timeline de estado */}
      {pedido.estado !== 'cancelado' && (
        <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '0', position: 'relative' }}>
            {TIMELINE.map((estado, idx) => {
              const s = ESTADOS_PEDIDO[estado];
              const activo = idx <= idxActual;
              const esCurrent = idx === idxActual;
              return (
                <div key={estado} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  {idx < TIMELINE.length - 1 && (
                    <div style={{ position: 'absolute', top: '15px', left: '50%', width: '100%', height: '2px', background: activo && idx < idxActual ? 'var(--color-primary)' : 'var(--color-border)', zIndex: 0 }} />
                  )}
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: activo ? 'var(--color-primary)' : 'var(--color-bg-alt)',
                    border: `2px solid ${activo ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    zIndex: 1, position: 'relative',
                    boxShadow: esCurrent ? '0 0 12px var(--color-primary-glow)' : 'none',
                    fontSize: '0.75rem',
                    color: activo ? '#000' : 'var(--color-text-4)',
                    fontWeight: 800,
                  }}>
                    {activo ? '✓' : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: activo ? 'var(--color-text-1)' : 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: esCurrent ? 700 : 500, textAlign: 'center' }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>

        {/* Productos */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Productos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedido.lineas.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', minWidth: '28px' }}>{l.cantidad}×</span>
                <span style={{ flex: 1 }}>{l.nombre}</span>
                <span style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{l.peso}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{l.totalConIVA.toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border-amber)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
              <span>Base imponible</span><span>{pedido.subtotalSinIVA.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
              <span>IVA</span><span>{pedido.ivaTotal.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem', marginTop: '4px' }}>
              <span>Total</span><span>{pedido.totalConIVA.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        {/* Lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Recogida
            </h2>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{pedido.franjaRecogida?.fecha ?? '—'}</p>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '4px' }}>
              {pedido.franjaRecogida ? `${pedido.franjaRecogida.horaInicio} – ${pedido.franjaRecogida.horaFin}` : '—'}
            </p>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Pago
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              {pedido.metodoPago === 'stripe_card' && 'Tarjeta'}
              {pedido.metodoPago === 'stripe_bizum' && 'Bizum'}
              {pedido.metodoPago === 'efectivo_recogida' && 'Efectivo en recogida'}
            </p>
          </div>

          {pedido.facturaUrl && (
            <a href={pedido.facturaUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Descargar factura PDF
            </a>
          )}

          <RepetirPedidoInfo lineas={pedido.lineas} />
        </div>
      </div>
    </>
  );
}

function RepetirPedidoInfo({ lineas }: { lineas: Pedido['lineas'] }) {
  return (
    <Link href="/catalogo" className="btn-ghost" style={{ textAlign: 'center', justifyContent: 'center', border: '1px solid var(--color-border)' }}>
      Volver a pedir productos similares →
    </Link>
  );
}
