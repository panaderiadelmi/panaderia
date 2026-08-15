'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cart/CartProvider';
import type { Producto } from '@/lib/types';
import { calcularPrecioConIVA } from '@/lib/types';
import styles from './ProductCard.module.css';

interface Props {
  producto: Producto & { id: string };
}

export default function ProductCard({ producto }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const precioConIVA = calcularPrecioConIVA(producto.precioSinIVA, producto.tipoIVA);
  const ivaLabel     = producto.tipoIVA === 0.04 ? '4% IVA' : '10% IVA';

  function handleAdd() {
    addItem({
      productoId: producto.id,
      nombre:     producto.nombre,
      peso:       producto.peso,
      imagenUrl:  producto.imagenes[0] ?? '',
      precioSinIVA: producto.precioSinIVA,
      tipoIVA:    producto.tipoIVA,
      cantidad:   1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className={styles.card}>
      {/* Imagen */}
      <Link href={`/catalogo/${producto.id}`} className={styles.imageLink} aria-label={`Ver ${producto.nombre}`}>
        <div className={styles.imageWrap}>
          {producto.imagenes[0] ? (
            <Image
              src={producto.imagenes[0]}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.img}
            />
          ) : (
            <div className={styles.imgPlaceholder} aria-hidden>🍞</div>
          )}
        </div>

        {/* Badge disponibilidad */}
        <span className={`${styles.availBadge} ${producto.disponible ? styles.availOk : styles.availOut}`}>
          {producto.disponible ? '● Disponible' : '● Agotado'}
        </span>
      </Link>

      {/* Contenido */}
      <div className={styles.body}>
        {/* Nombre + peso */}
        <Link href={`/catalogo/${producto.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{producto.nombre}</h3>
        </Link>
        {producto.peso && (
          <span className={styles.weight}>{producto.peso}</span>
        )}

        {/* Descripción corta */}
        <p className={styles.desc}>{producto.descripcion.slice(0, 80)}{producto.descripcion.length > 80 ? '…' : ''}</p>

        {/* Alérgenos */}
        {producto.alergenos.length > 0 && (
          <div className={styles.alergenos} title="Contiene alérgenos">
            <span>⚠</span>
            {producto.alergenos.map(a => (
              <span key={a} className={styles.alergenoTag}>{a}</span>
            ))}
          </div>
        )}

        {/* Precio + botón */}
        <div className={styles.footer}>
          <div className={styles.precio}>
            <span className={styles.precioMain}>{precioConIVA.toFixed(2)} €</span>
            <span className={styles.precioIva}>{ivaLabel} incl.</span>
          </div>

          <button
            className={`${styles.addBtn} ${added ? styles.addBtnAdded : ''}`}
            onClick={handleAdd}
            disabled={!producto.disponible || added}
            aria-label={`Añadir ${producto.nombre} al carrito`}
          >
            {added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                Añadido
              </>
            ) : producto.disponible ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Añadir
              </>
            ) : 'Agotado'}
          </button>
        </div>
      </div>
    </article>
  );
}
