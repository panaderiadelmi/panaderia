import { notFound } from 'next/navigation';
import { getConfiguracion } from '@/lib/actions/configuracion';

export const dynamic = 'force-dynamic';
import PublicNavbar from '@/components/public/PublicNavbar';

type TipoLegal = 'aviso-legal' | 'privacidad' | 'cookies' | 'condiciones-venta';

const TITULOS: Record<TipoLegal, string> = {
  'aviso-legal':        'Aviso Legal',
  'privacidad':         'Política de Privacidad',
  'cookies':            'Política de Cookies',
  'condiciones-venta':  'Condiciones de Venta',
};

const CONFIG_KEYS: Record<TipoLegal, keyof ReturnType<typeof getDefaultTextos>> = {
  'aviso-legal':       'avisoLegal',
  'privacidad':        'politicaPrivacidad',
  'cookies':           'politicaCookies',
  'condiciones-venta': 'condicionesVenta',
};

function getDefaultTextos() {
  return {
    avisoLegal: 'Contenido del aviso legal pendiente de configuración.',
    politicaPrivacidad: 'Contenido de la política de privacidad pendiente de configuración.',
    politicaCookies: 'Contenido de la política de cookies pendiente de configuración.',
    condicionesVenta: 'Contenido de las condiciones de venta pendiente de configuración.',
  };
}

interface Props {
  params: { tipo: string };
}

export default async function LegalPage({ params }: Props) {
  const { tipo } = params;
  const tipos = Object.keys(TITULOS) as TipoLegal[];

  if (!tipos.includes(tipo as TipoLegal)) notFound();

  const tipoLegal = tipo as TipoLegal;
  const config    = await getConfiguracion();
  const defaults  = getDefaultTextos();
  const key       = CONFIG_KEYS[tipoLegal];
  const contenido = (config as Record<string, string>)[key] ?? defaults[key];

  return (
    <>
      <PublicNavbar />
      <main style={{ minHeight: '100vh', paddingTop: 'calc(var(--navbar-h) + 48px)', paddingBottom: '80px', background: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 24px' }}>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-1)', marginBottom: '8px' }}>
            {TITULOS[tipoLegal]}
          </h1>
          <p style={{ color: 'var(--color-text-4)', fontSize: '0.85rem', marginBottom: '40px', borderBottom: '1px solid var(--color-border)', paddingBottom: '24px' }}>
            Señas Gómez — Actualizado en {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
          </p>

          <div
            style={{ color: 'var(--color-text-2)', lineHeight: '1.8', fontSize: '0.95rem' }}
            dangerouslySetInnerHTML={{ __html: contenido.replace(/\n/g, '<br/>') }}
          />

        </div>
      </main>
    </>
  );
}

