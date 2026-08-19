'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_GROUPS = [
  {
    label: 'General',
    items: [
      { href: '/admin',         label: 'Panel',        emoji: '📊', exact: true },
      { href: '/admin/pedidos', label: 'Pedidos',      emoji: '📋' },
    ],
  },
  {
    label: 'Tienda',
    items: [
      { href: '/admin/articulos',     label: 'Artículos',    emoji: '🗂️' },
      { href: '/admin/catalogo',      label: 'Catálogo',     emoji: '📦' },
      { href: '/admin/clientes',      label: 'Clientes',     emoji: '👥' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { href: '/admin/operarios', label: 'Operarios', emoji: '👷' },
      { href: '/admin/horarios',  label: 'Horarios',  emoji: '🕐' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/configuracion', label: 'Configuración', emoji: '⚙️' },
      { href: '/admin/roles',         label: 'Roles',         emoji: '🛡️' },
      { href: '/admin/usuarios',      label: 'Usuarios',      emoji: '👤' },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-text-4)', fontFamily: 'var(--font-display)',
            padding: '0 10px', marginBottom: '4px',
          }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {group.items.map(item => {
              const isActive = (item as { exact?: boolean }).exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-2)',
                    background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(245,158,11,0.22)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.12s',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{item.emoji}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
