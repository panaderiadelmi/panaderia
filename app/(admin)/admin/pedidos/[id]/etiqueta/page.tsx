import { adminDb } from '@/lib/firebase/admin';
import { getConfiguracion } from '@/lib/actions/configuracion';
import type { Pedido } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/admin/PrintButton';
import { BarcodeDisplay } from '@/components/admin/BarcodeDisplay';

export const metadata = { title: 'Etiqueta — Admin' };

export default async function EtiquetaPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { papel?: string };
}) {
  const [snap, cfg] = await Promise.all([
    adminDb.collection('pedidos').doc(params.id).get(),
    getConfiguracion(),
  ]);
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const papel = searchParams.papel === '40x50' ? '40x50' : '50x50';
  const [pw, ph] = papel.split('x').map(Number);
  const bultos = pedido.bultos ?? 1;

  const remite = [
    cfg.nombreFiscal ?? cfg.nombreWeb,
    cfg.direccionFiscal,
    cfg.codigoPostal && cfg.municipio ? `${cfg.codigoPostal} ${cfg.municipio}` : cfg.municipio,
    cfg.telefonoPublico,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <style>{`
        @media print {
          @page { size: ${pw}mm ${ph}mm; margin: 2mm; }
        }
      `}</style>

      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href={`/admin/pedidos/${pedido.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)' }}>Tamaño de etiqueta:</span>
        <Link href={`?papel=40x50`} className={papel === '40x50' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          40×50 mm
        </Link>
        <Link href={`?papel=50x50`} className={papel === '50x50' ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          50×50 mm
        </Link>
        <PrintButton />
      </div>

      <div style={{
        background: 'white',
        color: '#111',
        width: `${pw * 3.78}px`,
        height: `${ph * 3.78}px`,
        padding: '8px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '10px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #ddd',
        overflow: 'hidden',
      }}>
        {/* Parte superior: datos del destinatario */}
        <div>
          <div style={{ fontWeight: 900, fontSize: '13px', lineHeight: '1.3', marginBottom: '4px' }}>
            {pedido.clienteNombre}
          </div>
          {pedido.clienteEmail && (
            <div style={{ fontSize: '9px', color: '#444' }}>{pedido.clienteEmail}</div>
          )}
          {pedido.clienteTelefono && (
            <div style={{ fontSize: '9px', color: '#444' }}>{pedido.clienteTelefono}</div>
          )}

          <div style={{ marginTop: '6px', borderTop: '1px solid #ddd', paddingTop: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pedido</span>
              <span style={{ fontWeight: 700, fontSize: '9px' }}>{pedido.numero}</span>
            </div>
            {pedido.franjaRecogida && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                <span style={{ color: '#666', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recogida</span>
                <span style={{ fontSize: '9px' }}>{pedido.franjaRecogida.fecha} {pedido.franjaRecogida.horaInicio}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span style={{ color: '#666', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bultos</span>
              <span style={{ fontWeight: 700, fontSize: '9px' }}>{bultos}</span>
            </div>
          </div>
        </div>

        {/* Código de barras */}
        <div style={{ margin: '4px 0', minHeight: '40px' }}>
          <BarcodeDisplay value={pedido.numero} height={35} />
        </div>

        {/* Remitente */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '4px', fontSize: '8px', color: '#555' }}>
          <span style={{ fontWeight: 700 }}>Remite: </span>
          {remite}
        </div>
      </div>
    </>
  );
}
