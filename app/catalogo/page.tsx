import { Suspense } from 'react';
import type { Metadata } from 'next';
import { adminDb } from '@/lib/firebase/admin';
import type { Producto, Categoria } from '@/lib/types';
import PublicNavbar from '@/components/public/PublicNavbar';
import CatalogoClient from '@/components/public/CatalogoClient';

export const metadata: Metadata = {
  title: 'Catálogo — Señas Gómez',
  description: 'Pan candeal, baguettes, bollería y especialidades del obrador. Haz tu pedido online y recógelo en tienda.',
};

export const revalidate = 60; // revalidar cada minuto

async function getProductosYCategorias() {
  const [prodSnap, catSnap] = await Promise.all([
    adminDb
      .collection('productos')
      .where('disponible', '==', true)
      .orderBy('categoria')
      .orderBy('orden')
      .get(),
    adminDb
      .collection('categorias')
      .where('activa', '==', true)
      .orderBy('orden')
      .get(),
  ]);

  const productos  = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Producto & { id: string });
  const categorias = catSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Categoria & { id: string });

  return { productos, categorias };
}

interface Props {
  searchParams: Promise<{ cat?: string }>;
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params     = await searchParams;
  const catActiva  = params.cat ?? 'todos';

  const { productos, categorias } = await getProductosYCategorias();

  return (
    <>
      <PublicNavbar />

      {/* Header de sección */}
      <header style={{
        background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(245,158,11,0.1)',
        padding: '48px 24px 36px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            🌾 Elaboración artesanal · Horno de leña
          </p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '12px' }}>
            Nuestros Productos
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Pan candeal, baguettes y bollería horneados cada mañana.
            Haz tu pedido con al menos 24 horas de antelación.
          </p>
        </div>
      </header>

      <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-4)' }}>Cargando catálogo…</div>}>
        <CatalogoClient
          productos={productos}
          categorias={categorias}
          catActiva={catActiva}
        />
      </Suspense>
    </>
  );
}
