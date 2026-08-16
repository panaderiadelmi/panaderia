'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ALERGENOS, MERCADOS_OPCIONES, type CategoriaSlug, type TipoIVA, type Alergeno } from '@/lib/types';

function parseForm(formData: FormData) {
  return {
    nombre: formData.get('nombre') as string,
    referencia: (formData.get('referencia') as string) ?? '',
    refProveedor: (formData.get('refProveedor') as string) ?? '',
    categoria: formData.get('categoria') as CategoriaSlug,
    descripcion: (formData.get('descripcion') as string) ?? '',
    peso: (formData.get('peso') as string) ?? '',
    unidades: (formData.get('unidades') as string) ?? 'ud',
    precioSinIVA: parseFloat(formData.get('precioSinIVA') as string) || 0,
    precioCoste: formData.get('precioCoste') ? parseFloat(formData.get('precioCoste') as string) : null,
    tipoIVA: parseFloat(formData.get('tipoIVA') as string) as TipoIVA,
    alergenos: ALERGENOS.filter(a => formData.get(`alergeno_${a}`) === 'on') as Alergeno[],
    disponible: formData.get('disponible') === 'on',
    stockDiario: formData.get('stockDiario') ? parseInt(formData.get('stockDiario') as string) : null,
    destacado: formData.get('destacado') === 'on',
    imagenes: (formData.get('imagenUrl') as string) ? [(formData.get('imagenUrl') as string)] : [],
    orden: parseInt((formData.get('orden') as string) ?? '99') || 99,
    mercados: MERCADOS_OPCIONES.map(m => m.value).filter(v => formData.get(`mercado_${v}`) === 'on'),
  };
}

function revalidateAll() {
  revalidatePath('/admin/articulos');
  revalidatePath('/admin/catalogo');
  revalidatePath('/catalogo');
}

export async function crearArticulo(formData: FormData) {
  const datos = parseForm(formData);

  if (datos.referencia) {
    const existing = await adminDb
      .collection('productos')
      .where('referencia', '==', datos.referencia)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new Error(`Ya existe un artículo con la referencia "${datos.referencia}"`);
    }
  }

  await adminDb.collection('productos').add({
    ...datos,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidateAll();
  redirect('/admin/articulos');
}

export async function actualizarArticulo(id: string, formData: FormData) {
  const datos = parseForm(formData);

  if (datos.referencia) {
    const existing = await adminDb
      .collection('productos')
      .where('referencia', '==', datos.referencia)
      .limit(2)
      .get();
    const conflict = existing.docs.find(d => d.id !== id);
    if (conflict) {
      throw new Error(`Ya existe un artículo con la referencia "${datos.referencia}"`);
    }
  }

  await adminDb.collection('productos').doc(id).update({
    ...datos,
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidateAll();
  redirect('/admin/articulos');
}

export async function eliminarArticulo(id: string, _fd?: FormData) {
  await adminDb.collection('productos').doc(id).delete();
  revalidateAll();
}
