/**
 * DELMI SORIANO — Panadería Artesanal Premium
 * script.js — Interacciones y Animaciones
 */

'use strict';

/* =====================================================
   🛠️ CATÁLOGO DE PRODUCTOS — EDITABLE
   =====================================================
   Para añadir un producto nuevo: copia uno de estos objetos
   y pégalo al final del array (antes del cierre ]).
   Para añadir una imagen nueva: pon el archivo en /images/
   y escribe su nombre en el campo "imagen".
   ===================================================== */

const PRODUCTOS = [
    {
        id:          'masa-madre',
        titulo:      'Pan de Masa Madre',
        imagen:      'images/service_1.png',
        imgAlt:      'Pan artesanal de masa madre',
        icono:       '🍞',
        descripcion: 'Fermentación lenta de 24 horas. Corteza crujiente, miga alveolada y sabor profundo que solo la tradición puede dar.',
        ingredientes: [
            'Harina ecológica de trigo',
            'Agua de manantial',
            'Sal marina sin refinar',
            'Masa madre (fermento vivo)',
        ],
        ctaTexto: 'Hacer Pedido →',
        ctaHref:  '#contacto',
        ctaWa:    false,
    },
    {
        id:          'bolleria-francesa',
        titulo:      'Bollería Francesa',
        imagen:      'images/service_2.png',
        imgAlt:      'Bollería francesa premium: croissants',
        icono:       '🥐',
        descripcion: 'Croissants y viennoiserie laminados a mano con ingredientes de la máxima calidad.',
        ingredientes: [
            'Harina de fuerza T65',
            'Mantequilla AOC francesa (82% M.G.)',
            'Leche entera fresca',
            'Huevos camperos',
            'Azúcar de caña',
            'Levadura fresca de panadero',
        ],
        ctaTexto: 'Hacer Pedido →',
        ctaHref:  '#contacto',
        ctaWa:    false,
    },
    {
        id:          'obrador',
        titulo:      'Obrador Artesanal',
        imagen:      'images/service_3.png',
        imgAlt:      'Proceso de amasado en el obrador',
        icono:       '👐',
        descripcion: 'Todo se elabora a mano en nuestro obrador propio bajo supervisión personal en cada etapa.',
        ingredientes: [
            'Selección de harinas certificadas',
            'Fermentaciones largas (12–24h)',
            'Amasado y formado manual',
            'Horneado en horno de piedra',
        ],
        ctaTexto: 'Conocer Más →',
        ctaHref:  '#nosotros',
        ctaWa:    false,
    },
    {
        id:          'reposteria',
        titulo:      'Repostería de Ocasión',
        imagen:      'images/service_4.png',
        imgAlt:      'Tartas y repostería artesanal para celebraciones',
        icono:       '🎂',
        descripcion: 'Tartas personalizadas, macarons y petit fours para bodas, cumpleaños y eventos especiales.',
        ingredientes: [
            'Harina repostera ecológica',
            'Huevos camperos (Cat. A)',
            'Azúcar moreno integral',
            'Mantequilla de calidad superior',
            'Chocolate negro 70% cacao',
            'Nata fresca de vaca',
        ],
        ctaTexto: 'Consultar por WhatsApp →',
        ctaHref:  'https://wa.me/TUNUMEROAQUI',
        ctaWa:    true,
    },
    {
        id:          'ingredientes',
        titulo:      'Ingredientes Premium',
        imagen:      'images/service_5.png',
        imgAlt:      'Harinas ecológicas y materias primas premium',
        icono:       '🌿',
        descripcion: 'Seleccionamos las mejores harinas ecológicas, trigos antiguos y materias primas de productores locales.',
        ingredientes: [
            'Harinas molidas en piedra',
            'Trigos ancestrales (espelta, kamut)',
            'Semillas ecológicas certificadas',
            'Aceite de oliva virgen extra',
            'Miel de producción local',
            'Sal rosa del Himalaya',
        ],
        ctaTexto: 'Saber Más →',
        ctaHref:  '#nosotros',
        ctaWa:    false,
    },
    {
        id:          'pedidos',
        titulo:      'Pedidos & Entrega',
        imagen:      'images/service_6.png',
        imgAlt:      'Servicio de pedidos y entrega a domicilio',
        icono:       '📦',
        descripcion: 'Realiza tu pedido con antelación y recógelo en tienda o recíbelo en casa con packaging sostenible.',
        ingredientes: [
            'Pedido mínimo 24h de antelación',
            'Recogida en tienda (7:00–14:00)',
            'Entrega a domicilio disponible',
            'Packaging 100% eco-friendly',
            'Producto siempre en el mismo día',
        ],
        ctaTexto: 'Hacer Pedido →',
        ctaHref:  '#contacto',
        ctaWa:    false,
    },
];


