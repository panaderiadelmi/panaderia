'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart/CartProvider';
import PublicNavbar from '@/components/public/PublicNavbar';
import styles from './carrito.module.css';

export default function CarritoPage() {
  const { items, totalUnidades, subtotalSinIVA, ivaTotal, totalConIVA, setCantidad, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <>
        <PublicNavbar />
        <main className={styles.emptyWrap}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon} aria-hidden>🛒</div>
            <h1 className={styles.emptyTitle}>Tu carrito está vacío</h1>
            <p className={styles.emptyText}>
              Explora nuestro catálogo y añade tus productos favoritos.
            </p>
            <Link href="/catalogo" className="btn-primary">
              Ver productos
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PublicNavbar />
      <main className={styles.main}>

        {/* Cabecera */}
        <div className={styles.header}>
          <h1 className={styles.title}>Tu carrito</h1>
          <button onClick={clearCart} className="btn-ghost" style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>
            Vaciar carrito
          </button>
        </div>

        <div className={styles.layout}>

          {/* Lista de productos */}
          <div className={styles.items}>
            {items.map(item => {
              const precioConIVA = item.precioSinIVA * (1 + item.tipoIVA);
              const lineTotal    = precioConIVA * item.cantidad;

              return (
                <div key={item.productoId} className={`glass-card ${styles.item}`}>

                  {/* Imagen */}
                  <div className={styles.itemImg}>
                    {item.imagenUrl ? (
                      <Image src={item.imagenUrl} alt={item.nombre} fill sizes="80px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '2rem' }} aria-hidden>🍞</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.nombre}</h3>
                    {item.peso && <span className={styles.itemPeso}>{item.peso}</span>}
                    <span className={styles.itemPrecioUnit}>
                      {precioConIVA.toFixed(2)} € / ud · IVA {item.tipoIVA === 0.04 ? '4%' : '10%'}
                    </span>
                  </div>

                  {/* Controles cantidad */}
                  <div className={styles.itemControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setCantidad(item.productoId, item.cantidad - 1)}
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className={styles.qtyVal}>{item.cantidad}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => setCantidad(item.productoId, item.cantidad + 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  {/* Total línea */}
                  <div className={styles.itemTotal}>
                    <span className={styles.itemTotalVal}>{lineTotal.toFixed(2)} €</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.productoId)}
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen de pedido */}
          <aside className={`glass-card ${styles.summary}`}>
            <h2 className={styles.summaryTitle}>Resumen del pedido</h2>

            <div className={styles.summaryLines}>
              <div className={styles.summaryLine}>
                <span>{totalUnidades} producto{totalUnidades !== 1 ? 's' : ''}</span>
                <span>{subtotalSinIVA.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryLine}>
                <span>IVA (desglosado)</span>
                <span>{ivaTotal.toFixed(2)} €</span>
              </div>
              <div className={styles.summaryLine} style={{ color: 'var(--color-text-4)', fontSize: '0.78rem' }}>
                <span>Recogida en tienda</span>
                <span style={{ color: 'var(--color-success)' }}>Gratis</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total con IVA</span>
              <span className={styles.summaryTotalVal}>{totalConIVA.toFixed(2)} €</span>
            </div>

            <Link href="/checkout" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
              Continuar con el pedido →
            </Link>

            <p className={styles.summaryNote}>
              📅 Seleccionarás la franja de recogida en el siguiente paso.<br />
              ⏱ Pedidos con 24 h de antelación mínimo.
            </p>

            <div className={styles.summaryBack}>
              <Link href="/catalogo" className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                ← Seguir comprando
              </Link>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}
