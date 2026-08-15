# Señas Gómez — Tienda Online Profesional
## Prompt completo para desarrollo desde cero

> Documento técnico de producto listo para entregar a un desarrollador o a Claude Code.
> Generado el: 2026-08-15 | Revisión: 1.0

---

## 0. Decisiones de negocio tomadas (bloqueantes resueltas)

| Decisión | Valor elegido |
|---|---|
| Pasarela de pago | **Stripe** (tarjeta + Bizum vía Stripe Link) |
| Facturación Verifactu | Integrar proveedor API certificado — **NO** motor propio (ver §5) |
| Forma jurídica | **Autónomo / persona física** — facturas con NIF personal |
| Zona de entrega | **Solo recogida en tienda** (sin envío a domicilio en v1) |
| Idiomas | **Español** únicamente (v1) |
| Nombre comercial web | **Señas Gómez** — Panadería · Bollería · Horno de Leña |

---

## 1. Contexto del negocio y del proyecto

### El negocio
**Señas Gómez** es una panadería y bollería artesanal con horno de leña propio, ubicada en una localidad española. Elabora a diario pan candeal, baguettes, bollería y productos especiales con métodos tradicionales — fermentaciones largas, masa madre, harinas seleccionadas — sin aditivos ni conservantes.

El local actual gestiona los pedidos mediante notas manuscritas y llamadas de teléfono. El objetivo de este proyecto es trasladar ese flujo a una tienda online que permita a los clientes habituales hacer sus pedidos con antelación y recogerlos en tienda, sin fricción.

### El estado actual del código
Existe una landing page de marketing ya construida en:
```
D:\01_WEBS\webpanaderia\
├── index.html       ← Landing Dark Luxury (mantener diseño)
├── styles.css       ← Sistema de diseño Dark Luxury (mantener)
├── script.js        ← Animaciones + catálogo en localStorage (descartar lógica de datos)
├── auth.js          ← Sistema de roles en localStorage (descartar por completo)
├── login.html       ← Pantalla de login (rediseñar con backend real)
├── admin-*.html     ← Paneles admin prototipo (rediseñar con backend real)
└── images/          ← Fotos reales del negocio (usar como fuente principal)
```

**Qué se reutiliza:** identidad visual (colores, tipografía, componentes CSS de `styles.css`), estructura de secciones de `index.html`, fotografías de `/images/` y `/fotos/`.

**Qué se descarta:** toda la lógica de datos de `auth.js` (hash fijo, localStorage, roles hardcodeados) y `db.js` (datos de prueba en localStorage). El backend real los sustituye por completo.

