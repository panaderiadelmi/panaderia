import { getSession } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';
import type { Pedido } from '@/lib/types';
import { ESTADOS_PEDIDO } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Mis pedidos' };

async function getPedidosCliente(clienteId: string): Promise<Pedido[]> {
  const snap = await adminDb
    .collection('pedidos')
    .where('clienteId', '==', clienteId)
    .get();

  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Pedido)
    .sort((a, b) => {
      const aMs = (a as unknown as { createdAt?: { toMillis(): number } }).createdAt?.toMillis() ?? 0;
      const bMs = (b as unknown as { createdAt?: { toMillis(): number } }).createdAt?.toMillis() ?? 0;
      return bMs - aMs;
    })
    .slice(0, 20);
}

export default async function MiCuentaPage() {
  const sesion  = await getSession();
  if (!sesion) return null;

  const pedidos = await getPedidosCliente(sesion.uid);

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
          Mis pedidos
        </h1>
        <p style={{ color: 'var(--color-text-3)' }}>
          Hola, {sesion.nombre}. Aquí tienes el historial de todos tus pedidos.
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍞</div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Aún no tienes pedidos</h2>
          <p style={{ color: 'var(--color-text-3)', marginBottom: '28px' }}>
            Explora nuestro catálogo y haz tu primer pedido artesanal.
          </p>
          <Link href="/catalogo" className="btn-primary">
            Ver productos
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pedidos.map(pedido => {
            const estado = ESTADOS_PEDIDO[pedido.estado];
            const fecha  = pedido.franjaRecogida
              ? `${pedido.franjaRecogida.fecha} · ${pedido.franjaRecogida.horaInicio}–${pedido.franjaRecogida.horaFin}`
              : '—';

            return (
              <div key={pedido.id} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>

                {/* Número + fecha */}
                <div style={{ minWidth: '140px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-1)' }}>
                    #{pedido.numero}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', marginTop: '2px' }}>
                    {fecha}
                  </div>
                </div>

                {/* Estado */}
                <span className="badge" style={{
                  background: `${estado.color}18`,
                  border: `1px solid ${estado.color}40`,
                  color: estado.color,
                }}>
                  {estado.emoji} {estado.label}
                </span>

                {/* Artículos */}
                <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                  {pedido.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(' · ')}
                </div>

                {/* Total */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                  {pedido.totalConIVA.toFixed(2)} €
                </div>

                {/* Acción */}
                <Link href={`/mi-cuenta/pedidos/${pedido.id}`} className="btn-ghost" style={{ whiteSpace: 'nowrap' }}>
                  Ver detalle →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
