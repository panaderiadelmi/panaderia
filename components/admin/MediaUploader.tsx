'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subirMedia } from '@/lib/actions/configuracion';

interface Props {
  tipo: 'logo' | 'banner' | 'favicon';
  label: string;
  descripcion: string;
  currentUrl?: string;
}

export function MediaUploader({ tipo, label, descripcion, currentUrl }: Props) {
  const [preview, setPreview]   = useState<string | null>(currentUrl ?? null);
  const [fileName, setFileName] = useState<string>('');
  const [pending, setPending]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [ok, setOk]             = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  const previewW = tipo === 'banner' ? 240 : 80;
  const previewH = tipo === 'banner' ? 67  : 80;
  const accept   = tipo === 'favicon' ? '.ico,.png,.svg,image/*' : 'image/*';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setOk(false);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputRef.current?.files?.[0]) return;
    setPending(true);
    setError(null);
    setOk(false);
    try {
      const fd     = new FormData(e.currentTarget);
      const result = await subirMedia(fd);
      setPreview(result.url);
      setFileName('');
      if (inputRef.current) inputRef.current.value = '';
      setOk(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>

      {/* Preview */}
      <div style={{
        width: `${previewW}px`,
        height: `${previewH}px`,
        borderRadius: tipo === 'logo' ? '50%' : 'var(--radius-md)',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {preview ? (
          <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: '0.68rem', color: 'var(--color-text-4)', textAlign: 'center', padding: '4px' }}>
            Sin imagen
          </span>
        )}
      </div>

      {/* Info + form */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-1)', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-4)', marginBottom: '12px', lineHeight: 1.4 }}>
          {descripcion}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="hidden" name="tipo" value={tipo} />

          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', background: 'var(--color-bg-card)',
            cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-display)', fontWeight: 600,
            color: 'var(--color-text-2)', maxWidth: '260px', overflow: 'hidden',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName || 'Elegir archivo'}
            </span>
            <input
              ref={inputRef}
              type="file"
              name="archivo"
              accept={accept}
              onChange={handleChange}
              style={{ display: 'none' }}
            />
          </label>

          <button
            type="submit"
            className="btn-primary"
            disabled={!fileName || pending}
            style={{ fontSize: '0.8rem', padding: '9px 18px', opacity: (!fileName || pending) ? 0.5 : 1 }}
          >
            {pending ? 'Subiendo…' : 'Subir'}
          </button>

          {currentUrl && !ok && (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: '0.75rem' }}>
              Ver actual
            </a>
          )}
        </form>

        {ok && (
          <p style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            ✓ Imagen guardada correctamente
          </p>
        )}
        {error && (
          <p style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--color-error, #f87171)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            ✗ {error}
          </p>
        )}
      </div>
    </div>
  );
}