/* =====================================================
   RENDER DE CARDS DE PRODUCTOS
   ===================================================== */

function renderServicios() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    /* Cargar del localStorage (admin) o usar el catálogo por defecto */
    let lista = PRODUCTOS;
    try {
        const guardado = localStorage.getItem('PANADERIA_PRODUCTOS');
        if (guardado) lista = JSON.parse(guardado);
    } catch (e) { /* sin cambios del admin, se usan los defaults */ }

    grid.innerHTML = lista.map(p => `
        <article
            class="service-card-flip"
            role="listitem"
            tabindex="0"
            id="producto-${p.id}"
            aria-label="${p.titulo}"
        >
            <div class="service-card-inner">

                <!-- CARA DELANTERA -->
                <div class="service-card-front">
                    <img
                        src="${p.imagen}"
                        alt="${p.imgAlt}"
                        class="service-image"
                        loading="lazy"
                        onerror="this.src='images/hero_visual.png'"
                    >
                    <div class="service-overlay">
                        <div class="service-icon" aria-hidden="true">${p.icono}</div>
                        <h3 class="service-title-front">${p.titulo}</h3>
                        <button class="btn-ver-ingredientes" aria-label="Ver ingredientes de ${p.titulo}">
                            👁 Ver ingredientes
                        </button>
                    </div>
                </div>

                <!-- CARA TRASERA (ingredientes) -->
                <div class="service-card-back glass-card">

                    <div class="service-back-header">
                        <span class="service-back-icon" aria-hidden="true">${p.icono}</span>
                        <h3 class="service-title-back">${p.titulo}</h3>
                    </div>

                    <p class="service-description">${p.descripcion}</p>

                    <div class="ingredientes-block">
                        <p class="ingredientes-label">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 14v-4m0-4h.01"/></svg>
                            Ingredientes
                        </p>
                        <ul class="ingredientes-lista" role="list">
                            ${p.ingredientes.map(ing => `
                                <li class="ingrediente-item" role="listitem">
                                    <span class="ingrediente-check" aria-hidden="true">✦</span>
                                    ${ing}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <!-- Botones en fila: Volver | Hacer Pedido -->
                    <div class="card-back-actions">
                        <button class="btn-volver" aria-label="Volver">← Volver</button>
                        <a
                            href="${p.ctaHref}"
                            class="service-cta${p.ctaWa ? ' service-cta-wa' : ''}"
                            ${p.ctaWa ? 'target="_blank" rel="noopener noreferrer"' : ''}
                        >${p.ctaTexto}</a>
                    </div>

                </div>

            </div>
        </article>
    `).join('');

    /* Inicializar flip sobre los elementos recién creados */
    initFlipCards();
}

/* =====================================================
   FLIP CARDS — Solo por clic, no por hover
   ===================================================== */

function initFlipCards() {
    const cards = document.querySelectorAll('.service-card-flip');

    cards.forEach(card => {

        /* Botón "Ver ingredientes" → activa el flip */
        const btnVer = card.querySelector('.btn-ver-ingredientes');
        if (btnVer) {
            btnVer.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.add('flipped');
            });
        }

        /* Botón "← Volver" → cierra el flip */
        const btnVolver = card.querySelector('.btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('flipped');
            });
        }

        /* Links CTA → navegan normalmente, sin flip */
        const ctaLinks = card.querySelectorAll('.service-cta');
        ctaLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.remove('flipped'); /* cierra la card al ir al formulario */
            });
        });

        /* Teclado (accesibilidad) */
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('flipped');
            }
            if (e.key === 'Escape') {
                card.classList.remove('flipped');
            }
        });
    });
}

/* =====================================================
   UTILIDADES
   ===================================================== */

/**
 * Debounce para eventos de scroll/resize
 */
function debounce(func, wait = 16) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Contador animado para estadísticas
 * @param {HTMLElement} element - Elemento donde mostrar el número
 * @param {number} target - Número objetivo
 * @param {number} duration - Duración en ms
 */
function animateCounter(element, target, duration = 2200) {
    if (!element) return;
    const start = performance.now();
    const startVal = 0;

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing: easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(startVal + (target - startVal) * eased);
        element.textContent = current.toLocaleString('es-ES');
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

/* =====================================================
   PARTÍCULAS DE FONDO
   ===================================================== */

function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const particleCount = window.innerWidth < 768 ? 18 : 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: -${Math.random() * 20}s;
            animation-duration: ${14 + Math.random() * 12}s;
            opacity: ${0.2 + Math.random() * 0.5};
        `;
        container.appendChild(particle);
    }
}

