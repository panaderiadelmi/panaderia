import type { ConfiguracionEmpresa } from '@/lib/types';

interface Props {
  cfg: Partial<ConfiguracionEmpresa>;
  titulo?: string;
}

export function PrintHeader({ cfg, titulo }: Props) {
  const nombre = cfg.nombreFiscal || cfg.nombreWeb || '';
  const fecha  = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="print-only" style={{
      borderBottom: '2px solid #111',
      paddingBottom: '14px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    }}>
      {cfg.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cfg.logoUrl} alt={nombre} style={{ height: '56px', objectFit: 'contain', flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 800, fontSize: '1rem', margin: 0 }}>{nombre}</p>
        {cfg.nif && (
          <p style={{ fontSize: '0.78rem', margin: '2px 0 0' }}>NIF: {cfg.nif}</p>
        )}
        {cfg.direccionFiscal && (
          <p style={{ fontSize: '0.78rem', margin: '1px 0 0' }}>
            {cfg.direccionFiscal}{cfg.codigoPostal ? ` — ${cfg.codigoPostal}` : ''}
            {cfg.municipio ? ` ${cfg.municipio}` : ''}{cfg.provincia ? ` (${cfg.provincia})` : ''}
          </p>
        )}
        {(cfg.telefonoPublico || cfg.emailPublico) && (
          <p style={{ fontSize: '0.78rem', margin: '1px 0 0' }}>
            {[cfg.telefonoPublico, cfg.emailPublico].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div style={{ textAlign: 'right', fontSize: '0.78rem', flexShrink: 0 }}>
        {titulo && <p style={{ fontWeight: 700, margin: '0 0 2px' }}>{titulo}</p>}
        <p style={{ margin: 0 }}>Fecha: {fecha}</p>
      </div>
    </div>
  );
}
