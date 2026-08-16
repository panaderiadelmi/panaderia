'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { EstadoPedido } from '@/lib/types';

export async function cambiarEstadoPedido(pedidoId: string, estado: EstadoPedido, _fd?: FormData) {
  await adminDb.collection('pedidos').doc(pedidoId).update({
    estado,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/admin');
  revalidatePath('/admin/pedidos');
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}

export async function guardarNotaAdmin(pedidoId: string, formData: FormData) {
  await adminDb.collection('pedidos').doc(pedidoId).update({
    notasAdmin: (formData.get('notasAdmin') as string) ?? '',
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}