### Fotografías disponibles
Las fotografías del local y del obrador están en:
- `D:\01_WEBS\webpanaderia\images\` — exterior del local, pizarras con recetas y cantidades
- `D:\01_WEBS\webpanaderia\fotos\` — más vistas del local
- `D:\01_WEBS\webpanaderia\images\logo.png` — logotipo actual

Antes de desplegar, subir todas las imágenes al repositorio o al CDN del proveedor de hosting.

---

## 2. Catálogo real de productos

> Extraído de las pizarras y notas del obrador (fotografías del negocio).
> El administrador podrá editar precios, stock y descripciones desde el panel sin tocar código.

### Categoría 1 — Pan Candeal (horno de leña)

| Producto | Peso aprox. | Notas |
|---|---|---|
| Bollo Pequeño Candeal | 190 gr | — |
| Bollo Grande Candeal | 280 gr | — |
| Pan Pequeño Candeal | 450 gr | — |
| Pan Grande Candeal | 680 gr | — |
| Colín Pequeño Candeal | — | Variante: piña / normal |
| Colín Grande Candeal | — | — |

**Receta base Pan Candeal** (para referencia de ficha de producto / descripción):
- Harina Arandina R + Galán (700gr/300gr por kg)
- 20gr sal · 4,5gr mejoante · 500gr agua
- 20gr masa madre o 30gr levadura fresca

### Categoría 2 — Baguette y Viena

| Producto | Peso aprox. | Notas |
|---|---|---|
| Bollo Viena | 190 gr | — |
| Bollo Viena Pequeño | — | Partido por la mitad |
| Baguett Grande | 290 gr | — |
| Baguett Pequeña | — | Partido por la mitad |
| Viena | 380 gr | — |

**Receta base Baguett / Molletes** (para descripción):
- 1 kg Harina CV18 · 20gr sal · 5gr mejoante
- 600gr agua · 20gr masa madre · 45gr levadura

### Categoría 3 — Pan Blanco

| Producto | Notas |
|---|---|
| Bollo Grande Blanco | — |
| Pan Pequeño Blanco | — |
| Pan Grande Blanco | — |
| Colín Pequeño Blanco | — |
| Colín Grande Blanco | — |
| Viena (blanco) | — |

### Categoría 4 — Bollería y Otros

| Producto | Notas |
|---|---|
| Mollete Grande | — |
| Mollete Pequeño | Para partir por mitad |
| Bollito Bolsa | — |
| Bollo Hamburguesa | — |
| Bollo Antequera | Para partir por mitad |
| Colín de Piña | Variedad especial |
| Colín de Jamón | Variedad especial |

### Notas de disponibilidad
- Producción diaria limitada: el stock disponible varía cada día.
- Pedidos especiales requieren **mínimo 24–48h de antelación**.
- Horario de recogida: **lunes a sábado, 7:00 – 14:00** (ajustar en panel de configuración).

---

## 3. Arquitectura técnica obligatoria

### Stack recomendado
```
Frontend:   Next.js 14+ (App Router) — SSR/SSG para SEO + React para UI dinámica
Backend:    Next.js API Routes o Firebase Cloud Functions
Base datos: Firestore (Firebase) — escala bien para este volumen, sin servidor que gestionar
Auth:       Firebase Authentication — gestiona hash, tokens y sesiones de forma segura
Pagos:      Stripe Checkout / Payment Intents — tarjeta + Bizum vía Stripe Link
Hosting:    Firebase Hosting o Vercel — ambos con HTTPS automático y CDN global
Storage:    Firebase Storage — para imágenes de producto y facturas en PDF
```

### Alternativa si se prefiere control total
```
Frontend:   Next.js 14+
Backend:    Node.js + Express o Next.js API Routes
Base datos: PostgreSQL en Railway o Supabase
Auth:       Supabase Auth (bcrypt/argon2 gestionado por el proveedor)
Pagos:      Stripe
Hosting:    Vercel (frontend) + Railway/Supabase (backend/BD)
```

### Requisitos no negociables
- **HTTPS en todo el sitio**, incluido el panel admin.
- **Autenticación server-side real**: tokens JWT o cookies httpOnly — nunca solo localStorage.
- **Separación de entornos**: `.env.local` (dev) y variables de entorno en consola del proveedor (prod). Ninguna clave de API en el repositorio.
- **Backups automáticos diarios** de Firestore (o de la BD elegida).
- **Rate limiting** en los endpoints de login y checkout para evitar abuso.
- **RLS / reglas de seguridad de Firestore**: cada usuario solo puede leer/escribir sus propios pedidos y facturas. El administrador tiene acceso total a través de reglas autenticadas con claim de rol.
- **Validación server-side de todos los inputs**: precios, cantidades y estados de pedido se calculan y verifican siempre en el servidor, nunca se confía en el cliente.
- **Errores que no expongan información interna** al usuario final.

---

## 4. Roles y permisos

| Rol | Alcance | Permisos clave |
|---|---|---|
| **Invitado** (no registrado) | Solo navegación | Ver catálogo, precios y disponibilidad. Para pedir debe registrarse. |
| **Cliente registrado** | Su propia cuenta | Comprar, ver SUS pedidos con estado en tiempo real, descargar SUS facturas en PDF, editar sus datos, repetir pedido anterior. |
| **Administrador** (negocio) | Todo el negocio | Catálogo, stock, pedidos de todos los clientes, clientes, configuración de empresa, informes de ventas, gestión de contenidos. NO acceso a infraestructura. |
| **Desarrollador / Infraestructura** | Sistema técnico | Acceso a consola Firebase/Vercel, logs, variables de entorno, backups, despliegues. **NO es un rol de login dentro de la app** — se gestiona en la consola del proveedor. |

> **Importante**: el rol "desarrollador" no existe como usuario de la aplicación web. El acceso técnico se gestiona exclusivamente en la consola de Firebase/Vercel con su propio control de acceso (IAM).

### Usuarios por defecto a crear al inicializar
```
admin@senasgomez.com  →  rol: administrador
[propietaria]@senasgomez.com  →  rol: administrador (cuenta principal del negocio)
```

---

## 5. Módulos funcionales — especificación detallada

### 5.1 Web pública (marketing + tienda)

**Navbar**
- Logo + nombre "Señas Gómez"
- Links: Inicio · Productos · Nuestra Historia · Contacto
- Botón CTA "Pedir Ahora" → lleva directamente al catálogo
- Widget de usuario (iniciar sesión / mi cuenta) a la derecha

**Hero section**
- Titular con CTA directa al catálogo (no solo a "contacto")
- Fotografías reales del local y del pan (usar `/images/`)
- Estadísticas animadas: años de oficio, variedades diarias, clientes

**Catálogo por categorías**
- Categorías: Pan Candeal · Baguette y Viena · Pan Blanco · Bollería y Otros
- Cards de producto: foto real, nombre, peso, precio con IVA desglosado, badge de disponibilidad
- Filtro por categoría, ordenar por precio / nombre
- Botón "Añadir al carrito" visible directamente en la card

**Ficha de producto**
- Foto principal + galería
- Nombre, peso, descripción artesanal (ingredientes naturales, proceso)
- Precio con IVA incluido y desglosado (tipo de IVA aplicable al pan: 4% superreducido)
- Alérgenos (gluten, según normativa UE 1169/2011)
- Disponibilidad en tiempo real (stock del día)
- Selector de cantidad + botón "Añadir al carrito"

**Carrito**
- Persistente asociado a la cuenta (o sesión de navegador si no hay sesión)
- Resumen lateral o página dedicada
- Modificar cantidades, eliminar productos
- Total con IVA desglosado

**Checkout** (flujo en 3 pasos)
1. Resumen del pedido
2. Franja de recogida: selector de día (mín. 24h desde ahora) + hora (franjas configurables en panel de admin, ej. 8:00–9:00, 9:00–10:00…)
3. Pago con Stripe (tarjeta / Bizum)
4. Confirmación: número de pedido, resumen, correo de confirmación automático

**Otras secciones del home**
- Nuestra Historia (reutilizar contenido de `#showcases` de index.html)
- Proceso artesanal (horno de leña, masa madre, formado a mano)
- Testimonios de clientes
- Sobre nosotros + valores
- Footer con datos de contacto, horario, redes sociales, links legales

