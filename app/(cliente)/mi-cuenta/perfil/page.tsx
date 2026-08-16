import { adminDb } from '@/lib/firebase/admin';
import { getSession } from '@/lib/firebase/auth';
import { actualizarPerfil } from '@/lib/actions/perfil';
import { ALERGENOS, type Cliente } from '@/lib/types';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Mi perfil' };

const ALERGENOS_ES: Record<string, string> = {
  gluten: 'Gluten', lacteos: 'Lácteos', huevos: 'Huevos',
  frutos_secos: 'Frutos secos', sesamo: 'Sésamo', soja: 'Soja',
  apio: 'Apio', mostaza: 'Mostaza',
};

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: { guardado?: string };
}) {
  const sesion = await getSession();
  if (!sesion) redirect('/login');

  const snap = await adminDb.collection('clientes').doc(sesion.uid).get();
  const cliente = snap.exists ? ({ uid: snap.id, ...snap.data() } as Cliente) : null;

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '6px' }}>
          Mi perfil
        </h1>
        {searchParams.guardado && (
          <p style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: '8px' }}>
            ✓ Cambios guardados correctamente
          </p>
        )}
      </div>

      <form action={actualizarPerfil} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Datos personales
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">Nombre</label>
              <input name="nombre" required className="form-input" defaultValue={cliente?.nombre ?? sesion.nombre} />
            </div>
            <div>
              <label className="form-label">Apellidos</label>
              <input name="apellidos" required className="form-input" defaultValue={cliente?.apellidos ?? sesion.apellidos} />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <input type="email" disabled className="form-input" value={sesion.email} style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-4)', marginTop: '4px', display: 'block' }}>
              El email no se puede cambiar desde aquí
            </span>
          </div>

          <div>
            <label className="form-label">Teléfono</label>
            <input name="telefono" type="tel" className="form-input" defaultValue={cliente?.telefono ?? ''} placeholder="+34 600 000 000" />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            Alergias e intolerancias
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-4)', marginBottom: '14px' }}>
            Esta información nos ayuda a informarte si algún producto puede afectarte.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {ALERGENOS.map(a => (
              <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name={`alergia_${a}`}
                  defaultChecked={cliente?.alergias?.includes(a) ?? false}
                  style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                />
                {ALERGENOS_ES[a]}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
          Guardar cambios
        </button>
      </form>
    </>
  );
}
