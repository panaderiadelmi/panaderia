'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getSession, setUserRole } from '@/lib/firebase/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ROLES_ADMIN, type Rol } from '@/lib/types';
import { PERMISOS } from '@/lib/data/permisos';

async function requireAdminAccess() {
  const sesion = await getSession();
  if (!sesion || !ROLES_ADMIN.includes(sesion.rol)) throw new Error('NO_PERMISSION');
  return sesion;
}

export async function guardarPermisos(formData: FormData) {
  await requireAdminAccess();

  const roles: Rol[] = ['administrador', 'developer', 'propietario', 'cliente'];
  const resultado: Record<string, { permisos: string[] }> = {};

  for (const rol of roles) resultado[rol] = { permisos: [] };

  for (const key of Array.from(formData.keys())) {
    const match = key.match(/^perm__(.+?)__(.+)$/);
    if (match) {
      const [, rol, perm] = match;
      if (resultado[rol]) resultado[rol].permisos.push(perm);
    }
  }

  await adminDb.collection('configuracion').doc('roles').set(resultado);

  revalidatePath('/admin/roles');
  redirect('/admin/roles?guardado=1');
}

export async function crearUsuarioPrivilegiado(formData: FormData) {
  await requireAdminAccess();

  const nombre    = (formData.get('nombre')    as string).trim();
  const apellidos = (formData.get('apellidos') as string).trim();
  const email     = (formData.get('email')     as string).toLowerCase().trim();
  const password  = formData.get('password')   as string;
  const rol       = formData.get('rol')        as Rol;

  if (!ROLES_ADMIN.includes(rol)) throw new Error('Rol no válido');
  if (password.length < 8)        throw new Error('Contraseña demasiado corta');

  const userRecord = await adminAuth.createUser({
    email,
    password,
    displayName: `${nombre} ${apellidos}`.trim(),
  });

  await setUserRole(userRecord.uid, rol);

  await adminDb.collection('clientes').doc(userRecord.uid).set({
    uid:       userRecord.uid,
    nombre,
    apellidos,
    email,
    telefono:  '',
    alergias:  [],
    rol,
    activo:    true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios?creado=1');
}
