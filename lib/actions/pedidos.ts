'use server';

import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { EstadoPedido } from '@/lib/types';
import { sendEstadoEmail } from '@/lib/email/resend';

export async function cambiarEstadoPedido(pedidoId: string, estado: EstadoPedido, _fd?: FormData) {
  const snap = await adminDb.collection('pedidos').doc(pedidoId).get();
  const pedido = snap.data();

  await adminDb.collection('pedidos').doc(pedidoId).update({
    estado,
    updatedAt: FieldValue.serverTimestamp(),
  });

  if (pedido) {
    sendEstadoEmail({
      numero: pedido.numero,
      clienteEmail: pedido.clienteEmail,
      clienteNombre: pedido.clienteNombre,
      estado,
      franjaRecogida: pedido.franjaRecogida,
    }).catch(() => {});
  }

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

export async function guardarTipoEntrega(pedidoId: string, formData: FormData) {
  const tipoEntrega = formData.get('tipoEntrega') as 'recogida' | 'envio';
  await adminDb.collection('pedidos').doc(pedidoId).update({
    tipoEntrega,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}

export async function actualizarBultos(pedidoId: string, formData: FormData) {
  const bultos = Math.max(1, parseInt(formData.get('bultos') as string) || 1);
  await adminDb.collection('pedidos').doc(pedidoId).update({
    bultos,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}
