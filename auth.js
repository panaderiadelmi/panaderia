/**
 * auth.js — Sistema de autenticación Delmi Soriano
 * Roles: administrador | almacen | contabilidad | cliente | incognito
 */
(function () {
    'use strict';

    const LS_USERS = 'DS_USUARIOS_V1';
    const LS_SESSION = 'DS_SESSION_V1';
    const LS_OVERRIDES = 'DS_PERMISOS_V1';
    const SALT = 'DelmiSoriano_2026_##';

    /* ── LISTADO COMPLETO DE PERMISOS ─────────────────────────────── */
    const ALL_PERMS = [
        { key: 'admin_usuarios', label: 'Gestionar usuarios', emoji: '👤', desc: 'Crear, editar y eliminar usuarios del sistema' },
        { key: 'admin_productos', label: 'Gestionar productos', emoji: '📦', desc: 'Editar el catálogo y fichas de productos' },
        { key: 'ver_pedidos', label: 'Ver pedidos', emoji: '📋', desc: 'Consultar el historial y estado de pedidos' },
        { key: 'ver_contabilidad', label: 'Ver contabilidad', emoji: '📊', desc: 'Acceder a informes financieros y facturas' },
        { key: 'hacer_pedidos', label: 'Realizar pedidos', emoji: '🛒', desc: 'Crear nuevos pedidos desde el formulario' },
        { key: 'ver_catalogo', label: 'Ver catálogo web', emoji: '🌐', desc: 'Navegar por la tienda y ver productos' },
    ];

    /* ── DEFINICIÓN DE ROLES Y PERMISOS ──────────────────────────── */
    const ROLES = {
        administrador: {
            label: 'Administrador', emoji: '👑',
            color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)',
            permisos: ['admin_usuarios', 'admin_productos', 'ver_pedidos', 'ver_contabilidad', 'hacer_pedidos', 'ver_catalogo']
        },
        almacen: {
            label: 'Almacén', emoji: '📦',
            color: '#38BDF8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)',
            permisos: ['admin_productos', 'ver_pedidos', 'hacer_pedidos', 'ver_catalogo']
        },
        contabilidad: {
            label: 'Contabilidad', emoji: '📊',
            color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)',
            permisos: ['ver_pedidos', 'ver_contabilidad', 'ver_catalogo']
        },
        cliente: {
            label: 'Cliente', emoji: '🛒',
            color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)',
            permisos: ['hacer_pedidos', 'ver_catalogo']
        },
        incognito: {
            label: 'Incógnito', emoji: '🕵️',
            color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)',
            permisos: ['ver_catalogo']
        }
    };

    /* ── HASH SIMPLE (demo — no usar en producción con datos reales) ─ */
    function hashPwd(pwd) {
        const str = SALT + pwd + SALT;
        let h = 5381;
        for (let i = 0; i < str.length; i++) h = Math.imul(33, h) ^ str.charCodeAt(i);
        return (h >>> 0).toString(36);
    }

    /* ── USUARIOS POR DEFECTO ─────────────────────────────────────── */
    const DEFAULT_USERS = [
        { id: 'u1', nombre: 'Laura', apellido: 'Delmi', email: 'admin@delmisoriano.com', password: hashPwd('admin123'), rol: 'administrador', activo: true, creado: '2026-01-01' },
        { id: 'u2', nombre: 'Carlos', apellido: 'Moreno', email: 'almacen@delmisoriano.com', password: hashPwd('almacen123'), rol: 'almacen', activo: true, creado: '2026-01-15' },
        { id: 'u3', nombre: 'Ana', apellido: 'García', email: 'conta@delmisoriano.com', password: hashPwd('conta123'), rol: 'contabilidad', activo: true, creado: '2026-02-01' },
        { id: 'u4', nombre: 'María', apellido: 'López', email: 'cliente@delmisoriano.com', password: hashPwd('cliente123'), rol: 'cliente', activo: true, creado: '2026-02-20' },
        { id: 'u5', nombre: 'Invitado', apellido: '', email: 'visita@delmisoriano.com', password: hashPwd('visita123'), rol: 'incognito', activo: true, creado: '2026-03-01' },
    ];

    /* ── ALMACENAMIENTO ───────────────────────────────────────────── */
    function getUsers() {
        try {
            const s = localStorage.getItem(LS_USERS);
            return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_USERS));
        } catch { return JSON.parse(JSON.stringify(DEFAULT_USERS)); }
    }

    function saveUsers(users) {
        localStorage.setItem(LS_USERS, JSON.stringify(users));
    }

    /* ── PERMISOS SOBRESCRITOS ────────────────────────────────────── */
    // Estructura: { userId: { grants:['perm'], revokes:['perm'] } }
    function getOverrides() {
        try { return JSON.parse(localStorage.getItem(LS_OVERRIDES) || '{}'); }
        catch { return {}; }
    }

    function saveOverrides(overrides) {
        localStorage.setItem(LS_OVERRIDES, JSON.stringify(overrides));
    }

    /* Permisos efectivos para un usuario concreto (rol + overrides) */
    function getUserEffectivePerms(userId) {
        const users = getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return [];
        const rolePerms = [...(ROLES[user.rol]?.permisos || [])];
        const ovr = getOverrides()[userId] || {};
        let perms = rolePerms;
        if (ovr.grants) ovr.grants.forEach(p => { if (!perms.includes(p)) perms.push(p); });
        if (ovr.revokes) perms = perms.filter(p => !ovr.revokes.includes(p));
        return perms;
    }

    /* ¿Tiene overrides activos? */
    function userHasOverrides(userId) {
        const ovr = getOverrides()[userId] || {};
        return (ovr.grants?.length || 0) + (ovr.revokes?.length || 0) > 0;
    }

    function getSession() {
        try {
            const s = localStorage.getItem(LS_SESSION);
            return s ? JSON.parse(s) : null;
        } catch { return null; }
    }

    function saveSession(s) {
        localStorage.setItem(LS_SESSION, JSON.stringify(s));
    }

    /* ── LOGIN / LOGOUT ───────────────────────────────────────────── */
    function login(email, password) {
        const users = getUsers();
        const hash = hashPwd(password);
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase().trim() &&
            u.password === hash &&
            u.activo
        );
        if (!user) throw new Error('Credenciales incorrectas o cuenta inactiva.');
        const session = {
            userId: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol: user.rol,
            loginAt: new Date().toISOString()
        };
        saveSession(session);
        return session;
    }

    function logout() {
        localStorage.removeItem(LS_SESSION);
        window.location.href = 'login.html';
    }

    /* ── PERMISOS ─────────────────────────────────────────────────── */
    function hasPermission(perm) {
        const s = getSession();
        if (!s) return false;
        return getUserEffectivePerms(s.userId).includes(perm);
    }

    function requireAuth(perm) {
        const s = getSession();
        if (!s) { window.location.href = 'login.html'; return false; }
        if (perm && !hasPermission(perm)) {
            alert(`Acceso denegado.\nNecesitas el permiso "${perm}" para entrar aquí.\nTu rol actual: ${ROLES[s.rol]?.label || s.rol}`);
            history.back();
            return false;
        }
        return true;
    }

    /* ── BARRA DE NAVEGACIÓN ADMIN COMPARTIDA ─────────────────────── */
    function renderAdminNav(currentPage) {
        const session = getSession();
        if (!session) return;

        const role = ROLES[session.rol] || {};
        const initials = (session.nombre[0] + (session.apellido[0] || '')).toUpperCase();

        // Páginas relacionadas con Productos (para resaltado activo del menú padre)
        const productosPages = ['admin-productos.html', 'admin-articulos.html', 'admin-pedidos.html'];
        const isProductosActive = productosPages.includes(currentPage);

        const regularLinks = [
            { href: 'index.html', icon: '🌐', label: 'Ver web', perm: 'ver_catalogo' },
            { href: 'admin-usuarios.html', icon: '👥', label: 'Usuarios', perm: 'admin_usuarios' },
            { href: 'admin-permisos.html', icon: '🔐', label: 'Permisos', perm: 'admin_usuarios' },
        ];

        const visibleRegular = regularLinks.filter(l => !l.perm || hasPermission(l.perm));

        const showProductosMenu = hasPermission('admin_productos') || hasPermission('ver_pedidos');

        // Submenú de Productos
        const subMenuItems = [];
        if (hasPermission('admin_productos')) {
            subMenuItems.push({ href: 'admin-productos.html', icon: '📦', label: 'Catálogo' });
        }
        if (hasPermission('admin_productos') || hasPermission('ver_pedidos')) {
            subMenuItems.push({ href: 'admin-articulos.html', icon: '🗂️', label: 'Artículos' });
            subMenuItems.push({ href: 'admin-pedidos.html', icon: '📋', label: 'Pedidos' });
        }

        const navHtml = `
        <style>
            #ds-admin-nav .ds-dropdown { position: relative; display: inline-flex; }
            #ds-admin-nav .ds-dropdown-menu {
                display: none;
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                min-width: 180px;
                background: rgba(10,10,10,0.98);
                border: 1px solid rgba(245,158,11,0.25);
                border-radius: 10px;
                padding: 6px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.6);
                backdrop-filter: blur(20px);
                z-index: 9999;
                flex-direction: column;
                gap: 2px;
            }
            #ds-admin-nav .ds-dropdown:hover .ds-dropdown-menu { display: flex; }
            #ds-admin-nav .ds-dropdown-menu a {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 9px 12px;
                border-radius: 7px;
                font-size: 0.78rem;
                font-weight: 600;
                text-decoration: none;
                color: #94A3B8;
                border: 1px solid transparent;
                transition: all 0.15s;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            #ds-admin-nav .ds-dropdown-menu a:hover {
                background: rgba(245,158,11,0.1);
                color: #F59E0B;
                border-color: rgba(245,158,11,0.25);
            }
            #ds-admin-nav .ds-dropdown-menu a.active-sub {
                background: rgba(245,158,11,0.12);
                color: #F59E0B;
                border-color: rgba(245,158,11,0.3);
            }
            #ds-admin-nav .ds-dropdown-menu .ds-submenu-sep {
                height: 1px;
                background: rgba(255,255,255,0.06);
                margin: 4px 6px;
            }
        </style>
        <nav id="ds-admin-nav" style="
            position:sticky; top:0; z-index:200;
            background:rgba(5,5,5,0.95); backdrop-filter:blur(20px);
            border-bottom:1px solid rgba(245,158,11,0.15);
            display:flex; align-items:center; justify-content:space-between;
            padding:0 24px; height:60px; gap:16px; font-family:'Plus Jakarta Sans',sans-serif;
        ">
            <div style="display:flex; align-items:center; gap:20px;">
                <a href="index.html" style="
                    font-size:0.9rem; font-weight:800; color:#F59E0B;
                    text-decoration:none; letter-spacing:-0.02em;
                ">🥖 DS Admin</a>
                <div style="display:flex; gap:4px; align-items:center;">

                    <!-- ENLACE VER WEB siempre visible -->
                    ${visibleRegular.filter(l => l.href === 'index.html').map(l => `
                        <a href="${l.href}" style="
                            display:inline-flex; align-items:center; gap:6px;
                            padding:6px 12px; border-radius:8px;
                            font-size:0.78rem; font-weight:600;
                            text-decoration:none;
                            ${currentPage === l.href
                ? 'background:rgba(245,158,11,0.15); color:#F59E0B; border:1px solid rgba(245,158,11,0.3);'
                : 'color:#94A3B8; border:1px solid transparent;'}
                            transition:all 0.2s;
                        "
                        onmouseover="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.05)'"
                        onmouseout="this.style.color='${currentPage === l.href ? '#F59E0B' : '#94A3B8'}'; this.style.borderColor='${currentPage === l.href ? 'rgba(245,158,11,0.3)' : 'transparent'}'; this.style.background='${currentPage === l.href ? 'rgba(245,158,11,0.15)' : 'transparent'}'"
                        >${l.icon} ${l.label}</a>
                    `).join('')}

                    <!-- MENÚ DESPLEGABLE: PRODUCTOS -->
                    ${showProductosMenu ? `
                    <div class="ds-dropdown">
                        <button style="
                            display:inline-flex; align-items:center; gap:6px;
                            padding:6px 12px; border-radius:8px;
                            font-size:0.78rem; font-weight:600;
                            cursor:pointer; background:transparent;
                            font-family:'Plus Jakarta Sans',sans-serif;
                            ${isProductosActive
                    ? 'background:rgba(245,158,11,0.15); color:#F59E0B; border:1px solid rgba(245,158,11,0.3);'
                    : 'color:#94A3B8; border:1px solid transparent;'}
                            transition:all 0.2s;
                        "
                        onmouseover="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.05)'"
                        onmouseout="this.style.color='${isProductosActive ? '#F59E0B' : '#94A3B8'}'; this.style.borderColor='${isProductosActive ? 'rgba(245,158,11,0.3)' : 'transparent'}'; this.style.background='${isProductosActive ? 'rgba(245,158,11,0.15)' : 'transparent'}'"
                        >
                            📦 Productos
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="opacity:0.6"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        <div class="ds-dropdown-menu">
                            ${subMenuItems.map((item, idx) => {
                        const isActiveSub = currentPage === item.href || currentPage === item.href.split('?')[0];
                        return `
                                ${idx > 0 && subMenuItems[idx - 1].href.split('?')[0] !== item.href.split('?')[0] && idx === 1 ? '<div class="ds-submenu-sep"></div>' : ''}
                                <a href="${item.href}" class="${isActiveSub ? 'active-sub' : ''}">
                                    <span style="font-size:1rem">${item.icon}</span>
                                    ${item.label}
                                </a>`;
                    }).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <!-- RESTO DE ENLACES: Usuarios, Permisos -->
                    ${visibleRegular.filter(l => l.href !== 'index.html').map(l => `
                        <a href="${l.href}" style="
                            display:inline-flex; align-items:center; gap:6px;
                            padding:6px 12px; border-radius:8px;
                            font-size:0.78rem; font-weight:600;
                            text-decoration:none;
                            ${currentPage === l.href
                            ? 'background:rgba(245,158,11,0.15); color:#F59E0B; border:1px solid rgba(245,158,11,0.3);'
                            : 'color:#94A3B8; border:1px solid transparent;'}
                            transition:all 0.2s;
                        "
                        onmouseover="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.05)'"
                        onmouseout="this.style.color='${currentPage === l.href ? '#F59E0B' : '#94A3B8'}'; this.style.borderColor='${currentPage === l.href ? 'rgba(245,158,11,0.3)' : 'transparent'}'; this.style.background='${currentPage === l.href ? 'rgba(245,158,11,0.15)' : 'transparent'}'"
                        >${l.icon} ${l.label}</a>
                    `).join('')}

                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="
                        width:32px; height:32px; border-radius:50%;
                        background:${role.bg || 'rgba(245,158,11,0.1)'};
                        border:1px solid ${role.border || 'rgba(245,158,11,0.3)'};
                        display:flex; align-items:center; justify-content:center;
                        font-size:0.7rem; font-weight:800;
                        color:${role.color || '#F59E0B'};
                    ">${initials}</div>
                    <div>
                        <div style="font-size:0.8rem; font-weight:700; color:#fff; line-height:1.2;">${session.nombre} ${session.apellido}</div>
                        <div style="
                            font-size:0.65rem; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;
                            color:${role.color || '#F59E0B'};
                        ">${role.emoji || ''} ${role.label || session.rol}</div>
                    </div>
                </div>
                <button onclick="DS_AUTH.logout()" style="
                    display:inline-flex; align-items:center; gap:5px;
                    padding:6px 12px; border-radius:8px; cursor:pointer;
                    font-size:0.75rem; font-weight:600;
                    color:#94A3B8; background:transparent;
                    border:1px solid rgba(255,255,255,0.08);
                    font-family:'Plus Jakarta Sans',sans-serif;
                    transition:all 0.2s;
                "
                onmouseover="this.style.color='#EF4444'; this.style.borderColor='rgba(239,68,68,0.3)'; this.style.background='rgba(239,68,68,0.06)'"
                onmouseout="this.style.color='#94A3B8'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.background='transparent'"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Salir
                </button>
            </div>
        </nav>`;

        // Insertar al principio del body
        document.body.insertAdjacentHTML('afterbegin', navHtml);
    }

    /* ── EXPORTAR ─────────────────────────────────────────────────── */
    window.DS_AUTH = {
        ROLES,
        ALL_PERMS,
        hashPwd,
        login,
        logout,
        getSession,
        getUsers,
        saveUsers,
        getOverrides,
        saveOverrides,
        getUserEffectivePerms,
        userHasOverrides,
        hasPermission,
        requireAuth,
        renderAdminNav,
        DEFAULT_USERS: JSON.parse(JSON.stringify(DEFAULT_USERS))
    };

})();
