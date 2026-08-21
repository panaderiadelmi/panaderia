import { redirect } from 'next/navigation';
import { getSession } from '@/lib/firebase/auth';
import { getConfiguracion } from '@/lib/actions/configuracion';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import PublicNavbar from '@/components/public/PublicNavbar';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const sesion = await getSession();
  if (!sesion) redirect('/login?next=/checkout');

  const config = await getConfiguracion();

  if (config.tiendaActiva === false) {
    return (
      <>
        <PublicNavbar />
        <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔒</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>
              Tienda temporalmente cerrada
            </h1>
            <p style={{ color: 'var(--color-text-3)', lineHeight: 1.7, marginBottom: '28px' }}>
              Los pedidos online están desactivados en este momento.<br />
              Puedes seguir explorando nuestro catálogo y te avisaremos cuando la tienda vuelva a estar activa.
            </p>
            <a href="/catalogo" className="btn-primary">Ver productos →</a>
          </div>
        </main>
      </>
    );
  }

  const stripeEnabled = !!(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_SECRET_KEY
  );

  return (
    <>
      <PublicNavbar />
      <CheckoutForm
        sesionNombre={sesion.nombre}
        diasRecogida={config.diasRecogida ?? [1, 2, 3, 4, 5, 6]}
        franjas={config.franjas ?? []}
        antelacionHoras={config.antelacionMinimaHoras ?? 24}
        metodosActivos={config.metodosActivos ?? ['efectivo_recogida']}
        stripeEnabled={stripeEnabled}
      />
    </>
  );
}
