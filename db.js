/**
 * db.js — Base de datos local Delmi Soriano
 * Motor CRUD para: Clientes | Artículos | Pedidos
 * Almacenamiento: localStorage
 */
(function () {
    'use strict';

    const LS = {
        CLIENTES:  'DS_CLIENTES_V1',
        ARTICULOS: 'DS_ARTICULOS_V1',
        PEDIDOS:   'DS_PEDIDOS_V1',
        SEQ:       'DS_SEQ_V1',
    };

    /* ── SECUENCIAS (números de pedido) ──────────────── */
    function getSeq() {
        try { return JSON.parse(localStorage.getItem(LS.SEQ) || '{"pedido":0}'); }
        catch { return { pedido: 0 }; }
    }
    function nextPedidoNum() {
        const seq = getSeq();
        seq.pedido += 1;
        localStorage.setItem(LS.SEQ, JSON.stringify(seq));
        const year = new Date().getFullYear();
        return `PED-${year}-${String(seq.pedido).padStart(4, '0')}`;
    }

    /* ── GENERADOR DE IDs ─────────────────────────────── */
    function uid(prefix) {
        return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    /* ════════════════════════════════════════════════════
       CLIENTES
    ════════════════════════════════════════════════════ */
    const CLIENTES_DEFAULT = [
        {
            id:'cli_001', nombre:'Marta', apellido:'Rodríguez', email:'marta@example.com',
            telefono:'612 345 678', direccion:{ calle:'Calle Mayor 12', ciudad:'Madrid', cp:'28001', provincia:'Madrid' },
            notas:'Cliente frecuente. Prefiere recogida en tienda.', activo:true, creado:'2026-01-10', ultimoPedido:'2026-03-01'
        },
        {
            id:'cli_002', nombre:'Javier', apellido:'Sánchez', email:'javier.s@example.com',
            telefono:'635 901 234', direccion:{ calle:'Av. De la Paz 33', ciudad:'Alcorcón', cp:'28922', provincia:'Madrid' },
            notas:'Alérgico al gluten. Solo bollería sin gluten.', activo:true, creado:'2026-01-22', ultimoPedido:'2026-02-28'
        },
        {
            id:'cli_003', nombre:'Lucía', apellido:'Fernández', email:'lucia.f@example.com',
            telefono:'677 222 111', direccion:{ calle:'Plaza España 7', ciudad:'Getafe', cp:'28901', provincia:'Madrid' },
            notas:'Pide tartas para eventos corporativos.', activo:true, creado:'2026-02-05', ultimoPedido:'2026-03-05'
        },
        {
            id:'cli_004', nombre:'Roberto', apellido:'Méndez', email:'roberto@example.com',
            telefono:'699 888 777', direccion:{ calle:'C/ Flores 4', ciudad:'Leganés', cp:'28911', provincia:'Madrid' },
            notas:'', activo:true, creado:'2026-02-20', ultimoPedido:null
        },
        {
            id:'cli_005', nombre:'Carmen', apellido:'Torres', email:'carmen.t@example.com',
            telefono:'611 333 444', direccion:{ calle:'Paseo del Prado 18', ciudad:'Madrid', cp:'28014', provincia:'Madrid' },
            notas:'Compras semanales todos los viernes.', activo:false, creado:'2025-12-01', ultimoPedido:'2026-01-15'
        },
    ];

    function getClientes() {
        try {
            const s = localStorage.getItem(LS.CLIENTES);
            return s ? JSON.parse(s) : JSON.parse(JSON.stringify(CLIENTES_DEFAULT));
        } catch { return JSON.parse(JSON.stringify(CLIENTES_DEFAULT)); }
    }
    function saveClientes(data) { localStorage.setItem(LS.CLIENTES, JSON.stringify(data)); }

    function addCliente(data) {
        const list = getClientes();
        const item = { ...data, id: uid('cli'), creado: new Date().toISOString().split('T')[0], ultimoPedido: null };
        list.push(item);
        saveClientes(list);
        return item;
    }
    function updateCliente(id, data) {
        const list = getClientes();
        const idx  = list.findIndex(c => c.id === id);
        if (idx < 0) return null;
        list[idx] = { ...list[idx], ...data };
        saveClientes(list);
        return list[idx];
    }
    function deleteCliente(id) {
        const list = getClientes().filter(c => c.id !== id);
        saveClientes(list);
    }

    /* ════════════════════════════════════════════════════
       ARTÍCULOS
    ════════════════════════════════════════════════════ */
    const CATEGORIAS = [
        { key:'pan',         label:'Pan',          emoji:'🍞' },
        { key:'bolleria',    label:'Bollería',      emoji:'🥐' },
        { key:'reposteria',  label:'Repostería',    emoji:'🎂' },
        { key:'ingredientes',label:'Ingredientes',  emoji:'🌿' },
        { key:'otros',       label:'Otros',         emoji:'📦' },
    ];

    const ARTICULOS_DEFAULT = [
        { id:'art_001', nombre:'Pan de Masa Madre (500g)', descripcion:'Hogaza artesanal de masa madre.', categoria:'pan', precio:4.50, unidad:'unidad', stock:50, iva:4, activo:true, creado:'2026-01-01' },
        { id:'art_002', nombre:'Barra de Pan Tradicional', descripcion:'Barra crujiente, horneada dos veces.', categoria:'pan', precio:1.20, unidad:'unidad', stock:100, iva:4, activo:true, creado:'2026-01-01' },
        { id:'art_003', nombre:'Croissant Mantequilla', descripcion:'Hojaldrado con mantequilla AOC.', categoria:'bolleria', precio:1.80, unidad:'unidad', stock:60, iva:10, activo:true, creado:'2026-01-01' },
        { id:'art_004', nombre:'Pain au Chocolat', descripcion:'Croissant relleno de chocolate negro 70%.', categoria:'bolleria', precio:2.20, unidad:'unidad', stock:40, iva:10, activo:true, creado:'2026-01-01' },
        { id:'art_005', nombre:'Tarta Personalizada (6 pers.)', descripcion:'Tarta artesanal para encargo.', categoria:'reposteria', precio:38.00, unidad:'unidad', stock:10, iva:10, activo:true, creado:'2026-01-01' },
        { id:'art_006', nombre:'Macaron (caja 12 uds)', descripcion:'Macarons de temporada, caja regalo.', categoria:'reposteria', precio:18.50, unidad:'caja', stock:20, iva:10, activo:true, creado:'2026-01-01' },
        { id:'art_007', nombre:'Harina Ecológica T65 (1kg)', descripcion:'Harina molida en piedra, certificada.', categoria:'ingredientes', precio:3.80, unidad:'kg', stock:200, iva:4, activo:true, creado:'2026-01-15' },
        { id:'art_008', nombre:'Pan de Espelta (400g)', descripcion:'Trigo ancestral, alto valor nutricional.', categoria:'pan', precio:5.20, unidad:'unidad', stock:30, iva:4, activo:false, creado:'2026-02-01' },
    ];

    function getArticulos() {
        try {
            const s = localStorage.getItem(LS.ARTICULOS);
            return s ? JSON.parse(s) : JSON.parse(JSON.stringify(ARTICULOS_DEFAULT));
        } catch { return JSON.parse(JSON.stringify(ARTICULOS_DEFAULT)); }
    }
    function saveArticulos(data) { localStorage.setItem(LS.ARTICULOS, JSON.stringify(data)); }

    function addArticulo(data) {
        const list = getArticulos();
        const item = { ...data, id: uid('art'), creado: new Date().toISOString().split('T')[0] };
        list.push(item);
        saveArticulos(list);
        return item;
    }
    function updateArticulo(id, data) {
        const list = getArticulos();
        const idx  = list.findIndex(a => a.id === id);
        if (idx < 0) return null;
        list[idx] = { ...list[idx], ...data };
        saveArticulos(list);
        return list[idx];
    }
    function deleteArticulo(id) {
        saveArticulos(getArticulos().filter(a => a.id !== id));
    }

    /* ════════════════════════════════════════════════════
       PEDIDOS
    ════════════════════════════════════════════════════ */
    const ESTADOS = [
        { key:'pendiente',   label:'Pendiente',   emoji:'⏳', color:'#F59E0B', bg:'rgba(245,158,11,0.12)' },
        { key:'confirmado',  label:'Confirmado',  emoji:'✅', color:'#38BDF8', bg:'rgba(56,189,248,0.12)' },
        { key:'en_proceso',  label:'En proceso',  emoji:'🔧', color:'#A78BFA', bg:'rgba(167,139,250,0.12)' },
        { key:'listo',       label:'Listo',       emoji:'🎁', color:'#4ADE80', bg:'rgba(74,222,128,0.12)' },
        { key:'entregado',   label:'Entregado',   emoji:'🚚', color:'#94A3B8', bg:'rgba(148,163,184,0.1)' },
        { key:'cancelado',   label:'Cancelado',   emoji:'❌', color:'#EF4444', bg:'rgba(239,68,68,0.1)'  },
    ];

    const PEDIDOS_DEFAULT = [
        {
            id:'ped_001', numero:'PED-2026-0001',
            clienteId:'cli_001', estado:'entregado',
            fechaPedido:'2026-03-01T09:30:00', fechaEntrega:'2026-03-02',
            tipo:'recogida', direccionEntrega:'',
            items:[
                { articuloId:'art_001', nombre:'Pan de Masa Madre (500g)', precio:4.50, cantidad:2, subtotal:9.00 },
                { articuloId:'art_003', nombre:'Croissant Mantequilla',    precio:1.80, cantidad:4, subtotal:7.20 },
            ],
            subtotal:16.20, descuento:0, ivaPct:5.5, iva:0.89, total:17.09,
            notas:'', pagado:true, metodoPago:'efectivo'
        },
        {
            id:'ped_002', numero:'PED-2026-0002',
            clienteId:'cli_003', estado:'confirmado',
            fechaPedido:'2026-03-05T11:00:00', fechaEntrega:'2026-03-15',
            tipo:'domicilio', direccionEntrega:'Plaza España 7, Getafe',
            items:[
                { articuloId:'art_005', nombre:'Tarta Personalizada (6 pers.)', precio:38.00, cantidad:1, subtotal:38.00 },
                { articuloId:'art_006', nombre:'Macaron (caja 12 uds)',          precio:18.50, cantidad:2, subtotal:37.00 },
            ],
            subtotal:75.00, descuento:5, ivaPct:10, iva:7.00, total:77.00,
            notas:'Sin lactosa en la tarta. Entrega antes de las 18h.', pagado:false, metodoPago:'transferencia'
        },
        {
            id:'ped_003', numero:'PED-2026-0003',
            clienteId:'cli_002', estado:'pendiente',
            fechaPedido:'2026-03-09T16:45:00', fechaEntrega:'2026-03-10',
            tipo:'recogida', direccionEntrega:'',
            items:[
                { articuloId:'art_003', nombre:'Croissant Mantequilla', precio:1.80, cantidad:6, subtotal:10.80 },
                { articuloId:'art_004', nombre:'Pain au Chocolat',       precio:2.20, cantidad:3, subtotal:6.60 },
            ],
            subtotal:17.40, descuento:0, ivaPct:10, iva:1.74, total:19.14,
            notas:'', pagado:false, metodoPago:'efectivo'
        },
        {
            id:'ped_004', numero:'PED-2026-0004',
            clienteId:'cli_001', estado:'en_proceso',
            fechaPedido:'2026-03-08T08:00:00', fechaEntrega:'2026-03-11',
            tipo:'domicilio', direccionEntrega:'Calle Mayor 12, Madrid',
            items:[
                { articuloId:'art_001', nombre:'Pan de Masa Madre (500g)', precio:4.50, cantidad:3, subtotal:13.50 },
                { articuloId:'art_007', nombre:'Harina Ecológica T65 (1kg)', precio:3.80, cantidad:2, subtotal:7.60 },
            ],
            subtotal:21.10, descuento:0, ivaPct:4, iva:0.84, total:21.94,
            notas:'Dejar en portería.', pagado:true, metodoPago:'bizum'
        },
    ];

    function getPedidos() {
        try {
            const s = localStorage.getItem(LS.PEDIDOS);
            return s ? JSON.parse(s) : JSON.parse(JSON.stringify(PEDIDOS_DEFAULT));
        } catch { return JSON.parse(JSON.stringify(PEDIDOS_DEFAULT)); }
    }
    function savePedidos(data) { localStorage.setItem(LS.PEDIDOS, JSON.stringify(data)); }

    function addPedido(data) {
        const list = getPedidos();
        const item = { ...data, id: uid('ped'), numero: nextPedidoNum(), fechaPedido: new Date().toISOString() };
        list.push(item);
        savePedidos(list);
        return item;
    }
    function updatePedido(id, data) {
        const list = getPedidos();
        const idx  = list.findIndex(p => p.id === id);
        if (idx < 0) return null;
        list[idx] = { ...list[idx], ...data };
        savePedidos(list);
        return list[idx];
    }
    function deletePedido(id) {
        savePedidos(getPedidos().filter(p => p.id !== id));
    }

    /* ── UTILIDADES ───────────────────────────────────── */
    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric'});
    }
    function formatMoney(n) {
        return typeof n === 'number' ? n.toFixed(2).replace('.', ',') + ' €' : '—';
    }

    /* ── EXPORTAR ─────────────────────────────────────── */
    window.DS_DB = {
        CATEGORIAS,
        ESTADOS,
        // Clientes
        getClientes, saveClientes, addCliente, updateCliente, deleteCliente,
        // Artículos
        getArticulos, saveArticulos, addArticulo, updateArticulo, deleteArticulo,
        // Pedidos
        getPedidos, savePedidos, addPedido, updatePedido, deletePedido, nextPedidoNum,
        // Utils
        formatDate, formatMoney,
    };

})();
