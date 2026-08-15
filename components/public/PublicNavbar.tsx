'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart/CartProvider';
import styles from './PublicNavbar.module.css';

const NAV_LINKS = [
  { href: '/catalogo', label: 'Productos' },
  { href: '/#historia',  label: 'Nuestra historia' },
  { href: '/#contacto',  label: 'Contacto' },
];

export default function PublicNavbar() {
  const { totalUnidades } = useCart();
  const pathname = usePathname();

  return (
    <nav className={styles.nav} role="navigation" aria-label="Menú principal">
      <div className={styles.inner}>

        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Señas Gómez</span>
          <span className={styles.logoSub}>Horno de Leña</span>
        </Link>

        {/* Links */}
        <ul className={styles.links} role="list">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`${styles.link} ${pathname === l.href ? styles.linkActive : ''}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones */}
        <div className={styles.actions}>
          {/* Carrito */}
          <Link href="/carrito" className={styles.cartBtn} aria-label={`Carrito: ${totalUnidades} productos`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            {totalUnidades > 0 && (
              <span className={styles.cartBadge} aria-hidden>{totalUnidades > 9 ? '9+' : totalUnidades}</span>
            )}
          </Link>

          {/* Mi cuenta */}
          <Link href="/mi-cuenta" className={styles.accountBtn} aria-label="Mi cuenta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </Link>

          {/* CTA Pedir */}
          <Link href="/catalogo" className="btn-primary" style={{ fontSize: '0.82rem', padding: '9px 18px' }}>
            Pedir ahora
          </Link>
        </div>

      </div>
    </nav>
  );
}
