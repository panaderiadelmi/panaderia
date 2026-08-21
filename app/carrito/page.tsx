import { getConfiguracion } from '@/lib/actions/configuracion';
import CarritoContent from './CarritoContent';

export const dynamic = 'force-dynamic';

export default async function CarritoPage() {
  const cfg = await getConfiguracion();
  return <CarritoContent tiendaActiva={cfg.tiendaActiva ?? true} />;
}
