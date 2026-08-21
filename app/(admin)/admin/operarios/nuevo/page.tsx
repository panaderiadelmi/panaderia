import { crearOperario } from '@/lib/actions/operarios';
import { CATEGORIAS_OPERARIO, TIPOS_CONTRATO } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Nuevo operario — Admin' };

export default function NuevoOperarioPage() {
  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/operarios" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nuevo operario</h1>
      </div>

      <form action={crearOperario} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <OperarioFormFields />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary">Crear operario</button>
          <Link href="/admin/operarios" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}

function OperarioFormFields({ defaultValues }: { defaultValues?: Record<string, string | boolean> }) {
  const v = defaultValues ?? {};

  return (
    <>
      {/* Datos personales */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Datos personales
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Nombre *</label>
            <input name="nombre" required className="form-input" defaultValue={v.nombre as string ?? ''} />
          </div>
          <div>
            <label className="form-label">Apellidos *</label>
            <input name="apellidos" required className="form-input" defaultValue={v.apellidos as string ?? ''} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Fecha de nacimiento</label>
            <input name="fechaNacimiento" type="date" className="form-input" defaultValue={v.fechaNacimiento as string ?? ''} />
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <input name="telefono" type="tel" className="form-input" defaultValue={v.telefono as string ?? ''} placeholder="+34 600 000 000" />
          </div>
        </div>

        <div>
          <label className="form-label">Email</label>
          <input name="email" type="email" className="form-input" defaultValue={v.email as string ?? ''} />
        </div>
      </div>

      {/* Datos laborales */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Datos laborales
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Categoría / Puesto *</label>
            <select name="categoria" required className="form-input" defaultValue={v.categoria as string ?? ''}>
              <option value="">Seleccionar...</option>
              {Object.entries(CATEGORIAS_OPERARIO).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Tipo de contrato *</label>
            <select name="tipoContrato" required className="form-input" defaultValue={v.tipoContrato as string ?? ''}>
              <option value="">Seleccionar...</option>
              {Object.entries(TIPOS_CONTRATO).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Fecha de inicio (contrato)</label>
          <input name="fechaInicio" type="date" className="form-input" defaultValue={v.fechaInicio as string ?? ''} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Nº Seguridad Social</label>
            <input name="nss" className="form-input" defaultValue={v.nss as string ?? ''} placeholder="XXXXXXXXXX/XX" />
          </div>
          <div>
            <label className="form-label">Número de cuenta (IBAN)</label>
            <input name="numeroCuenta" className="form-input" defaultValue={v.numeroCuenta as string ?? ''} placeholder="ES00 0000 0000 0000 0000 0000" />
          </div>
        </div>
      </div>

      {/* Jornada contratada */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Jornada contratada
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Horas semanales</label>
            <input name="horasSemanales" type="number" step="0.5" min="0" max="40" className="form-input" defaultValue={v.horasSemanales as string ?? ''} placeholder="40" />
          </div>
          <div>
            <label className="form-label">Días por semana</label>
            <input name="jornadaDiasSemanales" type="number" step="1" min="1" max="7" className="form-input" defaultValue={v.jornadaDiasSemanales as string ?? ''} placeholder="5" />
          </div>
          <div>
            <label className="form-label">Días por mes</label>
            <input name="jornadaDiasMensuales" type="number" step="1" min="1" max="31" className="form-input" defaultValue={v.jornadaDiasMensuales as string ?? ''} placeholder="22" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label className="form-label">Hora entrada habitual</label>
            <input name="jornadaEntrada" type="time" className="form-input" defaultValue={v.jornadaEntrada as string ?? ''} />
          </div>
          <div>
            <label className="form-label">Hora salida habitual</label>
            <input name="jornadaSalida" type="time" className="form-input" defaultValue={v.jornadaSalida as string ?? ''} />
          </div>
          <div>
            <label className="form-label">Horas diarias</label>
            <input name="jornadaHorasDiarias" type="number" step="0.5" min="0" max="24" className="form-input" defaultValue={v.jornadaHorasDiarias as string ?? ''} placeholder="8" />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Notas internas
        </h2>
        <textarea name="notas" rows={3} className="form-input" defaultValue={v.notas as string ?? ''} placeholder="Observaciones, permisos especiales..." style={{ resize: 'vertical' }} />
      </div>
    </>
  );
}
