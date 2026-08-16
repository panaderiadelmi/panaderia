import { adminDb } from '@/lib/firebase/admin';
import { ESTADOS_PEDIDO, type Pedido } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Pedidos — Admin' };

async function getPedidos(estado?: string, fecha?: string): Promise<Pedido[]> {
  const snap = await adminDb.collection('pedidos').orderBy('createdAt', 'desc').limit(200).get();
  let pedidos = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Pedido);

  if (estado && estado !== 'todos') {
    pedidos = pedidos.filter(p => p.estado === estado);
  }
  if (fecha) {
    pedidos = pedidos.filter(p => p.franjaRecogida?.fecha === fecha);
  }
  return pedidos;
}

const INPUT_STYLE = {
  padding: '9px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-1)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  outline: 'none',
} as const;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: { estado?: string; fecha?: string };
}) {
  const { estado = 'todos', fecha } = searchParams;
  const pedidos = await getPedidos(estado, fecha);

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Pedidos</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{pedidos.length} pedidos</p>
        </div>
      </div>

      <form style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select name="estado" defaultValue={estado} style={{ ...INPUT_STYLE, minWidth: '200px' }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADOS_PEDIDO).map(([key, e]) => (
            <option key={key} value={key}>{e.emoji} {e.label}</option>
          ))}
        </select>
        <input type="date" name="fecha" defaultValue={fecha ?? ''} style={INPUT_STYLE} />
        <button type="submit" className="btn-secondary">Filtrar</button>
        {(estado !== 'todos' || fecha) && (
          <Link href="/admin/pedidos" className="btn-ghost">Limpiar</Link>
        )}
      </form>

      {pedidos.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay pedidos con estos filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pedidos.map(p => {
            const est = ESTADOS_PEDIDO[p.estado];
            return (
              <div key={p.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', minWidth: '130px' }}>
                  #{p.numero}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-3)', minWidth: '110px' }}>
                  {p.franjaRecogida?.fecha ?? '—'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-4)', minWidth: '90px' }}>
                  {p.franjaRecogida ? `${p.franjaRecogida.horaInicio}–${p.franjaRecogida.horaFin}` : '—'}
                </span>
                <span style={{ flex: 1, fontSize: '0.85rem' }}>{p.clienteNombre}</span>
                <span className="badge" style={{ background: `${est.color}18`, border: `1px solid ${est.color}40`, color: est.color }}>
                  {est.emoji} {est.label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', minWidth: '80px', textAlign: 'right' }}>
                  {p.totalConIVA.toFixed(2)} €
                </span>
                <Link href={`/admin/pedidos/${p.id}`} className="btn-ghost" style={{ whiteSpace: 'nowrap' }}>
                  Ver →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
