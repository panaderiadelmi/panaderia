import { crearArticulo } from '@/lib/actions/articulos';
import { ALERGENOS, MERCADOS_OPCIONES, UNIDADES_OPCIONES } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Nuevo artículo — Admin' };

const CATEGORIAS = [
  { value: 'candeal',  label: 'Pan Candeal' },
  { value: 'baguette', label: 'Baguette y Viena' },
  { value: 'blanco',   label: 'Pan Blanco' },
  { value: 'bolleria', label: 'Bollería y Otros' },
];

const ALERGENOS_ES: Record<string, string> = {
  gluten: 'Gluten', lacteos: 'Lácteos', huevos: 'Huevos',
  frutos_secos: 'Frutos secos', sesamo: 'Sésamo', soja: 'Soja',
  apio: 'Apio', mostaza: 'Mostaza',
};

export default function NuevoArticuloPage() {
  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/articulos" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nuevo artículo</h1>
      </div>

      <form action={crearArticulo} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Referencia (SKU) *</label>
            <input name="referencia" required className="form-input" placeholder="ej. PAN-001" />
          </div>
          <div>
            <label className="form-label">Referencia proveedor</label>
            <input name="refProveedor" className="form-input" placeholder="Opcional" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Nombre *</label>
            <input name="nombre" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Categoría *</label>
            <select name="categoria" required className="form-input" defaultValue="candeal">
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Descripción</label>
          <textarea name="descripcion" rows={3} className="form-input" style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Unidades *</label>
            <select name="unidades" required className="form-input" defaultValue="ud">
              {UNIDADES_OPCIONES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Peso / formato</label>
            <input name="peso" className="form-input" placeholder="ej. 450 gr" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Precio venta sin IVA (€) *</label>
            <input name="precioSinIVA" type="number" step="0.01" min="0" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Tipo IVA *</label>
            <select name="tipoIVA" required className="form-input" defaultValue="0.04">
              <option value="0.04">4% — Pan básico</option>
              <option value="0.10">10% — Bollería</option>
            </select>
          </div>
          <div>
            <label className="form-label">Precio coste (€)</label>
            <input name="precioCoste" type="number" step="0.01" min="0" className="form-input" placeholder="Opcional" />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px' }}>Mercados</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {MERCADOS_OPCIONES.map(m => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name={`mercado_${m.value}`} style={{ accentColor: 'var(--color-primary)' }} />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">URL imagen principal</label>
          <input name="imagenUrl" type="url" className="form-input" placeholder="https://..." />
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px' }}>Alérgenos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ALERGENOS.map(a => (
              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name={`alergeno_${a}`} style={{ accentColor: 'var(--color-primary)' }} />
                {ALERGENOS_ES[a]}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Stock diario (vacío = ilimitado)</label>
            <input name="stockDiario" type="number" min="0" className="form-input" />
          </div>
          <div>
            <label className="form-label">Orden de aparición</label>
            <input name="orden" type="number" min="0" className="form-input" defaultValue={99} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="disponible" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
            Disponible
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="destacado" style={{ accentColor: 'var(--color-primary)' }} />
            Destacado en portada
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type="submit" className="btn-primary">Crear artículo</button>
          <Link href="/admin/articulos" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
