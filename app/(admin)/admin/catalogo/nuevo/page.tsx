import { crearProducto } from '@/lib/actions/catalogo';
import { ALERGENOS } from '@/lib/types';
import Link from 'next/link';

export const metadata = { title: 'Nuevo producto — Admin' };

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

export default function NuevoProductoPage() {
  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/catalogo" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Nuevo producto</h1>
      </div>

      <form action={crearProducto} style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ProductoFormCampos />
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type="submit" className="btn-primary">Crear producto</button>
          <Link href="/admin/catalogo" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}

function ProductoFormCampos({ producto }: { producto?: Record<string, any> }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label className="form-label">Nombre *</label>
          <input name="nombre" required className="form-input" defaultValue={producto?.nombre ?? ''} />
        </div>
        <div>
          <label className="form-label">Categoría *</label>
          <select name="categoria" required className="form-input" defaultValue={producto?.categoria ?? 'candeal'}>
            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Descripción</label>
        <textarea name="descripcion" rows={3} className="form-input" defaultValue={producto?.descripcion ?? ''} style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label className="form-label">Peso / formato</label>
          <input name="peso" className="form-input" placeholder="ej. 450 gr" defaultValue={producto?.peso ?? ''} />
        </div>
        <div>
          <label className="form-label">Precio sin IVA (€) *</label>
          <input name="precioSinIVA" type="number" step="0.01" min="0" required className="form-input" defaultValue={producto?.precioSinIVA ?? ''} />
        </div>
        <div>
          <label className="form-label">Tipo IVA *</label>
          <select name="tipoIVA" required className="form-input" defaultValue={producto?.tipoIVA ?? 0.04}>
            <option value="0.04">4% — Pan básico</option>
            <option value="0.10">10% — Bollería</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label className="form-label">Stock diario (vacío = ilimitado)</label>
          <input name="stockDiario" type="number" min="0" className="form-input" defaultValue={producto?.stockDiario ?? ''} />
        </div>
        <div>
          <label className="form-label">Orden de aparición</label>
          <input name="orden" type="number" min="0" className="form-input" defaultValue={producto?.orden ?? 99} />
        </div>
      </div>

      <div>
        <label className="form-label">URL imagen principal</label>
        <input name="imagenUrl" type="url" className="form-input" placeholder="https://..." defaultValue={producto?.imagenes?.[0] ?? ''} />
      </div>

      <div>
        <label className="form-label" style={{ marginBottom: '10px' }}>Alérgenos</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {ALERGENOS.map(a => (
            <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name={`alergeno_${a}`}
                defaultChecked={producto?.alergenos?.includes(a) ?? false}
                style={{ accentColor: 'var(--color-primary)' }}
              />
              {ALERGENOS_ES[a]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label" style={{ marginBottom: '10px' }}>Canales de venta</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {[
            { key: 'web',       label: 'Tienda online (web)' },
            { key: 'tienda',    label: 'Tienda física' },
            { key: 'mayorista', label: 'Mayorista' },
          ].map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input type="checkbox" name={`mercado_${key}`} defaultChecked={producto?.mercados?.includes(key) ?? false} style={{ accentColor: 'var(--color-primary)' }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
          <input type="checkbox" name="disponible" defaultChecked={producto?.disponible ?? true} style={{ accentColor: 'var(--color-primary)' }} />
          Disponible hoy
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
          <input type="checkbox" name="destacado" defaultChecked={producto?.destacado ?? false} style={{ accentColor: 'var(--color-primary)' }} />
          Destacado en portada
        </label>
      </div>
    </>
  );
}
