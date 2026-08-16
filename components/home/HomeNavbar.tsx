'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Props {
  sesion: { nombre: string; rol: string } | null;
}

export function HomeNavbar({ sesion }: Props) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
      height: 'var(--navbar-h)',
      background: scrolled ? 'var(--navbar-bg-scrolled)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--color-border-amber)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '32px' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/images/logo.jpg" alt="Delmi Soriano — Panadería" width={44} height={44} style={{ borderRadius: '50%', objectFit: 'cover' }} />
        </Link>

        {/* Links desktop */}
        <div className="desktop-nav-links" style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {[
            { href: '/catalogo', label: 'Productos' },
            { href: '/#historia', label: 'Nuestra Historia' },
            { href: '/#proceso', label: 'Proceso' },
            { href: '/#contacto', label: 'Contacto' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '8px 14px', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600,
              color: 'var(--color-text-3)', transition: 'color 0.2s',
              textDecoration: 'none',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-1)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-3)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + Auth */}
        <div className="desktop-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Link href="/catalogo" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.85rem' }}>
            Pedir ahora
          </Link>
          {sesion ? (
            <Link href={sesion.rol === 'administrador' ? '/admin' : '/mi-cuenta'} className="btn-ghost" style={{ fontSize: '0.82rem' }}>
              {sesion.nombre}
            </Link>
          ) : (
            <Link href="/login" className="btn-ghost" style={{ fontSize: '0.82rem' }}>
              Mi cuenta
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--color-text-1)' }}
          aria-label="Menú"
          className="mobile-nav-toggle"
        >
          <div style={{ width: '22px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.2s' }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'var(--navbar-h)', left: 0, right: 0,
          background: 'var(--mobile-menu-bg)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border-amber)',
          padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {[
            { href: '/catalogo', label: 'Productos' },
            { href: '/#historia', label: 'Nuestra Historia' },
            { href: '/#proceso', label: 'Proceso' },
            { href: '/#contacto', label: 'Contacto' },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-2)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
            <Link href="/catalogo" className="btn-primary" onClick={() => setMenuOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
              Pedir ahora
            </Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