/* =====================================================
   NAVBAR STICKY
   ===================================================== */

function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const handleScroll = debounce(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 10);

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // estado inicial
}

/* =====================================================
   MENÚ HAMBURGUESA (MOBILE)
   ===================================================== */

function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    let isOpen = false;

    function openMenu() {
        isOpen = true;
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Cerrar menú');
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        isOpen = false;
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        if (isOpen) closeMenu();
        else openMenu();
    });

    // Cerrar al hacer click en cualquier link del menú
    menu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) closeMenu();
    });
}

/* =====================================================
   SMOOTH SCROLL
   ===================================================== */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const offset = 80; // altura del navbar
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}


/* =====================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
   ===================================================== */

function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.glass-card, .proceso-step, .testimonio-card, .metric-card, .service-card-flip, .value-item, .proof-item'
    );

    if (!revealElements.length) return;

    // Añadir clase reveal a los elementos
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger delay para grupos
                const siblings = Array.from(entry.target.parentElement?.children || []);
                const sibIdx = siblings.indexOf(entry.target);
                const delay = Math.min(sibIdx * 80, 400);

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/* =====================================================
   CONTADORES ANIMADOS
   ===================================================== */

function initCounters() {
    const counters = document.querySelectorAll('.count-up, .stat-number');
    if (!counters.length) return;

    // Map para saber cuáles ya animamos
    const animated = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated.has(entry.target)) {
                animated.add(entry.target);
                const target = parseInt(entry.target.getAttribute('data-target') || entry.target.textContent, 10);
                if (!isNaN(target)) animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(el => observer.observe(el));
}

/* =====================================================
   PARALLAX SUAVE EN HERO
   ===================================================== */

function initParallax() {
    const heroBg = document.querySelector('.hero-bg-gradient');
    if (!heroBg) return;

    const handleScroll = debounce(() => {
        const scrolled = window.pageYOffset;
        if (scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
        }
    }, 8);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

/* =====================================================
   ACTIVE NAV LINK
   ===================================================== */

function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link:not(.nav-link-cta)');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: '-80px 0px -35% 0px'
    });

    sections.forEach(s => observer.observe(s));
}

/* =====================================================
   LAZY LOAD IMAGES
   ===================================================== */

function initLazyImages() {
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.transition = 'opacity 0.5s ease';
                img.style.opacity = '0';
                img.addEventListener('load', () => {
                    img.style.opacity = '1';
                }, { once: true });
                imageObserver.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });

    imgs.forEach(img => imageObserver.observe(img));
}

/* =====================================================
   EFECTO HOVER EN PROOF LOGOS (GRISES → COLOR)
   ===================================================== */

function initProofLogos() {
    const items = document.querySelectorAll('.proof-item');
    items.forEach(item => {
        item.style.transition = 'all 0.3s ease';
    });
}

/* =====================================================
   FORMULARIO DE CONTACTO → n8n Webhook
   ===================================================== */