### 5.2 Panel de configuración de empresa (administrador)

Editable 100% desde la interfaz, sin tocar código:

| Sección | Campos |
|---|---|
| **Datos fiscales** | Nombre y apellidos (autónomo), NIF, dirección fiscal, régimen de IVA |
| **Contacto público** | Teléfono, WhatsApp, email, dirección física, horario de apertura |
| **Horarios de recogida** | Días disponibles, franjas horarias, capacidad máxima de pedidos por franja |
| **Métodos de pago activos** | Toggle Stripe (tarjeta) / Toggle Bizum / Toggle pago en recogida |
| **Textos legales** | Editor de texto enriquecido para aviso legal, privacidad, cookies, condiciones de venta |
| **Contenido web** | Estadísticas del hero (años, clientes, variedades), textos de secciones, banners |
| **Marca** | Logo, colores de acento, links a redes sociales |
| **Parámetros de pedido** | Antelación mínima (horas), pedido mínimo (€ o unidades) |

### 5.3 Panel de cliente registrado

- **Ficha personal**: nombre, email, teléfono, notas de alergias/intolerancias
- **Historial de pedidos**: lista con estado en tiempo real, fecha, productos, total
  - Estados: `pendiente` → `confirmado` → `en elaboración` → `listo para recoger` → `recogido` / `cancelado`
- **Detalle de pedido**: desglose de productos, franja de recogida, método de pago, factura en PDF
- **Facturas descargables**: generadas por el proveedor de facturación certificado Verifactu
- **Repetir pedido**: botón para clonar un pedido anterior al carrito actual
- **Baja de cuenta**: flujo de confirmación + eliminación/anonimización de datos (RGPD)
- **Exportar mis datos**: descarga en JSON/CSV de todos los datos personales (RGPD)

### 5.4 Panel de administrador (negocio)

**Gestión de catálogo**
- Alta, edición y baja de productos
- Control de disponibilidad diaria (toggle disponible/agotado por producto)
- Subida de fotografías de producto
- Gestión de categorías y orden de aparición

**Gestión de pedidos**
- Lista de todos los pedidos con filtros: fecha, estado, cliente, franja horaria
- Detalle de pedido: productos, cliente, franja de recogida, pago
- Cambio de estado del pedido (con notificación automática al cliente por email)
- Impresión de albarán / ticket de recogida
- Vista de pedidos por franja horaria (para organizar la producción del día)

**Gestión de clientes**
- Lista de clientes con buscador
- Ficha de cliente: datos, historial de pedidos, notas internas

**Informes de ventas**
- Ventas por período (día, semana, mes)
- Productos más vendidos
- Ingresos totales con IVA desglosado
- Exportar a CSV/Excel

**Configuración** (ver §5.2)

