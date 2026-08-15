import { adminDb } from '@/lib/firebase/admin';
import { ESTADOS_PEDIDO } from '@/lib/types';
import type { Pedido } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Dashboard — Admin' };

async function getDashboardData() {
  const [pedidosSnap, productosSnap, clientesSnap] = await Promise.all([
    adminDb.collection('pedidos').orderBy('createdAt', 'desc').limit(50).get(),
    adminDb.collection('productos').get(),
    adminDb.collection('clientes').get(),
  ]);

  const pedidos  = pedidosSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Pedido);
  const hoy      = new Date().toISOString().split('T')[0];
  const pedidosHoy = pedidos.filter(p => p.franjaRecogida?.fecha === hoy);

  const ventasHoy = pedidosHoy
    .filter(p => p.estado !== 'cancelado')
    .reduce((sum, p) => sum + p.totalConIVA, 0);

  const porEstado = pedidos.reduce<Record<string, number>>((acc, p) => {
    acc[p.estado] = (acc[p.estado] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalPedidosHoy:    pedidosHoy.length,
    ventasHoy,
    totalProductos:     productosSnap.size,
    totalClientes:      clientesSnap.size,
    porEstado,
    ultimosPedidos:     pedidos.slice(0, 8),
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const stats = [
    { label: 'Pedidos hoy',      value: data.totalPedidosHoy,        suffix: '',  color: 'var(--color-info)' },
    { label: 'Ventas hoy',       value: data.ventasHoy.toFixed(2),   suffix: ' €', color: 'var(--color-primary)' },
    { label: 'Productos activos',value: data.totalProductos,          suffix: '',  color: 'var(--color-success)' },
    { label: 'Clientes',         value: data.totalClientes,           suffix: '',  color: 'var(--color-accent)' },
  ];

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>
          Resumen del negocio · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: s.color }}>
              {s.value}{s.suffix}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-3)', marginTop: '4px', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pedidos por estado */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Estado de pedidos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(Object.entries(ESTADOS_PEDIDO) as [string, typeof ESTADOS_PEDIDO[keyof typeof ESTADOS_PEDIDO]][]).map(([key, estado]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem' }}>{estado.emoji}</span>
                <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {estado.label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: estado.color, fontSize: '1rem' }}>
                  {data.porEstado[key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '16px' }}>Accesos rápidos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { href: '/admin/pedidos?estado=listo',   label: 'Pedidos listos para recoger', color: 'var(--color-success)' },
              { href: '/admin/pedidos?estado=pendiente', label: 'Pedidos pendientes',         color: 'var(--color-warning)' },
              { href: '/admin/catalogo',               label: 'Actualizar disponibilidad',   color: 'var(--color-info)' },
              { href: '/admin/configuracion',          label: 'Configuración de empresa',    color: 'var(--color-text-3)' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="btn-ghost" style={{ justifyContent: 'flex-start', color: item.color }}>
                → {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos pedidos */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="btn-ghost" style={{ fontSize: '0.78rem' }}>Ver todos →</Link>
        </div>
        {data.ultimosPedidos.length === 0 ? (
          <p style={{ color: 'var(--color-text-4)', fontSize: '0.875rem' }}>Aún no hay pedidos.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.ultimosPedidos.map(p => {
              const estado = ESTADOS_PEDIDO[p.estado];
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', minWidth: '110px' }}>#{p.numero}</span>
                  <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--color-text-3)' }}>{p.clienteNombre}</span>
                  <span className="badge" style={{ background: `${estado.color}18`, border: `1px solid ${estado.color}40`, color: estado.color }}>
                    {estado.emoji} {estado.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', minWidth: '70px', textAlign: 'right' }}>
                    {p.totalConIVA.toFixed(2)} €
                  </span>
                  <Link href={`/admin/pedidos/${p.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>Ver →</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
