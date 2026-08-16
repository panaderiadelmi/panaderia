'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
}

export function BannerCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const goTo = useCallback((i: number) => {
    setCurrent((i + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, images.length, paused]);

  if (images.length === 0) return null;

  const btnBase: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    zIndex: 10, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%',
    width: '44px', height: '44px', cursor: 'pointer', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', transition: 'background 0.2s',
  };

  return (
    <section
      style={{ position: 'relative', width: '100%', height: 'clamp(340px, 60vh, 680px)', overflow: 'hidden', background: '#000' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Galería de imágenes"
    >
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={src}
          style={{
            position: 'absolute', inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.9s ease',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <Image
            src={src}
            alt={`Señas Gómez — imagen ${i + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority={i === 0}
          />
          {/* Overlay degradado inferior */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 100%)',
          }} />
          {/* Overlay degradado ámbar sutil */}
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(245,158,11,0.08) 0%, transparent 70%)',
          }} />
        </div>
      ))}

      {/* Flechas (solo si hay más de 1 imagen) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{ ...btnBase, left: '16px' }}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{ ...btnBase, right: '16px' }}
            aria-label="Imagen siguiente"
          >
            ›
          </button>
        </>
      )}

      {/* Indicadores de puntos */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '8px', zIndex: 10,
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir a imagen ${i + 1}`}
              style={{
                width: i === current ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>
      )}

    </section>
  );
}
