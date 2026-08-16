import { getConfiguracion, guardarConfiguracion } from '@/lib/actions/configuracion';
import { HorarioSection } from '@/components/admin/HorarioSection';
import { MediaUploader }  from '@/components/admin/MediaUploader';
import type { ConfiguracionEmpresa } from '@/lib/types';

export const metadata = { title: 'Configuración — Admin' };

const SECTIONSTYLE = { display: 'flex', flexDirection: 'column' as const, gap: '16px' };

export default async function ConfiguracionPage({
  searchParams,
}: {
  searchParams: { guardado?: string; subido?: string };
}) {
  const cfg = await getConfiguracion() as Partial<ConfiguracionEmpresa>;
  const ok  = searchParams.guardado || searchParams.subido;

  return (
    <>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>Configuración de empresa</h1>
          <p style={{ color: 'var(--color-text-4)', fontSize: '0.85rem', marginTop: '4px' }}>Datos fiscales, horarios, medios y parámetros generales.</p>
        </div>
        {ok && (
          <span style={{ color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', alignSelf: 'center' }}>
            ✓ {searchParams.subido ? 'Imagen subida correctamente' : 'Cambios guardados correctamente'}
          </span>
        )}
      </div>

      {/* ── Formulario principal ─────────────────────────────── */}
      <form action={guardarConfiguracion} style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>

        {/* Datos fiscales */}
        <Section titulo="Datos fiscales">
          <Grid2>
            <Campo label="Nombre fiscal (autónomo)" name="nombreFiscal" defaultValue={cfg.nombreFiscal} />
            <Campo label="NIF" name="nif" defaultValue={cfg.nif} />
          </Grid2>
          <Campo label="Dirección fiscal" name="direccionFiscal" defaultValue={cfg.direccionFiscal} />
          <Grid3>
            <Campo label="Código postal" name="codigoPostal" defaultValue={cfg.codigoPostal} />
            <Campo label="Municipio" name="municipio" defaultValue={cfg.municipio} />
            <Campo label="Provincia" name="provincia" defaultValue={cfg.provincia} />
          </Grid3>
          <div>
            <label className="form-label">Régimen fiscal</label>
            <select name="regimen" className="form-input" defaultValue={cfg.regimen ?? 'autonomo'}>
              <option value="autonomo">Autónomo / persona física</option>
              <option value="sociedad">Sociedad (SL, SA…)</option>
            </select>
          </div>
        </Section>

        {/* Contacto público */}
        <Section titulo="Contacto público">
          <Grid2>
            <Campo label="Teléfono" name="telefonoPublico" defaultValue={cfg.telefonoPublico} />
            <Campo label="WhatsApp" name="whatsapp" defaultValue={cfg.whatsapp} />
          </Grid2>
          <Campo label="Email público" name="emailPublico" type="email" defaultValue={cfg.emailPublico} />
          <Campo label="Dirección física del local" name="direccionFisica" defaultValue={cfg.direccionFisica} />
        </Section>

        {/* Horario semanal */}
        <Section titulo="Horario de apertura">
          <HorarioSection inicial={cfg.horarioSemanal ?? {}} />
        </Section>

        {/* Pedidos */}
        <Section titulo="Parámetros de pedido">
          <Grid2>
            <Campo label="Antelación mínima (horas)" name="antelacionMinimaHoras" type="number" defaultValue={cfg.antelacionMinimaHoras ?? 24} />
            <Campo label="Máx. pedidos por franja horaria" name="maxPedidosPorFranja" type="number" defaultValue={cfg.maxPedidosPorFranja ?? 20} />
          </Grid2>
        </Section>

        {/* Métodos de pago */}
        <Section titulo="Métodos de pago activos">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <CheckLabel name="metodo_stripe_card"        checked={cfg.metodosActivos?.includes('stripe_card')}        label="Tarjeta (Stripe)" />
            <CheckLabel name="metodo_stripe_bizum"       checked={cfg.metodosActivos?.includes('stripe_bizum')}       label="Bizum (Stripe)" />
            <CheckLabel name="metodo_efectivo_recogida"  checked={cfg.metodosActivos?.includes('efectivo_recogida')}  label="Pago en efectivo al recoger" />
          </div>
        </Section>

        {/* Identidad web */}
        <Section titulo="Identidad web">
          <Grid2>
            <Campo label="Nombre web" name="nombreWeb" defaultValue={cfg.nombreWeb ?? 'Señas Gómez'} />
            <Campo label="Tagline" name="tagline" defaultValue={cfg.tagline} />
          </Grid2>
          <Grid2>
            <Campo label="Instagram (usuario)" name="instagram" defaultValue={cfg.instagram} placeholder="@senasgomez" />
            <Campo label="Facebook (URL)" name="facebook" defaultValue={cfg.facebook} />
          </Grid2>
        </Section>

        {/* Hero */}
        <Section titulo="Sección hero (estadísticas animadas)">
          <Campo label="Título del hero" name="heroTitulo" defaultValue={cfg.heroTitulo} placeholder="Pan de verdad, de toda la vida" />
          <Campo label="Subtítulo" name="heroSubtitulo" defaultValue={cfg.heroSubtitulo} />
          <Grid3>
            <Campo label="Años de oficio"     name="statsAnios"      type="number" defaultValue={cfg.statsAnios      ?? 0} />
            <Campo label="Clientes habituales" name="statsClientes"   type="number" defaultValue={cfg.statsClientes   ?? 0} />
            <Campo label="Variedades diarias"  name="statsVariedades" type="number" defaultValue={cfg.statsVariedades ?? 0} />
          </Grid3>
        </Section>

        {/* Textos legales */}
        <Section titulo="Textos legales">
          <TextareaField label="Aviso Legal"           name="avisoLegal"          defaultValue={cfg.avisoLegal} />
          <TextareaField label="Política de Privacidad" name="politicaPrivacidad" defaultValue={cfg.politicaPrivacidad} />
          <TextareaField label="Política de Cookies"    name="politicaCookies"    defaultValue={cfg.politicaCookies} />
          <TextareaField label="Condiciones de Venta"   name="condicionesVenta"   defaultValue={cfg.condicionesVenta} />
        </Section>

        <div style={{ paddingTop: '8px' }}>
          <button type="submit" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Guardar configuración
          </button>
        </div>
      </form>

      {/* ── Imágenes y recursos (formularios separados) ──────── */}
      <div style={{ marginTop: '40px', maxWidth: '800px' }}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--color-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '4px',
          }}>
            Imágenes y recursos
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', marginBottom: '20px' }}>
            Cada imagen se sube de forma independiente. Los cambios se aplican inmediatamente en la web.
          </p>

          <MediaUploader
            tipo="logo"
            label="Logo"
            descripcion="Aparece en la barra de navegación, facturas y correos. Recomendado: PNG cuadrado, mínimo 200×200 px."
            currentUrl={cfg.logoUrl}
          />

          <MediaUploader
            tipo="banner"
            label="Banner principal"
            descripcion="Carrusel de la portada. Para mejor resultado usa imágenes de 869×243 px o proporción 16:4,5."
            currentUrl={cfg.bannerUrl}
          />

          <MediaUploader
            tipo="favicon"
            label="Favicon"
            descripcion="Icono de la pestaña del navegador. Formatos: ICO, PNG o SVG, tamaño ideal 32×32 px."
            currentUrl={cfg.faviconUrl}
          />

          <div style={{ paddingTop: '8px' }} />
        </div>
      </div>
    </>
  );
}

/* ── Componentes auxiliares ────────────────────────────────────── */

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.9rem',
        fontWeight: 700,
        color: 'var(--color-text-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '18px',
      }}>
        {titulo}
      </h2>
      <div style={SECTIONSTYLE}>{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>{children}</div>;
}

function Grid3({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>{children}</div>;
}

function Campo({ label, name, defaultValue, type = 'text', placeholder }: {
  label: string; name: string; defaultValue?: any; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input name={name} type={type} className="form-input" defaultValue={defaultValue ?? ''} placeholder={placeholder} />
    </div>
  );
}

function TextareaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <textarea name={name} rows={5} className="form-input" defaultValue={defaultValue ?? ''} style={{ resize: 'vertical' }} />
    </div>
  );
}

function CheckLabel({ name, checked, label }: { name: string; checked?: boolean; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
      <input type="checkbox" name={name} defaultChecked={checked ?? false}
        style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }} />
      {label}
    </label>
  );
}
