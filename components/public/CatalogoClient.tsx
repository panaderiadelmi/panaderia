'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import type { Categoria, Producto } from '@/lib/types';
import styles from './CatalogoClient.module.css';

interface Props {
  productos:  (Producto & { id: string })[];
  categorias: (Categoria & { id: string })[];
  catActiva:  string;
}

export default function CatalogoClient({ productos, categorias, catActiva }: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  function selectCat(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'todos') {
      params.delete('cat');
    } else {
      params.set('cat', slug);
    }
    router.push(`/catalogo?${params.toString()}`);
  }

  const productosFiltrados = catActiva === 'todos'
    ? productos
    : productos.filter(p => p.categoria === catActiva);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Filtro de categorías */}
        <div className={styles.filters} role="tablist" aria-label="Filtrar por categoría">
          <button
            role="tab"
            aria-selected={catActiva === 'todos'}
            className={`${styles.filterBtn} ${catActiva === 'todos' ? styles.filterActive : ''}`}
            onClick={() => selectCat('todos')}
          >
            🍞 Todos
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={catActiva === cat.slug}
              className={`${styles.filterBtn} ${catActiva === cat.slug ? styles.filterActive : ''}`}
              onClick={() => selectCat(cat.slug)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Contador */}
        <p className={styles.count}>
          {productosFiltrados.length === 0
            ? 'No hay productos disponibles en esta categoría'
            : `${productosFiltrados.length} producto${productosFiltrados.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid de productos */}
        {productosFiltrados.length > 0 && (
          <div className={styles.grid} role="list" aria-label="Catálogo de productos">
            {productosFiltrados.map(p => (
              <div key={p.id} role="listitem">
                <ProductCard producto={p} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
