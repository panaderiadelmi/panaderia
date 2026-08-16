import { adminDb } from '@/lib/firebase/admin';
import { actualizarArticulo } from '@/lib/actions/articulos';
import { ALERGENOS, MERCADOS_OPCIONES, UNIDADES_OPCIONES, type Producto } from '@/lib/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const metadata = { title: 'Editar artículo — Admin' };

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

export default async function EditarArticuloPage({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('productos').doc(params.id).get();
  if (!snap.exists) notFound();
  const p = { id: snap.id, ...snap.data() } as Producto;

  const action = actualizarArticulo.bind(null, p.id);

  return (
    <>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/articulos" className="btn-ghost" style={{ fontSize: '0.75rem' }}>← Volver</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Editar: {p.nombre}</h1>
      </div>

      <form action={action} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Referencia (SKU) *</label>
            <input name="referencia" required className="form-input" defaultValue={p.referencia ?? ''} />
          </div>
          <div>
            <label className="form-label">Referencia proveedor</label>
            <input name="refProveedor" className="form-input" defaultValue={p.refProveedor ?? ''} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Nombre *</label>
            <input name="nombre" required className="form-input" defaultValue={p.nombre} />
          </div>
          <div>
            <label className="form-label">Categoría *</label>
            <select name="categoria" required className="form-input" defaultValue={p.categoria}>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Descripción</label>
          <textarea name="descripcion" rows={3} className="form-input" defaultValue={p.descripcion ?? ''} style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Unidades *</label>
            <select name="unidades" required className="form-input" defaultValue={p.unidades ?? 'ud'}>
              {UNIDADES_OPCIONES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Peso / formato</label>
            <input name="peso" className="form-input" defaultValue={p.peso ?? ''} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Precio venta sin IVA (€) *</label>
            <input name="precioSinIVA" type="number" step="0.01" min="0" required className="form-input" defaultValue={p.precioSinIVA} />
          </div>
          <div>
            <label className="form-label">Tipo IVA *</label>
            <select name="tipoIVA" required className="form-input" defaultValue={p.tipoIVA}>
              <option value="0.04">4% — Pan básico</option>
              <option value="0.10">10% — Bollería</option>
            </select>
          </div>
          <div>
            <label className="form-label">Precio coste (€)</label>
            <input name="precioCoste" type="number" step="0.01" min="0" className="form-input" defaultValue={p.precioCoste ?? ''} />
          </div>
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px' }}>Mercados</label>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {MERCADOS_OPCIONES.map(m => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name={`mercado_${m.value}`}
                  defaultChecked={p.mercados?.includes(m.value) ?? false}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">URL imagen principal</label>
          <input name="imagenUrl" type="url" className="form-input" defaultValue={p.imagenes?.[0] ?? ''} />
        </div>

        <div>
          <label className="form-label" style={{ marginBottom: '10px' }}>Alérgenos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {ALERGENOS.map(a => (
              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" name={`alergeno_${a}`} defaultChecked={p.alergenos?.includes(a) ?? false} style={{ accentColor: 'var(--color-primary)' }} />
                {ALERGENOS_ES[a]}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="form-label">Stock diario (vacío = ilimitado)</label>
            <input name="stockDiario" type="number" min="0" className="form-input" defaultValue={p.stockDiario ?? ''} />
          </div>
          <div>
            <label className="form-label">Orden de aparición</label>
            <input name="orden" type="number" min="0" className="form-input" defaultValue={p.orden ?? 99} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="disponible" defaultChecked={p.disponible} style={{ accentColor: 'var(--color-primary)' }} />
            Disponible
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="destacado" defaultChecked={p.destacado} style={{ accentColor: 'var(--color-primary)' }} />
            Destacado en portada
          </label>
        </div>

        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button type="submit" className="btn-primary">Guardar cambios</button>
          <Link href="/admin/articulos" className="btn-ghost">Cancelar</Link>
        </div>
      </form>
    </>
  );
}
