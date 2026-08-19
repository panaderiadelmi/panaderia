import type { Timestamp } from 'firebase/firestore';

// ── Roles ────────────────────────────────────────────────────────────────────
export type Rol = 'cliente' | 'administrador' | 'developer' | 'propietario';

export const ROLES_ADMIN: Rol[] = ['administrador', 'developer', 'propietario'];

export const ROLES_CONFIG: Record<Rol, { label: string; color: string }> = {
  cliente:       { label: 'Cliente',       color: '#64748B' },
  administrador: { label: 'Administrador', color: '#F59E0B' },
  developer:     { label: 'Developer',     color: '#38BDF8' },
  propietario:   { label: 'Propietario',   color: '#4ADE80' },
};

// ── Categorías ───────────────────────────────────────────────────────────────
export type CategoriaSlug = 'candeal' | 'baguette' | 'blanco' | 'bolleria';

export interface Categoria {
  id: string;
  nombre: string;
  slug: CategoriaSlug;
  descripcion: string;
  imagenUrl: string;
  orden: number;
  activa: boolean;
}

// ── Producto ─────────────────────────────────────────────────────────────────
export type TipoIVA = 0.04 | 0.10;

export const ALERGENOS = [
  'gluten', 'lacteos', 'huevos', 'frutos_secos', 'sesamo', 'soja', 'apio', 'mostaza'
] as const;

export type Alergeno = typeof ALERGENOS[number];

export interface Producto {
  id: string;
  nombre: string;
  referencia?: string;
  refProveedor?: string;
  categoria: CategoriaSlug;
  descripcion: string;
  peso: string;
  unidades?: string;
  precioSinIVA: number;
  precioCoste?: number;
  tipoIVA: TipoIVA;
  alergenos: Alergeno[];
  disponible: boolean;
  stockDiario: number | null;
  imagenes: string[];
  orden: number;
  destacado: boolean;
  mercados?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const MERCADOS_OPCIONES = [
  { value: 'web',       label: 'Tienda online' },
  { value: 'tienda',    label: 'Tienda física' },
  { value: 'mayorista', label: 'Mayorista' },
] as const;

export const UNIDADES_OPCIONES = [
  { value: 'ud',      label: 'Unidades (ud)' },
  { value: 'kg',      label: 'Kilogramos (kg)' },
  { value: 'g',       label: 'Gramos (g)' },
  { value: 'l',       label: 'Litros (l)' },
  { value: 'ml',      label: 'Mililitros (ml)' },
  { value: 'docena',  label: 'Docena' },
  { value: 'bandeja', label: 'Bandeja' },
  { value: 'pack',    label: 'Pack' },
] as const;

export interface ProductoConPrecio extends Producto {
  precioConIVA: number;
  ivaAmount: number;
}

// ── Pedido ───────────────────────────────────────────────────────────────────
export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'elaborando'
  | 'listo'
  | 'recogido'
  | 'cancelado';

export const ESTADOS_PEDIDO: Record<EstadoPedido, { label: string; color: string; emoji: string }> = {
  pendiente:   { label: 'Pendiente',          color: '#94A3B8', emoji: '🕐' },
  confirmado:  { label: 'Confirmado',          color: '#38BDF8', emoji: '✅' },
  elaborando:  { label: 'En elaboración',      color: '#FBBF24', emoji: '🔥' },
  listo:       { label: 'Listo para recoger',  color: '#4ADE80', emoji: '📦' },
  recogido:    { label: 'Recogido',            color: '#A78BFA', emoji: '🏠' },
  cancelado:   { label: 'Cancelado',           color: '#F87171', emoji: '❌' },
};

export type MetodoPago = 'stripe_card' | 'stripe_bizum' | 'efectivo_recogida';

export interface LineaPedido {
  productoId: string;
  nombre: string;
  peso: string;
  cantidad: number;
  precioSinIVA: number;
  tipoIVA: TipoIVA;
  subtotalSinIVA: number;
  ivaAmount: number;
  totalConIVA: number;
}

export interface FranjaRecogida {
  fecha: string;        // 'YYYY-MM-DD'
  horaInicio: string;   // 'HH:MM'
  horaFin: string;
}

export interface Pedido {
  id: string;
  numero: string;        // 'SG-2026-0001'
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  lineas: LineaPedido[];
  subtotalSinIVA: number;
  ivaTotal: number;
  totalConIVA: number;
  estado: EstadoPedido;
  franjaRecogida: FranjaRecogida;
  metodoPago: MetodoPago;
  stripePaymentIntentId?: string;
  stripePaymentStatus?: string;
  bultos?: number;
  facturaId?: string;
  facturaUrl?: string;
  notasCliente?: string;
  notasAdmin?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Cliente ──────────────────────────────────────────────────────────────────
export interface Cliente {
  uid: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  username: string;
  usernameLower: string;
  alergias: Alergeno[];
  notasAdmin?: string;
  rol: Rol;
  activo: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Sesión (lo que va en el token / server component) ───────────────────────
export interface SesionUsuario {
  uid: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: Rol;
}

// ── Carrito ──────────────────────────────────────────────────────────────────
export interface ItemCarrito {
  productoId: string;
  nombre: string;
  peso: string;
  imagenUrl: string;
  precioSinIVA: number;
  tipoIVA: TipoIVA;
  cantidad: number;
}

export interface Carrito {
  items: ItemCarrito[];
  subtotalSinIVA: number;
  ivaTotal: number;
  totalConIVA: number;
}

// ── Factura ──────────────────────────────────────────────────────────────────
export interface Factura {
  id: string;
  numero: string;         // Número de factura del proveedor Verifactu
  pedidoId: string;
  clienteId: string;
  pdfUrl: string;
  verifactuHash?: string;
  verifactuQrData?: string;
  emitidaAt: Timestamp;
}

// ── Horario semanal ──────────────────────────────────────────────────────────
export interface HorarioDia {
  abierto: boolean;
  manana: { desde: string; hasta: string };
  tarde:  { desde: string; hasta: string };
}

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export type HorarioSemanal = Record<DiaSemana, HorarioDia>;

// ── Configuración de empresa ─────────────────────────────────────────────────
export interface FranjaHoraria {
  id: string;
  horaInicio: string;
  horaFin: string;
  activa: boolean;
}

export interface ConfiguracionEmpresa {
  // Datos fiscales
  nombreFiscal: string;
  nif: string;
  direccionFiscal: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
  regimen: 'autonomo' | 'sociedad';

