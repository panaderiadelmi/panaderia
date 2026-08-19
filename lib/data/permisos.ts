import type { Rol } from '@/lib/types';

export const PERMISOS = [
  { key: 'admin.dashboard',      label: 'Panel',             desc: 'Ver estadísticas del panel' },
  { key: 'admin.pedidos',        label: 'Pedidos',           desc: 'Ver y gestionar pedidos' },
  { key: 'admin.articulos',      label: 'Artículos',         desc: 'Ficha de artículos y precios' },
  { key: 'admin.catalogo',       label: 'Catálogo web',      desc: 'Productos visibles en la tienda' },
  { key: 'admin.clientes',       label: 'Clientes / CRM',    desc: 'Datos y ficha de cada cliente' },
  { key: 'admin.facturas',       label: 'Facturas',          desc: 'Acceso a facturas emitidas' },
  { key: 'admin.configuracion',  label: 'Configuración',     desc: 'Ajustes generales del sistema' },
  { key: 'admin.roles',          label: 'Roles y permisos',  desc: 'Modificar permisos por rol' },
  { key: 'admin.usuarios',       label: 'Crear usuarios',    desc: 'Dar de alta cuentas privilegiadas' },
] as const;

export const PERMISOS_DEFAULT: Record<Rol, string[]> = {
  administrador: PERMISOS.map(p => p.key),
  developer:     PERMISOS.map(p => p.key),
  propietario:   PERMISOS.filter(p => p.key !== 'admin.roles' && p.key !== 'admin.usuarios').map(p => p.key),
  cliente:       [],
};
