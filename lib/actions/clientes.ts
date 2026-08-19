'use server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function editarCliente(uid: string, formData: FormData) {
  const nombre       = (formData.get('nombre')    as string).trim();
  const apellidos    = (formData.get('apellidos') as string).trim();
  const telefono     = (formData.get('telefono')  as string).trim();
  const username     = (formData.get('username')  as string).trim();
  const usernameLower = username.toLowerCase();
  const activo       = formData.get('activo') === 'true';

  if (username) {
    const snap = await adminDb.collection('clientes').where('usernameLower', '==', usernameLower).get();
    if (!snap.empty && snap.docs[0].id !== uid) throw new Error('Ese nombre de usuario ya está en uso.');
  }

  await adminAuth.updateUser(uid, { displayName: `${nombre} ${apellidos}`.trim() });
  await adminDb.collection('clientes').doc(uid).update({
    nombre, apellidos, telefono, activo,
    ...(username ? { username, usernameLower } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin/clientes');
  revalidatePath(`/admin/clientes/${uid}`);
  redirect('/admin/clientes?editado=1');
}

export async function eliminarCliente(uid: string) {
  await adminAuth.deleteUser(uid);
  await adminDb.collection('clientes').doc(uid).delete();
  revalidatePath('/admin/clientes');
  redirect('/admin/clientes?eliminado=1');
}