### 5.5 Acceso de desarrollador / infraestructura
- Gestionado exclusivamente en **Firebase Console** (o consola del proveedor elegido)
- Control de acceso IAM: solo emails autorizados con rol de editor/propietario
- Acceso a: Firestore, Storage, Authentication, Cloud Functions, Hosting, Logs
- Documentación técnica entregada como `README_TECNICO.md` (separado de la web pública)
- Variables de entorno solo en `.env.local` (dev) y en consola del proveedor (prod) — nunca en el repositorio

---

## 6. Facturación y cumplimiento legal (bloqueante)

> ⚠ **Verifactu (RD 1007/2023)** obliga desde 2026 a que cada factura genere un registro inalterable, encadenado y con QR, mediante software certificado.

### Estrategia obligatoria
**NO programar un generador de facturas propio.** Integrar uno de estos enfoques:

| Opción | Descripción |
|---|---|
| **API de proveedor certificado** | Holded, FacturaDirecta, Billin, Anfix u otro con certificación Verifactu y API REST. Se envían los datos del pedido y se recibe la factura en PDF + registro Verifactu. |
| **Módulo de facturación de la plataforma** | Si se usa WooCommerce o similar, existe plugin certificado Verifactu. Para stack custom, preferir opción API. |

### Flujo de facturación
1. Cliente completa el pago → Stripe confirma el cobro
2. El backend crea el pedido en Firestore con estado `confirmado`
3. El backend llama a la API de facturación con los datos del pedido
4. La API devuelve la factura en PDF + número de factura + registro Verifactu
5. El PDF se guarda en Firebase Storage vinculado al pedido
6. El cliente recibe email con la factura adjunta
7. El cliente puede descargar la factura desde su panel en cualquier momento

### Datos fiscales para las facturas
- Emisor: nombre completo del autónomo + NIF
- IVA aplicable: **4% (superreducido)** para pan y productos de panadería básicos; **10%** para bollería y repostería elaborada (verificar con asesor fiscal)
- Dirección fiscal: la configurada en el panel de empresa (§5.2)

### Otros requisitos legales
- **Aviso Legal**: datos del titular (LSSI-CE)
- **Política de Privacidad**: datos recogidos, base legal, derechos RGPD, DPO si aplica
- **Política de Cookies**: banner con aceptación granular (RGPD + AEPD)
- **Condiciones de Venta**: política de cancelación, recogida, reclamaciones
- **Alérgenos**: indicación obligatoria en fichas de producto (Reglamento UE 1169/2011)

> Los textos legales deben ser revisados y aprobados por un profesional (gestor o abogado) antes del lanzamiento. El sistema permite editarlos sin código desde el panel de configuración.

---

## 7. Aprendizajes de la competencia aplicados

| Patrón observado | Implementación en este proyecto |
|---|---|
| **CTA directa al catálogo** desde el primer scroll — las mejores tiendas de panadería no mandan a "contacto" | Hero con botón "Pedir Ahora" que lleva directamente al catálogo, no al formulario de contacto |
| **Fotografía real vende más** que texto o imágenes de IA (Hornos Domingo, Horno Artesano de Pedraza) | Fichas de producto con fotos reales del obrador de Señas Gómez. Prioridad máxima subir las fotos de `/images/` |
| **Métodos de pago locales**: Bizum es clave en España | Stripe con Bizum activo desde el lanzamiento |
| **Franjas de recogida** en tiendas serias — no solo "llama para quedar" | Selector de franja horaria en el checkout, gestión de capacidad máxima por franja |
| **Stock en tiempo real**: tiendas de panadería con producción limitada cierran el pedido cuando se agota la producción | Badge de disponibilidad diaria en cada producto, panel admin para activar/desactivar |
| **Email de confirmación con resumen y estado** — los clientes esperan seguimiento digital | Email automático al confirmar pedido + notificación al cambiar estado |
| **Repetir pedido con un clic** — funcionalidad muy valorada por clientes habituales de panadería (compra recurrente) | Botón "Repetir pedido" en el historial del cliente |
| **Diseño mobile-first** — más del 70% del tráfico de tiendas de proximidad viene de móvil | Checkout y catálogo diseñados primero para móvil |

---

## 8. Diseño visual

### Identidad vigente (mantener)
- **Fondo**: negro puro `#000000` / `#09090B`
- **Acento principal**: ámbar/dorado `#F59E0B` (ajustar del azul genérico del prototipo al tono real de la marca)
- **Tipografía títulos**: Plus Jakarta Sans (700, 800)
- **Tipografía cuerpo**: Inter (300, 400, 500)
- **Estilo**: Dark Luxury — glassmorphism, glow effects, partículas flotantes

