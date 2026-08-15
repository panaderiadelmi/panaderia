import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/firebase/auth';

const NAV_ITEMS = [
  { href: '/admin',              label: 'Dashboard',  emoji: '📊' },
  { href: '/admin/pedidos',      label: 'Pedidos',    emoji: '📋' },
  { href: '/admin/catalogo',     label: 'Catálogo',   emoji: '📦' },
  { href: '/admin/clientes',     label: 'Clientes',   emoji: '👥' },
  { href: '/admin/configuracion',label: 'Configuración', emoji: '⚙️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getSession();

  if (!sesion)                        redirect('/login?redirect=/admin');
  if (sesion.rol !== 'administrador') redirect('/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar admin */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(5,5,5,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border-amber)',
        height: 'var(--navbar-h)',
        display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: '24px',
      }}>

        {/* Logo */}
        <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
          🥖 SG Admin
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className="btn-ghost" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
              {item.emoji} {item.label}
            </Link>
          ))}
        </div>

        {/* Ver web + usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/" target="_blank" className="btn-ghost" style={{ fontSize: '0.75rem' }}>
            🌐 Ver web
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 800,
              color: 'var(--color-primary)',
            }}>
              {(sesion.nombre[0] + (sesion.apellidos[0] ?? '')).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--font-display)' }}>
                {sesion.nombre}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                👑 Admin
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </nav>

      {/* Contenido */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
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
      <button type="submit" className="btn-ghost" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>
        Salir
      </button>
    </form>
  );
}
