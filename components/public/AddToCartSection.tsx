'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart/CartProvider';
import type { Producto } from '@/lib/types';
import Link from 'next/link';

interface Props {
  producto:     Producto & { id: string };
  precioConIVA: number;
}

export default function AddToCartSection({ producto, precioConIVA }: Props) {
  const { addItem, items } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [added,    setAdded]    = useState(false);

  const yaEnCarrito = items.find(i => i.productoId === producto.id);

  function handleAdd() {
    addItem({
      productoId: producto.id,
      nombre:     producto.nombre,
      peso:       producto.peso,
      imagenUrl:  producto.imagenes[0] ?? '',
      precioSinIVA: producto.precioSinIVA,
      tipoIVA:    producto.tipoIVA,
      cantidad,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Selector de cantidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Cantidad
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button
            onClick={() => setCantidad(c => Math.max(1, c - 1))}
            style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Reducir cantidad"
          >
            −
          </button>
          <span style={{ minWidth: '36px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-1)' }}>
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad(c => c + 1)}
            style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', color: 'var(--color-text-3)', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
        <span style={{ color: 'var(--color-text-4)', fontSize: '0.82rem' }}>
          = {(precioConIVA * cantidad).toFixed(2)} €
        </span>
      </div>

      {/* Botón añadir */}
      <button
        onClick={handleAdd}
        disabled={!producto.disponible}
        className="btn-primary"
        style={{
          justifyContent: 'center',
          background: added
            ? 'linear-gradient(135deg, var(--color-success), #22c55e)'
            : undefined,
          opacity: !producto.disponible ? 0.5 : 1,
          cursor: !producto.disponible ? 'not-allowed' : 'pointer',
        }}
      >
        {added ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
            ¡Añadido al carrito!
          </>
        ) : !producto.disponible ? (
          'Producto agotado hoy'
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>
            Añadir al carrito
          </>
        )}
      </button>

      {/* Si ya está en el carrito */}
      {yaEnCarrito && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            ✓ {yaEnCarrito.cantidad} unidad{yaEnCarrito.cantidad !== 1 ? 'es' : ''} en el carrito
          </span>
          <Link href="/carrito" className="btn-ghost" style={{ fontSize: '0.78rem', color: 'var(--color-success)' }}>
            Ver carrito →
          </Link>
        </div>
      )}
    </div>
  );
}