### Ajustes para la tienda online
- La paleta del prototipo usa azul eléctrico + verde neón — **adaptar el acento primario al ámbar/tostado** que representa mejor una panadería artesanal (ya presente en el widget de admin)
- Las páginas de catálogo y checkout deben priorizar **legibilidad y conversión** sobre efectos visuales — reducir partículas y glows en estas secciones
- El catálogo y las fichas de producto deben funcionar perfectamente en **móvil en una mano** (UX de checkout mobile-first)

### Imágenes a usar
```
images/20260413_113051.jpg    → Exterior del local (para hero / sobre nosotros)
images/20260418_085039.jpg    → Vista del local (alternativa hero)
fotos/1.jpeg, fotos/2.jpeg    → Más vistas del local
images/WhatsApp Image *.jpeg  → Proceso del obrador, recetas, pizarras (para sección "Nuestra Historia")
images/logo.png               → Logo oficial
```

---

## 9. Entregables esperados (checklist de aceptación)

- [ ] Backend con base de datos real desplegado (Firestore o PostgreSQL)
- [ ] Autenticación segura server-side con los roles definidos en §4
- [ ] Catálogo público con las 4 categorías y todos los productos del §2
- [ ] Carrito persistente funcionando en móvil y desktop
- [ ] Checkout con selector de franja de recogida y pago real con Stripe (tarjeta + Bizum)
- [ ] Email de confirmación de pedido automático
- [ ] Panel de cliente: historial de pedidos con estado, facturas PDF descargables, ficha personal
- [ ] Panel de administrador: catálogo, pedidos, clientes, informes, configuración de empresa
- [ ] Panel de configuración de empresa editable sin código (datos fiscales, horarios, textos legales)
- [ ] Integración de facturación conforme a Verifactu vía API de proveedor certificado
- [ ] Textos legales revisables: aviso legal, privacidad, cookies, condiciones de venta
- [ ] Indicación de alérgenos en fichas de producto
- [ ] HTTPS en todo el sitio
- [ ] Variables de entorno fuera del repositorio
- [ ] Reglas de seguridad de Firestore: RLS por usuario
- [ ] Rate limiting en endpoints de login y checkout
- [ ] Documentación técnica (`README_TECNICO.md`) con instrucciones de despliegue y acceso de infraestructura
- [ ] Backups automáticos diarios de la base de datos

---

## 10. Lo que la IA NO debe hacer sin confirmación explícita

- **No** diseñar ni implementar un motor de facturación propio no certificado Verifactu.
- **No** procesar pagos reales sin Stripe (o PSP homologado) de por medio.
- **No** añadir el rol "desarrollador" como login dentro de la app pública.
- **No** publicar en producción sin HTTPS y sin revisar los textos legales.
- **No** guardar credenciales, claves de API ni tokens en el repositorio.
- **No** generar facturas con IVA sin confirmar el tipo aplicable con el asesor fiscal del negocio.
- **No** usar las imágenes del directorio local como rutas absolutas de Windows — convertirlas a rutas relativas del proyecto o subirlas al CDN antes de desplegar.

---

## 11. Secuencia de construcción recomendada

Fase 1 — Fundamentos (sprint 1–2)
1. Inicializar proyecto Next.js + Firebase
2. Configurar autenticación (Firebase Auth) + roles (custom claims)
3. Modelo de datos en Firestore (productos, categorías, pedidos, clientes, configuración)
4. Panel de configuración de empresa (para que el negocio pueda volcar sus datos)

Fase 2 — Tienda pública (sprint 3–4)
5. Catálogo público por categorías + fichas de producto
6. Carrito persistente
7. Checkout con Stripe + selector de franja de recogida
8. Email de confirmación (SendGrid / Resend)

Fase 3 — Paneles (sprint 5–6)
9. Panel de cliente (pedidos, facturas, ficha personal)
10. Panel de administrador (catálogo, pedidos, clientes, informes)
11. Integración API de facturación Verifactu

Fase 4 — Pulido y lanzamiento (sprint 7)
12. Migrar y adaptar diseño Dark Luxury de styles.css al stack nuevo
13. Optimizar imágenes reales del negocio (subir a Firebase Storage / CDN)
14. Textos legales + revisión del asesor
15. Tests E2E del flujo de compra (checkout → pago → confirmación → factura)
16. Despliegue en producción con HTTPS, variables de entorno y backups configurados

---

*Señas Gómez · Panadería · Bollería · Horno de Leña*
*Prompt generado: 2026-08-15*
