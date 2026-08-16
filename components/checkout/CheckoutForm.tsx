'use client';

import { useState, Fragment, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart/CartProvider';
import type { FranjaHoraria, MetodoPago } from '@/lib/types';

interface Props {
  sesionNombre: string;
  diasRecogida: number[];
  franjas: FranjaHoraria[];
  antelacionHoras: number;
  metodosActivos: MetodoPago[];
  stripeEnabled: boolean;
}

const DIAS_ES  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function buildAvailableDates(diasRecogida: number[], antelacionHoras: number): string[] {
  const dates: string[] = [];
  const cur = new Date(Date.now() + antelacionHoras * 3_600_000);
  cur.setHours(0, 0, 0, 0);
  cur.setDate(cur.getDate() + 1);
  for (let i = 0; dates.length < 21 && i < 90; i++) {
    if (diasRecogida.includes(cur.getDay())) {
      dates.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDate(s: string) {
  const d = new Date(`${s}T12:00:00`);
  return `${DIAS_ES[d.getDay()]} ${d.getDate()} ${MESES_ES[d.getMonth()]}`;
}

const METODO_INFO: Record<MetodoPago, { label: string; desc: string; icon: string }> = {
  efectivo_recogida: { label: 'Pagar en tienda',  desc: 'Abonas en efectivo al recoger', icon: '💵' },
  stripe_card:       { label: 'Tarjeta bancaria', desc: 'Visa, Mastercard…',              icon: '💳' },
  stripe_bizum:      { label: 'Bizum',            desc: 'Pago instantáneo por móvil',     icon: '📱' },
};

const DEFAULT_FRANJAS: FranjaHoraria[] = [
  { id: 'manana', horaInicio: '09:00', horaFin: '12:00', activa: true },
  { id: 'tarde',  horaInicio: '16:00', horaFin: '19:00', activa: true },
];

export function CheckoutForm({
  sesionNombre,
  diasRecogida,
  franjas,
  antelacionHoras,
  metodosActivos,
  stripeEnabled,
}: Props) {
  const router = useRouter();
  const { items, subtotalSinIVA, ivaTotal, totalConIVA, clearCart } = useCart();

  const availableDates  = buildAvailableDates(diasRecogida.length ? diasRecogida : [1,2,3,4,5,6], antelacionHoras || 24);
  const activeFranjas   = (franjas.length ? franjas : DEFAULT_FRANJAS).filter(f => f.activa);
  const availableMetodos = metodosActivos.length ? metodosActivos : ['efectivo_recogida' as MetodoPago];

  const [step,         setStep]         = useState<1 | 2 | 3>(1);
  const [notas,        setNotas]        = useState('');
  const [fecha,        setFecha]        = useState('');
  const [franjaId,     setFranjaId]     = useState('');
  const [metodoPago,   setMetodoPago]   = useState<MetodoPago | ''>('');
  const [loading,      setLoading]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');

  if (items.length === 0) {
    if (typeof window !== 'undefined') router.replace('/catalogo');
    return null;
  }

  const selectedFranja = activeFranjas.find(f => f.id === franjaId);

  async function handleConfirmar() {
    if (!fecha || !franjaId || !metodoPago || !selectedFranja) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productoId: i.productoId,
            nombre:     i.nombre,
            cantidad:   i.cantidad,
          })),
          franjaRecogida: {
            fecha,
            horaInicio: selectedFranja.horaInicio,
            horaFin:    selectedFranja.horaFin,
          },
          metodoPago,
          notasCliente: notas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Error al crear el pedido');
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/checkout/exito?id=${data.pedidoId}&num=${encodeURIComponent(data.numero)}`);
    } catch {
      setErrorMsg('Error de conexión. Inténtalo de nuevo.');
      setLoading(false);
    }
  }

  const s = {
    wrap:       { minHeight: '100vh', paddingTop: 'calc(var(--navbar-h) + 32px)', paddingBottom: '64px', background: 'var(--color-bg)' },
    inner:      { maxWidth: '680px', margin: '0 auto', padding: '0 24px' },
    title:      { fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-1)', marginBottom: '8px' },
    subtitle:   { color: 'var(--color-text-3)', fontSize: '0.9rem', marginBottom: '32px' },
    steps:      { display: 'flex', gap: '8px', marginBottom: '32px', alignItems: 'center' },
    stepItem:   (active: boolean, done: boolean): CSSProperties => ({
      display: 'flex', alignItems: 'center', gap: '8px',
      color: done ? 'var(--color-primary)' : active ? 'var(--color-text-1)' : 'var(--color-text-4)',
      fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 700,
    }),
    stepDot:    (active: boolean, done: boolean): CSSProperties => ({
      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.7rem', fontWeight: 800,
      background: done ? 'var(--color-primary)' : active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${done ? 'var(--color-primary)' : active ? 'var(--color-primary)' : 'var(--color-border)'}`,
      color: done ? '#000' : active ? 'var(--color-primary)' : 'var(--color-text-4)',
    }),
    sep:        { flex: 1, height: '1px', background: 'var(--color-border)' },
    card:       { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' },
    cardTitle:  { fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: '16px' },
    lineRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' },
    lineName:   { fontFamily: 'var(--font-display)', fontSize: '0.88rem', color: 'var(--color-text-2)' },
    lineDetail: { fontSize: '0.78rem', color: 'var(--color-text-4)', marginTop: '2px' },
    linePrice:  { fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-1)' },
    totals:     { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' } as CSSProperties,
    totalRow:   { display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-3)', fontSize: '0.85rem' },
    totalFinal: { display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--color-border-amber)', marginTop: '4px' },
    totalLabel: { fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-text-1)' },
    totalVal:   { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' },
    textarea:   { width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-1)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', resize: 'vertical', minHeight: '80px', outline: 'none' } as CSSProperties,
    label:      { display: 'block', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-3)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' },
    dateGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' },
    dateBtn:    (sel: boolean): CSSProperties => ({
      padding: '10px 6px', borderRadius: 'var(--radius-md)', border: `1px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: sel ? 'var(--color-primary-dim)' : 'rgba(255,255,255,0.03)', cursor: 'pointer',
      fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
      color: sel ? 'var(--color-primary)' : 'var(--color-text-3)', transition: 'all 0.15s', textAlign: 'center',
    }),
    franjaGrid: { display: 'flex', flexDirection: 'column', gap: '8px' } as CSSProperties,
    franjaBtn:  (sel: boolean): CSSProperties => ({
      padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: sel ? 'var(--color-primary-dim)' : 'rgba(255,255,255,0.03)', cursor: 'pointer',
      fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'left',
      color: sel ? 'var(--color-primary)' : 'var(--color-text-2)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '10px',
    }),
    metodoBtns: { display: 'flex', flexDirection: 'column', gap: '8px' } as CSSProperties,
    metodoBtn:  (sel: boolean, disabled: boolean): CSSProperties => ({
      padding: '16px', borderRadius: 'var(--radius-md)', border: `1px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
      background: sel ? 'var(--color-primary-dim)' : 'rgba(255,255,255,0.03)',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
      fontFamily: 'var(--font-display)', textAlign: 'left', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', gap: '12px',
    }),
    actions:    { display: 'flex', gap: '12px', marginTop: '24px' },
    error:      { color: 'var(--color-error)', fontSize: '0.85rem', padding: '12px 16px', background: 'rgba(248,113,113,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.2)', marginTop: '12px' },
  };

  const STEPS = [
    { n: 1, label: 'Resumen' },
    { n: 2, label: 'Recogida' },
    { n: 3, label: 'Pago' },
  ];

  return (
    <main style={s.wrap}>
      <div style={s.inner}>
        <h1 style={s.title}>Confirmar pedido</h1>
        <p style={s.subtitle}>Hola, {sesionNombre}. Revisa tu pedido antes de confirmarlo.</p>

        {/* Step indicator */}
        <div style={s.steps}>
          {STEPS.map((st, idx) => (
            <Fragment key={st.n}>
              <div style={s.stepItem(step === st.n, step > st.n)}>
                <div style={s.stepDot(step === st.n, step > st.n)}>
                  {step > st.n ? '✓' : st.n}
                </div>
                {st.label}
              </div>
              {idx < STEPS.length - 1 && <div style={s.sep} />}
            </Fragment>
          ))}
        </div>

        {/* ── Step 1: Resumen ── */}
        {step === 1 && (
          <>
            <div style={s.card}>
              <p style={s.cardTitle}>Productos</p>
              {items.map(item => {
                const precioConIVA = item.precioSinIVA * (1 + item.tipoIVA);
                return (
                  <div key={item.productoId} style={s.lineRow}>
                    <div>
                      <p style={s.lineName}>{item.nombre}</p>
                      <p style={s.lineDetail}>{item.peso} · {item.cantidad} ud · {precioConIVA.toFixed(2)} €/ud</p>
                    </div>
                    <span style={s.linePrice}>{(precioConIVA * item.cantidad).toFixed(2)} €</span>
                  </div>
                );
              })}
              <div style={s.totals}>
                <div style={s.totalRow}><span>Subtotal sin IVA</span><span>{subtotalSinIVA.toFixed(2)} €</span></div>
                <div style={s.totalRow}><span>IVA</span><span>{ivaTotal.toFixed(2)} €</span></div>
                <div style={s.totalRow}><span>Recogida en tienda</span><span style={{ color: 'var(--color-success)' }}>Gratis</span></div>
                <div style={s.totalFinal}>
                  <span style={s.totalLabel}>Total con IVA</span>
                  <span style={s.totalVal}>{totalConIVA.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div style={s.card}>
              <label style={s.label}>Notas para la panadería (opcional)</label>
              <textarea
                style={s.textarea}
                placeholder="Alergias adicionales, preferencias de cocción, etc."
                value={notas}
                onChange={e => setNotas(e.target.value)}
                maxLength={500}
              />
            </div>

            <div style={s.actions}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>
                Elegir franja de recogida →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Franja de recogida ── */}
        {step === 2 && (
          <>
            <div style={s.card}>
              <p style={s.cardTitle}>Selecciona el día</p>
              {availableDates.length === 0 ? (
                <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
                  No hay días disponibles próximamente. Contacta con la panadería.
                </p>
              ) : (
                <div style={s.dateGrid}>
                  {availableDates.slice(0, 14).map(d => (
                    <button key={d} style={s.dateBtn(fecha === d)} onClick={() => { setFecha(d); setFranjaId(''); }}>
                      {formatDate(d)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {fecha && (
              <div style={s.card}>
                <p style={s.cardTitle}>Selecciona la franja horaria</p>
                {activeFranjas.length === 0 ? (
                  <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem' }}>
                    Sin franjas configuradas. Contacta con la panadería.
                  </p>
                ) : (
                  <div style={s.franjaGrid}>
                    {activeFranjas.map(f => (
                      <button key={f.id} style={s.franjaBtn(franjaId === f.id)} onClick={() => setFranjaId(f.id)}>
                        <span style={{ fontSize: '1.1rem' }}>🕐</span>
                        {f.horaInicio} – {f.horaFin}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={s.actions}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Volver</button>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', opacity: (!fecha || !franjaId) ? 0.5 : 1 }}
                disabled={!fecha || !franjaId}
                onClick={() => setStep(3)}
              >
                Elegir método de pago →
              </button>
            </div>
          </>
        )}

        {/* ── Step 3: Método de pago ── */}
        {step === 3 && (
          <>
            <div style={s.card}>
              <p style={s.cardTitle}>Resumen de tu pedido</p>
              <div style={{ ...s.totalRow, marginBottom: '4px' }}>
                <span>{items.reduce((acc, i) => acc + i.cantidad, 0)} producto(s)</span>
                <span style={{ ...s.totalLabel, fontSize: '1rem', color: 'var(--color-primary)' }}>{totalConIVA.toFixed(2)} €</span>
              </div>
              <div style={{ color: 'var(--color-text-3)', fontSize: '0.85rem', marginTop: '8px' }}>
                Recogida el {formatDate(fecha)} · {selectedFranja?.horaInicio} – {selectedFranja?.horaFin}
              </div>
            </div>

            <div style={s.card}>
              <p style={s.cardTitle}>Método de pago</p>
              <div style={s.metodoBtns}>
                {availableMetodos.map(m => {
                  const info = METODO_INFO[m];
                  const isStripe = m !== 'efectivo_recogida';
                  const disabled = isStripe && !stripeEnabled;
                  return (
                    <button
                      key={m}
                      style={s.metodoBtn(metodoPago === m, disabled)}
                      onClick={() => !disabled && setMetodoPago(m)}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: metodoPago === m ? 'var(--color-primary)' : 'var(--color-text-1)', fontSize: '0.95rem' }}>
                          {info.label}
                          {disabled && <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: 'var(--color-text-4)' }}>Próximamente</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', marginTop: '2px' }}>{info.desc}</div>
                      </div>
                      {metodoPago === m && (
                        <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 800 }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMsg && <div style={s.error}>{errorMsg}</div>}

            <div style={s.actions}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Volver</button>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', opacity: (!metodoPago || loading) ? 0.5 : 1 }}
                disabled={!metodoPago || loading}
                onClick={handleConfirmar}
              >
                {loading ? 'Confirmando…' : `Confirmar pedido · ${totalConIVA.toFixed(2)} €`}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
