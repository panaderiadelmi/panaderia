import { adminDb } from '@/lib/firebase/admin';
import { type Producto, type CategoriaSlug } from '@/lib/types';
import { toggleDisponible, eliminarProducto } from '@/lib/actions/catalogo';
import { DeleteButton } from '@/components/admin/DeleteButton';
import Link from 'next/link';
import { calcularPrecioConIVA } from '@/lib/types';

export const metadata = { title: 'Catálogo — Admin' };

const CATEGORIAS: Record<CategoriaSlug, string> = {
  candeal:  'Pan Candeal',
  baguette: 'Baguette y Viena',
  blanco:   'Pan Blanco',
  bolleria: 'Bollería y Otros',
};

async function getProductos(): Promise<Producto[]> {
  const snap = await adminDb.collection('productos').orderBy('orden').get();
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Producto)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export default async function AdminCatalogoPage() {
  const productos = await getProductos();
  const porCategoria = Object.keys(CATEGORIAS).reduce<Record<string, Producto[]>>((acc, cat) => {
    acc[cat] = productos.filter(p => p.categoria === cat);
    return acc;
  }, {});

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Catálogo</h1>
          <p style={{ color: 'var(--color-text-3)', marginTop: '4px' }}>{productos.length} productos</p>
        </div>
        <Link href="/admin/catalogo/nuevo" className="btn-primary">+ Nuevo producto</Link>
      </div>

      {(Object.entries(CATEGORIAS) as [CategoriaSlug, string][]).map(([slug, nombre]) => {
        const items = porCategoria[slug] ?? [];
        if (items.length === 0) return null;
        return (
          <div key={slug} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              {nombre}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(p => {
                const precio = calcularPrecioConIVA(p.precioSinIVA, p.tipoIVA);
                return (
                  <div key={p.id} className="glass-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{p.nombre}</p>
                      {p.peso && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginTop: '2px' }}>{p.peso}</p>}
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {precio.toFixed(2)} €
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-4)' }}>
                      IVA {Math.round(p.tipoIVA * 100)}%
                    </span>
                    <form action={toggleDisponible.bind(null, p.id, !p.disponible)}>
                      <button type="submit" className={p.disponible ? 'btn-ghost' : 'btn-danger'} style={{
                        color: p.disponible ? 'var(--color-success)' : 'var(--color-error)',
                        background: p.disponible ? 'rgba(74,222,128,0.08)' : undefined,
                        border: `1px solid ${p.disponible ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      }}>
                        {p.disponible ? '✓ Disponible' : '✗ Agotado'}
                      </button>
                    </form>
                    <Link href={`/admin/catalogo/${p.id}`} className="btn-ghost">Editar</Link>
                    <DeleteButton action={eliminarProducto.bind(null, p.id)} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {productos.length === 0 && (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>
          No hay productos. <Link href="/admin/catalogo/nuevo" className="btn-ghost">Añadir el primero →</Link>
        </div>
      )}
    </>
  );
}
