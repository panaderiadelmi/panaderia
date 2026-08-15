import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/firebase/auth';

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getSession();

  if (!sesion) redirect('/login?redirect=/mi-cuenta');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar de cliente */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,5,5,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-amber)',
        height: 'var(--navbar-h)',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        gap: '16px',
      }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>
          <span className="gradient-text">Señas Gómez</span>
        </Link>

        <div style={{ flex: 1 }} />

        <nav style={{ display: 'flex', gap: '4px' }}>
          {[
            { href: '/mi-cuenta',          label: 'Mis pedidos' },
            { href: '/mi-cuenta/facturas', label: 'Facturas' },
            { href: '/mi-cuenta/perfil',   label: 'Mi perfil' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="btn-ghost">
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--color-primary-dim)',
            border: '1px solid var(--color-border-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 800,
            color: 'var(--color-primary)',
          }}>
            {(sesion.nombre[0] + (sesion.apellidos[0] ?? '')).toUpperCase()}
          </div>
          <span style={{ color: 'var(--color-text-3)', fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {sesion.nombre}
          </span>
          <LogoutButton />
        </div>
      </nav>

      {/* Contenido */}
      <main style={{ flex: 1, padding: '40px 24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>

    </div>
  );
}

function LogoutButton() {
  return (
    <form action={async () => {
      'use server';
      const { deleteSessionCookie } = await import('@/lib/firebase/auth');
      await deleteSessionCookie();
    }}>
      <button type="submit" className="btn-ghost" style={{ color: 'var(--color-error)', fontSize: '0.78rem' }}>
        Salir
      </button>
    </form>
  );
}
