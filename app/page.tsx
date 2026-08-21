import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSession } from '@/lib/firebase/auth';
import { getConfiguracion } from '@/lib/actions/configuracion';
import { HomeNavbar } from '@/components/home/HomeNavbar';
import { StatNumber } from '@/components/home/AnimatedStats';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import type { HorarioSemanal, DiaSemana } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Señas Gómez — Panadería · Bollería · Horno de Leña',
  description: 'Pan candeal, baguettes y bollería artesanal elaborados cada día con masa madre, fermentaciones largas y horno de leña propio. Haz tu pedido online.',
};

function getBannerImages(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'banner');
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map(f => `/images/banner/${f}`);
  } catch {
    return [];
  }
}

const DIAS_HS: { key: DiaSemana; short: string }[] = [
  { key: 'lunes',     short: 'Lun' },
  { key: 'martes',    short: 'Mar' },
  { key: 'miercoles', short: 'Mié' },
  { key: 'jueves',    short: 'Jue' },
  { key: 'viernes',   short: 'Vie' },
  { key: 'sabado',    short: 'Sáb' },
  { key: 'domingo',   short: 'Dom' },
];

function horariosLineas(horario: HorarioSemanal): { dias: string; horas: string }[] {
  const lineas: { dias: string; horas: string }[] = [];
  let i = 0;
  while (i < DIAS_HS.length) {
    const h = horario[DIAS_HS[i].key];
    if (!h?.abierto) {
      let j = i + 1;
      while (j < DIAS_HS.length && !horario[DIAS_HS[j].key]?.abierto) j++;
      const rango = j - 1 > i ? `${DIAS_HS[i].short} – ${DIAS_HS[j - 1].short}` : DIAS_HS[i].short;
      lineas.push({ dias: rango, horas: 'Cerrado' });
      i = j;
    } else {
      const horas = `${h.manana.desde}–${h.manana.hasta} / ${h.tarde.desde}–${h.tarde.hasta}`;
      let j = i + 1;
      while (j < DIAS_HS.length) {
        const nh = horario[DIAS_HS[j].key];
        if (!nh?.abierto) break;
        if (`${nh.manana.desde}–${nh.manana.hasta} / ${nh.tarde.desde}–${nh.tarde.hasta}` !== horas) break;
        j++;
      }
      const rango = j - 1 > i ? `${DIAS_HS[i].short} – ${DIAS_HS[j - 1].short}` : DIAS_HS[i].short;
      lineas.push({ dias: rango, horas });
      i = j;
    }
  }
  return lineas;
}

