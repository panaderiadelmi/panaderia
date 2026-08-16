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