function initContactForm() {
    const form    = document.getElementById('contacto-form');
    const success = document.getElementById('form-success');
    const btnEnviar = document.getElementById('form-submit');
    if (!form) return;

    /* 🔗 URL del webhook de n8n */
    const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/b76a95dc-03cb-4540-a425-10cbee095fdf';

    /* ──────────────────────────────────────────────────
       VALIDACIÓN
    ────────────────────────────────────────────────── */
    function ok(field, errorId, msg) {
        const errEl = document.getElementById(errorId);
        const valid = field.value.trim() !== '' &&
                      !(field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.classList.toggle('error', !valid);
        if (errEl) errEl.textContent = valid ? '' : msg;
        return valid;
    }

    function okCheck(checkbox, errorId) {
        const errEl = document.getElementById(errorId);
        if (errEl) errEl.textContent = checkbox.checked ? '' : 'Debes aceptar la política de privacidad.';
        return checkbox.checked;
    }

    /* Borrar error al escribir */
    form.querySelectorAll('.form-input').forEach(inp => {
        inp.addEventListener('input', () => {
            if (inp.value.trim()) {
                inp.classList.remove('error');
                const e = document.getElementById('error-' + inp.id.replace('form-', ''));
                if (e) e.textContent = '';
            }
        });
    });

    /* ──────────────────────────────────────────────────
       ENVÍO
    ────────────────────────────────────────────────── */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        /* Recoger campos */
        const nombre     = document.getElementById('form-nombre');
        const email      = document.getElementById('form-email');
        const telefono   = document.getElementById('form-telefono');
        const tipo       = document.getElementById('form-tipo');
        const mensaje    = document.getElementById('form-mensaje');
        const privacidad = document.getElementById('form-privacidad');

        /* Validar */
        const valido =
            ok(nombre,  'error-nombre',  'Por favor, escribe tu nombre.')      &
            ok(email,   'error-email',   'Introduce un email válido.')          &
            ok(tipo,    'error-tipo',    'Selecciona el tipo de pedido.')        &
            ok(mensaje, 'error-mensaje', 'Cuéntanos los detalles del pedido.')  &
            okCheck(privacidad, 'error-privacidad');

        if (!valido) {
            const primero = form.querySelector('.form-input.error');
            if (primero) { primero.scrollIntoView({ behavior: 'smooth', block: 'center' }); primero.focus(); }
            return;
        }

        /* Botón → estado cargando */
        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `
            <svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Enviando...`;

        /* ── JSON que recibirá n8n ── */
        const payload = {
            nombre:   nombre.value.trim(),
            email:    email.value.trim(),
            telefono: telefono ? telefono.value.trim() : '',
            tipo:     tipo.options[tipo.selectedIndex].text,
            mensaje:  mensaje.value.trim(),
            fecha:    new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
            origen:   'Web Delmi Soriano'
        };

        try {
            /*
             * Se usa mode:'no-cors' + Content-Type:'text/plain'
             * para evitar el preflight OPTIONS (CORS) cuando la web
             * se abre desde file:// o un dominio distinto.
             * n8n recibe el body como texto y lo parsea como JSON.
             */
            await fetch(N8N_WEBHOOK_URL, {
                method:  'POST',
                mode:    'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body:    JSON.stringify(payload)
            });

            /* no-cors no permite leer la respuesta → asumimos éxito */
            form.style.display = 'none';
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (err) {
            console.error('[n8n webhook] Error:', err);

            /* Restaurar botón */
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Enviar Mensaje`;

            const errMensaje = document.getElementById('error-mensaje');
            if (errMensaje) {
                errMensaje.textContent = '⚠️ No se pudo conectar con el servidor. '
                    + 'Por favor, contáctanos por WhatsApp o llámanos directamente.';
            }
        }
    });
}






document.addEventListener('DOMContentLoaded', () => {
    renderServicios();   // ← genera las cards del catálogo primero
    initParticles();
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initFlipCards();
    initScrollReveal();
    initCounters();
    initParallax();
    initActiveNavLinks();
    initLazyImages();
    initContactForm();
    initProofLogos();
    initAuthWidget();    // ← widget de acceso admin

    // Añadir estilo activo a nav links
    const style = document.createElement('style');
    style.textContent = `
        .nav-link.active:not(.nav-link-cta) {
            color: var(--text-primary) !important;
        }
        .nav-link.active:not(.nav-link-cta)::after {
            width: calc(100% - 28px) !important;
        }
    `;
    document.head.appendChild(style);
});

/* =====================================================
   AUTH WIDGET — ACCESO ADMIN DESDE EL MENÚ
   ===================================================== */

function initAuthWidget() {
    // Salir silenciosamente si DS_AUTH no está disponible
    if (typeof DS_AUTH === 'undefined') return;

    const desktopItem = document.getElementById('nav-auth-item');
    const mobileItem  = document.getElementById('mobile-auth-item');
    if (!desktopItem && !mobileItem) return;

    const session = DS_AUTH.getSession();
    const ROLES   = DS_AUTH.ROLES;

    // Inyectar estilos del widget una sola vez
    if (!document.getElementById('auth-widget-styles')) {
        const s = document.createElement('style');
        s.id = 'auth-widget-styles';
        s.textContent = `
            /* ── Botón "Admin" sin sesión ── */
            .nav-admin-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 6px 13px;
                border-radius: 999px;
                font-family: var(--font-display, 'Plus Jakarta Sans', sans-serif);
                font-size: 0.72rem;
                font-weight: 700;
                text-decoration: none;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: rgba(245,158,11,0.8);
                border: 1px solid rgba(245,158,11,0.25);
                background: rgba(245,158,11,0.06);
                transition: all 0.2s ease;
                cursor: pointer;
                white-space: nowrap;
            }
            .nav-admin-btn:hover {
                color: #F59E0B;
                border-color: rgba(245,158,11,0.6);
                background: rgba(245,158,11,0.12);
                box-shadow: 0 0 12px rgba(245,158,11,0.2);
            }

            /* ── Widget con sesión activa ── */
            .nav-user-widget {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 4px 4px 4px 10px;
                border-radius: 999px;
                border: 1px solid rgba(245,158,11,0.2);
                background: rgba(245,158,11,0.05);
                transition: all 0.2s ease;
                text-decoration: none;
                cursor: pointer;
                position: relative;
            }
            .nav-user-widget:hover { border-color: rgba(245,158,11,0.45); background: rgba(245,158,11,0.1); }

            .nav-user-info {
                display: flex;
                flex-direction: column;
                line-height: 1.2;
                text-align: right;
            }
            .nav-user-name {
                font-family: var(--font-display,'Plus Jakarta Sans',sans-serif);
                font-size: 0.72rem;
                font-weight: 700;
                color: #fff;
                white-space: nowrap;
            }
            .nav-user-role {
                font-size: 0.62rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                white-space: nowrap;
            }
            .nav-user-avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: var(--font-display,'Plus Jakarta Sans',sans-serif);
                font-size: 0.65rem;
                font-weight: 800;
                flex-shrink: 0;
            }

            /* Dropdown */
            .nav-user-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                min-width: 200px;
                background: #0d0d0d;
                border: 1px solid rgba(245,158,11,0.2);
                border-radius: 12px;
                padding: 8px;
                box-shadow: 0 20px 48px rgba(0,0,0,0.7);
                display: none;
                flex-direction: column;
                gap: 4px;
                z-index: 500;
            }
            .nav-user-widget:hover .nav-user-dropdown,
            .nav-user-widget:focus-within .nav-user-dropdown { display: flex; }

            .dropdown-link {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 9px 12px;
                border-radius: 8px;
                font-size: 0.8rem;
                font-weight: 600;
                font-family: var(--font-display,'Plus Jakarta Sans',sans-serif);
                color: #E2E8F0;
                text-decoration: none;
                transition: all 0.15s;
                cursor: pointer;
                border: none;
                background: transparent;
                width: 100%;
                text-align: left;
            }
            .dropdown-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
            .dropdown-link.logout { color: #EF4444; }
            .dropdown-link.logout:hover { background: rgba(239,68,68,0.1); }
            .dropdown-divider {
                height: 1px;
                background: rgba(255,255,255,0.06);
                margin: 4px 8px;
            }

            /* Móvil */
            .mobile-auth-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                border-radius: 10px;
                border: 1px solid rgba(245,158,11,0.2);
                background: rgba(245,158,11,0.05);
                gap: 10px;
                text-decoration: none;
            }
            .mobile-auth-login {
                display: block;
                padding: 12px 16px;
                border-radius: 10px;
                border: 1px solid rgba(245,158,11,0.2);
                background: rgba(245,158,11,0.06);
                color: #F59E0B;
                font-family: var(--font-display,'Plus Jakarta Sans',sans-serif);
                font-size: 0.82rem;
                font-weight: 700;
                text-align: center;
                text-decoration: none;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                transition: all 0.2s;
            }
            .mobile-auth-login:hover { background: rgba(245,158,11,0.12); }
        `;
        document.head.appendChild(s);
    }

    /* ── SIN SESIÓN: botón simple "Admin" ── */
    if (!session) {
        const loginBtn = `<a href="login.html" class="nav-admin-btn" aria-label="Acceso administración">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Admin
        </a>`;

        if (desktopItem) { desktopItem.innerHTML = loginBtn; desktopItem.style.display = 'list-item'; }
        if (mobileItem)  {
            mobileItem.innerHTML = `<a href="login.html" class="mobile-auth-login">🔐 Acceso Admin</a>`;
            mobileItem.style.display = 'list-item';
        }
        return;
    }

    /* ── CON SESIÓN: widget de usuario ── */
    const role     = ROLES[session.rol] || {};
    const initials = (session.nombre[0] + (session.apellido?.[0] || '')).toUpperCase();
    const adminHref = DS_AUTH.hasPermission('admin_productos')
        ? 'admin-productos.html'
        : DS_AUTH.hasPermission('admin_usuarios')
            ? 'admin-usuarios.html'
            : '#';

    // Desktop widget con dropdown
    if (desktopItem) {
        desktopItem.style.display = 'list-item';
        desktopItem.innerHTML = `
            <div class="nav-user-widget" tabindex="0" role="button" aria-haspopup="true" aria-label="Menú de usuario">
                <div class="nav-user-info">
                    <span class="nav-user-name">${session.nombre}</span>
                    <span class="nav-user-role" style="color:${role.color || '#F59E0B'}">${role.emoji || ''} ${role.label || session.rol}</span>
                </div>
                <div class="nav-user-avatar"
                    style="background:${role.bg || 'rgba(245,158,11,0.1)'};
                           border:1px solid ${role.border || 'rgba(245,158,11,0.3)'};
                           color:${role.color || '#F59E0B'}">
                    ${initials}
                </div>
                <!-- Dropdown -->
                <div class="nav-user-dropdown">
                    ${adminHref !== '#' ? `
                    <a href="${adminHref}" class="dropdown-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        Panel Admin
                    </a>` : ''}
                    ${DS_AUTH.hasPermission('admin_usuarios') ? `
                    <a href="admin-usuarios.html" class="dropdown-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                        Usuarios
                    </a>` : ''}
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-link logout" onclick="DS_AUTH.logout()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Cerrar sesión
                    </button>
                </div>
            </div>`;
    }

    // Móvil: fila con avatar + nombre + enlace al panel
    if (mobileItem) {
        mobileItem.style.display = 'list-item';
        mobileItem.innerHTML = `
            <a href="${adminHref !== '#' ? adminHref : 'login.html'}" class="mobile-auth-row">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                                background:${role.bg};border:1px solid ${role.border};
                                color:${role.color};font-family:'Plus Jakarta Sans',sans-serif;font-size:0.7rem;font-weight:800;">
                        ${initials}
                    </div>
                    <div>
                        <div style="font-family:'Plus Jakarta Sans',sans-serif;font-size:0.82rem;font-weight:700;color:#fff;">
                            ${session.nombre} ${session.apellido}
                        </div>
                        <div style="font-size:0.68rem;color:${role.color};font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">
                            ${role.emoji} ${role.label}
                        </div>
                    </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <button onclick="DS_AUTH.logout()" style="
                width:100%;margin-top:6px;padding:10px;border-radius:8px;
                background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);
                color:#EF4444;font-family:'Plus Jakarta Sans',sans-serif;
                font-size:0.78rem;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;
            ">Cerrar sesión</button>`;
    }
}
