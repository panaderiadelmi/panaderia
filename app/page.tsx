import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inicio',
};

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px' }}>
        <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          🌾 Horno de Leña · Artesanal
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
          <span className="gradient-text">Señas Gómez</span>
          <br />
          <span style={{ color: 'var(--color-text-2)', fontWeight: 400, fontSize: '0.55em' }}>
            Panadería · Bollería · Horno de Leña
          </span>
        </h1>
        <p style={{ color: 'var(--color-text-3)', marginBottom: '40px', lineHeight: 1.7 }}>
          Pan candeal, baguettes y bollería artesanal elaborados cada día con masa madre,
          fermentaciones largas y horno de leña propio.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/catalogo" className="btn-primary">
            Ver productos y hacer pedido
          </Link>
          <Link href="/login" className="btn-secondary">
            Mi cuenta
          </Link>
        </div>

        {/* Construcción en curso */}
        <div className="glass-card" style={{ marginTop: '60px', padding: '24px', textAlign: 'left' }}>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginBottom: '12px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            🚧 Estado de la tienda
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { done: true,  label: 'Proyecto Next.js + Firebase inicializado' },
              { done: true,  label: 'Modelo de datos (TypeScript) definido' },
              { done: true,  label: 'Reglas de seguridad Firestore' },
              { done: true,  label: 'Autenticación con sesión segura (cookie httpOnly)' },
              { done: true,  label: 'Middleware de rutas protegidas' },
              { done: true,  label: 'Catálogo público con filtros por categoría' },
              { done: true,  label: 'Carrito persistente con desglose de IVA' },
              { done: false, label: 'Panel de cliente (Fase 3)' },
              { done: false, label: 'Panel de administrador (Fase 3)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: item.done ? 'var(--color-success)' : 'var(--color-text-4)' }}>
                <span>{item.done ? '✅' : '⬜'}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
