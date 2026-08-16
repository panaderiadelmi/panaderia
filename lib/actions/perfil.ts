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

export async function guardarNotaAdminCliente(clienteId: string, formData: FormData) {
  await adminDb.collection('clientes').doc(clienteId).update({
    notasAdmin: (formData.get('notasAdmin') as string) ?? '',
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/clientes/${clienteId}`);
}