export default async function HomePage() {
  const sesion      = await getSession();
  const bannerImgs  = getBannerImages();
  const cfg         = await getConfiguracion();

  return (
    <>
      <HomeNavbar sesion={sesion} />

      {/* ── BANNER CARRUSEL ──────────────────────────────────────────── */}
      <div style={{ paddingTop: 'var(--navbar-h)' }}>
        <BannerCarousel images={bannerImgs} />
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '85vh',
        display: 'flex', alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Gradiente de fondo */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Imagen de fondo difuminada */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.08 }}>
          <Image src="/images/exterior.png" alt="" fill style={{ objectFit: 'cover', objectPosition: 'center' }} priority />
        </div>

        <div className="grid-hero" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', width: '100%', position: 'relative', zIndex: 1 }}>

          {/* Texto */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
              color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: '24px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block' }} />
              Horno de leña · Masa madre · Artesanal
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
              El Pan de <span className="gradient-text">Verdad</span>,<br />
              De Toda la Vida
            </h1>

            <p style={{ color: 'var(--color-text-3)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '36px', maxWidth: '480px' }}>
              En Señas Gómez horneamos cada mañana pan candeal, baguettes y bollería artesanal.
              Sin prisa, sin atajos. Solo masa madre, harina seleccionada y horno de leña.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <Link href="/catalogo" className="btn-primary" style={{ fontSize: '0.95rem', padding: '13px 28px' }}>
                Ver productos y hacer pedido
              </Link>
              <Link href="#historia" className="btn-secondary" style={{ fontSize: '0.95rem', padding: '13px 28px' }}>
                Nuestra historia
              </Link>
            </div>

            {/* Estadísticas */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { target: 15, suffix: '+', label: 'Años de oficio' },
                { target: 500, suffix: '+', label: 'Clientes habituales' },
                { target: 30, suffix: '+', label: 'Variedades al día' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--color-primary)', lineHeight: 1 }}>
                    <StatNumber target={s.target} suffix={s.suffix} />
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen hero */}
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: '0 0 60px rgba(245,158,11,0.15), 0 32px 80px rgba(0,0,0,0.5)' }}>
            <Image
              src="/images/exterior.png"
              alt="Exterior de la panadería Señas Gómez"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
            />
            {/* Badge flotante */}
            <div style={{
              position: 'absolute', bottom: '24px', left: '24px',
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--color-border-amber)',
              borderRadius: 'var(--radius-lg)', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '1.5rem' }}>🌾</span>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-1)' }}>Horno de Leña</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>Horneado cada mañana</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, transparent, var(--color-primary))' }} />
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            '🌿 Sin conservantes',
            '🔥 Horno de leña',
            '⏳ Fermentación 24h',
            '👐 Formado a mano',
            '🌾 Harina seleccionada',
            '🥖 Masa madre propia',
          ].map(item => (
            <span key={item} style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── NUESTRA HISTORIA ─────────────────────────────────────────── */}
      <section id="historia" style={{ padding: '100px 24px' }}>
        <div className="grid-historia" style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Fotos */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
              <Image src="/images/local.jpg" alt="Interior de la panadería" fill style={{ objectFit: 'cover' }} />
            </div>
            {/* Foto pequeña superpuesta */}
            <div className="historia-float" style={{
              position: 'absolute', bottom: '-24px', right: '-24px',
              width: '180px', height: '220px', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '3px solid var(--color-bg)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
            }}>
              <Image src="/images/obrador1.jpg" alt="El obrador" fill style={{ objectFit: 'cover' }} />
            </div>
            {/* Métricas */}
            <div className="historia-float" style={{
              position: 'absolute', top: '24px', right: '-20px',
              background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--color-border-amber)', borderRadius: 'var(--radius-lg)',
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {[
                { target: 15, suffix: '+', label: 'Años' },
                { target: 500, suffix: '+', label: 'Clientes' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--color-primary)' }}>
                    <StatNumber target={s.target} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-4)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Texto */}
          <div>
            <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
              🏅 Nuestra Historia
            </p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1.15, marginBottom: '24px' }}>
              Más de <span className="gradient-text">15 Años</span><br />Horneando Excelencia
            </h2>
            <p style={{ color: 'var(--color-text-3)', lineHeight: 1.8, marginBottom: '16px' }}>
              Señas Gómez nació como un pequeño obrador familiar con una sola receta y una enorme ilusión.
              Hoy, cada mañana antes del amanecer, nuestras manos trabajan la masa con la misma pasión del primer día.
            </p>
            <p style={{ color: 'var(--color-text-3)', lineHeight: 1.8, marginBottom: '36px' }}>
              Creemos que el buen pan no puede tener prisa. Por eso respetamos los tiempos de fermentación natural,
              usamos harinas molidas en piedra y nunca añadimos conservantes artificiales a ninguno de nuestros productos.
            </p>

            {/* Valores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '🌿', title: '100% Natural', desc: 'Sin conservantes ni aditivos artificiales' },
                { icon: '⏳', title: 'Fermentación lenta', desc: 'Hasta 24 horas para desarrollar sabor y textura' },
                { icon: '🔥', title: 'Horno de leña', desc: 'La corteza crujiente que solo el fuego real da' },
              ].map(v => (
                <div key={v.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  }}>
                    {v.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '2px' }}>{v.title}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-4)' }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESO ──────────────────────────────────────────────────── */}
      <section id="proceso" style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Nuestro Proceso
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Del Trigo a <span className="gradient-text">Tu Mesa</span>
            </h2>
          </div>

          <div className="grid-4col">
            {[
              { num: '01', icon: '🌾', title: 'Selección', desc: 'Elegimos harinas de molinos locales y trigos de calidad certificada. Harina Arandina para el candeal, CV18 para baguettes.' },
              { num: '02', icon: '⏳', title: 'Fermentación', desc: 'Dejamos reposar la masa hasta 24 horas con masa madre propia. Sin levaduras industriales.' },
              { num: '03', icon: '👐', title: 'Formado', desc: 'Cada pieza se forma a mano. La técnica y el tacto del artesano no los puede replicar ninguna máquina.' },
              { num: '04', icon: '🔥', title: 'Horneado', desc: 'Horno de leña a temperatura precisa. Esa corteza crujiente y esa miga perfecta solo las da el fuego real.' },
            ].map(step => (
              <div key={step.num} className="glass-card" style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2.5rem', color: 'rgba(245,158,11,0.08)', lineHeight: 1 }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '10px' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERÍA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              El Obrador, <span className="gradient-text">Cada Mañana</span>
            </h2>
          </div>
          <div className="grid-gallery">
            {['/images/obrador1.jpg', '/images/obrador2.jpg', '/images/obrador3.jpg'].map((src, i) => (
              <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', aspectRatio: '4/3', position: 'relative', border: '1px solid var(--color-border)' }}>
                <Image src={src} alt="Obrador artesanal Señas Gómez" fill style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Qué dicen nuestros clientes
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              Opiniones que nos <span className="gradient-text">Hacen Crecer</span>
            </h2>
          </div>
          <div className="grid-3col">
            {[
              { initials: 'MG', name: 'María García', role: 'Cliente habitual', text: 'El mejor pan candeal que he probado en mi vida. El sabor te transporta directamente a una panadería de pueblo. ¡Una experiencia única!' },
              { initials: 'RL', name: 'Rosa López', role: 'Vecina del barrio', text: 'Llevo años comprando aquí cada mañana. El pan de horno de leña no tiene comparación con nada de lo que venden en el supermercado.' },
              { initials: 'JM', name: 'Jorge Martínez', role: 'Hostelero', text: 'Proveemos nuestro restaurante con el pan de Señas Gómez. Los clientes siempre lo comentan. La bollería también es excepcional.' },
            ].map(t => (
              <article key={t.name} className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'var(--color-primary)', fontSize: '1rem', letterSpacing: '2px' }}>★★★★★</div>
                <p style={{ color: 'var(--color-text-2)', lineHeight: 1.75, fontSize: '0.9rem', flex: 1, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-primary-dim)', border: '1px solid var(--color-border-amber)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.72rem', color: 'var(--color-primary)',
                  }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-4)' }}>{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA CATÁLOGO ─────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div aria-hidden style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Haz tu pedido hoy
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '20px', lineHeight: 1.15 }}>
            Pan de verdad,<br /><span className="gradient-text">recogido en tienda</span>
          </h2>
          <p style={{ color: 'var(--color-text-3)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Elige tu pan y bollería, selecciona tu franja horaria y recógelo fresco del horno.
            Mínimo 24h de antelación para asegurar tu pedido.
          </p>
          <Link href="/catalogo" className="btn-primary" style={{ fontSize: '1rem', padding: '15px 36px' }}>
            Ver productos y hacer pedido
          </Link>
        </div>
      </section>

      {/* ── CONTACTO ─────────────────────────────────────────────────── */}
      <section id="contacto" style={{ padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <div className="grid-contacto" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
              Contacto
            </p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '24px', lineHeight: 1.2 }}>
              Estamos aquí<br /><span className="gradient-text">cada mañana</span>
            </h2>
            <p style={{ color: 'var(--color-text-3)', lineHeight: 1.8, marginBottom: '36px' }}>
              Para pedidos especiales, encargos o cualquier consulta,
              escríbenos por WhatsApp o visítanos en tienda.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🕐</span>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-1)', marginBottom: '4px' }}>Horario</p>
                  {cfg.horarioSemanal
                    ? horariosLineas(cfg.horarioSemanal).map((l, i) => (
                        <p key={i} style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 600 }}>{l.dias}</span>: {l.horas}
                        </p>
                      ))
                    : <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>Lun – Sáb, 7:00 – 14:00</p>
                  }
                </div>
              </div>
              {[
                { icon: '📦', label: 'Pedidos especiales', value: 'Mínimo 24–48h de antelación' },
                { icon: '🌾', label: 'Solo recogida en tienda', value: 'Sin envío a domicilio' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-1)', marginBottom: '2px' }}>{item.label}</p>
                    <p style={{ color: 'var(--color-text-3)', fontSize: '0.875rem' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>¿Quieres hacer un pedido?</h3>
            <p style={{ color: 'var(--color-text-3)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              Accede al catálogo, elige tus productos, selecciona tu franja horaria y paga online. Simple y rápido.
            </p>
            <Link href="/catalogo" className="btn-primary" style={{ justifyContent: 'center', fontSize: '0.95rem', padding: '13px' }}>
              Ir al catálogo
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-4)' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-3)', textAlign: 'center' }}>
              Para pedidos especiales de más de 48h de antelación
            </p>
            <a
              href="https://wa.me/34600000000?text=Hola,%20me%20gustar%C3%ADa%20hacer%20un%20pedido%20especial"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ justifyContent: 'center', gap: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="grid-footer">

            {/* Marca */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Image src="/images/logo.jpg" alt="Señas Gómez" width={32} height={32} style={{ borderRadius: '6px' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                  DELMI <span style={{ color: 'var(--color-primary)' }}>SORIANO</span>
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-4)', lineHeight: 1.7, maxWidth: '260px' }}>
                Panadería artesanal con horno de leña propio. Pan candeal, baguettes y bollería horneados cada mañana.
              </p>
            </div>

            {/* Productos */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)', marginBottom: '14px' }}>
                Productos
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Pan Candeal', 'Baguette y Viena', 'Pan Blanco', 'Bollería'].map(p => (
                  <Link key={p} href="/catalogo" className="link-muted" style={{ fontSize: '0.85rem' }}>{p}</Link>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)', marginBottom: '14px' }}>
                Información
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { href: '/#historia', label: 'Nuestra Historia' },
                  { href: '/#proceso', label: 'Proceso artesanal' },
                  { href: '/catalogo', label: 'Catálogo' },
                  { href: '/#contacto', label: 'Contacto' },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="link-muted" style={{ fontSize: '0.85rem' }}>{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-3)', marginBottom: '14px' }}>
                Horario
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-4)' }}>
                {cfg.horarioSemanal
                  ? horariosLineas(cfg.horarioSemanal).map((l, i) => (
                      <p key={i}>{l.dias}: <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{l.horas}</span></p>
                    ))
                  : <>
                      <p>Lun – Sáb</p>
                      <p style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>7:00 – 14:00</p>
                      <p style={{ marginTop: '8px' }}>Domingo cerrado</p>
                    </>
                }
              </div>
            </div>
          </div>

          {/* Footer bottom */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-4)' }}>
              © 2026 Señas Gómez. Todos los derechos reservados.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { label: 'Aviso Legal',           href: '/legal/aviso-legal' },
                { label: 'Privacidad',            href: '/legal/privacidad' },
                { label: 'Cookies',               href: '/legal/cookies' },
                { label: 'Condiciones de venta',  href: '/legal/condiciones-venta' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="link-muted" style={{ fontSize: '0.75rem' }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
