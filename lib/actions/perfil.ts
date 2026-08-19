'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/firebase/auth';
import { ALERGENOS, type Alergeno } from '@/lib/types';

export async function actualizarPerfil(formData: FormData) {
  const sesion = await getSession();
  if (!sesion) redirect('/login');

  await adminDb.collection('clientes').doc(sesion.uid).update({
    nombre:    formData.get('nombre') as string,
    apellidos: formData.get('apellidos') as string,
    telefono:  formData.get('telefono') as string,
    alergias:  ALERGENOS.filter(a => formData.get(`alergia_${a}`) === 'on') as Alergeno[],
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/mi-cuenta/perfil');
  redirect('/mi-cuenta/perfil?guardado=1');
}

export async function asignarUsernameAdmin(clienteId: string, formData: FormData) {
  const username      = (formData.get('username') as string ?? '').trim();
  const usernameLower = username.toLowerCase();

  if (!username) throw new Error('El nombre de usuario no puede estar vacío.');

  const snap = await adminDb.collection('clientes').where('usernameLower', '==', usernameLower).get();
  if (!snap.empty && snap.docs[0].id !== clienteId) {
    throw new Error('Ese nombre de usuario ya está en uso.');
  }

  await adminDb.collection('clientes').doc(clienteId).update({
    username, usernameLower, updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/clientes/${clienteId}`);
}

export async function guardarNotaAdminCliente(clienteId: string, formData: FormData) {
  await adminDb.collection('clientes').doc(clienteId).update({
    notasAdmin: (formData.get('notasAdmin') as string) ?? '',
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/clientes/${clienteId}`);
}
