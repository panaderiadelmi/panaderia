'use server';

import { cookies } from 'next/headers';
import { adminAuth } from './admin';
import type { SesionUsuario, Rol } from '@/lib/types';

const SESSION_COOKIE_NAME = '__session';
const SESSION_DURATION_MS = 60 * 60 * 24 * 5 * 1000; // 5 días

// ── Crear cookie de sesión a partir del idToken de Firebase ─────────────────
export async function createSessionCookie(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_DURATION_MS / 1000,
    path:     '/',
  });
}

// ── Eliminar cookie de sesión (logout) ───────────────────────────────────────
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ── Verificar sesión activa y devolver datos del usuario ─────────────────────
export async function getSession(): Promise<SesionUsuario | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    return {
      uid:       decoded.uid,
      email:     decoded.email ?? '',
      nombre:    (decoded.nombre as string)    ?? '',
      apellidos: (decoded.apellidos as string) ?? '',
      rol:       (decoded.rol as Rol)          ?? 'cliente',
    };
  } catch {
    return null;
  }
}

// ── Verificar que el usuario tiene un rol mínimo ─────────────────────────────
export async function requireRole(rol: Rol): Promise<SesionUsuario> {
  const sesion = await getSession();

  if (!sesion) {
    throw new Error('NO_AUTH');
  }

  if (rol === 'administrador' && sesion.rol !== 'administrador') {
    throw new Error('NO_PERMISSION');
  }

  return sesion;
}

// ── Establecer custom claims de rol en Firebase Auth ─────────────────────────
// Llamar desde la API de admin cuando se crea o edita un usuario
export async function setUserRole(uid: string, rol: Rol): Promise<void> {
  await adminAuth.setCustomUserClaims(uid, { rol });
}
