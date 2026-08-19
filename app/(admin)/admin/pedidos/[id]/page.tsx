import { adminDb } from '@/lib/firebase/admin';
import { ESTADOS_PEDIDO, type Pedido, type EstadoPedido } from '@/lib/types';
import { cambiarEstadoPedido, guardarNotaAdmin, actualizarBultos, guardarTipoEntrega } from '@/lib/actions/pedidos';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Detalle de pedido — Admin' };

const TRANSICIONES: Partial<Record<EstadoPedido, EstadoPedido[]>> = {
  pendiente:  ['confirmado', 'cancelado'],
  confirmado: ['elaborando', 'cancelado'],
  elaborando: ['listo', 'cancelado'],
  listo:      ['recogido'],
};

const LABEL_BOTON: Record<EstadoPedido, string> = {
  confirmado:  'Confirmar pedido',
  elaborando:  'Marcar en preparación',
  listo:       'Marcar como preparado',
  recogido:    'Completar pedido',
  cancelado:   'Cancelar pedido',
  pendiente:   'Pendiente',
};

const SECTION_TITLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '0.9rem',
  marginBottom: '14px',
  color: 'var(--color-text-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

export default async function AdminPedidoDetallePage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('pedidos').doc(params.id).get();
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const estadoActual = ESTADOS_PEDIDO[pedido.estado];
  const proximos = TRANSICIONES[pedido.estado] ?? [];
  const esEnvio = pedido.tipoEntrega === 'envio';
  const enDocumentos = pedido.estado === 'listo' || pedido.estado === 'recogido';

  return (
    <>
      {/* Cabecera */}
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
        <span className="badge" style={{ background: `${estadoActual.color}18`, border: `1px solid ${estadoActual.color}40`, color: estadoActual.color, fontSize: '0.8rem', padding: '6px 14px' }}>
          {estadoActual.emoji} {estadoActual.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

        {/* ── Columna principal ── */}
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
                <span>Subtotal sin IVA</span><span>{pedido.subtotalSinIVA.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                <span>IVA</span><span>{pedido.ivaTotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1.1rem', marginTop: '4px' }}>
                <span>Total</span><span>{pedido.totalConIVA.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Siguiente paso — documentos */}
          {enDocumentos && (
            <div className="glass-card" style={{ padding: '24px', border: `1px solid ${estadoActual.color}40` }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '6px' }}>
                {esEnvio ? '📋 Documentos de envío' : '📄 Documentos del pedido'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-4)', marginBottom: '20px' }}>
                {esEnvio
                  ? 'Genera el albarán, imprime la etiqueta y adjunta la factura al paquete.'
                  : 'El pedido está preparado. Genera la factura al entregar al cliente.'}
              </p>

              {esEnvio ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <DocPaso num={1} label="Albarán de entrega" desc="Lista de productos que acompaña al paquete."
                    href={`/admin/pedidos/${pedido.id}/albaran`} btnLabel="Ver albarán →" />
                  <DocPaso num={2} label="Etiqueta de envío" desc="Datos del destinatario y código de barras."
                    href={`/admin/pedidos/${pedido.id}/etiqueta`} btnLabel="Ver etiqueta →" />
                  <DocPaso num={3} label="Factura" desc="Documento fiscal para el cliente."
                    href={`/admin/pedidos/${pedido.id}/factura`} btnLabel="Ver factura →" />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href={`/admin/pedidos/${pedido.id}/factura`} className="btn-primary" style={{ fontSize: '0.85rem' }}>
                    🧾 Ver factura
                  </Link>
                  <Link href={`/admin/pedidos/${pedido.id}/recibo`} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
                    🖨️ Ver recibo
                  </Link>
                </div>
              )}
            </div>
          )}

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

        {/* ── Columna lateral ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Cambiar estado */}
          {proximos.length > 0 && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={SECTION_TITLE}>Cambiar estado</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proximos.map(sig => {
                  const s = ESTADOS_PEDIDO[sig];
                  return (
                    <form key={sig} action={cambiarEstadoPedido.bind(null, pedido.id, sig)}>
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

          {/* Tipo de entrega */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={SECTION_TITLE}>Tipo de entrega</h2>
            <form action={guardarTipoEntrega.bind(null, pedido.id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" name="tipoEntrega" value="recogida"
                  defaultChecked={(pedido.tipoEntrega ?? 'recogida') === 'recogida'}
                  style={{ accentColor: 'var(--color-primary)' }} />
                🏪 Recogida en tienda
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="radio" name="tipoEntrega" value="envio"
                  defaultChecked={pedido.tipoEntrega === 'envio'}
                  style={{ accentColor: 'var(--color-primary)' }} />
                🚚 Envío online
              </label>
              <button type="submit" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px', marginTop: '4px' }}>
                Guardar
              </button>
            </form>
          </div>

          {/* Info recogida / envío */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={SECTION_TITLE}>{esEnvio ? 'Envío' : 'Recogida'}</h2>
            {pedido.franjaRecogida ? (
              <>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-1)' }}>
                  {pedido.franjaRecogida.fecha}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)', marginTop: '4px' }}>
                  {pedido.franjaRecogida.horaInicio} – {pedido.franjaRecogida.horaFin}
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-4)' }}>Sin franja asignada</p>
            )}
          </div>

          {/* Cliente */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h2 style={SECTION_TITLE}>Cliente</h2>
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
            <h2 style={SECTION_TITLE}>Pago</h2>
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

          {/* Bultos (solo envío) */}
          {esEnvio && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={SECTION_TITLE}>Bultos</h2>
              <form action={actualizarBultos.bind(null, pedido.id)} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number" name="bultos" min={1} max={99}
                  defaultValue={pedido.bultos ?? 1}
                  className="form-input"
                  style={{ width: '70px', textAlign: 'center', padding: '6px 8px' }}
                />
                <button type="submit" className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                  Guardar
                </button>
              </form>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-text-4)', marginTop: '8px' }}>
                Número de paquetes para la etiqueta.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function DocPaso({ num, label, desc, href, btnLabel }: {
  num: number; label: string; desc: string; href: string; btnLabel: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-primary)', minWidth: '24px', textAlign: 'center' }}>
        {num}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{label}</p>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', margin: '2px 0 0' }}>{desc}</p>
      </div>
      <Link href={href} className="btn-ghost" style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}>
        {btnLabel}
      </Link>
    </div>
  );
}
