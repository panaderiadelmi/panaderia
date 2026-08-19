import { adminDb } from '@/lib/firebase/admin';
import { getConfiguracion } from '@/lib/actions/configuracion';
import type { Pedido } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/admin/PrintButton';

export const metadata = { title: 'Factura — Admin' };

const METODO: Record<string, string> = {
  stripe_card: 'Tarjeta bancaria',
  stripe_bizum: 'Bizum',
  efectivo_recogida: 'Efectivo en recogida',
};

export default async function FacturaPage({ params }: { params: { id: string } }) {
  const [snap, cfg] = await Promise.all([
    adminDb.collection('pedidos').doc(params.id).get(),
    getConfiguracion(),
  ]);
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const fecha = (pedido.createdAt as any)?.toDate?.() ?? new Date();
  const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const ivaGroups = pedido.lineas.reduce<Record<number, number>>((acc, l) => {
    const pct = Math.round(l.tipoIVA * 100);
    acc[pct] = (acc[pct] ?? 0) + l.ivaAmount;
    return acc;
  }, {});

  const DOC = { background: 'white', color: '#111', padding: '40px', maxWidth: '800px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.5' } as const;

  return (
    <>
      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href={`/admin/pedidos/${pedido.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <PrintButton />
      </div>

      <div style={DOC}>
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '10px' }}>
              {cfg.nombreWeb ?? 'Señas Gómez'}
            </div>
            <div style={{ color: '#444', lineHeight: '1.7' }}>
              {cfg.nombreFiscal && <div>{cfg.nombreFiscal}</div>}
              {cfg.nif         && <div>NIF: {cfg.nif}</div>}
              {cfg.direccionFiscal && <div>{cfg.direccionFiscal}</div>}
              {(cfg.codigoPostal || cfg.municipio) && (
                <div>{cfg.codigoPostal} {cfg.municipio}{cfg.provincia ? `, ${cfg.provincia}` : ''}</div>
              )}
              {cfg.telefonoPublico && <div>Tel: {cfg.telefonoPublico}</div>}
              {cfg.emailPublico   && <div>{cfg.emailPublico}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
              FACTURA
            </div>
            <div style={{ color: '#444', lineHeight: '1.8' }}>
              <div><strong>Nº:</strong> F-{pedido.numero}</div>
              <div><strong>Fecha:</strong> {fechaStr}</div>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div style={{ background: '#f5f5f5', padding: '16px 20px', borderRadius: '4px', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '8px' }}>
            FACTURADO A
          </div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>{pedido.clienteNombre}</div>
          <div style={{ color: '#444', marginTop: '4px' }}>{pedido.clienteEmail}</div>
          {pedido.clienteTelefono && <div style={{ color: '#444' }}>{pedido.clienteTelefono}</div>}
          {pedido.franjaRecogida && (
            <div style={{ marginTop: '8px', color: '#444' }}>
              Recogida: {pedido.franjaRecogida.fecha} · {pedido.franjaRecogida.horaInicio}–{pedido.franjaRecogida.horaFin}
            </div>
          )}
        </div>

        {/* Tabla de productos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr>
              {['Descripción', 'Cant.', 'Precio unit.', 'IVA', 'Total'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right',
                  padding: '8px 6px', borderBottom: '2px solid #111',
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pedido.lineas.map((l, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ padding: '10px 6px' }}>
                  {l.nombre}
                  {l.peso && <span style={{ color: '#666', fontSize: '12px' }}> · {l.peso}</span>}
                </td>
                <td style={{ textAlign: 'center', padding: '10px 6px' }}>{l.cantidad}</td>
                <td style={{ textAlign: 'right', padding: '10px 6px' }}>{l.precioSinIVA.toFixed(2)} €</td>
                <td style={{ textAlign: 'right', padding: '10px 6px' }}>{Math.round(l.tipoIVA * 100)}%</td>
                <td style={{ textAlign: 'right', padding: '10px 6px', fontWeight: 700 }}>{l.totalConIVA.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#444', borderBottom: '1px solid #eee' }}>
              <span>Subtotal sin IVA</span>
              <span>{pedido.subtotalSinIVA.toFixed(2)} €</span>
            </div>
            {Object.entries(ivaGroups).map(([pct, amt]) => (
              <div key={pct} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#444', borderBottom: '1px solid #eee' }}>
                <span>IVA {pct}%</span>
                <span>{(amt as number).toFixed(2)} €</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 900, fontSize: '17px', borderTop: '2px solid #111', marginTop: '2px' }}>
              <span>TOTAL</span>
              <span>{pedido.totalConIVA.toFixed(2)} €</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#444' }}>
              Forma de pago: {METODO[pedido.metodoPago] ?? pedido.metodoPago}
            </div>
          </div>
        </div>

        {/* Pie */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '14px', color: '#888', fontSize: '11px' }}>
          {[cfg.nombreFiscal, cfg.nif ? `NIF: ${cfg.nif}` : '', cfg.direccionFiscal, cfg.codigoPostal && cfg.municipio ? `${cfg.codigoPostal} ${cfg.municipio}` : ''].filter(Boolean).join(' · ')}
        </div>
      </div>
    </>
  );
}
