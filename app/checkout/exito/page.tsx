import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/firebase/auth';
import { adminDb } from '@/lib/firebase/admin';
import PublicNavbar from '@/components/public/PublicNavbar';

export const dynamic = 'force-dynamic';

const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatFecha(s: string) {
  const d = new Date(`${s}T12:00:00`);
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

interface Props {
  searchParams: { id?: string; num?: string };
}

export default async function ExitoPage({ searchParams }: Props) {
  const { id, num } = searchParams;

  const sesion = await getSession();
  if (!sesion) redirect('/login');

  if (!id) notFound();

  const snap = await adminDb.collection('pedidos').doc(id).get();
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as {
    id: string;
    numero: string;
    clienteId: string;
    totalConIVA: number;
    franjaRecogida: { fecha: string; horaInicio: string; horaFin: string };
    metodoPago: string;
    lineas: { nombre: string; cantidad: number; totalConIVA: number }[];
  };

  if (pedido.clienteId !== sesion.uid) notFound();

  const numero = pedido.numero ?? num ?? id;

  const METODO_LABEL: Record<string, string> = {
    efectivo_recogida: 'Pago en tienda al recoger',
    stripe_card:       'Tarjeta bancaria',
    stripe_bizum:      'Bizum',
  };

  return (
    <>
      <PublicNavbar />
      <main style={{ minHeight: '100vh', paddingTop: 'calc(var(--navbar-h) + 48px)', paddingBottom: '80px', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

          {/* Icono éxito */}
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px' }}>
            ✅
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-1)', marginBottom: '8px' }}>
            ¡Pedido confirmado!
          </h1>
          <p style={{ color: 'var(--color-text-3)', fontSize: '0.95rem', marginBottom: '32px' }}>
            Hemos recibido tu pedido. Te avisaremos cuando esté listo para recoger.
          </p>

          {/* Tarjeta de detalle */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border-amber)', borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-text-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número de pedido</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)', fontSize: '1rem' }}>{numero}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Row label="Recogida" value={`${formatFecha(pedido.franjaRecogida.fecha)} · ${pedido.franjaRecogida.horaInicio}–${pedido.franjaRecogida.horaFin}`} />
              <Row label="Pago" value={METODO_LABEL[pedido.metodoPago] ?? pedido.metodoPago} />
              <Row label="Total" value={`${pedido.totalConIVA.toFixed(2)} €`} highlight />
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--color-text-4)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Productos</p>
              {pedido.lineas.map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--color-text-2)', padding: '4px 0' }}>
                  <span>{l.nombre} × {l.cantidad}</span>
                  <span>{l.totalConIVA.toFixed(2)} €</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href={`/mi-cuenta/pedidos/${id}`} className="btn-primary" style={{ justifyContent: 'center' }}>
              Ver detalle del pedido
            </Link>
            <Link href="/catalogo" className="btn-secondary" style={{ justifyContent: 'center' }}>
              Seguir comprando
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-3)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: highlight ? 700 : 600, fontSize: highlight ? '1rem' : '0.88rem', color: highlight ? 'var(--color-primary)' : 'var(--color-text-1)' }}>
        {value}
      </span>
    </div>
  );
}
