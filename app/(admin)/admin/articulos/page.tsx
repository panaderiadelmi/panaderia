import { adminDb } from '@/lib/firebase/admin';
import { type Producto, MERCADOS_OPCIONES, calcularPrecioConIVA } from '@/lib/types';
import { eliminarArticulo } from '@/lib/actions/articulos';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';

export const metadata = { title: 'Artículos — Admin' };

async function getArticulos(): Promise<Producto[]> {
  const snap = await adminDb.collection('productos').get();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Producto)
    .sort((a, b) => (a.referencia ?? '').localeCompare(b.referencia ?? ''));
}

export default async function AdminArticulosPage() {
  const articulos = await getArticulos();

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Artículos</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{articulos.length} artículos</p>
        </div>
        <Link href="/admin/articulos/nuevo" className="btn-primary">+ Nuevo artículo</Link>
      </div>

      {articulos.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay artículos. <Link href="/admin/articulos/nuevo" className="btn-ghost">Añadir el primero →</Link>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Ref.', 'Nombre', 'Unidades', 'Mercados', 'Precio venta', 'Precio coste', 'Disponible', 'Acciones'].map(col => (
                  <th key={col} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--color-text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articulos.map(p => {
                const precio = calcularPrecioConIVA(p.precioSinIVA, p.tipoIVA);
                const mercadosLabels = (p.mercados ?? [])
                  .map(v => MERCADOS_OPCIONES.find(m => m.value === v)?.label ?? v)
                  .join(', ');
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      {p.referencia ?? '—'}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.nombre}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-3)' }}>{p.unidades ?? '—'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-3)' }}>{mercadosLabels || '—'}</td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{precio.toFixed(2)} €</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
                      {p.precioCoste != null ? `${p.precioCoste.toFixed(2)} €` : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ color: p.disponible ? 'var(--color-success)' : 'var(--color-error)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {p.disponible ? '✓ Sí' : '✗ No'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Link href={`/admin/articulos/${p.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>Editar</Link>
                        <DeleteButton action={eliminarArticulo.bind(null, p.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
