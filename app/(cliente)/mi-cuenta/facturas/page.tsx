import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/firebase/auth';
import type { Pedido } from '@/lib/types';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Mis facturas' };

export default async function FacturasPage() {
  const sesion = await getSession();
  if (!sesion) redirect('/login');

  const snap = await adminDb
    .collection('pedidos')
    .where('clienteId', '==', sesion.uid)
    .where('estado', '==', 'recogido')
    .get();

  type PedidoRaw = Pedido & { createdAt?: { toMillis(): number } };
  const pedidosConFactura = snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as PedidoRaw)
    .filter(p => p.facturaUrl)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    .slice(0, 50);

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
          Mis facturas
        </h1>
        <p style={{ color: 'var(--color-text-3)' }}>
          Facturas de todos tus pedidos completados.
        </p>
      </div>

      {pedidosConFactura.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🧾</div>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Aún no tienes facturas</h2>
          <p style={{ color: 'var(--color-text-3)', marginBottom: '28px' }}>
            Las facturas aparecerán aquí una vez que recojas tus pedidos y se emitan.
          </p>
          <Link href="/mi-cuenta" className="btn-ghost">Ver mis pedidos</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pedidosConFactura.map(pedido => (
            <div key={pedido.id} className="glass-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '140px' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  Pedido #{pedido.numero}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', marginTop: '2px' }}>
                  {pedido.franjaRecogida?.fecha ?? '—'}
                </p>
              </div>
              <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
                {pedido.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(' · ')}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                {pedido.totalConIVA.toFixed(2)} €
              </span>
              <a
                href={pedido.facturaUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
              >
                Descargar PDF
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card" style={{ padding: '20px 24px', marginTop: '32px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Las facturas se generan mediante software certificado Verifactu conforme al RD 1007/2023. Si necesitas una copia o tienes algún problema, contacta con nosotros.
        </p>
      </div>
    </>
  );
}
