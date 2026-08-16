'use client';

import { useState } from 'react';
import type { HorarioDia, DiaSemana, HorarioSemanal } from '@/lib/types';

const DIAS: { key: DiaSemana; label: string }[] = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sabado',    label: 'Sábado' },
  { key: 'domingo',   label: 'Domingo' },
];

const HORAS = Array.from({ length: 36 }, (_, i) => {
  const mins = 360 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

const DIA_VACIO: HorarioDia = {
  abierto: false,
  manana: { desde: '09:00', hasta: '14:00' },
  tarde:  { desde: '17:00', hasta: '20:00' },
};

function buildInitial(inicial: Partial<HorarioSemanal>): HorarioSemanal {
  const h: Partial<HorarioSemanal> = {};
  for (const d of DIAS) h[d.key] = inicial[d.key] ?? { ...DIA_VACIO };
  return h as HorarioSemanal;
}

interface Props { inicial: Partial<HorarioSemanal> }

export function HorarioSection({ inicial }: Props) {
  const [horario, setHorario] = useState<HorarioSemanal>(() => buildInitial(inicial));

  function toggle(dia: DiaSemana) {
    setHorario(prev => ({ ...prev, [dia]: { ...prev[dia], abierto: !prev[dia].abierto } }));
  }

  function setHora(dia: DiaSemana, turno: 'manana' | 'tarde', campo: 'desde' | 'hasta', v: string) {
    setHorario(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [turno]: { ...prev[dia][turno], [campo]: v } },
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {DIAS.map(({ key, label }) => {
        const d = horario[key];
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: d.abierto ? 'rgba(245,158,11,0.04)' : 'transparent',
              border: '1px solid',
              borderColor: d.abierto ? 'var(--color-border-amber)' : 'var(--color-border)',
              transition: 'background 0.2s, border-color 0.2s',
              flexWrap: 'wrap',
            }}
          >
            {/* Nombre del día */}
            <span style={{
              width: '86px',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: d.abierto ? 'var(--color-text-1)' : 'var(--color-text-4)',
              flexShrink: 0,
            }}>
              {label}
            </span>

            {/* Toggle abierto/cerrado */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', userSelect: 'none', flexShrink: 0,
            }}>
              <input
                type="checkbox"
                name={`horario_${key}_abierto`}
                value="on"
                checked={d.abierto}
                onChange={() => toggle(key)}
                style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{
                fontSize: '0.78rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                color: d.abierto ? 'var(--color-success)' : 'var(--color-text-4)',
                minWidth: '52px',
              }}>
                {d.abierto ? 'Abierto' : 'Cerrado'}
              </span>
            </label>

            {/* Franjas horarias */}
            {d.abierto ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                <Turno
                  label="Mañana"
                  desdeName={`horario_${key}_manana_desde`}
                  hastaName={`horario_${key}_manana_hasta`}
                  desde={d.manana.desde}
                  hasta={d.manana.hasta}
                  onDesde={v => setHora(key, 'manana', 'desde', v)}
                  onHasta={v => setHora(key, 'manana', 'hasta', v)}
                />
                <Turno
                  label="Tarde"
                  desdeName={`horario_${key}_tarde_desde`}
                  hastaName={`horario_${key}_tarde_hasta`}
                  desde={d.tarde.desde}
                  hasta={d.tarde.hasta}
                  onDesde={v => setHora(key, 'tarde', 'desde', v)}
                  onHasta={v => setHora(key, 'tarde', 'hasta', v)}
                />
              </div>
            ) : (
              <>
                <input type="hidden" name={`horario_${key}_manana_desde`} value={d.manana.desde} />
                <input type="hidden" name={`horario_${key}_manana_hasta`} value={d.manana.hasta} />
                <input type="hidden" name={`horario_${key}_tarde_desde`}  value={d.tarde.desde}  />
                <input type="hidden" name={`horario_${key}_tarde_hasta`}  value={d.tarde.hasta}  />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', fontStyle: 'italic' }}>
                  Cerrado este día
                </span>
              </>
            )}
          </div>
        );
      })}

      <p style={{ fontSize: '0.73rem', color: 'var(--color-text-4)', marginTop: '4px' }}>
        Los horarios se muestran en la web pública y en los formularios de recogida.
      </p>
    </div>
  );
}

interface TurnoProps {
  label: string;
  desdeName: string;
  hastaName: string;
  desde: string;
  hasta: string;
  onDesde: (v: string) => void;
  onHasta: (v: string) => void;
}

function Turno({ label, desdeName, hastaName, desde, hasta, onDesde, onHasta }: TurnoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        fontSize: '0.75rem',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        color: 'var(--color-text-3)',
        minWidth: '48px',
      }}>
        {label}
      </span>
      <select
        name={desdeName}
        value={desde}
        onChange={e => onDesde(e.target.value)}
        className="form-input"
        style={{ width: '82px', padding: '5px 8px', fontSize: '0.8rem' }}
      >
        {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)' }}>–</span>
      <select
        name={hastaName}
        value={hasta}
        onChange={e => onHasta(e.target.value)}
        className="form-input"
        style={{ width: '82px', padding: '5px 8px', fontSize: '0.8rem' }}
      >
        {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
    </div>
  );
}
