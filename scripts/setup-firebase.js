/**
 * Setup inicial de Firebase para Señas Gómez.
 * Ejecutar UNA SOLA VEZ: node scripts/setup-firebase.js
 */

const fs    = require('fs');
const path  = require('path');
const admin = require('firebase-admin');

// ── Leer .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');

function getEnvVar(name) {
  const match = envText.match(new RegExp(`^${name}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

const sdkJson = getEnvVar('FIREBASE_ADMIN_SDK_JSON');
if (!sdkJson) { console.error('FIREBASE_ADMIN_SDK_JSON no encontrado en .env.local'); process.exit(1); }

const serviceAccount = JSON.parse(sdkJson);

// ── Inicializar Admin SDK ────────────────────────────────────────────────────
if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db   = admin.firestore();
const auth = admin.auth();
const TS   = admin.firestore.FieldValue.serverTimestamp;

// ── Configuración ────────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'adolforp@gmail.com';
const ADMIN_PASSWORD = 'Panaderia2026!';
const ADMIN_NOMBRE   = 'Adolfo';
const ADMIN_APE      = 'Rodríguez';

// ────────────────────────────────────────────────────────────────────────────
async function crearAdminUser() {
  console.log('\n[1/5] Creando usuario administrador...');
  let uid;

  try {
    const existing = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existing.uid;
    await auth.updateUser(uid, { password: ADMIN_PASSWORD, displayName: `${ADMIN_NOMBRE} ${ADMIN_APE}` });
    console.log('  → Usuario ya existía, contraseña actualizada.');
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      const user = await auth.createUser({
        email:       ADMIN_EMAIL,
        password:    ADMIN_PASSWORD,
        displayName: `${ADMIN_NOMBRE} ${ADMIN_APE}`,
      });
      uid = user.uid;
      console.log('  → Usuario creado:', uid);
    } else {
      throw e;
    }
  }

  // Custom claims
  await auth.setCustomUserClaims(uid, { rol: 'administrador' });
  console.log('  → Custom claim rol=administrador asignado.');

  // Perfil Firestore
  await db.collection('clientes').doc(uid).set({
    uid,
    nombre:    ADMIN_NOMBRE,
    apellidos: ADMIN_APE,
    email:     ADMIN_EMAIL,
    telefono:  '',
    alergias:  [],
    rol:       'administrador',
    activo:    true,
    createdAt: TS(),
    updatedAt: TS(),
  }, { merge: true });
  console.log('  → Perfil Firestore creado/actualizado.');
  return uid;
}

// ────────────────────────────────────────────────────────────────────────────
async function seedCategorias() {
  console.log('\n[2/5] Creando categorías...');
  const categorias = [
    { id: 'candeal',  nombre: 'Pan Candeal',   slug: 'candeal',  descripcion: 'Pan tradicional con masa candeal, horno de leña.', orden: 1, activa: true, imagenUrl: '' },
    { id: 'baguette', nombre: 'Baguette',       slug: 'baguette', descripcion: 'Baguettes artesanales de corteza crujiente.',       orden: 2, activa: true, imagenUrl: '' },
    { id: 'blanco',   nombre: 'Pan Blanco',     slug: 'blanco',   descripcion: 'Pan blanco esponjoso para el día a día.',           orden: 3, activa: true, imagenUrl: '' },
    { id: 'bolleria', nombre: 'Bollería',        slug: 'bolleria', descripcion: 'Croissants, napolitanas y piezas de bollería.',     orden: 4, activa: true, imagenUrl: '' },
  ];

  for (const cat of categorias) {
    const { id, ...data } = cat;
    await db.collection('categorias').doc(id).set({ ...data, createdAt: TS(), updatedAt: TS() }, { merge: true });
    console.log('  →', cat.nombre);
  }
}

// ────────────────────────────────────────────────────────────────────────────
async function seedProductos() {
  console.log('\n[3/5] Creando productos de muestra...');
  const productos = [
    {
      nombre: 'Pan Candeal 800g',
      categoria: 'candeal',
      descripcion: 'Pan candeal elaborado con harina seleccionada, masa madre y cocido en horno de leña. Corteza gruesa, miga densa.',
      peso: '800 g',
      precioSinIVA: 2.69,
      tipoIVA: 0.04,
      alergenos: ['gluten'],
      disponible: true,
      destacado: true,
      stockDiario: null,
      imagenes: [],
      orden: 1,
    },
    {
      nombre: 'Pan Candeal 1,6 kg',
      categoria: 'candeal',
      descripcion: 'El pan grande para toda la semana. Misma receta tradicional en tamaño familiar.',
      peso: '1,6 kg',
      precioSinIVA: 4.81,
      tipoIVA: 0.04,
      alergenos: ['gluten'],
      disponible: true,
      destacado: false,
      stockDiario: null,
      imagenes: [],
      orden: 2,
    },
    {
      nombre: 'Baguette Rústica',
      categoria: 'baguette',
      descripcion: 'Baguette de fermentación larga, corteza crujiente y miga alveolada.',
      peso: '250 g',
      precioSinIVA: 1.25,
      tipoIVA: 0.04,
      alergenos: ['gluten'],
      disponible: true,
      destacado: true,
      stockDiario: null,
      imagenes: [],
      orden: 1,
    },
    {
      nombre: 'Pan Blanco Familiar',
      categoria: 'blanco',
      descripcion: 'Pan blanco de miga suave, ideal para el bocadillo del día a día.',
      peso: '500 g',
      precioSinIVA: 1.63,
      tipoIVA: 0.04,
      alergenos: ['gluten'],
      disponible: true,
      destacado: false,
      stockDiario: null,
      imagenes: [],
      orden: 1,
    },
    {
      nombre: 'Croissant de Mantequilla',
      categoria: 'bolleria',
      descripcion: 'Croissant hojaldrado con mantequilla de calidad, dorado al horno cada mañana.',
      peso: '90 g',
      precioSinIVA: 1.35,
      tipoIVA: 0.10,
      alergenos: ['gluten', 'lacteos', 'huevos'],
      disponible: true,
      destacado: true,
      stockDiario: null,
      imagenes: [],
      orden: 1,
    },
    {
      nombre: 'Napolitana de Chocolate',
      categoria: 'bolleria',
      descripcion: 'Masa hojaldrada rellena de crema de chocolate negro. Receta de siempre.',
      peso: '100 g',
      precioSinIVA: 1.44,
      tipoIVA: 0.10,
      alergenos: ['gluten', 'lacteos', 'huevos'],
      disponible: true,
      destacado: false,
      stockDiario: null,
      imagenes: [],
      orden: 2,
    },
  ];

  for (const prod of productos) {
    await db.collection('productos').add({ ...prod, createdAt: TS(), updatedAt: TS() });
    console.log('  →', prod.nombre);
  }
}

// ────────────────────────────────────────────────────────────────────────────
async function seedConfiguracion() {
  console.log('\n[4/5] Creando configuración de empresa...');

  await db.collection('configuracion').doc('empresa').set({
    // Datos fiscales
    nombreFiscal:    'Señas Gómez',
    nif:             '',
    direccionFiscal: '',
    codigoPostal:    '',
    municipio:       '',
    provincia:       '',
    regimen:         'autonomo',

    // Contacto público
    telefonoPublico: '',
    whatsapp:        '',
    emailPublico:    'adolforp@gmail.com',
    direccionFisica: '',
    horario:         'Lunes a sábado de 9:00 a 13:30 y de 17:00 a 20:00',

    // Recogida
    diasRecogida:           [1, 2, 3, 4, 5, 6],  // lun–sáb
    franjas: [
      { id: 'manana', horaInicio: '09:00', horaFin: '13:00', activa: true },
      { id: 'tarde',  horaInicio: '17:00', horaFin: '19:30', activa: true },
    ],
    maxPedidosPorFranja:    20,
    antelacionMinimaHoras:  24,

    // Métodos de pago activos
    metodosActivos: ['efectivo_recogida'],

    // Marca
    nombreWeb:   'Señas Gómez',
    tagline:     'Panadería · Bollería · Horno de Leña',
    logoUrl:     '/images/logo.png',
    colorAcento: '#F59E0B',
    instagram:   '',
    facebook:    '',

    // Hero
    heroTitulo:     'El Pan de Verdad, De Toda la Vida',
    heroSubtitulo:  'Pan candeal, baguettes y bollería artesanal. Horno de leña propio.',
    statsAnios:     15,
    statsClientes:  500,
    statsVariedades: 30,

    // Legal (vacío, rellenar en panel admin)
    avisoLegal:          '',
    politicaPrivacidad:  '',
    politicaCookies:     '',
    condicionesVenta:    '',

    updatedAt: TS(),
  }, { merge: true });

  console.log('  → Configuración guardada.');
}

// ────────────────────────────────────────────────────────────────────────────
async function seedCounter() {
  console.log('\n[5/5] Inicializando contador de pedidos...');
  const ref = db.collection('counters').doc('pedidos');
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ value: 0 });
    console.log('  → Contador creado en 0.');
  } else {
    console.log('  → Contador ya existía:', snap.data().value);
  }
}

// ────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Setup Firebase — Señas Gómez');
  console.log('  Proyecto:', serviceAccount.project_id);
  console.log('═══════════════════════════════════════════');

  await crearAdminUser();
  await seedCategorias();
  await seedProductos();
  await seedConfiguracion();
  await seedCounter();

  console.log('\n✅  Setup completado.');
  console.log('   Admin:',    ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
  console.log('   URL admin: http://localhost:3000/admin');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌  Error:', err.message || err);
  process.exit(1);
});
