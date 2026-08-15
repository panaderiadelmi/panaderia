import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { adminDb } from '@/lib/firebase/admin';
import type { Producto } from '@/lib/types';
import { calcularPrecioConIVA, ALERGENOS } from '@/lib/types';
import PublicNavbar from '@/components/public/PublicNavbar';
import AddToCartSection from '@/components/public/AddToCartSection';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProducto(id: string): Promise<(Producto & { id: string }) | null> {
  const doc = await adminDb.collection('productos').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Producto & { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }     = await params;
  const producto   = await getProducto(id);
  if (!producto) return { title: 'Producto no encontrado' };
  return {
    title: `${producto.nombre} — Señas Gómez`,
    description: producto.descripcion,
  };
}

export default async function ProductoDetailPage({ params }: Props) {
  const { id }   = await params;
  const producto = await getProducto(id);

  if (!producto) notFound();

  const precioConIVA = calcularPrecioConIVA(producto.precioSinIVA, producto.tipoIVA);
  const ivaLabel     = producto.tipoIVA === 0.04 ? '4 %' : '10 %';
  const ivaAmount    = (precioConIVA - producto.precioSinIVA).toFixed(2);

  return (
    <>
      <PublicNavbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Breadcrumb */}
        <nav aria-label="Ruta" style={{ marginBottom: '28px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--color-text-4)', fontFamily: 'var(--font-display)' }}>
          <Link href="/catalogo" style={{ color: 'var(--color-text-3)' }}>Catálogo</Link>
          <span>›</span>
          <span>{producto.nombre}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

          {/* Imagen */}
          <div>
            <div style={{
              position: 'relative',
              height: '380px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(196,129,58,0.06) 100%)',
              border: '1px solid rgba(245,158,11,0.15)',
            }}>
              {producto.imagenes[0] ? (
                <Image
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', opacity: 0.4 }}>
                  🍞
                </div>
              )}
            </div>
          </div>

          {/* Info + compra */}
          <div>
            {/* Badge disponibilidad */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700,
              background: producto.disponible ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${producto.disponible ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.25)'}`,
              color: producto.disponible ? 'var(--color-success)' : 'var(--color-error)',
              marginBottom: '16px',
            }}>
              {producto.disponible ? '● Disponible hoy' : '● Agotado por hoy'}
            </span>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.2 }}>
              {producto.nombre}
            </h1>

            {producto.peso && (
              <p style={{ color: 'var(--color-text-4)', fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '16px' }}>
                Peso: {producto.peso}
              </p>
            )}

            <p style={{ color: 'var(--color-text-3)', lineHeight: 1.7, marginBottom: '28px' }}>
              {producto.descripcion}
            </p>

            {/* Alérgenos */}
            {producto.alergenos.length > 0 && (
              <div style={{ marginBottom: '24px', padding: '12px 16px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-warning)', marginBottom: '6px' }}>
                  ⚠ Contiene alérgenos
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {producto.alergenos.map(a => (
                    <span key={a} style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      color: 'var(--color-text-2)',
                      textTransform: 'capitalize',
                    }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Precio */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                    {precioConIVA.toFixed(2)} €
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginTop: '4px' }}>
                    {producto.precioSinIVA.toFixed(2)} € + {ivaAmount} € IVA ({ivaLabel})
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-4)' }}>
                  <div>Precio por unidad</div>
                  <div style={{ color: 'var(--color-text-3)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>IVA incluido</div>
                </div>
              </div>
            </div>

            {/* Añadir al carrito (client component) */}
            <AddToCartSection producto={producto} precioConIVA={precioConIVA} />

            {/* Nota de recogida */}
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', marginTop: '16px', lineHeight: 1.5 }}>
              📦 Recogida en tienda · Lun–Sáb 7:00–14:00<br />
              ⏱ Pedidos con <strong>24 h de antelación</strong> mínimo
            </p>
          </div>
        </div>

        {/* Volver */}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/catalogo" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            ← Volver al catálogo
          </Link>
        </div>

      </main>
    </>
  );
}
