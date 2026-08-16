'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ALERGENOS, type CategoriaSlug, type TipoIVA, type Alergeno } from '@/lib/types';

function parseForm(formData: FormData) {
  return {
    nombre: formData.get('nombre') as string,
    categoria: formData.get('categoria') as CategoriaSlug,
    descripcion: (formData.get('descripcion') as string) ?? '',
    peso: (formData.get('peso') as string) ?? '',
    precioSinIVA: parseFloat(formData.get('precioSinIVA') as string) || 0,
    tipoIVA: parseFloat(formData.get('tipoIVA') as string) as TipoIVA,
    alergenos: ALERGENOS.filter(a => formData.get(`alergeno_${a}`) === 'on') as Alergeno[],
    disponible: formData.get('disponible') === 'on',
    stockDiario: formData.get('stockDiario') ? parseInt(formData.get('stockDiario') as string) : null,
    destacado: formData.get('destacado') === 'on',
    imagenes: (formData.get('imagenUrl') as string) ? [(formData.get('imagenUrl') as string)] : [],
    orden: parseInt((formData.get('orden') as string) ?? '99') || 99,
  };
}

export async function crearProducto(formData: FormData) {
  await adminDb.collection('productos').add({
    ...parseForm(formData),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/admin/catalogo');
  revalidatePath('/catalogo');
  redirect('/admin/catalogo');
}

export async function actualizarProducto(productoId: string, formData: FormData) {
  await adminDb.collection('productos').doc(productoId).update({
    ...parseForm(formData),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/admin/catalogo');
  revalidatePath('/catalogo');
  redirect('/admin/catalogo');
}

export async function toggleDisponible(productoId: string, disponible: boolean, _fd?: FormData) {
  await adminDb.collection('productos').doc(productoId).update({
    disponible,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/admin/catalogo');
  revalidatePath('/catalogo');
}

export async function eliminarProducto(productoId: string, _fd?: FormData) {
  await adminDb.collection('productos').doc(productoId).delete();
  revalidatePath('/admin/catalogo');
  revalidatePath('/catalogo');
}
