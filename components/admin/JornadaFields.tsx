'use client';

import { useState } from 'react';

interface Props {
  defaultValues?: {
    horasSemanales?: number;
    jornadaDiasSemanales?: number;
    jornadaDiasMensuales?: number;
    jornadaEntrada?: string;
    jornadaSalida?: string;
    jornadaHorasDiarias?: number;
  };
}

function addHorasToTime(time: string, horas: number): string {
  const [hh, mm] = time.split(':').map(Number);
  const totalMin = hh * 60 + mm + Math.round(horas * 60);
  const sh = Math.floor(totalMin / 60) % 24;
  const sm = totalMin % 60;
  return `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`;
}

export function JornadaFields({ defaultValues: dv = {} }: Props) {
  const [horasSemanales, setHorasSemanales] = useState(dv.horasSemanales?.toString() ?? '');
  const [diasSemana, setDiasSemana]         = useState(dv.jornadaDiasSemanales?.toString() ?? '');
  const [diasMes, setDiasMes]               = useState(dv.jornadaDiasMensuales?.toString() ?? '');
  const [entrada, setEntrada]               = useState(dv.jornadaEntrada ?? '');
  const [salida, setSalida]                 = useState(dv.jornadaSalida ?? '');
  const [horasDiarias, setHorasDiarias]     = useState(dv.jornadaHorasDiarias?.toString() ?? '');

  function recalcular(hs: string, ds: string, ent: string) {
    const h = parseFloat(hs);
    const d = parseInt(ds);
    if (h > 0 && d > 0) {
      const hd = Math.round((h / d) * 10) / 10;
      setHorasDiarias(hd.toString());
      if (ent) setSalida(addHorasToTime(ent, hd));
    }
  }

  function onHorasSemanales(val: string) {
    setHorasSemanales(val);
    recalcular(val, diasSemana, entrada);
  }
  function onDiasSemana(val: string) {
    setDiasSemana(val);
    recalcular(horasSemanales, val, entrada);
  }
  function onEntrada(val: string) {
    setEntrada(val);
    if (horasDiarias) setSalida(addHorasToTime(val, parseFloat(horasDiarias)));
  }

  const hs = parseFloat(horasSemanales);
  const dm = parseInt(diasMes);
  const hd = parseFloat(horasDiarias);
  const horasMensuales = !isNaN(hd) && !isNaN(dm) && hd > 0 && dm > 0
    ? Math.round(hd * dm * 10) / 10
    : !isNaN(hs) && hs > 0
      ? Math.round(hs * 52 / 12 * 10) / 10
      : null;
  const horasAnuales = !isNaN(hs) && hs > 0 ? Math.round(hs * 52 * 10) / 10 : null;

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Jornada contratada
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Horas semanales</label>
          <input
            name="horasSemanales" type="number" step="0.5" min="0" max="40"
            className="form-input"
            value={horasSemanales}
            onChange={e => onHorasSemanales(e.target.value)}
            placeholder="40"
          />
        </div>
        <div>
          <label style={labelStyle}>Días por semana</label>
          <input
            name="jornadaDiasSemanales" type="number" step="1" min="1" max="7"
            className="form-input"
            value={diasSemana}
            onChange={e => onDiasSemana(e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <label style={labelStyle}>Días por mes</label>
          <input
            name="jornadaDiasMensuales" type="number" step="1" min="1" max="31"
            className="form-input"
            value={diasMes}
            onChange={e => setDiasMes(e.target.value)}
            placeholder="22"
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Hora entrada habitual</label>
          <input
            name="jornadaEntrada" type="time"
            className="form-input"
            value={entrada}
            onChange={e => onEntrada(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Hora salida habitual</label>
          <input
            name="jornadaSalida" type="time"
            className="form-input"
            value={salida}
            onChange={e => setSalida(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>Horas diarias</label>
          <input
            name="jornadaHorasDiarias" type="number" step="0.5" min="0" max="24"
            className="form-input"
            value={horasDiarias}
            onChange={e => setHorasDiarias(e.target.value)}
            placeholder="8"
          />
        </div>
      </div>
      {(horasMensuales || horasAnuales) && (
        <div style={{ display: 'flex', gap: '24px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--color-text-3)' }}>
          {horasMensuales && <span>Horas/mes estimadas: <strong style={{ color: 'var(--color-text-1)' }}>{horasMensuales} h</strong></span>}
          {horasAnuales   && <span>Horas/año estimadas: <strong style={{ color: 'var(--color-text-1)' }}>{horasAnuales} h</strong></span>}
        </div>
      )}
    </div>
  );
}
