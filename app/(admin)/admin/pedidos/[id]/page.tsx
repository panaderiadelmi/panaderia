import { adminDb } from '@/lib/firebase/admin';
import { ESTADOS_PEDIDO, type Pedido, type EstadoPedido } from '@/lib/types';
import { cambiarEstadoPedido, guardarNotaAdmin, actualizarBultos } from '@/lib/actions/pedidos';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/admin/PrintButton';

export const metadata = { title: 'Detalle de pedido — Admin' };

const TRANSICIONES: Partial<Record<EstadoPedido, EstadoPedido[]>> = {
  pendiente:  ['confirmado', 'cancelado'],
  confirmado: ['elaborando', 'cancelado'],
  elaborando: ['listo', 'cancelado'],
  listo:      ['recogido'],
};

const LABEL_BOTON: Record<EstadoPedido, string> = {
  confirmado:  'Confirmar pedido',
  elaborando:  'En elaboración',
  listo:       'Listo para recoger',
  recogido:    'Marcar recogido',
  cancelado:   'Cancelar pedido',
  pendiente:   'Pendiente',
};

export default async function AdminPedidoDetallePage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('pedidos').doc(params.id).get();
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const estadoActual = ESTADOS_PEDIDO[pedido.estado];
  const proximos = TRANSICIONES[pedido.estado] ?? [];

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <Link href="/admin/pedidos" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            Pedido #{pedido.numero}
          </h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '2px', fontSize: '0.85rem' }}>
            {pedido.clienteNombre} · {pedido.clienteEmail}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={`/admin/pedidos/${pedido.id}/factura`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '7px 12px' }}>🧾 Factura</Link>
          <Link href={`/admin/pedidos/${pedido.id}/recibo`}  className="btn-ghost" style={{ fontSize: '0.75rem', padding: '7px 12px' }}>🖨️ Recibo</Link>
          <Link href={`/admin/pedidos/${pedido.id}/etiqueta`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '7px 12px' }}>📦 Etiqueta</Link>
        </div>
        <span className="badge" style={{ background: `${estadoActual.color}18`, border: `1px solid ${estadoActual.color}40`, color: estadoActual.color, fontSize: '0.8rem', padding: '6px 14px' }}>
          {estadoActual.emoji} {estadoActual.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Líneas del pedido */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Productos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pedido.lineas.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', minWidth: '32px' }}>
                    {l.cantidad}×
                  </span>
                  <span style={{ flex: 1, fontSize: '0.9rem' }}>{l.nombre}</span>
                  <span style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{l.peso}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>
                    {l.totalConIVA.toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-amber)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                <span>Subtotal sin IVA</span>
                <span>{pedido.subtotalSinIVA.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                <span>IVA</span>
                <span>{pedido.ivaTotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem', marginTop: '4px' }}>
                <span>Total</span>
                <span>{pedido.totalConIVA.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Nota interna */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Nota interna</h2>
            <form action={guardarNotaAdmin.bind(null, pedido.id)}>
              <textarea
                name="notasAdmin"
                defaultValue={pedido.notasAdmin ?? ''}
                rows={4}
                placeholder="Notas internas sobre este pedido..."
                className="form-input"
                style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
              />
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-secondary">Guardar nota</button>
              </div>
            </form>
            {pedido.notasCliente && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(245,158,11,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-amber)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '4px' }}>NOTA DEL CLIENTE</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-2)' }}>{pedido.notasCliente}</p>
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Cambiar estado */}
          {proximos.length > 0 && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Cambiar estado
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proximos.map(sig => {
                  const s = ESTADOS_PEDIDO[sig];
                  const action = cambiarEstadoPedido.bind(null, pedido.id, sig);
                  return (
                    <form key={sig} action={action}>
                      <button
                        type="submit"
                        className={sig === 'cancelado' ? 'btn-danger' : 'btn-primary'}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {s.emoji} {LABEL_BOTON[sig]}
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info recogida */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recogida
            </h2>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
              {pedido.franjaRecogida?.fecha ?? '—'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)', marginTop: '4px' }}>
              {pedido.franjaRecogida ? `${pedido.franjaRecogida.horaInicio} – ${pedido.franjaRecogida.horaFin}` : '—'}
            </p>
          </div>

          {/* Info cliente */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cliente
            </h2>
            <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{pedido.clienteNombre}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-3)', marginTop: '4px' }}>{pedido.clienteEmail}</p>
            {pedido.clienteTelefono && (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-3)', marginTop: '2px' }}>{pedido.clienteTelefono}</p>
            )}
            <Link href={`/admin/clientes/${pedido.clienteId}`} className="btn-ghost" style={{ marginTop: '10px', fontSize: '0.75rem' }}>
              Ver ficha →
            </Link>
          </div>

          {/* Pago */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Pago
            </h2>
            <p style={{ fontSize: '0.85rem' }}>
              {pedido.metodoPago === 'stripe_card' && 'Tarjeta'}
              {pedido.metodoPago === 'stripe_bizum' && 'Bizum'}
              {pedido.metodoPago === 'efectivo_recogida' && 'Efectivo en recogida'}
            </p>
            {pedido.stripePaymentIntentId && (
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-4)', marginTop: '4px', wordBreak: 'break-all' }}>
                {pedido.stripePaymentIntentId}
              </p>
            )}
          </div>

          {/* Bultos */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '14px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Bultos
            </h2>
            <form action={actualizarBultos.bind(null, pedido.id)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                name="bultos"
                min={1}
                max={99}
                defaultValue={pedido.bultos ?? 1}
                className="form-input"
                style={{ width: '70px', textAlign: 'center', padding: '6px 8px' }}
              />
              <button type="submit" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                Guardar
              </button>
            </form>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-4)', marginTop: '8px' }}>
              Número de paquetes para la etiqueta de envío.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
