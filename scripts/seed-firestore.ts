import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Carga el JSON de credenciales
const keyPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function seed() {
  console.log('Seeding Firestore...');

  // ── Categorías ──────────────────────────────────────────────────────────────
  const categorias = [
    { id: 'candeal',  nombre: 'Pan Candeal',  slug: 'candeal',  orden: 1, activa: true },
    { id: 'baguette', nombre: 'Baguette',     slug: 'baguette', orden: 2, activa: true },
    { id: 'blanco',   nombre: 'Pan Blanco',   slug: 'blanco',   orden: 3, activa: true },
    { id: 'bolleria', nombre: 'Bollería',      slug: 'bolleria', orden: 4, activa: true },
  ];

  for (const cat of categorias) {
    await db.collection('categorias').doc(cat.id).set(cat);
    console.log(`  Categoría: ${cat.nombre}`);
  }

  // ── Productos ────────────────────────────────────────────────────────────────
  const productos = [
    // Pan Candeal (IVA 4%)
    { nombre: 'Pan Candeal Redondo',        categoria: 'candeal',  peso: '500 g',  precioSinIVA: 1.92, tipoIVA: 0.04, orden: 1, disponible: true, descripcion: 'Pan de miga densa y corteza dura, elaborado con harina candeal 100% y masa madre. Fermentación lenta de 18 horas.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Pan Candeal Grande',         categoria: 'candeal',  peso: '1 kg',   precioSinIVA: 3.37, tipoIVA: 0.04, orden: 2, disponible: true, descripcion: 'Versión familiar del candeal redondo. Corteza gruesa y crujiente, miga compacta ideal para conservar varios días.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Pan Candeal Cuadrado',       categoria: 'candeal',  peso: '500 g',  precioSinIVA: 1.92, tipoIVA: 0.04, orden: 3, disponible: true, descripcion: 'Forma cuadrada, perfecta para cortar en rebanadas uniformes. Misma receta tradicional de harina candeal.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Bollo de Pan Candeal',       categoria: 'candeal',  peso: '100 g',  precioSinIVA: 0.48, tipoIVA: 0.04, orden: 4, disponible: true, descripcion: 'Bollo individual de pan candeal, ideal para desayunos y meriendas.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Colín de Candeal',           categoria: 'candeal',  peso: '250 g',  precioSinIVA: 1.44, tipoIVA: 0.04, orden: 5, disponible: true, descripcion: 'Barra alargada de pan candeal con corteza muy crujiente. Perfecta para acompañar embutidos y quesos.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Hogaza de Candeal',          categoria: 'candeal',  peso: '800 g',  precioSinIVA: 2.88, tipoIVA: 0.04, orden: 6, disponible: true, descripcion: 'Hogaza rústica de formato redondo aplastado, con sello decorativo. Miga muy densa y sabor intenso a cereal.', alergenos: ['gluten'], imagenes: [] },

    // Baguette (IVA 4%)
    { nombre: 'Baguette Clásica',           categoria: 'baguette', peso: '280 g',  precioSinIVA: 0.96, tipoIVA: 0.04, orden: 1, disponible: true, descripcion: 'Baguette de corteza fina y crujiente con miga alveolada. Fermentación de 24 horas con prefermento.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Baguette Rústica',           categoria: 'baguette', peso: '320 g',  precioSinIVA: 1.20, tipoIVA: 0.04, orden: 2, disponible: true, descripcion: 'Baguette de harina semi-integral con aportación de cereales. Corteza más oscura y sabor más complejo.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Media Baguette',             categoria: 'baguette', peso: '140 g',  precioSinIVA: 0.53, tipoIVA: 0.04, orden: 3, disponible: true, descripcion: 'Mitad de baguette clásica, perfecta para bocadillos individuales.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Baguette con Semillas',      categoria: 'baguette', peso: '300 g',  precioSinIVA: 1.25, tipoIVA: 0.04, orden: 4, disponible: true, descripcion: 'Baguette cubierta con mezcla de semillas de sésamo, amapola y girasol. Crujiente y aromática.', alergenos: ['gluten', 'sésamo'], imagenes: [] },

    // Pan Blanco (IVA 4%)
    { nombre: 'Barra de Pan Blanco',        categoria: 'blanco',   peso: '250 g',  precioSinIVA: 0.72, tipoIVA: 0.04, orden: 1, disponible: true, descripcion: 'Barra de pan blanco de elaboración diaria. Miga tierna y corteza fina, ideal para el día a día.', alergenos: ['gluten'], imagenes: [] },
    { nombre: 'Pan de Molde Artesano',      categoria: 'blanco',   peso: '400 g',  precioSinIVA: 2.40, tipoIVA: 0.04, orden: 2, disponible: true, descripcion: 'Pan de molde sin aditivos, con aceite de oliva y toque de miel. Rebanadas regulares para sándwiches.', alergenos: ['gluten', 'huevo', 'leche'], imagenes: [] },
    { nombre: 'Pan de Hamburguesa',         categoria: 'blanco',   peso: '80 g',   precioSinIVA: 0.57, tipoIVA: 0.04, orden: 3, disponible: true, descripcion: 'Bollo redondo y esponjoso para hamburguesas. Con sésamo en la parte superior. Se vende por unidades.', alergenos: ['gluten', 'sésamo', 'huevo'], imagenes: [] },
    { nombre: 'Pan de Bocadillo Redondo',   categoria: 'blanco',   peso: '120 g',  precioSinIVA: 0.67, tipoIVA: 0.04, orden: 4, disponible: true, descripcion: 'Bollo redondo de miga tierna para bocadillos. Corteza suave, perfecto para rellenar.', alergenos: ['gluten'], imagenes: [] },

    // Bollería (IVA 10%)
    { nombre: 'Croissant de Mantequilla',   categoria: 'bolleria', peso: '80 g',   precioSinIVA: 0.90, tipoIVA: 0.10, orden: 1, disponible: true, descripcion: 'Croissant de mantequilla con 27 capas de hojaldrado. Elaborado con mantequilla francesa 84% MG. Crujiente por fuera, suave por dentro.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
    { nombre: 'Napolitana de Chocolate',    categoria: 'bolleria', peso: '90 g',   precioSinIVA: 1.00, tipoIVA: 0.10, orden: 2, disponible: true, descripcion: 'Hojaldre con dos barritas de chocolate negro al 55%. Acabado brillante y crujiente. Clásico irresistible.', alergenos: ['gluten', 'leche', 'huevo', 'soja'], imagenes: [] },
    { nombre: 'Palmera de Hojaldre',        categoria: 'bolleria', peso: '60 g',   precioSinIVA: 0.82, tipoIVA: 0.10, orden: 3, disponible: true, descripcion: 'Palmera de hojaldre caramelizada. Crujiente, dorada y sin relleno, para disfrutar de la mantequilla pura.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
    { nombre: 'Ensaimada',                  categoria: 'bolleria', peso: '100 g',  precioSinIVA: 1.36, tipoIVA: 0.10, orden: 4, disponible: true, descripcion: 'Ensaimada artesana con masa fermentada en espiral. Esponjosa, ligeramente dulce y con azúcar glass por encima.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
    { nombre: 'Berlina Rellena de Crema',   categoria: 'bolleria', peso: '90 g',   precioSinIVA: 1.27, tipoIVA: 0.10, orden: 5, disponible: true, descripcion: 'Berlina frita rellena de crema pastelera casera. Rebozada en azúcar fino. Servida a temperatura ambiente.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
    { nombre: 'Magdalena de Limón',         categoria: 'bolleria', peso: '50 g',   precioSinIVA: 0.77, tipoIVA: 0.10, orden: 6, disponible: true, descripcion: 'Magdalena casera con ralladura de limón natural y aceite de oliva virgen extra. Esponjosa y jugosa.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
    { nombre: 'Rosco de Anís',              categoria: 'bolleria', peso: '120 g',  precioSinIVA: 1.18, tipoIVA: 0.10, orden: 7, disponible: true, descripcion: 'Rosco tradicional con anís en grano y aceite de oliva. Receta de la abuela, elaborada sin prisas.', alergenos: ['gluten', 'huevo', 'anís'], imagenes: [] },
    { nombre: 'Torta de Aceite',            categoria: 'bolleria', peso: '80 g',   precioSinIVA: 1.09, tipoIVA: 0.10, orden: 8, disponible: true, descripcion: 'Torta crujiente y fina elaborada con aceite de oliva virgen extra y sésamo. Ligeramente dulce.', alergenos: ['gluten', 'sésamo'], imagenes: [] },
    { nombre: 'Roscón de Desayuno',         categoria: 'bolleria', peso: '150 g',  precioSinIVA: 1.45, tipoIVA: 0.10, orden: 9, disponible: true, descripcion: 'Roscón individual esponjoso, decorado con frutas confitadas y azúcar. Perfecto para desayuno especial.', alergenos: ['gluten', 'leche', 'huevo'], imagenes: [] },
  ];

  for (const p of productos) {
    await db.collection('productos').add({
      ...p,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  Producto: ${p.nombre}`);
  }

  // ── Configuración empresa ────────────────────────────────────────────────────
  await db.collection('configuracion').doc('empresa').set({
    nombre:        'Señas Gómez',
    tagline:       'Panadería · Bollería · Horno de Leña',
    nif:           'RELLENAR',
    telefono:      'RELLENAR',
    email:         'RELLENAR',
    direccion:     'RELLENAR',
    localidad:     'RELLENAR',
    cp:            'RELLENAR',
    provincia:     'RELLENAR',
    horario:       'Lunes a Sábado: 7:00 – 14:00',
    cierraFestivos: true,
    pedidoAntelacionHoras: 24,
    pedidoMinimo:  0,
    updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('  Configuración empresa guardada');

  // ── Franjas horarias ─────────────────────────────────────────────────────────
  const franjas = [
    { horaInicio: '07:30', horaFin: '09:00', etiqueta: '7:30 – 9:00',   activa: true, orden: 1 },
    { horaInicio: '09:00', horaFin: '11:00', etiqueta: '9:00 – 11:00',  activa: true, orden: 2 },
    { horaInicio: '11:00', horaFin: '13:00', etiqueta: '11:00 – 13:00', activa: true, orden: 3 },
    { horaInicio: '13:00', horaFin: '14:00', etiqueta: '13:00 – 14:00', activa: true, orden: 4 },
  ];

  for (const f of franjas) {
    await db.collection('franjas').add(f);
  }
  console.log('  Franjas horarias guardadas');

  console.log('\nSeed completado.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
