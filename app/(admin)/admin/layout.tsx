import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/firebase/auth';
import { ROLES_ADMIN, ROLES_CONFIG } from '@/lib/types';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getSession();

  if (!sesion)                           redirect('/api/auth/logout');
  if (!ROLES_ADMIN.includes(sesion.rol)) redirect('/');

  const initials = (sesion.nombre[0] + (sesion.apellidos[0] ?? '')).toUpperCase();

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0,
        width: '230px', height: '100vh',
        background: 'var(--admin-nav-bg)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-border-amber)',
        display: 'flex', flexDirection: 'column',
        zIndex: 200, overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
            🥖 SG Admin
          </Link>
        </div>

        {/* Nav */}
        <AdminSidebarNav />

        {/* Footer: usuario + acciones */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 800,
              color: 'var(--color-primary)',
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-1)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sesion.nombre}
              </div>
              <div style={{ fontSize: '0.62rem', color: ROLES_CONFIG[sesion.rol]?.color ?? 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {ROLES_CONFIG[sesion.rol]?.label ?? sesion.rol}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <ThemeToggle />
            <Link href="/" target="_blank" className="btn-ghost" style={{ fontSize: '0.72rem', flex: 1, textAlign: 'center', padding: '6px 8px' }}>
              🌐 Web
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main style={{ marginLeft: '230px', padding: '32px 28px', minHeight: '100vh' }}>
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
      <button type="submit" className="btn-ghost" style={{ color: 'var(--color-error)', fontSize: '0.72rem', padding: '6px 8px' }}>
        Salir
      </button>
    </form>
  );
}
