import { adminDb } from '@/lib/firebase/admin';
import { getConfiguracion } from '@/lib/actions/configuracion';
import type { Pedido } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/admin/PrintButton';

export const metadata = { title: 'Recibo — Admin' };

const METODO: Record<string, string> = {
  stripe_card: 'Tarjeta bancaria',
  stripe_bizum: 'Bizum',
  efectivo_recogida: 'Efectivo en recogida',
};

export default async function ReciboPage({ params }: { params: { id: string } }) {
  const [snap, cfg] = await Promise.all([
    adminDb.collection('pedidos').doc(params.id).get(),
    getConfiguracion(),
  ]);
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const fecha = (pedido.createdAt as any)?.toDate?.() ?? new Date();
  const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const DOC = { background: 'white', color: '#111', padding: '32px', maxWidth: '420px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '13px', lineHeight: '1.5' } as const;

  return (
    <>
      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href={`/admin/pedidos/${pedido.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <PrintButton />
      </div>

      <div style={DOC}>
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px dashed #ccc' }}>
          <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.01em' }}>
            {cfg.nombreWeb ?? 'Señas Gómez'}
          </div>
          {cfg.direccionFiscal && (
            <div style={{ color: '#444', marginTop: '4px', fontSize: '12px' }}>{cfg.direccionFiscal}</div>
          )}
          {(cfg.codigoPostal || cfg.municipio) && (
            <div style={{ color: '#444', fontSize: '12px' }}>{cfg.codigoPostal} {cfg.municipio}</div>
          )}
          {cfg.telefonoPublico && <div style={{ color: '#444', fontSize: '12px' }}>Tel: {cfg.telefonoPublico}</div>}
          {cfg.nif && <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>NIF: {cfg.nif}</div>}
        </div>

        {/* Datos del recibo */}
        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>Recibo nº</span>
            <span style={{ fontWeight: 700 }}>{pedido.numero}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>Fecha</span>
            <span>{fechaStr} {horaStr}</span>
          </div>
        </div>

        {/* Cliente */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px dashed #ccc' }}>
          <div style={{ fontWeight: 700 }}>{pedido.clienteNombre}</div>
          <div style={{ color: '#444', fontSize: '12px', marginTop: '2px' }}>{pedido.clienteEmail}</div>
          {pedido.franjaRecogida && (
            <div style={{ color: '#444', fontSize: '12px', marginTop: '4px' }}>
              Recogida: {pedido.franjaRecogida.fecha} · {pedido.franjaRecogida.horaInicio}–{pedido.franjaRecogida.horaFin}
            </div>
          )}
        </div>

        {/* Líneas */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px dashed #ccc' }}>
          {pedido.lineas.map((l, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
              <div>
                <span style={{ fontWeight: 600 }}>{l.cantidad}× </span>
                {l.nombre}
                {l.peso && <span style={{ color: '#666', fontSize: '11px' }}> {l.peso}</span>}
              </div>
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '12px' }}>{l.totalConIVA.toFixed(2)} €</span>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px dashed #ccc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', marginBottom: '4px' }}>
            <span>Subtotal sin IVA</span>
            <span>{pedido.subtotalSinIVA.toFixed(2)} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', marginBottom: '8px' }}>
            <span>IVA</span>
            <span>{pedido.ivaTotal.toFixed(2)} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '16px' }}>
            <span>TOTAL PAGADO</span>
            <span>{pedido.totalConIVA.toFixed(2)} €</span>
          </div>
          <div style={{ marginTop: '8px', color: '#444', fontSize: '12px' }}>
            {METODO[pedido.metodoPago] ?? pedido.metodoPago}
          </div>
        </div>

        {/* Sello PAGADO */}
        <div style={{ textAlign: 'center', margin: '16px 0', padding: '10px', border: '3px solid #111', display: 'inline-block', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>PAGADO</span>
        </div>

        {/* Pie */}
        <div style={{ textAlign: 'center', color: '#888', fontSize: '11px', marginTop: '16px' }}>
          Gracias por su compra · {cfg.nombreWeb ?? 'Señas Gómez'}
        </div>
      </div>
    </>
  );
}