  // Contacto público
  telefonoPublico: string;
  whatsapp: string;
  emailPublico: string;
  direccionFisica: string;
  horario: string;

  // Recogida
  diasRecogida: number[];          // 0=dom ... 6=sab
  franjas: FranjaHoraria[];
  maxPedidosPorFranja: number;
  antelacionMinimaHoras: number;

  // Stripe (solo la clave pública; la secreta va en env)
  metodosActivos: MetodoPago[];

  // Horario semanal estructurado
  horarioSemanal: HorarioSemanal;

  // Marca
  nombreWeb: string;
  tagline: string;
  logoUrl: string;
  bannerUrl: string;
  faviconUrl: string;
  colorAcento: string;
  instagram: string;
  facebook: string;

  // Hero
  heroTitulo: string;
  heroSubtitulo: string;
  statsAnios: number;
  statsClientes: number;
  statsVariedades: number;

  // Legal (texto plano o HTML)
  avisoLegal: string;
  politicaPrivacidad: string;
  politicaCookies: string;
  condicionesVenta: string;

  updatedAt: Timestamp;
}

// ── Operario ─────────────────────────────────────────────────────────────────
export type TipoContrato =
  | 'indefinido'
  | 'temporal'
  | 'parcial'
  | 'obra'
  | 'practicas'
  | 'formativo'
  | 'indefinido_discontinuo';

export type CategoriaOperario =
  | 'panadero'
  | 'oficial'
  | 'dependiente'
  | 'repartidor'
  | 'auxiliar'
  | 'gerente';

export type TipoHoras = 'ordinarias' | 'nocturnas' | 'festivas';

export const TIPOS_CONTRATO: Record<TipoContrato, string> = {
  indefinido:             'Indefinido',
  temporal:               'Temporal',
  parcial:                'A tiempo parcial',
  obra:                   'Por obra o servicio',
  practicas:              'En prácticas',
  formativo:              'Formativo / Dual',
  indefinido_discontinuo: 'Indefinido discontinuo',
};

export const CATEGORIAS_OPERARIO: Record<CategoriaOperario, string> = {
  panadero:    'Panadero/a',
  oficial:     'Oficial de panadería',
  dependiente: 'Dependiente/a',
  repartidor:  'Repartidor/a',
  auxiliar:    'Auxiliar',
  gerente:     'Gerente',
};

export const TIPOS_HORAS: Record<TipoHoras, string> = {
  ordinarias: 'Ordinarias',
  nocturnas:  'Nocturnas',
  festivas:   'Festivas / Festivo',
};

export interface Operario {
  id: string;
  nombre: string;
  apellidos: string;
  categoria: CategoriaOperario;
  telefono: string;
  email: string;
  nss: string;             // Número de Seguridad Social
  numeroCuenta: string;    // IBAN
  fechaNacimiento: string; // 'YYYY-MM-DD'
  fechaInicio: string;     // 'YYYY-MM-DD' — inicio de contrato
  tipoContrato: TipoContrato;
  activo: boolean;
  notas?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HorarioOperario {
  id: string;
  operarioId: string;
  operarioNombre: string;  // Desnormalizado para mostrar
  fecha: string;           // 'YYYY-MM-DD'
  horarioInicio: string;   // 'HH:MM'
  horarioFin: string;      // 'HH:MM'
  tipoHoras: TipoHoras;
  horasExtras: number;
  notas?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Helpers de cálculo ────────────────────────────────────────────────────────
export function calcularPrecioConIVA(precioSinIVA: number, tipoIVA: TipoIVA): number {
  return Math.round(precioSinIVA * (1 + tipoIVA) * 100) / 100;
}

export function calcularTotalesCarrito(items: ItemCarrito[]): Omit<Carrito, 'items'> {
  let subtotalSinIVA = 0;
  let ivaTotal = 0;

  for (const item of items) {
    const lineSinIVA = item.precioSinIVA * item.cantidad;
    subtotalSinIVA += lineSinIVA;
    ivaTotal += lineSinIVA * item.tipoIVA;
  }

  return {
    subtotalSinIVA: Math.round(subtotalSinIVA * 100) / 100,
    ivaTotal: Math.round(ivaTotal * 100) / 100,
    totalConIVA: Math.round((subtotalSinIVA + ivaTotal) * 100) / 100,
  };
}
