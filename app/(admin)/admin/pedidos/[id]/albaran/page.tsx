import { adminDb } from '@/lib/firebase/admin';
import { getConfiguracion } from '@/lib/actions/configuracion';
import type { Pedido } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/admin/PrintButton';

export const metadata = { title: 'Albarán — Admin' };

export default async function AlbaranPage({ params }: { params: { id: string } }) {
  const [snap, cfg] = await Promise.all([
    adminDb.collection('pedidos').doc(params.id).get(),
    getConfiguracion(),
  ]);
  if (!snap.exists) notFound();

  const pedido = { id: snap.id, ...snap.data() } as Pedido;
  const fecha = (pedido.createdAt as any)?.toDate?.() ?? new Date();
  const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const DOC = { background: 'white', color: '#111', padding: '40px', maxWidth: '800px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.5' } as const;

  return (
    <>
      <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href={`/admin/pedidos/${pedido.id}`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <PrintButton />
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)' }}>Siguiente:</span>
        <Link href={`/admin/pedidos/${pedido.id}/etiqueta`} className="btn-ghost" style={{ fontSize: '0.75rem' }}>📦 Etiqueta →</Link>
        <Link href={`/admin/pedidos/${pedido.id}/factura`}  className="btn-ghost" style={{ fontSize: '0.75rem' }}>🧾 Factura →</Link>
      </div>

      <div style={DOC}>
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '10px' }}>
              {cfg.nombreWeb ?? 'Señas Gómez'}
            </div>
            <div style={{ color: '#444', lineHeight: '1.7', fontSize: '13px' }}>
              {cfg.nombreFiscal && <div>{cfg.nombreFiscal}</div>}
              {cfg.direccionFiscal && <div>{cfg.direccionFiscal}</div>}
              {(cfg.codigoPostal || cfg.municipio) && (
                <div>{cfg.codigoPostal} {cfg.municipio}{cfg.provincia ? `, ${cfg.provincia}` : ''}</div>
              )}
              {cfg.telefonoPublico && <div>Tel: {cfg.telefonoPublico}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#111', marginBottom: '12px' }}>
              ALBARÁN
            </div>
            <div style={{ color: '#444', lineHeight: '1.8', fontSize: '13px' }}>
              <div><strong>Pedido:</strong> {pedido.numero}</div>
              <div><strong>Fecha:</strong> {fechaStr}</div>
            </div>
          </div>
        </div>

        {/* Destinatario */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: '#f5f5f5', padding: '16px 20px', borderRadius: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginBottom: '8px' }}>
              DESTINATARIO
            </div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{pedido.clienteNombre}</div>
            <div style={{ color: '#444', marginTop: '4px', fontSize: '13px' }}>{pedido.clienteEmail}</div>
            {pedido.clienteTelefono && <div style={{ color: '#444', fontSize: '13px' }}>{pedido.clienteTelefono}</div>}
          </div>
          {pedido.franjaRecogida && (
            <div style={{ background: '#fff8ed', border: '1px solid #f5a623', padding: '16px 20px', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#b45309', marginBottom: '8px' }}>
                ENTREGA / RECOGIDA
              </div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{pedido.franjaRecogida.fecha}</div>
              <div style={{ color: '#444', marginTop: '4px', fontSize: '13px' }}>
                {pedido.franjaRecogida.horaInicio} – {pedido.franjaRecogida.horaFin}
              </div>
            </div>
          )}
        </div>

        {/* Tabla de productos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr>
              {['Ref.', 'Descripción', 'Peso/Formato', 'Cantidad'].map((h, i) => (
                <th key={h} style={{
                  textAlign: i === 0 || i === 2 ? 'center' : i === 3 ? 'right' : 'left',
                  padding: '8px 8px', borderBottom: '2px solid #111',
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
                <td style={{ textAlign: 'center', padding: '12px 8px', color: '#888', fontSize: '12px' }}>{i + 1}</td>
                <td style={{ padding: '12px 8px', fontWeight: 600 }}>{l.nombre}</td>
                <td style={{ textAlign: 'center', padding: '12px 8px', color: '#555', fontSize: '13px' }}>{l.peso || '—'}</td>
                <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: 900, fontSize: '16px', color: '#111' }}>{l.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales de unidades */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, borderTop: '2px solid #111' }}>
              <span>Total unidades</span>
              <span>{pedido.lineas.reduce((s, l) => s + l.cantidad, 0)}</span>
            </div>
            {pedido.bultos && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#444', fontSize: '13px', borderTop: '1px solid #eee' }}>
                <span>Bultos</span>
                <span>{pedido.bultos}</span>
              </div>
            )}
          </div>
        </div>

        {/* Firma */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
          {['Firma del remitente', 'Firma del destinatario / Conforme'].map(label => (
            <div key={label}>
              <div style={{ borderBottom: '1px solid #111', height: '60px', marginBottom: '8px' }} />
              <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Pie */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '14px', marginTop: '32px', color: '#888', fontSize: '11px' }}>
          {[cfg.nombreFiscal, cfg.nif ? `NIF: ${cfg.nif}` : '', cfg.direccionFiscal].filter(Boolean).join(' · ')}
        </div>
      </div>
    </>
  );
}
